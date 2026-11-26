"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getRecyclerDashboardAPI } from "@/lib/api";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  FiTruck,
  FiCheckCircle,
  FiTrendingUp,
  FiStar,
  FiArrowRight,
  FiPackage,
} from "react-icons/fi";

interface RecyclerStats {
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
}

export default function RecyclerDashboardPage() {
  const [stats, setStats] = useState<RecyclerStats>({
    pendingPickups: 0,
    inProgressPickups: 0,
    completedPickups: 0,
    totalWeightProcessed: 0,
    rating: 4.8,
    recentPickups: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getRecyclerDashboardAPI();
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error("Recycler dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-8">
      {/* Recycler Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facility Operations Hub</h1>
          <p className="mt-1 text-xs text-gray-500">
            Monitor incoming waste batches, process chain-of-custody, and issue recycling proofs.
          </p>
        </div>

        <div className="flex gap-3">
          <Link href="/recycler/pickups">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-2 text-xs font-semibold text-white">
              <FiTruck className="h-4 w-4" /> Dispatch Logistics
            </span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Batches</span>
            <div className="rounded-lg bg-yellow-50 p-2 text-yellow-600">
              <FiPackage className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-gray-900">
            {loading ? "..." : stats.pendingPickups}
          </div>
          <div className="mt-1 text-[11px] text-yellow-600 font-medium">Awaiting driver assign</div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">In Smelter / Transit</span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <FiTruck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-gray-900">
            {loading ? "..." : stats.inProgressPickups}
          </div>
          <div className="mt-1 text-[11px] text-blue-600 font-medium">Active chain of custody</div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Dismantled</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <FiTrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-gray-900">
            {loading ? "..." : `${stats.totalWeightProcessed.toFixed(1)} kg`}
          </div>
          <div className="mt-1 text-[11px] text-gray-500">Raw materials recovered</div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Audit Rating</span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-500">
              <FiStar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-gray-900 flex items-center gap-1">
            <span>{stats.rating || 4.9}</span>
            <span className="text-xs font-normal text-gray-400">/ 5.0</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium">Top Tier Facility</div>
        </Card>
      </div>

      {/* Incoming Requests Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Incoming Collection Dispatches</h2>
          <Link
            href="/recycler/pickups"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700"
          >
            <span>Manage All Requests</span>
            <FiArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {stats.recentPickups && stats.recentPickups.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                  <tr>
                    <th className="px-6 py-3">Batch ID</th>
                    <th className="px-6 py-3">Generator</th>
                    <th className="px-6 py-3">Scheduled Slot</th>
                    <th className="px-6 py-3">Load Details</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats.recentPickups.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/80 transition">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-gray-900">
                        #{p.id.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-gray-800">
                        {p.generatorName}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {new Date(p.scheduledDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-gray-700">
                        {p.itemCount} items ({p.estimatedWeight} kg)
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/pickups/${p.id}`}
                          className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                        >
                          View Batch
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <Card className="p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
              <FiCheckCircle className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-bold text-gray-900">All dispatches processed</h3>
            <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
              New generator requests in your authorized municipal zone will appear here automatically.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
