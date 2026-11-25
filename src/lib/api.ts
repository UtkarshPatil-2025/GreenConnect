/**
 * API client for GreenCircuit frontend
 * Handles authentication headers and error responses
 */

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
    if (data.success && data.data?.accessToken) {
      localStorage.setItem("accessToken", data.data.accessToken);
      if (data.data.refreshToken) {
        localStorage.setItem("refreshToken", data.data.refreshToken);
      }
      return data.data.accessToken;
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
    accessToken: string;
    refreshToken: string;
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
    phone?: string;
  }>("/api/auth/me");
}

// ---- Dashboard API ----

export async function getDashboardStatsAPI() {
  return fetchAPI<{
    totalListings: number;
    activePickups: number;
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

export async function getListingsAPI() {
  return fetchAPI<
    Array<{
      id: string;
      title: string;
      category: string;
      description: string;
      quantity: number;
      estimatedWeight: number;
      condition: string;
      status: string;
      isHazardous: boolean;
      createdAt: string;
      images?: string[];
    }>
  >("/api/waste/listings");
}

export async function createListingAPI(data: {
  title: string;
  category: string;
  description: string;
  quantity: number;
  estimatedWeight: number;
  condition: string;
  isHazardous: boolean;
  hazardousDetails?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}) {
  return fetchAPI("/api/waste/listings", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ---- Pickups API ----

export async function getPickupsAPI(status?: string) {
  const url = status ? `/api/pickups?status=${status}` : "/api/pickups";
  return fetchAPI<
    Array<{
      id: string;
      scheduledDate: string;
      status: string;
      address: string;
      itemCount: number;
      estimatedWeight: number;
      specialInstructions?: string;
      otp?: string;
      recycler?: { id: string; name: string; phone?: string };
      items?: Array<{ id: string; title: string; category: string; weight: number }>;
      createdAt: string;
    }>
  >(url);
}

export async function getPickupByIdAPI(id: string) {
  return fetchAPI<{
    id: string;
    scheduledDate: string;
    status: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    itemCount: number;
    estimatedWeight: number;
    specialInstructions?: string;
    otp?: string;
    recycler?: { id: string; name: string; phone?: string; email?: string };
    items: Array<{
      id: string;
      title: string;
      category: string;
      quantity: number;
      estimatedWeight: number;
      condition: string;
    }>;
    statusHistory: Array<{
      status: string;
      timestamp: string;
      note?: string;
    }>;
    createdAt: string;
  }>(`/api/pickups/${id}`);
}

export async function createPickupAPI(data: {
  listingIds: string[];
  scheduledDate: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  specialInstructions?: string;
  recyclerId?: string;
}) {
  return fetchAPI("/api/pickups", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updatePickupStatusAPI(id: string, status: string) {
  return fetchAPI(`/api/pickups/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// ---- Recyclers API ----

export async function getRecyclersAPI(params?: { city?: string; capability?: string; search?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.city) searchParams.set("city", params.city);
  if (params?.capability) searchParams.set("capability", params.capability);
  if (params?.search) searchParams.set("search", params.search);
  const qs = searchParams.toString();
  return fetchAPI<
    Array<{
      id: string;
      name: string;
      businessName?: string;
      rating: number;
      reviewCount: number;
      tier: string;
      capabilities: string[];
      city: string;
      state: string;
      isVerified: boolean;
      description?: string;
    }>
  >(`/api/recyclers${qs ? `?${qs}` : ""}`);
}

// ---- Recycler Dashboard API ----

export async function getRecyclerDashboardAPI() {
  return fetchAPI<{
    verificationStatus: string;
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
  }>("/api/recycler/dashboard");
}

// ---- Recycler Verification API ----

export async function updateRecyclerProfileAPI(data: {
  businessName?: string;
  licenseNumber?: string;
  registrationNumber?: string;
  description?: string;
  facilityAddress?: string;
  capacity?: number;
  capabilities?: string[];
}) {
  return fetchAPI("/api/recycler/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function submitVerificationAPI() {
  return fetchAPI("/api/recycler/verify", {
    method: "POST",
  });
}
