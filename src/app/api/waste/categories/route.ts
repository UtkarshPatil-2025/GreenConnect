import { apiResponse } from "@/lib/utils";
import { WASTE_CATEGORY_LABELS } from "@/lib/utils";
import { HazardLevel } from "@prisma/client";

// Hazard info per category
const CATEGORY_HAZARD_INFO: Record<
  string,
  { level: HazardLevel; description: string }
> = {
  COMPUTERS: {
    level: "LOW",
    description:
      "May contain lead, mercury in screens, and flame retardants in circuit boards.",
  },
  MOBILES: {
    level: "LOW",
    description:
      "Contains lithium batteries and small amounts of heavy metals.",
  },
  TELEVISIONS: {
    level: "MEDIUM",
    description:
      "CRT TVs contain lead; LCD TVs may contain mercury in backlights.",
  },
  BATTERIES: {
    level: "HIGH",
    description:
      "Contains heavy metals like lead, cadmium, mercury. Risk of chemical leakage and fire.",
  },
  CABLES: {
    level: "NONE",
    description:
      "Generally low risk. PVC insulation may release toxins if burned.",
  },
  APPLIANCES: {
    level: "LOW",
    description: "May contain refrigerants (CFCs/HCFCs) and insulating foams.",
  },
  PCBS: {
    level: "MEDIUM",
    description:
      "Contains heavy metals (lead, cadmium), brominated flame retardants.",
  },
  PERIPHERALS: {
    level: "NONE",
    description: "Generally low risk. Standard electronic components.",
  },
  PRINTERS: {
    level: "LOW",
    description: "Toner cartridges may contain carbon black and other chemicals.",
  },
  NETWORKING: {
    level: "NONE",
    description: "Generally low risk. Standard electronic components.",
  },
  MEDICAL_DEVICES: {
    level: "HIGH",
    description:
      "May contain radioactive materials, mercury, or biological contaminants.",
  },
  OTHER: {
    level: "NONE",
    description: "Hazard level varies depending on the specific item.",
  },
};

export async function GET() {
  try {
    const categories = Object.entries(WASTE_CATEGORY_LABELS).map(
      ([key, label]) => ({
        key,
        label,
        hazard: CATEGORY_HAZARD_INFO[key] || {
          level: "NONE",
          description: "No specific hazard information available.",
        },
      }),
    );

    return apiResponse(categories, "Categories retrieved successfully");
  } catch (error) {
    console.error("Get categories error:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
