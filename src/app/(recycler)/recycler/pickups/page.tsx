"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getPickupsAPI, updatePickupStatusAPI } from "@/lib/api";
import StatusBadge from "@/components/ui/StatusBadge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import toast from "react-hot-toast";
import {
  FiTruck,
  FiMapPin,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiArrowRight,
} from "react-icons/fi";

interface RecyclerPickup {
  id: string;
  scheduledDate: string;
  status: string;
  address: string;
  itemCount: number;
  estimatedWeight: number;
  specialInstructions?: string;
  otp?: string;
}

export default function RecyclerPickupsPage() {
  const [pickups, setPickups] = useState<RecyclerPickup[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadPickups = async () => {
    try {
      const res = await getPickupsAPI();
      if (res.success && res.data) {
        setPickups(res.data);
      }
    } catch (err) {
      console.error("Recycler pickups load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPickups();
  }, []);

  const handleUpdateStatus = async (id: string, nextStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await updatePickupStatusAPI(id, nextStatus);
      if (res.success) {
        toast.success(`Pickup updated to ${nextStatus}!`);
        loadPickups();
      }
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Failed to update pickup status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Incoming Collection Requests</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage dispatched logistics vans, confirm door collections, and log intake weights.
        </p>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : pickups.length > 0 ? (
        <div className="space-y-4">
          {pickups.map((p) => (
            <Card key={p.id} className="p-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-gray-900">
                      Batch #{p.id.slice(0, 8)}
                    </span>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="flex items-center gap-1.5 text-xs text-gray-500 pt-1">
                    <FiCalendar className="h-3.5 w-3.5" />
                    <span>Slot: {new Date(p.scheduledDate).toLocaleString()}</span>
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-gray-500">
                    <FiMapPin className="h-3.5 w-3.5" />
                    <span>{p.address}</span>
                  </p>
                  {p.specialInstructions && (
                    <p className="text-xs text-amber-700 italic">
                      Note: {p.specialInstructions}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-right text-xs mr-2">
                    <div className="font-bold text-gray-900">{p.itemCount} Units</div>
                    <div className="text-gray-500">~{p.estimatedWeight} kg declared</div>
                  </div>

                  {/* Progressive action button based on current status */}
                  {p.status === "REQUESTED" && (
                    <Button
                      size="sm"
                      loading={updatingId === p.id}
                      onClick={() => handleUpdateStatus(p.id, "AGENT_ASSIGNED")}
                    >
                      Assign Logistics Van
                    </Button>
                  )}

                  {p.status === "AGENT_ASSIGNED" && (
                    <Button
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                      loading={updatingId === p.id}
                      onClick={() => handleUpdateStatus(p.id, "EN_ROUTE")}
                    >
                      Dispatch En Route
                    </Button>
                  )}

                  {p.status === "EN_ROUTE" && (
                    <Button
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-700"
                      loading={updatingId === p.id}
                      onClick={() => handleUpdateStatus(p.id, "ARRIVED")}
                    >
                      Mark Arrived at Door
                    </Button>
                  )}

                  {p.status === "ARRIVED" && (
                    <Button
                      size="sm"
                      className="bg-teal-600 hover:bg-teal-700"
                      loading={updatingId === p.id}
                      onClick={() => handleUpdateStatus(p.id, "PICKED_UP")}
                    >
                      Confirm OTP Handover
                    </Button>
                  )}

                  {p.status === "PICKED_UP" && (
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      loading={updatingId === p.id}
                      onClick={() => handleUpdateStatus(p.id, "COMPLETED")}
                    >
                      Log Smelter Intake (Complete)
                    </Button>
                  )}

                  {p.status === "COMPLETED" && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                      <FiCheckCircle className="h-4 w-4" /> Recycled & Certified
                    </span>
                  )}

                  <Link href={`/pickups/${p.id}`}>
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-400 mb-4">
            <FiTruck className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-gray-900">No active batches assigned</h3>
          <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
            Once generators schedule pickups in your territory, they will be listed here for dispatch management.
          </p>
        </Card>
      )}
    </div>
  );
}
