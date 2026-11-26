/**
 * API client for GreenCircuit frontend
 * Handles authentication headers and error responses
 */

import type {
  CreatePickupInput,
  ProcessingUpdateInput,
  RecyclerProfileInput,
  UpdateUserProfileInput,
} from "@/lib/validations";

interface APIResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
}

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken");
}

function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const tokens = data.data?.tokens;
    if (data.success && tokens?.accessToken) {
      localStorage.setItem("accessToken", tokens.accessToken);
      if (tokens.refreshToken) {
        localStorage.setItem("refreshToken", tokens.refreshToken);
      }
      return tokens.accessToken;
    }
    return null;
  } catch {
    return null;
  }
}

export async function fetchAPI<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<APIResponse<T>> {
  const token = getAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res = await fetch(url, { ...options, headers });

  // If unauthorized, try refreshing the token
  if (res.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(url, { ...options, headers });
    } else {
      clearAuth();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new Error("Session expired. Please login again.");
    }
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data as APIResponse<T>;
}

// ---- Auth API ----

export async function loginAPI(email: string, password: string) {
  return fetchAPI<{
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
    user: { id: string; name: string; email: string; role: string };
  }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function registerAPI(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: string;
}) {
  return fetchAPI<{
    user: { id: string; name: string; email: string; role: string };
    tokens: { accessToken: string; refreshToken: string };
  }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function verifyOtpAPI(userId: string, code: string, type: string = "EMAIL_VERIFY") {
  return fetchAPI<{
    accessToken?: string;
    refreshToken?: string;
    user?: { id: string; name: string; email: string; role: string };
  }>("/api/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ userId, code, type }),
  });
}

export async function forgotPasswordAPI(email: string) {
  return fetchAPI("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function getMeAPI() {
  return fetchAPI<{
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string | null;
    addressLine1?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    createdAt?: string;
    recyclerProfile?: {
      id: string;
      businessName: string;
      description: string | null;
      facilityAddress: string | null;
      capacity: string | null;
      capabilities: string[];
      rating: number;
      totalReviews: number;
    } | null;
    wallet?: { rewardPoints: number; balance: number } | null;
  }>("/api/auth/me");
}

export async function updateMeAPI(data: UpdateUserProfileInput) {
  return fetchAPI<{
    id: string;
    name: string;
    email: string;
    role: string;
    phone: string | null;
  }>("/api/auth/me", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function updateMyRecyclerProfileAPI(
  data: Partial<RecyclerProfileInput>,
) {
  return fetchAPI("/api/recyclers/me", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function getRecyclerReviewsAPI(recyclerId: string) {
  return fetchAPI<{
    reviews: Array<{
      id: string;
      rating: number;
      comment: string | null;
      createdAt: string;
      user: { id: string; name: string; avatar: string | null };
    }>;
    rating: number;
    totalReviews: number;
    pagination: { page: number; limit: number; total: number };
  }>(`/api/recyclers/${encodeURIComponent(recyclerId)}/reviews`);
}

export async function getLeaderboardAPI() {
  return fetchAPI<
    Array<{
      rank: number;
      name: string;
      stars: number;
      completedPickups: number;
    }>
  >("/api/leaderboard");
}

// ---- Dashboard API ----

export async function getDashboardStatsAPI() {
  return fetchAPI<{
    totalListings: number;
    activePickups: number;
    completedPickups: number;
    communityStars: number;
    weightRecycled: number;
    co2Saved: number;
    rewardPoints: number;
    recentPickups: Array<{
      id: string;
      scheduledDate: string;
      status: string;
      itemCount: number;
      estimatedWeight: number;
      recyclerName?: string;
    }>;
  }>("/api/dashboard/stats");
}

// ---- Waste Listings API ----

export interface WasteListingSummary {
  id: string;
  title: string;
  category: string;
  description: string | null;
  quantity: number;
  estimatedWeight: number | null;
  condition: string | null;
  status: string;
  isHazardous: boolean;
  createdAt: string;
  images: string[];
}

export interface RecyclerSummary {
  id: string;
  name: string;
  businessName: string;
  rating: number;
  reviewCount: number;
  tier: string;
  capabilities: string[];
  city: string;
  state: string;
  isVerified: boolean;
  description?: string;
}

export async function getListingsAPI() {
  const response = await fetchAPI<{
    listings: WasteListingSummary[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>("/api/waste/listings");

  return { ...response, data: response.data.listings };
}

export async function createListingAPI(data: {
  title: string;
  category: string;
  description: string;
  quantity: number;
  estimatedWeight: number;
  condition: string;
  isHazardous: boolean;
  images: string[];
  hazardDetails?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}) {
  return fetchAPI("/api/waste/listings", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ---- Pickups API ----

interface PickupProcessingUpdate {
  id: string;
  eventType: string;
  notes: string | null;
  timestamp: string;
  locationName: string | null;
}

interface PickupWasteItem {
  id: string;
  category: string;
  description: string | null;
  actualWeight: number | null;
  processingStatus: string;
  listing: {
    title: string;
    estimatedWeight: number | null;
    quantity: number;
    condition: string | null;
  } | null;
  chainOfCustody: PickupProcessingUpdate[];
}

interface PickupRecord {
  id: string;
  scheduledAt: string;
  status: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  estimatedWeight: number | null;
  instructions: string | null;
  otpCode: string | null;
  createdAt: string;
  updatedAt: string;
  recycler: {
    id: string;
    businessName: string;
    user: { phone: string | null };
  } | null;
  generator?: { id: string; name: string };
  tracking?: { status: string | null; updatedAt: string };
  wasteItems: PickupWasteItem[];
}

function normalizePickup(pickup: PickupRecord) {
  return {
    id: pickup.id,
    scheduledDate: pickup.scheduledAt,
    status: pickup.status,
    address: pickup.addressLine1,
    city: pickup.city,
    state: pickup.state,
    pincode: pickup.postalCode,
    itemCount: pickup.wasteItems.length,
    estimatedWeight: pickup.estimatedWeight ?? 0,
    specialInstructions: pickup.instructions ?? undefined,
    otp: pickup.otpCode ?? undefined,
    recycler: pickup.recycler
      ? {
          id: pickup.recycler.id,
          name: pickup.recycler.businessName,
          phone: pickup.recycler.user.phone ?? undefined,
        }
      : undefined,
    generatorName: pickup.generator?.name,
    items: pickup.wasteItems.map((item) => ({
      id: item.id,
      title: item.listing?.title || item.description || item.category,
      category: item.category,
      quantity: item.listing?.quantity ?? 1,
      estimatedWeight: item.actualWeight ?? item.listing?.estimatedWeight ?? 0,
      condition: item.listing?.condition ?? "not specified",
      processingStatus: item.processingStatus,
      processingUpdates: item.chainOfCustody,
    })),
    createdAt: pickup.createdAt,
    statusHistory: pickup.tracking?.status
      ? [{ status: pickup.tracking.status, timestamp: pickup.tracking.updatedAt }]
      : [],
  };
}

export async function getPickupsAPI(status?: string) {
  const url = status ? `/api/pickups?status=${status}` : "/api/pickups";
  const response = await fetchAPI<{
    pickups: PickupRecord[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>(url);
  return { ...response, data: response.data.pickups.map(normalizePickup) };
}

export async function getPickupByIdAPI(id: string) {
  const response = await fetchAPI<PickupRecord>(`/api/pickups/${id}`);
  return { ...response, data: normalizePickup(response.data) };
}

export async function createPickupAPI(data: CreatePickupInput) {
  return fetchAPI("/api/pickups", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updatePickupStatusAPI(id: string, status: string) {
  return fetchAPI(`/api/pickups/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function updateWasteItemProcessingAPI(
  pickupId: string,
  itemId: string,
  data: ProcessingUpdateInput,
) {
  return fetchAPI(`/api/pickups/${pickupId}/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// ---- Recyclers API ----

export async function getRecyclersAPI(params?: { city?: string; capability?: string; search?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.city) searchParams.set("city", params.city);
  if (params?.capability) searchParams.set("capability", params.capability);
  if (params?.search) searchParams.set("search", params.search);
  const qs = searchParams.toString();
  const response = await fetchAPI<{
    recyclers: Array<{
      id: string;
      businessName: string;
      rating: number;
      totalReviews: number;
      tier: string;
      capabilities: string[];
      isVerified: boolean;
      description: string | null;
      user: {
        name: string;
        city: string | null;
        state: string | null;
      };
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>(`/api/recyclers${qs ? `?${qs}` : ""}`);

  return {
    ...response,
    data: response.data.recyclers.map((recycler) => ({
      id: recycler.id,
      name: recycler.businessName,
      businessName: recycler.businessName,
      rating: recycler.rating,
      reviewCount: recycler.totalReviews,
      tier: recycler.tier,
      capabilities: recycler.capabilities,
      city: recycler.user.city ?? "",
      state: recycler.user.state ?? "",
      isVerified: recycler.isVerified,
      description: recycler.description ?? undefined,
    })),
  };
}

// ---- Recycler Dashboard API ----

export async function getRecyclerDashboardAPI() {
  return fetchAPI<{
    pendingPickups: number;
    inProgressPickups: number;
    completedPickups: number;
    totalWeightProcessed: number;
    rating: number;
    recentPickups: Array<{
      id: string;
      scheduledDate: string;
      status: string;
      generatorName: string;
      itemCount: number;
      estimatedWeight: number;
    }>;
  }>("/api/dashboard/stats");
}
