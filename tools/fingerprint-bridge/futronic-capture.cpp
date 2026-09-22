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

// Finger status returned by ftrScanIsFingerPresent when given a
// FTRSCAN_FRAME_PARAMETERS block (Futronic SDK ftrScanApi.h). The old
// code treated any non-zero value as "finger present", which means the
// scan could fire while the finger was still moving or only lightly
// pressed — producing ghosted/blurred captures.
#define FTR_IGNORE_FINGER  0   // no finger
#define FTR_MOVE_FINGER    1   // finger moving
#define FTR_LOW_PRESSURE   2   // finger pressed too lightly
#define FTR_HIGH_PRESSURE  3   // finger pressed too hard
#define FTR_CAPTURE_READY  4   // finger still and properly pressed

// Frames wider/taller than this are treated as large platen (FS64).
const int LARGE_FRAME_MAX_DIM = 800;

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

// Output a raw grayscale frame with magic markers so the bridge can
// re-synchronize even if the SDK injects extra bytes into stdout:
//   [FRD1][uint16_le width][uint16_le height][uint32_le size]
//   [FRD1][raw bytes]
// The header marker carries the dimensions; the SECOND marker marks the
// exact start of the pixel data. Field-verified: the SDK injects ~25
// bytes into stdout between the header and the data, which displaced
// every row by 25 bytes and produced the "double fingerprint" ghost.
// With the second marker the bridge skips any junk in between.
static void writeFrame(const unsigned char* data, int width, int height, int size) {
    const char magic[4] = {'F', 'R', 'D', '1'};
    uint16_t w = (uint16_t)width;
    uint16_t h = (uint16_t)height;
    uint32_t s = (uint32_t)size;
    fwrite(magic, 1, 4, stdout);
    fwrite(&w, 2, 1, stdout);
    fwrite(&h, 2, 1, stdout);
    fwrite(&s, 4, 1, stdout);
    fwrite(magic, 1, 4, stdout);  // data-start marker (re-sync point)
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

// Dose can be set per device class: FTR_DOSE_FS64 (large platen) takes
// precedence on FS64-class frames, FTR_DOSE for everything else.
static int captureDoseFor(const FTRSCAN_IMAGE_SIZE& isz) {
    if (isz.nWidth > LARGE_FRAME_MAX_DIM || isz.nHeight > LARGE_FRAME_MAX_DIM) {
        const char* env = getenv("FTR_DOSE_FS64");
        int dose = env ? atoi(env) : 0;
        if (dose > 0) {
            return dose > 7 ? 7 : dose;
        }
    }
    return captureDose();
}

// Wait until the sensor reports FTR_CAPTURE_READY (finger still and
// properly pressed) before scanning — the same gating the official
// Futronic demo uses. A scan fired while the finger is still moving or
// only lightly pressed shows up as ghosted/blurred ridges (the classic
// "streaks" complaint). On timeout it returns false and the caller
// captures anyway (previous behavior).
// Timeout configurable via FTR_READY_TIMEOUT_MS (default 12000).
static int readyTimeoutMs() {
    const char* env = getenv("FTR_READY_TIMEOUT_MS");
    int t = env ? atoi(env) : 12000;
    return t > 0 ? t : 12000;
}

#ifdef _WIN32
// ── Motion-stability gate (small devices, e.g. FS88H) ─────────
// The FS88H never reports FTR_CAPTURE_READY (its driver flickers
// move/ignore, and polling with frame parameters also degrades the
// capture), so stillness is verified EMPIRICALLY: capture consecutive
// frames and keep the newest only when they are nearly identical.
// A moving/rolling finger produces large frame-to-frame differences —
// the classic "double fingerprint" ghost. Returns:
//   1 = stable frame in buf, 0 = never stable (last frame in buf),
//  -1 = first capture failed (caller falls back to the classic path).
static int stableCapture(FTRHANDLE h, const FTRSCAN_IMAGE_SIZE& isz,
                         std::vector<unsigned char>& buf,
                         std::vector<unsigned char>& buf2,
                         int dose, int maxTries, int settleMsBetween) {
    if (!ftrScanGetImage(h, dose, buf.data()) || !ok(buf.data(), isz.nImageSize)) {
        return -1;  // first frame failed
    }
    for (int attempt = 0; attempt < maxTries; attempt++) {
        msleep(settleMsBetween);
        if (!ftrScanGetImage(h, dose, buf2.data())) continue;
        if (!ok(buf2.data(), isz.nImageSize)) continue;

        // Mean absolute difference between consecutive frames
        long long sum = 0;
        for (int i = 0; i < isz.nImageSize; i++) {
            int d = (int)buf.data()[i] - (int)buf2.data()[i];
            sum += d < 0 ? -d : d;
        }
        double mad = (double)sum / isz.nImageSize;
        fprintf(stderr, "STABLE: attempt=%d mad=%.2f\n", attempt + 1, mad);
        fflush(stderr);
        if (mad <= 3.0) {
            buf.swap(buf2);
            return 1;
        }
        buf.swap(buf2);
    }
    fprintf(stderr, "STABLE: finger never stabilized - keeping last frame\n");
    return 0;
}
#endif

#ifdef _WIN32
static bool waitCaptureReady(FTRHANDLE h, const FTRSCAN_IMAGE_SIZE& isz) {
    // Field-tested on BOTH devices (FS88H and FS64): the Windows drivers
    // flicker between FTR_MOVE_FINGER (1) and FTR_IGNORE_FINGER (0) and
    // never report FTR_CAPTURE_READY (4), so gating would add the full
    // 12 s timeout to every capture. Disabled by default.
    // FTR_READY_GATE env override: "all"/"1" enables the gating,
    // anything else (or unset) skips it.
    const char* gate = getenv("FTR_READY_GATE");
    bool enabled = gate && (strcmp(gate, "all") == 0 || strcmp(gate, "1") == 0);
    if (!enabled) {
        return true;  // default: capture right after the settle delay
    }

    int timeout = readyTimeoutMs();
    int waited = 0;
    int lastStatus = -1;
    bool everPresent = false;

    while (waited < timeout) {
        FTRSCAN_FRAME_PARAMETERS fp = {};
        int status = ftrScanIsFingerPresent(h, &fp);
        if (status != lastStatus) {
            lastStatus = status;
            const char* name =
                status == FTR_CAPTURE_READY ? "READY" :
                status == FTR_IGNORE_FINGER ? "ignore" :
                status == FTR_MOVE_FINGER ? "move" :
                status == FTR_LOW_PRESSURE ? "low pressure" :
                status == FTR_HIGH_PRESSURE ? "high pressure" : "unknown";
            fprintf(stderr, "FINGER: status=%d (%s)\n", status, name);
            fflush(stderr);
        }
        if (status == FTR_CAPTURE_READY) return true;
        if (status != FTR_IGNORE_FINGER) everPresent = true;

        // Finger lifted mid-wait: give the operator another chance to
        // place it, but keep the overall timeout so the caller falls
        // back instead of hanging forever.
        if (status == FTR_IGNORE_FINGER && everPresent) {
            // Re-arm the presence wait once, then keep gating.
            while (!ftrScanIsFingerPresent(h, NULL) && waited < timeout) {
                msleep(100);
                waited += 100;
            }
            if (waited >= timeout) break;
            msleep(800);  // settle after re-placement
            waited += 800;
            continue;
        }

        msleep(100);
        waited += 100;
    }

    fprintf(stderr, "FINGER: not ready after %d ms — capturing anyway\n", waited);
    return false;
}
#endif

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
                // Large platens (FS64) get a longer rest — their thermal
                // sensor smears when scanned continuously under a finger.
                msleep(isz.nWidth > LARGE_FRAME_MAX_DIM ||
                       isz.nHeight > LARGE_FRAME_MAX_DIM ? 500 : 300);
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

// Forward decl: BMP writer (defined below, shared with --dose-scan)
static void writeBmp(const char* path, const unsigned char* gray, int w, int h);

// Finish a capture: emit the frame to stdout AND save a BMP next to the
// binary for byte-level comparison against the --dose-scan output
// (capture-raw.bmp vs dose-scan/dose-N.bmp on the field PC).
// When outPath is given (bridge file-transfer mode) the frame is written
// ONLY to that BMP file — no stdout — because the SDK injects junk bytes
// into stdout on Windows and file I/O cannot be corrupted.
static int finishCapture(FTRHANDLE h, const unsigned char* data,
                         const FTRSCAN_IMAGE_SIZE& isz,
                         const char* outPath) {
    if (outPath) {
        writeBmp(outPath, data, isz.nWidth, isz.nHeight);
    } else {
        writeFrame(data, isz.nWidth, isz.nHeight, isz.nImageSize);
    }
    writeBmp("capture-raw.bmp", data, isz.nWidth, isz.nHeight);
    ftrScanSetDiodesStatus(h, 0, 0);
    ftrScanCloseDevice(h);
    return 0;
}

// Motion-stability gate is OPT-IN (FTR_STABILITY=1). Field evidence: the
// FS88H single scan is reliable, while back-to-back GetImage calls degrade
// its output (dark center) — and the original "ghost" turned out to be the
// stdout junk, not finger movement.
static bool stabilityEnabled() {
    const char* env = getenv("FTR_STABILITY");
    if (!env) return false;
    return strcmp(env, "0") != 0 && strcmp(env, "none") != 0;
}

static int runSingle(const char* outPath) {
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

    std::vector<unsigned char> b(isz.nImageSize + FRAME_SLACK);

    // Same order as --dose-scan: diodes on BEFORE waiting for the finger.
    ftrScanSetDiodesStatus(h, 100, 0);

    // Wait for finger placement (do NOT wait for removal — caller controls timing)
    fprintf(stderr,"Place finger...\n");
    while(!ftrScanIsFingerPresent(h, NULL)) msleep(100);
    fprintf(stderr,"Capturing...\n");
    // Let the finger settle before scanning — capturing mid-press produces
    // doubled/ghosted ridges (the scanner reads while the finger is moving).
    // Same settle as --dose-scan so the web capture matches its output.
    msleep(800);

    int dose = captureDoseFor(isz);
    int manual = dose > 0 ? dose : 2;

#ifdef _WIN32
    // Large platen (FS64): driver-based pressure/stillness gating is
    // OPT-IN (FTR_READY_GATE=all) — both Windows drivers never report
    // READY, so it is off by default to avoid a 12 s delay per capture.
    // Small devices (FS88H): empirical motion-stability gate, also
    // opt-in via FTR_STABILITY=1 (consecutive scans degrade the sensor).
    bool large = isz.nWidth > LARGE_FRAME_MAX_DIM || isz.nHeight > LARGE_FRAME_MAX_DIM;
    if (large) {
        waitCaptureReady(h, isz);
        if (ftrScanGetImage(h, manual, b.data()) && ok(b.data(), isz.nImageSize)) {
            fprintf(stderr, "GetImage OK (dose %d)\n", manual);
            return finishCapture(h, b.data(), isz, outPath);
        }
    } else if (stabilityEnabled()) {
        std::vector<unsigned char> b2(isz.nImageSize + FRAME_SLACK);
        int stable = stableCapture(h, isz, b, b2, manual, 8, 500);
        if (stable >= 0) {
            fprintf(stderr, "Stable capture OK (dose %d)\n", manual);
            return finishCapture(h, b.data(), isz, outPath);
        }
    }
#endif

    // Windows: classic ftrScanGetImage with a fixed dose (the same capture
    // path the legacy PIAC app used). GetImage2 was dropped: the shipped
    // ftrScanAPI.dll does not export it, and its adaptive scanning produced
    // doubled/overexposed captures. GetFrame on Windows returns sensor
    // noise, so it is only a last-resort fallback.
#ifdef _WIN32
    if(ftrScanGetImage(h, manual, b.data()) && ok(b.data(), isz.nImageSize))
        { fprintf(stderr,"GetImage OK (dose %d)\n", manual); return finishCapture(h, b.data(), isz, outPath); }
#endif
    if(ftrScanGetFrame(h, b.data(), NULL) && ok(b.data(), isz.nImageSize))
        { fprintf(stderr,"GetFrame OK\n"); return finishCapture(h, b.data(), isz, outPath); }
    if(ftrScanGetImage(h, manual, b.data()) && ok(b.data(), isz.nImageSize))
        { fprintf(stderr,"GetImage OK\n"); return finishCapture(h, b.data(), isz, outPath); }

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
    // Bridge file-transfer mode: write the capture to a BMP file instead
    // of stdout. The SDK injects junk bytes into stdout on Windows; file
    // I/O is immune, so the bridge reads the exact captured pixels.
    const char* outPath = nullptr;
    for (int i = 1; i + 1 < argc; i++) {
        if (strcmp(argv[i], "--out") == 0) {
            outPath = argv[i + 1];
        }
    }
    return runSingle(outPath);
}
