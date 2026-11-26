"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Card from "@/components/ui/Card";
import { getLeaderboardAPI } from "@/lib/api";
import { FiAward, FiStar, FiTrendingUp } from "react-icons/fi";

interface LeaderboardEntry {
  rank: number;
  name: string;
  stars: number;
  completedPickups: number;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getLeaderboardAPI()
      .then((response) => {
        if (response.success) setEntries(response.data);
      })
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : "Could not load the leaderboard.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="animate-fade-up mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-primary-900 via-primary-800 to-emerald-700 p-6 text-white shadow-lg sm:p-10">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-yellow-200">
              <FiAward className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">GreenCircuit Community</p>
              <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">Pickup leaderboard</h1>
            </div>
          </div>
          <p className="mt-5 max-w-2xl text-sm leading-6 text-emerald-50">
            Celebrate neighbors making a difference. Each completed pickup earns one star; unfinished bookings do not count.
          </p>
        </div>

        <Card className="overflow-hidden p-0">
          <div className="grid grid-cols-[3.5rem_minmax(0,1fr)_6rem] items-center gap-3 border-b border-gray-100 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 sm:grid-cols-[5rem_minmax(0,1fr)_8rem_9rem] sm:px-6">
            <span>Rank</span>
            <span>Community member</span>
            <span className="text-right">Stars</span>
            <span className="hidden text-right sm:block">Completed pickups</span>
          </div>

          {loading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3, 4, 5].map((row) => <div key={row} className="h-12 animate-pulse rounded-xl bg-gray-100" />)}
            </div>
          ) : error ? (
            <p role="alert" className="p-6 text-sm text-red-700">{error}</p>
          ) : entries.length ? (
            <ol>
              {entries.map((entry) => (
                <li
                  key={`${entry.rank}-${entry.name}`}
                  className="grid animate-fade-up grid-cols-[3.5rem_minmax(0,1fr)_6rem] items-center gap-3 border-b border-gray-50 px-4 py-4 last:border-0 sm:grid-cols-[5rem_minmax(0,1fr)_8rem_9rem] sm:px-6"
                  style={{ animationDelay: `${Math.min(entry.rank - 1, 10) * 45}ms` }}
                >
                  <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${entry.rank <= 3 ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-600"}`}>
                    {entry.rank}
                  </span>
                  <span className="min-w-0 truncate font-semibold text-gray-900">{entry.name}</span>
                  <span className="inline-flex items-center justify-end gap-1.5 font-bold text-amber-700">
                    <FiStar className="h-4 w-4 fill-amber-400 text-amber-500" aria-hidden="true" />
                    {entry.stars}
                  </span>
                  <span className="hidden items-center justify-end gap-1.5 text-sm text-gray-600 sm:flex">
                    <FiTrendingUp className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                    {entry.completedPickups}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <div className="p-10 text-center">
              <FiStar className="mx-auto h-8 w-8 text-amber-400" aria-hidden="true" />
              <h2 className="mt-3 font-bold text-gray-900">The board is ready for its first star</h2>
              <p className="mt-1 text-sm text-gray-500">Completed pickups will appear here.</p>
            </div>
          )}
        </Card>
        <p className="text-center text-xs text-gray-500">The public board shows member names and completed-pickup totals only.</p>
      </main>
    </div>
  );
}
