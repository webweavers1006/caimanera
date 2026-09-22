#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <vector>
#include <thread>
#include <chrono>

// Cross-platform sleep (replaces POSIX usleep)
static void msleep(int ms) {
    std::this_thread::sleep_for(std::chrono::milliseconds(ms));
}

// SIGPIPE only exists on POSIX (macOS/Linux), not Windows
#ifndef _WIN32
#include <signal.h>
#include <sys/stat.h>
#define MKDIR(p) mkdir(p, 0755)
#else
#include <direct.h>
#define MKDIR(p) _mkdir(p)
#endif

typedef void* FTRHANDLE; typedef unsigned char FTR_BYTE; typedef int FTR_BOOL;
typedef unsigned int FTR_DWORD; typedef void* FTR_PVOID;
#define FTR_PACKED __attribute__((aligned(1),packed))

// Calling convention: on Windows the Futronic SDK exports use __stdcall
// (callee cleans the stack). Calling them as cdecl corrupts the stack and
// produces crashes or garbage results. On macOS/Linux the macro is a no-op.
#ifdef _WIN32
#define FTR_API __stdcall
#else
#define FTR_API
#endif

typedef struct FTR_PACKED { int nWidth, nHeight, nImageSize; } FTRSCAN_IMAGE_SIZE, *PFTRSCAN_IMAGE_SIZE;
typedef struct FTR_PACKED { int nContrastOnDose2,nContrastOnDose4,nDose,nBrightnessOnDose1,nBrightnessOnDose2,nBrightnessOnDose3,nBrightnessOnDose4; FTR_BYTE R[64-32]; } FTRSCAN_FRAME_PARAMETERS, *PFTRSCAN_FRAME_PARAMETERS;

extern "C" {
    FTRHANDLE FTR_API ftrScanOpenDevice();
    void FTR_API ftrScanCloseDevice(FTRHANDLE);
    FTR_BOOL FTR_API ftrScanGetImageSize(FTRHANDLE, PFTRSCAN_IMAGE_SIZE);
    // NOTE: ftrScanGetImage2 is intentionally NOT used — the shipped
    // ftrScanAPI.dll does not export it (the exe would fail to load with
    // "entry point not found"), and its adaptive scanning produced
    // doubled/overexposed captures on the FS88H.
    FTR_BOOL FTR_API ftrScanGetImage(FTRHANDLE, int, FTR_PVOID);
    FTR_BOOL FTR_API ftrScanGetFrame(FTRHANDLE, FTR_PVOID, PFTRSCAN_FRAME_PARAMETERS);
    FTR_BOOL FTR_API ftrScanIsFingerPresent(FTRHANDLE, PFTRSCAN_FRAME_PARAMETERS);
    FTR_BOOL FTR_API ftrScanSetDiodesStatus(FTRHANDLE, FTR_BYTE, FTR_BYTE);
    void FTR_API ftrSetBaseInterface(int);
    FTR_DWORD FTR_API ftrScanGetLastError();
}

// Check if image buffer has any meaningful data (not all zeros)
static bool ok(const unsigned char* d, int s) { for(int i=0;i<200&&i<s;i++) if(d[i]) return true; return false; }

// Output a raw grayscale frame with a magic marker so the bridge can
// re-synchronize even if the SDK injects extra bytes into stdout:
//   [FRD1][uint16_le width][uint16_le height][uint32_le size][raw bytes]
static void writeFrame(const unsigned char* data, int width, int height, int size) {
    const char magic[4] = {'F', 'R', 'D', '1'};
    uint16_t w = (uint16_t)width;
    uint16_t h = (uint16_t)height;
    uint32_t s = (uint32_t)size;
    fwrite(magic, 1, 4, stdout);
    fwrite(&w, 2, 1, stdout);
    fwrite(&h, 2, 1, stdout);
    fwrite(&s, 4, 1, stdout);
    fwrite(data, 1, size, stdout);
    fflush(stdout);
}

// ── Stream mode: continuous frames to stdout ──────────────────
// NO signal handlers — they are not async-signal-safe and can deadlock
// the USB device. The OS releases all resources on process termination.

// The Futronic SDK writes slightly MORE bytes than ftrScanGetImageSize
// reports (~200-600 extra on FS88H). If the buffer is sized exactly to
// nImageSize, the SDK overflows it and corrupts the heap (which also
// corrupts stdio and leaks garbage bytes into stdout). Keep slack space.
const int FRAME_SLACK = 8192;

// Capture dose (1-7) — configurable via the FTR_DOSE env var.
// Classic ftrScanGetImage uses a fixed exposure dose:
//   1 = shortest exposure (darkest), 7 = longest (brightest).
// FTR_DOSE unset or 0 → default dose 2 (same capture path the legacy
// PIAC app used). ftrScanGetImage2 was dropped (see declarations).
static int captureDose() {
    const char* env = getenv("FTR_DOSE");
    int dose = env ? atoi(env) : 0;
    if (dose < 0) dose = 0;
    if (dose > 7) dose = 7;
    return dose;
}

static int runStream() {
#ifndef _WIN32
    signal(SIGPIPE, SIG_IGN);
#endif  // only ignore broken pipe

    ftrSetBaseInterface(0);
    FTRHANDLE h = ftrScanOpenDevice();
    if (!h) { fprintf(stderr, "ERROR: open\n"); return 1; }

    FTRSCAN_IMAGE_SIZE isz = {};
    if (!ftrScanGetImageSize(h, &isz)) {
        fprintf(stderr, "ERROR: size (err=%u)\n", ftrScanGetLastError());
        ftrScanCloseDevice(h); return 1;
    }

    // Signal ready
    fprintf(stderr, "STREAM:READY %d %d %d\n", isz.nWidth, isz.nHeight, isz.nImageSize);
    fflush(stderr);

    std::vector<unsigned char> buf(isz.nImageSize + FRAME_SLACK);
    int noFingerFrames = 0;
    const int MAX_NO_FINGER_AFTER_REMOVAL = 100;  // ~10 seconds after finger removed
    bool fingerWasPresent = false;
#ifdef _WIN32
    int method = 0;  // diagnostic: which capture call is producing frames
#endif

    ftrScanSetDiodesStatus(h, 100, 0);

    // Phase 1: Wait for initial finger placement (indefinite)
    fprintf(stderr, "STREAM:WAITING\n");
    fflush(stderr);
    while (!ftrScanIsFingerPresent(h, NULL)) {
        msleep(100);  // 100ms
    }
    fprintf(stderr, "STREAM:FINGER_DETECTED\n");
    fflush(stderr);

    // Let the finger settle after initial contact — scanning mid-press
    // produces doubled/ghosted ridges (sensor reads while finger moves).
    msleep(600);

    // Phase 2: Stream frames while finger is present
    while (noFingerFrames < MAX_NO_FINGER_AFTER_REMOVAL) {
        if (ftrScanIsFingerPresent(h, NULL)) {
            noFingerFrames = 0;
            if (!fingerWasPresent) {
                fingerWasPresent = true;
                fprintf(stderr, "STREAM:FINGER_DETECTED\n");
                fflush(stderr);
            }

            // Windows: classic ftrScanGetImage with a fixed dose.
            // GetFrame returns sensor noise here, so it is not used on
            // Windows. macOS uses ftrScanGetFrame with default parameters.
#ifdef _WIN32
            int dose = captureDose();
            int manual = dose > 0 ? dose : 2;
            if (ftrScanGetImage(h, manual, buf.data())) {
                if (method != 1) {
                    method = 1;
                    fprintf(stderr, "CAP:GetImage(dose=%d)\n", manual);
                    fflush(stderr);
                }
                writeFrame(buf.data(), isz.nWidth, isz.nHeight, isz.nImageSize);
                // Rest between full scans: back-to-back ftrScanGetImage
                // calls degrade the sensor (heat/charge accumulation) and
                // produce flickering/blurry live frames. A short pause lets
                // the scanning pipeline recover before the next frame.
                msleep(300);
                continue;
            }
#else
            if (ftrScanGetFrame(h, buf.data(), NULL)) {
                writeFrame(buf.data(), isz.nWidth, isz.nHeight, isz.nImageSize);
                // The capture already paces the loop — don't add extra sleep.
                continue;
            }
#endif
        } else {
            if (fingerWasPresent) {
                noFingerFrames++;
                if (noFingerFrames == 1) {
                    fprintf(stderr, "STREAM:FINGER_REMOVED\n");
                    fflush(stderr);
                }
            }
        }
        msleep(100);  // idle pacing when no frame was produced
    }

    ftrScanSetDiodesStatus(h, 0, 0);
    fprintf(stderr, "STREAM:DONE\n");
    ftrScanCloseDevice(h);
    return 0;
}

// ── Single capture mode ───────────────────────────────────────
static int runSingle() {
    ftrSetBaseInterface(0);

    // Retry device open up to 5 times (USB may still be releasing from stream)
    FTRHANDLE h = nullptr;
    for (int retry = 0; retry < 5; retry++) {
        h = ftrScanOpenDevice();
        if (h) break;
        fprintf(stderr, "Retry open (%d/5)...\n", retry + 1);
        msleep(500);  // 500ms
    }
    if (!h) { fprintf(stderr, "ERROR: open\n"); return 1; }

    FTRSCAN_IMAGE_SIZE isz = {};
    if(!ftrScanGetImageSize(h, &isz)) { fprintf(stderr,"ERROR: size (err=%u)\n",ftrScanGetLastError()); ftrScanCloseDevice(h); return 1; }
    fprintf(stderr,"DEBUG: %dx%d = %d\n", isz.nWidth, isz.nHeight, isz.nImageSize);

    // Wait for finger placement (do NOT wait for removal — caller controls timing)
    fprintf(stderr,"Place finger...\n");
    while(!ftrScanIsFingerPresent(h, NULL)) msleep(100);
    fprintf(stderr,"Capturing...\n");
    // Let the finger settle before scanning — capturing mid-press produces
    // doubled/ghosted ridges (the scanner reads while the finger is moving).
    msleep(600);

    std::vector<unsigned char> b(isz.nImageSize + FRAME_SLACK);
    ftrScanSetDiodesStatus(h, 100, 0);
    int dose = captureDose();
    int manual = dose > 0 ? dose : 2;

    // Windows: classic ftrScanGetImage with a fixed dose (the same capture
    // path the legacy PIAC app used). GetImage2 was dropped: the shipped
    // ftrScanAPI.dll does not export it, and its adaptive scanning produced
    // doubled/overexposed captures. GetFrame on Windows returns sensor
    // noise, so it is only a last-resort fallback.
#ifdef _WIN32
    if(ftrScanGetImage(h, manual, b.data()) && ok(b.data(), isz.nImageSize))
        { fprintf(stderr,"GetImage OK (dose %d)\n", manual); writeFrame(b.data(), isz.nWidth, isz.nHeight, isz.nImageSize); ftrScanCloseDevice(h); return 0; }
#endif
    if(ftrScanGetFrame(h, b.data(), NULL) && ok(b.data(), isz.nImageSize))
        { fprintf(stderr,"GetFrame OK\n"); writeFrame(b.data(), isz.nWidth, isz.nHeight, isz.nImageSize); ftrScanCloseDevice(h); return 0; }
    if(ftrScanGetImage(h, manual, b.data()) && ok(b.data(), isz.nImageSize))
        { fprintf(stderr,"GetImage OK\n"); writeFrame(b.data(), isz.nWidth, isz.nHeight, isz.nImageSize); ftrScanCloseDevice(h); return 0; }

    ftrScanSetDiodesStatus(h, 0, 0);
    fprintf(stderr,"ERROR: blank\n");
    ftrScanCloseDevice(h);
    return 1;
}

// ── Dose scan diagnostic mode ─────────────────────────────────
// Captures one image per dose (1-7) with a long settle delay and writes
// 8-bit grayscale BMP files to ./dose-scan/dose-N.bmp so the operator can
// visually pick the dose that matches the macOS-calibrated capture.
// Each dose waits for a fresh finger placement, then waits for removal.

static void writeBmp(const char* path, const unsigned char* gray, int w, int h) {
    FILE* f = fopen(path, "wb");
    if (!f) {
        fprintf(stderr, "ERROR: cannot write %s\n", path);
        return;
    }
    const int paletteSize = 1024;         // 256 grayscale entries × 4 bytes
    const int headerSize = 54;
    const int dataSize = w * h;
    const int fileSize = headerSize + paletteSize + dataSize;

    unsigned char header[54] = {0};
    header[0] = 'B';
    header[1] = 'M';
    header[2]  = fileSize & 0xff;          header[3]  = (fileSize >> 8) & 0xff;
    header[4]  = (fileSize >> 16) & 0xff;  header[5]  = (fileSize >> 24) & 0xff;
    const int dataOffset = headerSize + paletteSize;
    header[10] = dataOffset & 0xff;        header[11] = (dataOffset >> 8) & 0xff;
    header[12] = (dataOffset >> 16) & 0xff; header[13] = (dataOffset >> 24) & 0xff;
    header[14] = 40;                       // BITMAPINFOHEADER size
    header[18] = w & 0xff;                 header[19] = (w >> 8) & 0xff;
    header[20] = (w >> 16) & 0xff;         header[21] = (w >> 24) & 0xff;
    header[22] = h & 0xff;                 header[23] = (h >> 8) & 0xff;
    header[24] = (h >> 16) & 0xff;         header[25] = (h >> 24) & 0xff;
    header[26] = 1;                        // planes
    header[28] = 8;                        // bits per pixel (grayscale)
    header[34] = dataSize & 0xff;          header[35] = (dataSize >> 8) & 0xff;
    header[36] = (dataSize >> 16) & 0xff;  header[37] = (dataSize >> 24) & 0xff;
    header[46] = 0;                        // clrUsed = 256 (little-endian uint32)
    header[47] = 1;

    fwrite(header, 1, headerSize, f);

    unsigned char palette[1024];
    for (int i = 0; i < 256; i++) {
        palette[i * 4]     = (unsigned char)i;  // B
        palette[i * 4 + 1] = (unsigned char)i;  // G
        palette[i * 4 + 2] = (unsigned char)i;  // R
        palette[i * 4 + 3] = 0;
    }
    fwrite(palette, 1, paletteSize, f);

    // Rows are stored bottom-up in BMP
    for (int y = h - 1; y >= 0; y--) {
        fwrite(gray + (size_t)y * w, 1, (size_t)w, f);
    }
    fclose(f);
}

static int runDoseScan() {
    ftrSetBaseInterface(0);
    FTRHANDLE h = ftrScanOpenDevice();
    if (!h) { fprintf(stderr, "ERROR: open\n"); return 1; }

    FTRSCAN_IMAGE_SIZE isz = {};
    if (!ftrScanGetImageSize(h, &isz)) {
        fprintf(stderr, "ERROR: size (err=%u)\n", ftrScanGetLastError());
        ftrScanCloseDevice(h);
        return 1;
    }
    fprintf(stderr, "DOSE-SCAN: image %dx%d (%d bytes)\n", isz.nWidth, isz.nHeight, isz.nImageSize);
    fflush(stderr);

    MKDIR("dose-scan");

    std::vector<unsigned char> buf(isz.nImageSize + FRAME_SLACK);
    ftrScanSetDiodesStatus(h, 100, 0);

    int captured = 0;
    for (int dose = 1; dose <= 7; dose++) {
        fprintf(stderr, "DOSE %d: place finger...\n", dose);
        fflush(stderr);
        while (!ftrScanIsFingerPresent(h, NULL)) msleep(100);

        // Long settle: a moving finger produces doubled/ghosted ridges.
        msleep(800);

        bool good = ftrScanGetImage(h, dose, buf.data()) &&
                    ok(buf.data(), isz.nImageSize);

        fprintf(stderr, "DOSE %d: remove finger...\n", dose);
        fflush(stderr);
        while (ftrScanIsFingerPresent(h, NULL)) msleep(100);

        if (!good) {
            fprintf(stderr, "DOSE %d: blank capture — skipped\n", dose);
            continue;
        }

        char path[64];
        snprintf(path, sizeof(path), "dose-scan/dose-%d.bmp", dose);
        writeBmp(path, buf.data(), isz.nWidth, isz.nHeight);
        fprintf(stderr, "DOSE %d OK -> %s\n", dose, path);
        captured++;
    }

    ftrScanSetDiodesStatus(h, 0, 0);
    ftrScanCloseDevice(h);
    fprintf(stderr, "DOSE-SCAN done: %d/7 images in dose-scan/\n", captured);
    return 0;
}

int main(int argc, char** argv) {
    if (argc > 1 && strcmp(argv[1], "--stream") == 0) {
        return runStream();
    }
    if (argc > 1 && strcmp(argv[1], "--dose-scan") == 0) {
        return runDoseScan();
    }
    return runSingle();
}
