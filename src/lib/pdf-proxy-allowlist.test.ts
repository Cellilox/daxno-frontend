import { describe, it, expect } from "vitest";
import { isAllowedProxyUrl } from "./pdf-proxy-allowlist";

const HOSTS = ["daxno-files-897354.s3.amazonaws.com"];

describe("isAllowedProxyUrl", () => {
    it("allows an https URL on the S3 bucket host", () => {
        expect(
            isAllowedProxyUrl(
                "https://daxno-files-897354.s3.amazonaws.com/uploads/file.pdf",
                HOSTS
            )
        ).toBe(true);
    });

    it("blocks the cloud metadata endpoint (the SSRF target)", () => {
        expect(isAllowedProxyUrl("http://169.254.169.254/latest/meta-data/", HOSTS)).toBe(false);
        expect(isAllowedProxyUrl("https://169.254.169.254/latest/meta-data/", HOSTS)).toBe(false);
    });

    it("blocks http (scheme downgrade) even for the allowed host", () => {
        expect(
            isAllowedProxyUrl("http://daxno-files-897354.s3.amazonaws.com/x.pdf", HOSTS)
        ).toBe(false);
    });

    it("blocks userinfo host-spoofing (allowed.host@evil.com)", () => {
        expect(
            isAllowedProxyUrl(
                "https://daxno-files-897354.s3.amazonaws.com@evil.com/x.pdf",
                HOSTS
            )
        ).toBe(false);
    });

    it("blocks lookalike suffix domains", () => {
        expect(
            isAllowedProxyUrl(
                "https://daxno-files-897354.s3.amazonaws.com.evil.com/x.pdf",
                HOSTS
            )
        ).toBe(false);
    });

    it("blocks relative, unparseable, and non-http schemes", () => {
        expect(isAllowedProxyUrl("//169.254.169.254", HOSTS)).toBe(false);
        expect(isAllowedProxyUrl("file:///etc/passwd", HOSTS)).toBe(false);
        expect(isAllowedProxyUrl("data:text/html,<script>", HOSTS)).toBe(false);
        expect(isAllowedProxyUrl("not a url", HOSTS)).toBe(false);
        expect(isAllowedProxyUrl("", HOSTS)).toBe(false);
    });

    it("uses the default allowlist when no hosts are passed", () => {
        expect(
            isAllowedProxyUrl("https://daxno-files-897354.s3.amazonaws.com/x.pdf")
        ).toBe(true);
        expect(isAllowedProxyUrl("https://evil.com/x.pdf")).toBe(false);
    });
});
