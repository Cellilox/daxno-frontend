import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
    formatRemainingDuration,
    extractIso,
    localizeIsoInMessage,
} from "./format-time";

describe("format-time", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    });
    afterEach(() => {
        vi.useRealTimers();
    });

    it("formats a future ISO as a coarse h/min/sec countdown", () => {
        expect(formatRemainingDuration("2026-01-01T01:01:01Z")).toBe("1h, 1min, 1sec");
    });

    it("returns 'any moment' when the target is in the past", () => {
        expect(formatRemainingDuration("2025-12-31T23:00:00Z")).toBe("any moment");
    });

    it("never throws — returns the raw string when unparseable", () => {
        expect(formatRemainingDuration("not-a-date")).toBe("not-a-date");
    });

    it("extractIso returns the first ISO 8601 timestamp or null", () => {
        expect(extractIso("come back 2026-01-01T01:00:00Z please")).toBe(
            "2026-01-01T01:00:00Z"
        );
        expect(extractIso("no timestamp here")).toBeNull();
    });

    it("localizeIsoInMessage swaps the ISO for the countdown in place", () => {
        expect(localizeIsoInMessage("come back 2026-01-01T01:01:01Z now")).toBe(
            "come back 1h, 1min, 1sec now"
        );
        expect(localizeIsoInMessage("no iso to localize")).toBe("no iso to localize");
    });
});
