import { z } from "zod";

// Phone number regex for standard 10-digit Indian numbers (optional +91)
export const phoneRegex = /^(\+91[\-\s]?)?[6-9]\d{9}$/;

// Pincode regex (6 digits)
export const pincodeRegex = /^[1-9][0-9]{5}$/;

// Standardized Server Action / API Result
export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// OTP request validation schema
export const RequestOtpSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60, "Name is too long"),
  phone: z.string().trim().regex(phoneRegex, "Please enter a valid 10-digit phone number"),
});

// OTP verification schema
export const VerifyOtpSchema = z.object({
  enteredOtp: z.string().trim().regex(/^\d{4}$/, "OTP must be exactly 4 digits"),
});

// Cake Customization Schema (Weight, Flavor, Custom Cake Text Length)
export const CakeCustomizationSchema = z.object({
  weight: z.number().positive("Weight must be greater than 0").max(10, "Maximum cake weight is 10kg"),
  flavor: z.string().trim().min(2, "Please select or specify a flavor").max(50, "Flavor name is too long"),
  message: z.string().trim().max(50, "Custom cake message cannot exceed 50 characters").optional(),
  eggless: z.boolean().default(false),
  tier: z.number().int().min(1).max(4).default(1),
});

// Checkout & Order Creation Schema
export const CreateOrderSchema = z.object({
  customerName: z.string().trim().min(2, "Name is required (at least 2 characters)").max(70),
  customerPhone: z.string().trim().regex(phoneRegex, "Valid 10-digit mobile number required"),
  customerEmail: z.string().trim().email("Valid email address required"),
  deliveryAddress: z.string().trim().min(8, "Detailed address required (street, house/flat no)"),
  deliveryPincode: z.string().trim().regex(pincodeRegex, "Valid 6-digit delivery pincode required"),
  deliveryDate: z.string().min(1, "Delivery date is required"),
  deliverySlot: z.string().min(1, "Delivery time slot is required"),
  paymentMethod: z.enum(["ONLINE", "COD", "UPI", "CARD"]),
  totalAmount: z.number().positive("Total amount must be greater than zero"),
  items: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      price: z.number().positive(),
      quantity: z.number().int().positive(),
      variant: z.string().optional(),
      message: z.string().max(50, "Custom message cannot exceed 50 characters").optional(),
    })
  ).optional(),
});

// Delivery Handover PIN Verification Schema
export const VerifyDeliveryPinSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  enteredPin: z.string().trim().regex(/^\d{4}$/, "Delivery PIN must be a 4-digit code"),
});

// Pagination & Query Parameters Schema
export const PaginationParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  category: z.string().optional(),
  sortBy: z.enum(["newest", "price_asc", "price_desc", "name"]).default("newest"),
  cursor: z.string().optional(),
});

export type RequestOtpInput = z.infer<typeof RequestOtpSchema>;
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;
export type CakeCustomizationInput = z.infer<typeof CakeCustomizationSchema>;
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type VerifyDeliveryPinInput = z.infer<typeof VerifyDeliveryPinSchema>;
export type PaginationParams = z.infer<typeof PaginationParamsSchema>;
