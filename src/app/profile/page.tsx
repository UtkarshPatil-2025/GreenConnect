"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { getMeAPI } from "@/lib/api";

interface AccountProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  createdAt?: string;
  recyclerProfile?: {
    businessName: string;
    facilityAddress: string | null;
    description: string | null;
  } | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      router.replace("/login");
      return;
    }

    getMeAPI()
      .then((response) => {
        if (response.success) setProfile(response.data);
      })
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : "Could not load your profile.");
      })
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <DashboardLayout>
      <section className="animate-fade-up mx-auto max-w-3xl space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary-700">Account</p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">Your profile</h1>
            <p className="mt-1 text-sm text-gray-500">Review the information connected to your GreenCircuit account.</p>
          </div>
          <Link href="/settings">
            <Button variant="outline">Edit account details</Button>
          </Link>
        </div>

        {loading ? (
          <div className="h-40 animate-pulse rounded-2xl bg-gray-100" />
        ) : error ? (
          <Card className="p-6 text-sm text-red-700">{error}</Card>
        ) : profile ? (
          <Card className="grid gap-6 p-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-gray-500">Name</p>
              <p className="mt-1 break-words font-semibold text-gray-900">{profile.name}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Account type</p>
              <p className="mt-1 font-semibold capitalize text-gray-900">{profile.role.toLowerCase()}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Email</p>
              <p className="mt-1 break-all font-semibold text-gray-900">{profile.email}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Phone</p>
              <p className="mt-1 font-semibold text-gray-900">{profile.phone || "Not provided"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Location</p>
              <p className="mt-1 font-semibold text-gray-900">
                {[profile.city, profile.state].filter(Boolean).join(", ") || "Not provided"}
              </p>
            </div>
            {profile.createdAt && (
              <div>
                <p className="text-xs font-medium text-gray-500">Member since</p>
                <p className="mt-1 font-semibold text-gray-900">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}
            {profile.recyclerProfile && (
              <div className="border-t border-gray-100 pt-4 sm:col-span-2">
                <p className="text-xs font-medium text-gray-500">Recycler facility</p>
                <p className="mt-1 font-semibold text-gray-900">{profile.recyclerProfile.businessName}</p>
                <p className="mt-1 text-sm text-gray-600">
                  {profile.recyclerProfile.facilityAddress || profile.recyclerProfile.description || "Add facility details in Recycler Settings."}
                </p>
              </div>
            )}
          </Card>
        ) : (
          <Card className="p-6 text-sm text-gray-600">Profile information is unavailable.</Card>
        )}
      </section>
    </DashboardLayout>
  );
}
