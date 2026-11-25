import { z } from "zod";

// ============================================================
// Auth Validation Schemas
// ============================================================

export const signupSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{9,14}$/, "Invalid phone number")
    .optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character",
    ),
  role: z.enum(["GENERATOR", "RECYCLER"]),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const verifyOtpSchema = z.object({
  userId: z.string(),
  code: z.string().length(6, "OTP must be 6 digits"),
  type: z.enum(["EMAIL_VERIFY", "PHONE_VERIFY", "PASSWORD_RESET"]),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  userId: z.string(),
  code: z.string().length(6, "OTP must be 6 digits"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

// ============================================================
// Waste Listing Validation Schemas
// ============================================================

export const createListingSchema = z.object({
  category: z.enum([
    "COMPUTERS",
    "MOBILES",
    "TELEVISIONS",
    "BATTERIES",
    "CABLES",
    "APPLIANCES",
    "PCBS",
    "PERIPHERALS",
    "PRINTERS",
    "NETWORKING",
    "MEDICAL_DEVICES",
    "OTHER",
  ]),
  subcategory: z.string().optional(),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be at most 200 characters"),
  description: z.string().max(2000).optional(),
  quantity: z.number().int().min(1).default(1),
  estimatedWeight: z.number().positive().optional(),
  condition: z.enum(["working", "damaged", "non-functional"]).optional(),
  images: z.array(z.string()).max(5).optional(),
  isHazardous: z.boolean().default(false),
  hazardDetails: z.string().optional(),
  addressLine1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
});

// ============================================================
// Pickup Request Validation Schemas
// ============================================================

export const createPickupSchema = z.object({
  listingIds: z.array(z.string()).min(1, "At least one listing is required"),
  scheduledAt: z.string().datetime(),
  isInstant: z.boolean().default(false),
  addressLine1: z.string().min(1, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  instructions: z.string().max(500).optional(),
  recyclerId: z.string().optional(),
});

// ============================================================
// Recycler Validation Schemas
// ============================================================

export const recyclerProfileSchema = z.object({
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters"),
  licenseNumber: z.string().optional(),
  registrationNo: z.string().optional(),
  description: z.string().max(2000).optional(),
  facilityAddress: z.string().optional(),
  facilityLat: z.number().optional(),
  facilityLng: z.number().optional(),
  capacity: z.string().optional(),
  capabilities: z
    .array(
      z.enum([
        "COMPUTERS",
        "MOBILES",
        "TELEVISIONS",
        "BATTERIES",
        "CABLES",
        "APPLIANCES",
        "PCBS",
        "PERIPHERALS",
        "PRINTERS",
        "NETWORKING",
        "MEDICAL_DEVICES",
        "OTHER",
      ]),
    )
    .optional(),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

// ============================================================
// Type Exports
// ============================================================

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type CreateListingInput = z.infer<typeof createListingSchema>;
export type CreatePickupInput = z.infer<typeof createPickupSchema>;
export type RecyclerProfileInput = z.infer<typeof recyclerProfileSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
