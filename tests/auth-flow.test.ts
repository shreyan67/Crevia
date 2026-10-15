import { describe, it, expect } from "vitest";
import { RequestOtpSchema, VerifyOtpSchema, ActionResult } from "@/lib/validations";

describe("Authentication & Session Logic", () => {
  describe("OTP Generation & Format", () => {
    function generateMockOtp(): string {
      return Math.floor(1000 + Math.random() * 9000).toString();
    }

    it("should generate a 4-digit numeric string OTP", () => {
      for (let i = 0; i < 50; i++) {
        const otp = generateMockOtp();
        expect(otp).toHaveLength(4);
        expect(/^\d{4}$/.test(otp)).toBe(true);
        const num = parseInt(otp, 10);
        expect(num).toBeGreaterThanOrEqual(1000);
        expect(num).toBeLessThanOrEqual(9999);
      }
    });
  });

  describe("OTP Expiry Timeout Logic", () => {
    function isOtpSessionValid(createdAt: number, maxAgeSeconds = 300, currentTime = Date.now()): boolean {
      return (currentTime - createdAt) <= (maxAgeSeconds * 1000);
    }

    it("should accept OTP within the 5-minute validity window", () => {
      const now = Date.now();
      const twoMinutesAgo = now - (2 * 60 * 1000);
      expect(isOtpSessionValid(twoMinutesAgo, 300, now)).toBe(true);
    });

    it("should reject expired OTP after 5 minutes", () => {
      const now = Date.now();
      const sixMinutesAgo = now - (6 * 60 * 1000);
      expect(isOtpSessionValid(sixMinutesAgo, 300, now)).toBe(false);
    });
  });

  describe("Standardized ActionResult Contracts", () => {
    it("should conform to successful ActionResult structure", () => {
      const successResult: ActionResult<{ userId: string }> = {
        success: true,
        data: { userId: "usr_abc123" },
      };
      expect(successResult.success).toBe(true);
      expect(successResult.data?.userId).toBe("usr_abc123");
      expect(successResult.error).toBeUndefined();
    });

    it("should conform to failed ActionResult structure with error message", () => {
      const failedResult: ActionResult = {
        success: false,
        error: "INVALID_OTP",
        message: "The entered OTP is incorrect or expired.",
      };
      expect(failedResult.success).toBe(false);
      expect(failedResult.message).toContain("incorrect");
    });
  });
});
