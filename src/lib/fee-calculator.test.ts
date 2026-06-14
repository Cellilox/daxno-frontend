import { describe, it, expect } from "vitest";
import { calculateServiceFee } from "./fee-calculator";

// Default tiers (NEXT_PUBLIC_FEE_TIERS unset): 5-20:35, 21-50:30, 51-100:25, 101+:20.
// These mirror the backend GYOK multiplier (src/billing/cost.py:gyok_multiplier);
// the `credits` output must match `gyok_net_credit` for the same dollar amount.
describe("calculateServiceFee (mirrors backend GYOK tiers)", () => {
    it("$10 → 35% fee → $6.50 credits", () => {
        const r = calculateServiceFee(10);
        expect(r.serviceFeePercentage).toBe(35);
        expect(r.serviceFeeAmount).toBeCloseTo(3.5, 6);
        expect(r.credits).toBeCloseTo(6.5, 6);
    });

    it("$30 → 30% fee → $21 credits", () => {
        const r = calculateServiceFee(30);
        expect(r.serviceFeePercentage).toBe(30);
        expect(r.credits).toBeCloseTo(21, 6);
    });

    it("$75 → 25% fee → $56.25 credits", () => {
        const r = calculateServiceFee(75);
        expect(r.serviceFeePercentage).toBe(25);
        expect(r.credits).toBeCloseTo(56.25, 6);
    });

    it("$200 → 20% fee → $160 credits", () => {
        const r = calculateServiceFee(200);
        expect(r.serviceFeePercentage).toBe(20);
        expect(r.credits).toBeCloseTo(160, 6);
    });

    it("tier boundaries align with the backend (>20, >50, >100)", () => {
        expect(calculateServiceFee(20).serviceFeePercentage).toBe(35);
        expect(calculateServiceFee(21).serviceFeePercentage).toBe(30);
        expect(calculateServiceFee(50).serviceFeePercentage).toBe(30);
        expect(calculateServiceFee(51).serviceFeePercentage).toBe(25);
        expect(calculateServiceFee(100).serviceFeePercentage).toBe(25);
        expect(calculateServiceFee(101).serviceFeePercentage).toBe(20);
    });
});
