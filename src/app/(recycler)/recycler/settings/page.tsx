"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { getMeAPI, updateMyRecyclerProfileAPI } from "@/lib/api";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function RecyclerSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [facilityAddress, setFacilityAddress] = useState("");
  const [capacity, setCapacity] = useState("");

  useEffect(() => {
    getMeAPI()
      .then((response) => {
        const profile = response.data.recyclerProfile;
        if (!profile) {
          setError("Recycler profile not found.");
          return;
        }
        setBusinessName(profile.businessName);
        setDescription(profile.description || "");
        setFacilityAddress(profile.facilityAddress || "");
        setCapacity(profile.capacity || "");
      })
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : "Could not load facility settings.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await updateMyRecyclerProfileAPI({
        businessName: businessName.trim(),
        description: description.trim() || undefined,
        facilityAddress: facilityAddress.trim() || undefined,
        capacity: capacity.trim() || undefined,
      });
      if (!response.success) throw new Error(response.message || "Could not save facility settings.");
      toast.success("Facility settings saved.");
    } catch (cause: unknown) {
      const message = cause instanceof Error ? cause.message : "Could not save facility settings.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="animate-fade-up mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-700">Facility</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">Recycler settings</h1>
        <p className="mt-1 text-sm text-gray-500">Keep your public facility details accurate for pickup requests.</p>
      </div>

      {loading ? (
        <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
      ) : (
        <Card className="p-5 sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Business / facility name"
              value={businessName}
              onChange={(event) => setBusinessName(event.target.value)}
              required
            />
            <div>
              <label htmlFor="facility-description" className="mb-1 block text-xs font-semibold text-gray-700">
                Description
              </label>
              <textarea
                id="facility-description"
                rows={4}
                maxLength={2000}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                placeholder="Describe the recycling services your facility handles."
              />
              <p className="mt-1 text-right text-xs text-gray-400">{description.length}/2000</p>
            </div>
            <Input
              label="Facility address"
              value={facilityAddress}
              onChange={(event) => setFacilityAddress(event.target.value)}
              placeholder="Street, area, city"
            />
            <Input
              label="Processing capacity"
              value={capacity}
              onChange={(event) => setCapacity(event.target.value)}
              placeholder="e.g. 500 kg/day"
            />
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end border-t border-gray-100 pt-4">
              <Button type="submit" loading={saving}>Save facility settings</Button>
            </div>
          </form>
        </Card>
      )}
    </section>
  );
}
