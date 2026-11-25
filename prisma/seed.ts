import { PrismaClient, UserRole, WasteCategory, RecyclerTier, VerificationStatus, HazardLevel, ListingStatus, PickupStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding GreenCircuit database...");

  // Clear existing
  await prisma.chainOfCustody.deleteMany();
  await prisma.wasteItem.deleteMany();
  await prisma.tracking.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.pickupRequest.deleteMany();
  await prisma.wasteListing.deleteMany();
  await prisma.review.deleteMany();
  await prisma.recyclerDocument.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.recycler.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.otpCode.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Password@123", 10);

  // 1. Create Generator User
  const generator = await prisma.user.create({
    data: {
      email: "generator@greencircuit.io",
      name: "Aarav Sharma",
      phone: "+919876543210",
      passwordHash,
      role: UserRole.GENERATOR,
      emailVerified: true,
      phoneVerified: true,
      impactScore: 84.5,
      totalWeightKg: 42.5,
      co2SavedKg: 63.75,
      city: "Mumbai",
      state: "Maharashtra",
      addressLine1: "Flat 402, Green Heights, SV Road",
      wallet: {
        create: {
          balance: 250.0,
          rewardPoints: 420,
        },
      },
    },
  });

  // 2. Create Recycler User 1
  const recyclerUser1 = await prisma.user.create({
    data: {
      email: "recycler1@greencircuit.io",
      name: "Vikram Singhania",
      phone: "+919820011223",
      passwordHash,
      role: UserRole.RECYCLER,
      emailVerified: true,
      city: "Mumbai",
      state: "Maharashtra",
      wallet: {
        create: {
          balance: 14500.0,
          rewardPoints: 1200,
        },
      },
      recyclerProfile: {
        create: {
          businessName: "EcoRecycle Systems Ltd",
          licenseNumber: "CPCB-EW-2023-8819",
          registrationNo: "U37200MH2020PTC345678",
          tier: RecyclerTier.CERTIFIED_GREEN,
          description: "Certified zero-landfill e-waste processing facility with hydrometallurgical rare-earth metal recovery.",
          facilityAddress: "Plot 18, TTC Industrial Zone, Mahape, Navi Mumbai",
          capacity: "2500 kg/day",
          capabilities: ["COMPUTERS", "MOBILES", "BATTERIES", "PCBS", "TELEVISIONS"],
          rating: 4.9,
          totalReviews: 48,
          isVerified: true,
          verification: {
            create: {
              status: VerificationStatus.APPROVED,
              reviewedBy: "System Auditor",
              reviewerNotes: "All State Pollution Control Board clearances verified.",
              reviewedAt: new Date(),
            },
          },
        },
      },
    },
    include: {
      recyclerProfile: true,
    },
  });

  // 3. Create Recycler User 2
  const recyclerUser2 = await prisma.user.create({
    data: {
      email: "recycler2@greencircuit.io",
      name: "Pooja Hegde",
      phone: "+919830022334",
      passwordHash,
      role: UserRole.RECYCLER,
      emailVerified: true,
      city: "Bengaluru",
      state: "Karnataka",
      wallet: {
        create: {
          balance: 8900.0,
          rewardPoints: 850,
        },
      },
      recyclerProfile: {
        create: {
          businessName: "CleanEarth Circular Resources",
          licenseNumber: "KSPCB-EW-9921",
          registrationNo: "U37100KA2021PTC123456",
          tier: RecyclerTier.PREMIUM,
          description: "Authorized e-waste recovery specialist focusing on corporate IT decommissioning and secure data sanitization.",
          facilityAddress: "Whitefield Industrial Area, Phase II, Bengaluru",
          capacity: "1800 kg/day",
          capabilities: ["COMPUTERS", "NETWORKING", "PRINTERS", "CABLES"],
          rating: 4.8,
          totalReviews: 32,
          isVerified: true,
          verification: {
            create: {
              status: VerificationStatus.APPROVED,
              reviewedAt: new Date(),
            },
          },
        },
      },
    },
  });

  // 4. Create Listings for generator
  const listing1 = await prisma.wasteListing.create({
    data: {
      userId: generator.id,
      category: WasteCategory.COMPUTERS,
      title: "Dell Latitude E7470 (Broken Screen, Working Motherboard)",
      description: "Old laptop from office upgrade. 16GB RAM, 256GB SSD removed.",
      quantity: 1,
      estimatedWeight: 2.1,
      condition: "damaged",
      isHazardous: false,
      hazardLevel: HazardLevel.LOW,
      status: ListingStatus.MATCHED,
      city: "Mumbai",
      state: "Maharashtra",
    },
  });

  const listing2 = await prisma.wasteListing.create({
    data: {
      userId: generator.id,
      category: WasteCategory.BATTERIES,
      title: "Laptop & UPS Battery Pack Assortment",
      description: "6 Li-ion 18650 packs + 1 lead-acid inverter cell.",
      quantity: 7,
      estimatedWeight: 8.5,
      condition: "non-functional",
      isHazardous: true,
      hazardLevel: HazardLevel.HIGH,
      hazardDetails: "Contains lithium-ion and lead electrolyte",
      status: ListingStatus.MATCHED,
      city: "Mumbai",
      state: "Maharashtra",
    },
  });

  // 5. Create Pickup
  const pickup = await prisma.pickupRequest.create({
    data: {
      generatorId: generator.id,
      recyclerId: recyclerUser1.recyclerProfile?.id,
      status: PickupStatus.EN_ROUTE,
      scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      addressLine1: "Flat 402, Green Heights, SV Road",
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "400053",
      otpCode: "4918",
      estimatedWeight: 10.6,
      instructions: "Ring bell 402, lift available, driver please bring anti-static bins",
      tracking: {
        create: {
          agentLat: 19.076,
          agentLng: 72.8777,
          status: "Approaching pickup location",
        },
      },
    },
  });

  // Link waste items to pickup
  await prisma.wasteItem.create({
    data: {
      pickupId: pickup.id,
      listingId: listing1.id,
      qrCode: "GC-LP-8812-A",
      category: WasteCategory.COMPUTERS,
      description: listing1.title,
      actualWeight: 2.1,
    },
  });

  await prisma.wasteItem.create({
    data: {
      pickupId: pickup.id,
      listingId: listing2.id,
      qrCode: "GC-BT-9901-B",
      category: WasteCategory.BATTERIES,
      description: listing2.title,
      actualWeight: 8.5,
    },
  });

  console.log("Database seeded successfully with demo users, recyclers, and pickups!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
