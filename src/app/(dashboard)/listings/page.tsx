"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getListingsAPI, type WasteListingSummary } from "@/lib/api";
import { WASTE_CATEGORY_LABELS } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import {
  FiPlus,
  FiCpu,
  FiAlertTriangle,
} from "react-icons/fi";

export default function ListingsPage() {
  const [listings, setListings] = useState<WasteListingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await getListingsAPI();
        if (res.success && res.data) {
          setListings(res.data);
        }
      } catch (err) {
        console.error("Listings load error:", err);
        setLoadError(
          err instanceof Error ? err.message : "Unable to load your listings.",
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My E-Waste Listings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your discarded electronics and bundle them into pickups.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/pickups/new">
            <Button variant="outline">Schedule Pickup</Button>
          </Link>
          <Link href="/listings/new">
            <Button>
              <FiPlus className="mr-1.5 h-4 w-4" /> Add Item
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : loadError ? (
        <div role="alert">
          <Card className="p-8 text-center">
            <p className="font-semibold text-red-700">Could not load your listings</p>
            <p className="mt-1 text-sm text-gray-600">{loadError}</p>
          </Card>
        </div>
      ) : listings.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((item) => (
            <Card key={item.id} className="flex flex-col justify-between p-5 hover:shadow-md transition">
              <div>
                {item.images[0] && (
                  <Image
                    src={item.images[0]}
                    alt={item.title}
                    width={640}
                    height={400}
                    unoptimized
                    className="mb-4 h-40 w-full rounded-lg object-cover"
                  />
                )}
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-md bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-700">
                    {WASTE_CATEGORY_LABELS[item.category] || item.category}
                  </span>
                  <Badge
                    variant={
                      item.status === "ACTIVE"
                        ? "success"
                        : item.status === "MATCHED"
                        ? "info"
                        : "default"
                    }
                  >
                    {item.status}
                  </Badge>
                </div>

                <h3 className="mt-3 font-bold text-gray-900 text-base">{item.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                  {item.description || "No additional description provided."}
                </p>
              </div>

              <div className="mt-5 border-t border-gray-100 pt-3 text-xs text-gray-600 space-y-2">
                <div className="flex items-center justify-between">
                  <span>Quantity & Weight:</span>
                  <span className="font-semibold text-gray-900">
                    {item.quantity} units • {item.estimatedWeight || 1} kg
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Condition:</span>
                  <span className="capitalize font-medium text-gray-800">
                    {item.condition || "Used"}
                  </span>
                </div>
                {item.isHazardous && (
                  <div className="flex items-center gap-1.5 text-amber-600 font-semibold text-[11px]">
                    <FiAlertTriangle className="h-3.5 w-3.5" /> Hazardous Components
                  </div>
                )}
                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                  <span>Added on {new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 mb-4">
            <FiCpu className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No electronics listed yet</h3>
          <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
            Add items like old computers, smartphones, chargers, circuit boards, or large appliances to begin your green disposal journey.
          </p>
          <div className="mt-6">
            <Link href="/listings/new">
              <Button>
                <FiPlus className="mr-2 h-4 w-4" /> Add Your First Item
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
