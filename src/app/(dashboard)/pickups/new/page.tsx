"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getListingsAPI, getRecyclersAPI, createPickupAPI } from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiCalendar,
  FiMapPin,
  FiCpu,
  FiCheck,
  FiShield,
} from "react-icons/fi";

interface AvailableListing {
  id: string;
  title: string;
  category: string;
  quantity: number;
  estimatedWeight: number | null;
  status: string;
}

interface RecyclerOption {
  id: string;
  name: string;
  tier: string;
  city: string;
}

export default function NewPickupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [listings, setListings] = useState<AvailableListing[]>([]);
  const [recyclers, setRecyclers] = useState<RecyclerOption[]>([]);
  const [selectedListingIds, setSelectedListingIds] = useState<string[]>([]);

  const [scheduledDate, setScheduledDate] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Mumbai");
  const [state, setState] = useState("Maharashtra");
  const [pincode, setPincode] = useState("400001");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [selectedRecyclerId, setSelectedRecyclerId] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [listingsRes, recyclersRes] = await Promise.all([
          getListingsAPI(),
          getRecyclersAPI(),
        ]);

        if (listingsRes.success && listingsRes.data) {
          // Pickup requests can only be created for active listings.
          const available = listingsRes.data.filter((listing) => listing.status === "ACTIVE");
          setListings(available);
          if (available.length > 0) {
            setSelectedListingIds([available[0].id]);
          }
        }

        if (recyclersRes.success && recyclersRes.data) {
          setRecyclers(recyclersRes.data);
          if (recyclersRes.data.length > 0) {
            setSelectedRecyclerId(recyclersRes.data[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load options:", err);
      } finally {
        setFetching(false);
      }
    }
    loadData();

    // Default to tomorrow 10:00 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    setScheduledDate(tomorrow.toISOString().slice(0, 16));
  }, []);

  const toggleListing = (id: string) => {
    if (selectedListingIds.includes(id)) {
      if (selectedListingIds.length === 1) {
        toast.error("At least one item must be selected for pickup");
        return;
      }
      setSelectedListingIds(selectedListingIds.filter((item) => item !== id));
    } else {
      setSelectedListingIds([...selectedListingIds, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedListingIds.length === 0) {
      toast.error("Please select at least one e-waste item");
      return;
    }
    if (!address.trim()) {
      toast.error("Please enter the pickup address");
      return;
    }

    setLoading(true);
    try {
      const res = await createPickupAPI({
        listingIds: selectedListingIds,
        scheduledAt: new Date(scheduledDate).toISOString(),
        isInstant: false,
        addressLine1: address,
        city,
        state,
        postalCode: pincode,
        instructions: specialInstructions || undefined,
        recyclerId: selectedRecyclerId || undefined,
      });

      if (res.success) {
        toast.success("Pickup scheduled successfully! Track driver en route.");
        router.push("/pickups");
      }
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Failed to schedule pickup.");
    } finally {
      setLoading(false);
    }
  };

  const totalSelectedWeight = listings
    .filter((l) => selectedListingIds.includes(l.id))
    .reduce((sum, l) => sum + (l.estimatedWeight || 1), 0);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/pickups"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900"
      >
        <FiArrowLeft className="h-4 w-4" /> Back to Pickups
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Schedule E-Waste Pickup</h1>
        <p className="mt-1 text-sm text-gray-500">
          Select items from your inventory, pick a date, and an authorized van will collect them at your doorstep.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Select Items */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">
              1. Select Waste Items to Pickup
            </h2>
            <span className="text-xs font-semibold text-primary-600">
              {selectedListingIds.length} item(s) selected (~{totalSelectedWeight.toFixed(1)} kg)
            </span>
          </div>

          {fetching ? (
            <div className="py-4 text-center text-xs text-gray-500">Loading your items...</div>
          ) : listings.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {listings.map((item) => {
                const isSelected = selectedListingIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleListing(item.id)}
                    className={`cursor-pointer rounded-xl border p-3.5 transition flex items-center justify-between ${
                      isSelected
                        ? "border-primary-600 bg-primary-50/40 ring-1 ring-primary-500"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        isSelected ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-500"
                      }`}>
                        <FiCpu className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900">{item.title}</div>
                        <div className="text-[11px] text-gray-500">
                          {item.quantity} unit(s) • ~{item.estimatedWeight || 1} kg
                        </div>
                      </div>
                    </div>
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                        isSelected
                          ? "border-primary-600 bg-primary-600 text-white"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {isSelected && <FiCheck className="h-3 w-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-xs text-gray-500">
              No items in your inventory yet.{" "}
              <Link href="/listings/new" className="font-bold text-primary-600 underline">
                Add an item first
              </Link>
            </div>
          )}
        </Card>

        {/* Step 2: Time Slot */}
        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">
            2. Date & Time Slot
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Preferred Pickup Time
              </label>
              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Select Processing Recycler
              </label>
              <select
                value={selectedRecyclerId}
                onChange={(e) => setSelectedRecyclerId(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              >
                {recyclers.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.tier}) - {r.city}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Step 3: Address */}
        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">
            3. Doorstep Collection Address
          </h2>

          <Input
            label="Street Address / Building / Flat"
            type="text"
            placeholder="e.g. Flat 402, Green Heights, SV Road"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="City"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
            <Input
              label="State"
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
            />
            <Input
              label="Pincode"
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Driver Instructions (Gate code, floor, landmarks)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Ring bell 402, lift available, heavy scrap located in basement..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-xs text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href="/pickups">
            <Button variant="ghost" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" loading={loading} disabled={selectedListingIds.length === 0}>
            Confirm & Dispatch Pickup
          </Button>
        </div>
      </form>
    </div>
  );
}
