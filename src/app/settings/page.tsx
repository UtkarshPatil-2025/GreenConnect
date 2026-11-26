"use client";

import React, { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";
import { getMeAPI, updateMeAPI } from "@/lib/api";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      router.replace("/login");
      return;
    }

    getMeAPI()
      .then((response) => {
        if (!response.success) return;
        setName(response.data.name);
        setPhone(response.data.phone || "");
        setAddressLine1(response.data.addressLine1 || "");
        setCity(response.data.city || "");
        setState(response.data.state || "");
        setPostalCode(response.data.postalCode || "");
      })
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : "Could not load account settings.");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await updateMeAPI({
        name: name.trim(),
        phone: phone.trim() || null,
        addressLine1: addressLine1.trim() || null,
        city: city.trim() || null,
        state: state.trim() || null,
        postalCode: postalCode.trim() || null,
      });
      if (!response.success) throw new Error(response.message || "Could not save your settings.");

      localStorage.setItem("user", JSON.stringify(response.data));
      window.dispatchEvent(new Event("user-profile-updated"));
      toast.success("Account settings saved.");
    } catch (cause: unknown) {
      const message = cause instanceof Error ? cause.message : "Could not save your settings.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <section className="animate-fade-up mx-auto max-w-3xl space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-700">Account</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">Keep your contact and pickup address up to date.</p>
        </div>

        {loading ? (
          <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
        ) : (
          <Card className="p-5 sm:p-7">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Full name" value={name} onChange={(event) => setName(event.target.value)} required />
                <Input label="Phone number" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} />
              </div>
              <Input
                label="Pickup address"
                value={addressLine1}
                onChange={(event) => setAddressLine1(event.target.value)}
                placeholder="Street, building, apartment"
              />
              <div className="grid gap-4 sm:grid-cols-3">
                <Input label="City" value={city} onChange={(event) => setCity(event.target.value)} />
                <Input label="State" value={state} onChange={(event) => setState(event.target.value)} />
                <Input label="Postal code" value={postalCode} onChange={(event) => setPostalCode(event.target.value)} />
              </div>
              {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <Link href="/forgot-password" className="text-sm font-semibold text-primary-700 hover:text-primary-800">
                  Reset password
                </Link>
                <Button type="submit" loading={saving}>Save settings</Button>
              </div>
            </form>
          </Card>
        )}
      </section>
    </DashboardLayout>
  );
}
