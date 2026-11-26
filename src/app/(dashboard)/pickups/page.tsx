"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getPickupsAPI } from "@/lib/api";
import StatusBadge from "@/components/ui/StatusBadge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import {
  FiCalendar,
  FiMapPin,
  FiTruck,
  FiPlus,
  FiArrowRight,
  FiShield,
} from "react-icons/fi";

interface PickupItem {
  id: string;
  scheduledDate: string;
  status: string;
  address: string;
  itemCount: number;
  estimatedWeight: number;
  otp?: string;
  recycler?: { id: string; name: string };
  createdAt: string;
}

export default function PickupsPage() {
  const [pickups, setPickups] = useState<PickupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    async function load() {
      try {
        const res = await getPickupsAPI(filter === "ALL" ? undefined : filter);
        if (res.success && res.data) {
          setPickups(res.data);
        }
      } catch (err) {
        console.error("Pickups load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [filter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">E-Waste Pickups</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track pickup vans live, check driver details, and access your handover security OTP.
          </p>
        </div>
        <Link href="/pickups/new">
          <Button>
            <FiPlus className="mr-1.5 h-4 w-4" /> Book New Pickup
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        {["ALL", "REQUESTED", "CONFIRMED", "AGENT_ASSIGNED", "EN_ROUTE", "ARRIVED", "PICKED_UP", "IN_TRANSIT", "AT_FACILITY", "PROCESSING", "COMPLETED", "CANCELLED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              filter === tab
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.replace("_", " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : pickups.length > 0 ? (
        <div className="space-y-4">
          {pickups.map((p) => (
            <Card key={p.id} className="p-6 transition hover:shadow-md">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-gray-900">
                      Pickup #{p.id.slice(0, 8)}
                    </span>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="flex items-center gap-1.5 text-xs text-gray-500 pt-1">
                    <FiCalendar className="h-3.5 w-3.5" />
                    <span>
                      Scheduled for{" "}
                      {new Date(p.scheduledDate).toLocaleDateString("en-IN", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-gray-500">
                    <FiMapPin className="h-3.5 w-3.5" />
                    <span className="line-clamp-1">{p.address}</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 sm:justify-end">
                  {p.otp && (
                    <div className="rounded-xl border border-dashed border-primary-300 bg-primary-50 px-3 py-1.5 text-center">
                      <div className="text-[10px] uppercase font-bold text-primary-700">Handover OTP</div>
                      <div className="font-mono text-sm font-black tracking-widest text-primary-900">
                        {p.otp}
                      </div>
                    </div>
                  )}

                  <div className="text-right text-xs">
                    <div className="font-bold text-gray-900">{p.itemCount} Items ({p.estimatedWeight} kg)</div>
                    <div className="text-gray-500">{p.recycler?.name || "Assigned Facility"}</div>
                  </div>

                  <Link href={`/pickups/${p.id}`}>
                    <Button size="sm" variant="outline" className="gap-1">
                      <span>Track Live</span>
                      <FiArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 mb-4">
            <FiTruck className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No pickups found</h3>
          <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
            You don&apos;t have any pickups matching this filter. Schedule a pickup to send your e-waste to a recycler.
          </p>
          <div className="mt-6">
            <Link href="/pickups/new">
              <Button>
                <FiPlus className="mr-1.5 h-4 w-4" /> Schedule a Pickup
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
