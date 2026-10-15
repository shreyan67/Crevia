import { describe, it, expect } from "vitest";
import {
  RequestOtpSchema,
  VerifyOtpSchema,
  CreateOrderSchema,
  VerifyDeliveryPinSchema,
  PaginationParamsSchema,
  CakeCustomizationSchema,
} from "@/lib/validations";

describe("Validation Schemas (Zod)", () => {
  describe("RequestOtpSchema", () => {
    it("should accept valid 10-digit Indian phone numbers and names", () => {
      const valid = RequestOtpSchema.safeParse({
        name: "Aarav Sharma",
        phone: "9876543210",
      });
      expect(valid.success).toBe(true);
    });

    it("should accept phone numbers with +91 country prefix", () => {
      const valid = RequestOtpSchema.safeParse({
        name: "Priya Patel",
        phone: "+919876543210",
      });
      expect(valid.success).toBe(true);
    });

    it("should reject invalid phone numbers (too short, letters, or wrong starting digit)", () => {
      const invalid = RequestOtpSchema.safeParse({
        name: "Priya",
        phone: "12345",
      });
      expect(invalid.success).toBe(false);

      const invalidStartingDigit = RequestOtpSchema.safeParse({
        name: "Priya",
        phone: "4876543210",
      });
      expect(invalidStartingDigit.success).toBe(false);
    });

    it("should reject names shorter than 2 characters", () => {
      const invalid = RequestOtpSchema.safeParse({
        name: "A",
        phone: "9876543210",
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe("VerifyOtpSchema", () => {
    it("should accept valid 4-digit numeric OTPs", () => {
      const result = VerifyOtpSchema.safeParse({ enteredOtp: "4829" });
      expect(result.success).toBe(true);
    });

    it("should reject non-numeric or wrong length OTPs", () => {
      expect(VerifyOtpSchema.safeParse({ enteredOtp: "123" }).success).toBe(false);
      expect(VerifyOtpSchema.safeParse({ enteredOtp: "12345" }).success).toBe(false);
      expect(VerifyOtpSchema.safeParse({ enteredOtp: "abcd" }).success).toBe(false);
    });
  });

  describe("CreateOrderSchema", () => {
    const validOrderData = {
      customerName: "Rohan Verma",
      customerPhone: "9811223344",
      customerEmail: "rohan@example.com",
      deliveryAddress: "Flat 402, Lotus Residency, MG Road",
      deliveryPincode: "560001",
      deliveryDate: "2026-10-20",
      deliverySlot: "10:00 AM - 01:00 PM",
      paymentMethod: "ONLINE" as const,
      totalAmount: 1499,
      items: [
        {
          id: "w1",
          name: "Salted Caramel Cake",
          price: 1499,
          quantity: 1,
          variant: "1kg",
          message: "Happy Birthday Rohan!",
        },
      ],
    };

    it("should validate a complete valid order payload", () => {
      const result = CreateOrderSchema.safeParse(validOrderData);
      expect(result.success).toBe(true);
    });

    it("should reject order with invalid email format", () => {
      const result = CreateOrderSchema.safeParse({
        ...validOrderData,
        customerEmail: "not-an-email",
      });
      expect(result.success).toBe(false);
    });

    it("should reject order with negative or zero total amount", () => {
      const result = CreateOrderSchema.safeParse({
        ...validOrderData,
        totalAmount: 0,
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid pincode formats (not 6 digits)", () => {
      const result = CreateOrderSchema.safeParse({
        ...validOrderData,
        deliveryPincode: "1234",
      });
      expect(result.success).toBe(false);
    });

    it("should reject unsupported payment methods", () => {
      const result = CreateOrderSchema.safeParse({
        ...validOrderData,
        paymentMethod: "CRYPTO",
      });
      expect(result.success).toBe(false);
    });
  });


  describe("CakeCustomizationSchema", () => {
    it("should accept valid cake customization specs", () => {
      const valid = CakeCustomizationSchema.safeParse({
        weight: 1.5,
        flavor: "Belgian Chocolate",
        message: "Happy 25th Anniversary!",
        eggless: true,
        tier: 2,
      });
      expect(valid.success).toBe(true);
      if (valid.success) {
        expect(valid.data.weight).toBe(1.5);
        expect(valid.data.eggless).toBe(true);
      }
    });

    it("should reject message exceeding 50 characters", () => {
      const invalid = CakeCustomizationSchema.safeParse({
        weight: 1,
        flavor: "Vanilla Berry",
        message: "This is a super extremely long custom cake inscription text that exceeds fifty chars limit",
      });
      expect(invalid.success).toBe(false);
    });

    it("should reject non-positive or excessive cake weight", () => {
      expect(CakeCustomizationSchema.safeParse({ weight: 0, flavor: "Chocolate" }).success).toBe(false);
      expect(CakeCustomizationSchema.safeParse({ weight: -1, flavor: "Chocolate" }).success).toBe(false);
      expect(CakeCustomizationSchema.safeParse({ weight: 15, flavor: "Chocolate" }).success).toBe(false);
    });
  });

  describe("VerifyDeliveryPinSchema", () => {
    it("should validate delivery handoff PIN format", () => {
      const valid = VerifyDeliveryPinSchema.safeParse({
        orderId: "ord_123",
        enteredPin: "7821",
      });
      expect(valid.success).toBe(true);
    });

    it("should reject malformed PINs", () => {
      const invalid = VerifyDeliveryPinSchema.safeParse({
        orderId: "ord_123",
        enteredPin: "782",
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe("PaginationParamsSchema", () => {
    it("should apply sensible defaults for pagination", () => {
      const result = PaginationParamsSchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(12);
      expect(result.sortBy).toBe("newest");
    });

    it("should coerce string query params into numbers", () => {
      const result = PaginationParamsSchema.parse({
        page: "3",
        limit: "25",
        sortBy: "price_asc",
      });
      expect(result.page).toBe(3);
      expect(result.limit).toBe(25);
      expect(result.sortBy).toBe("price_asc");
    });
  });
});
