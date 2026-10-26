import { describe, expect, it } from "vitest";
import { matchPaymentSchema } from "@/features/payments/schemas/payment.schema";
import { PAYMENT_CONFIG } from "@/features/payments/config/payment.constants";

describe("payment schema", () => {
  it("accepts BDT without a reference", () => {
    const result = matchPaymentSchema.safeParse({
      matchId: "60e23aa7-7e32-4c5e-b8b2-4dcb563efb9f",
      method: "BDT",
    });

    expect(result.success).toBe(true);
    expect(result.data.method).toBe("BDT");
    expect(result.data.reference).toBeUndefined();
  });

  it("trims and keeps a manual reference", () => {
    const result = matchPaymentSchema.safeParse({
      matchId: "60e23aa7-7e32-4c5e-b8b2-4dcb563efb9f",
      method: "MOBILE_PAYMENT",
      reference: "  00123456  ",
    });

    expect(result.success).toBe(true);
    expect(result.data.reference).toBe("00123456");
  });

  it("rejects methods outside the gateway catalog", () => {
    const result = matchPaymentSchema.safeParse({
      matchId: "60e23aa7-7e32-4c5e-b8b2-4dcb563efb9f",
      method: "CASH",
    });

    expect(result.success).toBe(false);
  });

  it("exposes the four consumer payment methods", () => {
    expect(PAYMENT_CONFIG.METHODS.map((method) => method.value)).toEqual([
      "BDT",
      "MOBILE_PAYMENT",
      "BINANCE",
      "CARD",
    ]);
  });
});
