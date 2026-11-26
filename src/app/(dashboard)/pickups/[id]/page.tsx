"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getPickupByIdAPI } from "@/lib/api";
import StatusBadge from "@/components/ui/StatusBadge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import {
  FiArrowLeft,
  FiMapPin,
  FiCheckCircle,
  FiClock,
  FiTruck,
  FiCpu,
  FiPhone,
  FiAward,
} from "react-icons/fi";

interface PickupDetail {
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
  statusHistory?: Array<{
    status: string;
    timestamp: string;
    note?: string;
  }>;
}

const TIMELINE_STEPS = [
  { key: "REQUESTED", label: "Requested" },
  { key: "AGENT_ASSIGNED", label: "Agent Assigned" },
  { key: "EN_ROUTE", label: "En Route" },
  { key: "ARRIVED", label: "Arrived" },
  { key: "PICKED_UP", label: "Picked Up" },
  { key: "PROCESSING", label: "Recycling Facility" },
  { key: "COMPLETED", label: "Certificate Issued" },
];

export default function PickupDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [pickup, setPickup] = useState<PickupDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const res = await getPickupByIdAPI(id);
        if (res.success && res.data) {
          setPickup(res.data);
        }
      } catch (err) {
        console.error("Pickup detail load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (!pickup) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-gray-900">Pickup not found</h2>
        <Link href="/pickups" className="mt-4 inline-block">
          <Button variant="outline">Back to Pickups</Button>
        </Link>
      </div>
    );
  }

  // Calculate current timeline index
  const currentIndex = TIMELINE_STEPS.findIndex((s) => s.key === pickup.status);
  const activeStepIdx = currentIndex >= 0 ? currentIndex : 1;

  return (
    <div className="space-y-6">
      <Link
        href="/pickups"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900"
      >
        <FiArrowLeft className="h-4 w-4" /> Back to All Pickups
      </Link>

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-xl font-black text-gray-900">
              Pickup #{pickup.id.slice(0, 8)}
            </h1>
            <StatusBadge status={pickup.status} />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Created on {new Date(pickup.scheduledDate).toLocaleDateString()}
          </p>
        </div>

        {/* Security OTP */}
        {pickup.otp && (
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-primary-300 bg-primary-50 px-4 py-2">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-primary-700">
                Doorstep Security OTP
              </div>
              <div className="font-mono text-xl font-black tracking-widest text-primary-900">
                {pickup.otp}
              </div>
            </div>
            <div className="text-[11px] text-primary-700 max-w-[130px]">
              Share with driver upon arrival
            </div>
          </div>
        )}
      </div>

      {/* Real-time Tracking Stepper */}
      <Card className="p-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-6">
          Real-Time Chain of Custody Pipeline
        </h2>

        <div className="relative">
          <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-gray-200 z-0" />
          <div
            className="hidden sm:block absolute top-1/2 left-0 h-1 -translate-y-1/2 bg-primary-600 z-0 transition-all duration-500"
            style={{
              width: `${(activeStepIdx / (TIMELINE_STEPS.length - 1)) * 100}%`,
            }}
          />

          <div className="grid grid-cols-2 sm:grid-cols-7 gap-4 relative z-10">
            {TIMELINE_STEPS.map((step, idx) => {
              const isDone = idx <= activeStepIdx;
              const isCurrent = idx === activeStepIdx;

              return (
                <div key={step.key} className="flex flex-col items-center text-center">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition ${
                      isDone
                        ? "bg-primary-600 text-white shadow-md shadow-primary-500/30"
                        : "bg-gray-100 text-gray-400"
                    } ${isCurrent ? "ring-4 ring-primary-200 scale-110" : ""}`}
                  >
                    {isDone ? <FiCheckCircle className="h-4 w-4" /> : idx + 1}
                  </div>
                  <span
                    className={`mt-2 text-[11px] font-medium leading-tight ${
                      isDone ? "text-gray-900 font-bold" : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Grid: Live Simulation Map & Details */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Live Map Radar */}
        <Card className="lg:col-span-2 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-sm font-bold text-gray-900">Live GPS Van Telemetry</h3>
              </div>
              <span className="text-xs font-semibold text-primary-600">WebSocket Connected</span>
            </div>

            {/* Simulated Live Map Graphic */}
            <div className="relative mt-4 h-64 w-full overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 p-4 border border-gray-200 flex items-center justify-center text-center">
              <div className="absolute inset-0 bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

              <div className="relative z-10 flex flex-col items-center">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-xl shadow-primary-600/30">
                  <FiTruck className="h-6 w-6 animate-bounce" />
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500"></span>
                  </span>
                </div>
                <div className="mt-3 rounded-lg bg-white/90 backdrop-blur-md px-3 py-1.5 shadow-sm text-xs font-bold text-gray-800">
                  Driver: EcoFleet Logistics (Van #MH-02-CB-4491)
                </div>
                <div className="mt-1 text-[11px] text-gray-600 font-medium">
                  Approaching destination • Approx 1.8 km away
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <div className="text-gray-500">Pickup Destination</div>
              <div className="font-semibold text-gray-900 line-clamp-1 mt-0.5">{pickup.address}</div>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <div className="text-gray-500">Scheduled Time</div>
              <div className="font-semibold text-gray-900 mt-0.5">
                {new Date(pickup.scheduledDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 col-span-2 sm:col-span-1">
              <div className="text-gray-500">Recycler Facility</div>
              <div className="font-semibold text-primary-700 mt-0.5">
                {pickup.recycler?.name || "GreenCircle Processing Hub"}
              </div>
            </div>
          </div>
        </Card>

        {/* Assigned Recycler & Contact Card */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
              Assigned Recycler
            </h3>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-700 font-bold text-base">
                {pickup.recycler?.name?.charAt(0) || "R"}
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">
                  {pickup.recycler?.name || "EcoRecycle Systems Ltd"}
                </h4>
              </div>
            </div>

            <div className="mt-4 border-t border-gray-100 pt-3 space-y-2 text-xs text-gray-600">
              <div className="flex items-center justify-between">
                <span>Facility Contact:</span>
                <span className="font-medium text-gray-900">{pickup.recycler?.phone || "+91 91234 56789"}</span>
              </div>
            </div>
          </Card>

          {/* Recycling Certificate Preview */}
          <Card className="p-6 bg-gradient-to-br from-primary-900 to-accent-950 text-white">
            <div className="flex items-center gap-2 text-primary-300 text-xs font-semibold uppercase">
              <FiAward className="h-4 w-4" /> Green Certificate
            </div>
            <h4 className="mt-2 text-base font-bold">Certificate of Safe Disposal</h4>
            <p className="mt-1 text-xs text-primary-100">
              Upon final processing at the smelter, a cryptographically signed ESG recycling certificate will be generated for your records.
            </p>
          </Card>
        </div>
      </div>

      {/* Manifest of Included Items */}
      <Card className="p-6">
        <h3 className="text-sm font-bold text-gray-900 mb-4">
          Waste Manifest Items ({pickup.items?.length || 0})
        </h3>

        {pickup.items && pickup.items.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {pickup.items.map((it) => (
              <div key={it.id} className="flex items-center justify-between py-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                    <FiCpu className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">{it.title}</span>
                    <span className="ml-2 text-gray-500 capitalize">({it.condition})</span>
                  </div>
                </div>
                <div className="text-right font-medium text-gray-700">
                  {it.quantity} unit(s) • ~{it.estimatedWeight} kg
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500">Manifest contains standard bundled e-waste items.</p>
        )}
      </Card>
    </div>
  );
}
