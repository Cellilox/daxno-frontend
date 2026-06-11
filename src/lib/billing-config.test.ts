import { describe, it, expect, vi, afterEach } from "vitest";

// FEE_TIERS is computed at module load from NEXT_PUBLIC_FEE_TIERS, so we drive
// it with stubbed env + a module reset and a dynamic import.
describe("billing-config FEE_TIERS parsing", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
        vi.resetModules();
    });

    it("parses the default tiers when the env var is unset", async () => {
        vi.resetModules();
        const mod = await import("./billing-config");
        expect(mod.FEE_TIERS[0]).toEqual({ min: 5, max: 20, pct: 35 });
        expect(mod.FEE_TIERS[mod.FEE_TIERS.length - 1]).toEqual({
            min: 101,
            max: null,
            pct: 20,
        });
    });

    it("parses a custom open-ended tier", async () => {
        vi.stubEnv("NEXT_PUBLIC_FEE_TIERS", "1-10:50,11+:40");
        vi.resetModules();
        const mod = await import("./billing-config");
        expect(mod.FEE_TIERS).toEqual([
            { min: 1, max: 10, pct: 50 },
            { min: 11, max: null, pct: 40 },
        ]);
    });

    it("throws a descriptive error on malformed input (missing pct)", async () => {
        vi.stubEnv("NEXT_PUBLIC_FEE_TIERS", "5-20");
        vi.resetModules();
        await expect(import("./billing-config")).rejects.toThrow(/malformed/);
    });

    it("throws when pct is not a number", async () => {
        vi.stubEnv("NEXT_PUBLIC_FEE_TIERS", "5-20:abc");
        vi.resetModules();
        await expect(import("./billing-config")).rejects.toThrow(/not a number/);
    });
});
