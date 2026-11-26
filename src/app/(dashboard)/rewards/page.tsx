"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getDashboardStatsAPI } from "@/lib/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { FiAward, FiStar, FiTruck, FiTrendingUp } from "react-icons/fi";

interface RewardStats {
  rewardPoints: number;
  communityStars: number;
  completedPickups: number;
  weightRecycled: number;
  co2Saved: number;
}

export default function RewardsPage() {
  const [stats, setStats] = useState<RewardStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboardStatsAPI()
      .then((response) => {
        if (response.success) setStats(response.data);
      })
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : "Could not load rewards.");
      });
  }, []);

  return (
    <section className="animate-fade-up mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary-700">Your impact</p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">Rewards</h1>
            <p className="mt-1 text-sm text-gray-500">See your GreenCircuit points and community stars.</p>
          </div>
          <Link href="/leaderboard">
            <Button variant="outline"><FiStar aria-hidden="true" /> View leaderboard</Button>
          </Link>
        </div>

        {error ? (
          <Card className="p-6 text-sm text-red-700">{error}</Card>
        ) : !stats ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => <div key={item} className="h-32 animate-pulse rounded-2xl bg-gray-100" />)}
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <RewardMetric icon={<FiAward />} label="Reward points" value={stats.rewardPoints.toLocaleString()} tint="bg-amber-50 text-amber-600" />
              <RewardMetric icon={<FiStar />} label="Community stars" value={stats.communityStars.toLocaleString()} tint="bg-yellow-50 text-yellow-600" />
              <RewardMetric icon={<FiTruck />} label="Completed pickups" value={stats.completedPickups.toLocaleString()} tint="bg-primary-50 text-primary-700" />
              <RewardMetric icon={<FiTrendingUp />} label="Weight recycled" value={`${stats.weightRecycled.toFixed(1)} kg`} tint="bg-emerald-50 text-emerald-700" />
            </div>

            <Card className="flex flex-col justify-between gap-5 p-6 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-bold text-gray-900">How community stars work</h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-600">
                  Each non-cancelled scheduled pickup earns one public leaderboard star. Reward points continue to reflect
                  the recycling impact recorded for your pickups.
                </p>
              </div>
              <Link href="/leaderboard" className="shrink-0">
                <Button>Explore the community</Button>
              </Link>
            </Card>
          </>
        )}
    </section>
  );
}

function RewardMetric({
  icon,
  label,
  value,
  tint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tint: string;
}) {
  return (
    <Card className="flex items-center gap-4 p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tint}`}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="mt-1 truncate text-xl font-bold text-gray-900">{value}</p>
      </div>
    </Card>
  );
}
