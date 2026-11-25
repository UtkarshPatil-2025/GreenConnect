import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to human-readable string
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

/**
 * Format weight in kg with appropriate unit
 */
export function formatWeight(kg: number): string {
  if (kg < 1) return `${(kg * 1000).toFixed(0)}g`;
  return `${kg.toFixed(1)}kg`;
}

/**
 * Calculate estimated CO2 savings from e-waste recycling
 * Rough estimate: ~1.5 kg CO2 saved per kg of e-waste properly recycled
 */
export function estimateCO2Savings(weightKg: number): number {
  return weightKg * 1.5;
}

/**
 * Generate a random alphanumeric string for QR codes
 */
export function generateQRCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const prefix = "GC";
  let code = prefix;
  for (let i = 0; i < 10; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * API response helper
 */
export function apiResponse<T>(
  data: T,
  message: string = "Success",
  status: number = 200,
) {
  return Response.json({ success: true, message, data }, { status });
}

/**
 * API error response helper
 */
export function apiError(
  message: string,
  status: number = 400,
  errors?: Record<string, string[]>,
) {
  return Response.json(
    { success: false, message, errors },
    { status },
  );
}

/**
 * E-waste category display labels
 */
export const WASTE_CATEGORY_LABELS: Record<string, string> = {
  COMPUTERS: "Computers & Laptops",
  MOBILES: "Mobile Phones & Tablets",
  TELEVISIONS: "TVs & Monitors",
  BATTERIES: "Batteries",
  CABLES: "Cables & Wires",
  APPLIANCES: "Home Appliances",
  PCBS: "Circuit Boards (PCBs)",
  PERIPHERALS: "Keyboards, Mice & Peripherals",
  PRINTERS: "Printers & Scanners",
  NETWORKING: "Routers & Networking Equipment",
  MEDICAL_DEVICES: "Medical Electronic Devices",
  OTHER: "Other E-Waste",
};

/**
 * Pickup status display labels with colors
 */
export const PICKUP_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  REQUESTED: {
    label: "Requested",
    color: "text-yellow-700",
    bgColor: "bg-yellow-50",
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
  },
  AGENT_ASSIGNED: {
    label: "Agent Assigned",
    color: "text-indigo-700",
    bgColor: "bg-indigo-50",
  },
  EN_ROUTE: {
    label: "En Route",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
  },
  ARRIVED: {
    label: "Arrived",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
  },
  PICKED_UP: {
    label: "Picked Up",
    color: "text-teal-700",
    bgColor: "bg-teal-50",
  },
  IN_TRANSIT: {
    label: "In Transit",
    color: "text-cyan-700",
    bgColor: "bg-cyan-50",
  },
  AT_FACILITY: {
    label: "At Facility",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
  },
  PROCESSING: {
    label: "Processing",
    color: "text-lime-700",
    bgColor: "bg-lime-50",
  },
  COMPLETED: {
    label: "Completed",
    color: "text-green-700",
    bgColor: "bg-green-50",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "text-red-700",
    bgColor: "bg-red-50",
  },
};
