"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getDashboardStatsAPI } from "@/lib/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  FiCpu,
  FiTruck,
  FiAward,
  FiZap,
  FiPlus,
  FiCalendar,
  FiArrowRight,
  FiTrendingUp,
} from "react-icons/fi";

interface StatsData {
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
}

export default function GeneratorDashboard() {
  const [userName, setUserName] = useState("Eco Hero");
  const [stats, setStats] = useState<StatsData>({
    totalListings: 0,
    activePickups: 0,
    weightRecycled: 0,
    co2Saved: 0,
    rewardPoints: 0,
    recentPickups: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.name) setUserName(u.name.split(" ")[0]);
      } catch {}
    }

    async function loadStats() {
      try {
        const res = await getDashboardStatsAPI();
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error("Dashboard stats error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl bg-gradient-to-r from-primary-800 to-accent-900 p-8 text-white shadow-md sm:flex-row sm:items-center">
        <div>
          <span className="inline-block rounded-full bg-primary-700/60 px-3 py-1 text-xs font-semibold text-primary-200">
            Generator Portal
          </span>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
            Welcome back, {userName}! 🌱
          </h1>
          <p className="mt-1 text-sm text-primary-100 max-w-xl">
            Your recycling efforts keep hazardous chemicals out of landfills. Track pickups and manage items below.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/listings/new">
            <Button variant="secondary" className="bg-white text-primary-900 hover:bg-primary-50">
              <FiPlus className="mr-1.5 h-4 w-4" /> Add Waste Item
            </Button>
          </Link>
          <Link href="/pickups/new">
            <Button className="bg-primary-500 text-white hover:bg-primary-600">
              <FiCalendar className="mr-1.5 h-4 w-4" /> Schedule Pickup
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Card className="p-5">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Items Listed</span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <FiCpu className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-gray-900">
            {loading ? "..." : stats.totalListings}
          </div>
          <div className="mt-1 text-[11px] text-gray-500">Available to recycle</div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Pickups</span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <FiTruck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-gray-900">
            {loading ? "..." : stats.activePickups}
          </div>
          <div className="mt-1 text-[11px] text-amber-600 font-medium">In transit or scheduled</div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Weight Recycled</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <FiTrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-gray-900">
            {loading ? "..." : `${stats.weightRecycled.toFixed(1)} kg`}
          </div>
          <div className="mt-1 text-[11px] text-gray-500">Diverted from waste</div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">CO₂ Offset</span>
            <div className="rounded-lg bg-teal-50 p-2 text-teal-600">
              <FiZap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-teal-700">
            {loading ? "..." : `${stats.co2Saved.toFixed(1)} kg`}
          </div>
          <div className="mt-1 text-[11px] text-teal-600 font-medium">Avoided emissions</div>
        </Card>

        <Card className="p-5 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Eco Credits</span>
            <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
              <FiAward className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-purple-700">
            {loading ? "..." : stats.rewardPoints}
          </div>
          <div className="mt-1 text-[11px] text-purple-600 font-medium">Ready to redeem</div>
        </Card>
      </div>

      {/* Recent Pickups Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Recent Pickup Requests</h2>
          <Link
            href="/pickups"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700"
          >
            <span>View All Pickups</span>
            <FiArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {stats.recentPickups && stats.recentPickups.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                  <tr>
                    <th className="px-6 py-3">Pickup ID</th>
                    <th className="px-6 py-3">Scheduled Date</th>
                    <th className="px-6 py-3">Items / Weight</th>
                    <th className="px-6 py-3">Recycler</th>
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
                      <td className="px-6 py-4 text-xs">
                        {new Date(p.scheduledDate).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-gray-700">
                        {p.itemCount} items ({p.estimatedWeight} kg)
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {p.recyclerName || "Pending Assign"}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/pickups/${p.id}`}
                          className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                        >
                          Track
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
              <FiTruck className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-bold text-gray-900">No pickups scheduled yet</h3>
            <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
              List the e-waste items sitting around your home or office, then book a recycler to collect them.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/listings/new">
                <Button variant="outline" size="sm">
                  Add Item
                </Button>
              </Link>
              <Link href="/pickups/new">
                <Button size="sm">Schedule Pickup</Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
