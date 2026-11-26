"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getRecyclersAPI } from "@/lib/api";
import { WASTE_CATEGORY_LABELS } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import {
  FiSearch,
  FiMapPin,
  FiStar,
  FiFilter,
  FiTruck,
} from "react-icons/fi";

interface RecyclerEntry {
  id: string;
  name: string;
  businessName?: string;
  rating: number;
  reviewCount: number;
  tier: string;
  capabilities: string[];
  city: string;
  state: string;
  description?: string;
}

export default function RecyclersDirectoryPage() {
  const [recyclers, setRecyclers] = useState<RecyclerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCapability, setSelectedCapability] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await getRecyclersAPI({
          search: search || undefined,
          city: selectedCity || undefined,
          capability: selectedCapability || undefined,
        });
        if (res.success && res.data) {
          setRecyclers(res.data);
        }
      } catch (err) {
        console.error("Recyclers directory load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [search, selectedCity, selectedCapability]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header Banner */}
      <section className="border-b border-gray-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-800">
              <FiTruck className="h-3.5 w-3.5" />
              <span>E-Waste Recycler Network</span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Find Recyclers Near You
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Browse recycler profiles and pickup availability. Contact facilities directly about permits and compliance.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="relative">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search facility by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-xs text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">All Municipal Zones / Cities</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Delhi">Delhi NCR</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Pune">Pune</option>
            </select>

            <select
              value={selectedCapability}
              onChange={(e) => setSelectedCapability(e.target.value)}
              className="rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">All Processing Capabilities</option>
              {Object.entries(WASTE_CATEGORY_LABELS).map(([k, l]) => (
                <option key={k} value={k}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Recyclers Grid */}
      <main className="animate-fade-up mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
          </div>
        ) : recyclers.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recyclers.map((r) => (
              <Card key={r.id} className="flex flex-col justify-between p-6 transition hover:shadow-lg">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-700 font-bold text-lg">
                      {r.name?.charAt(0) || "R"}
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>

                  <h3 className="mt-4 font-bold text-gray-900 text-base">{r.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                    <FiMapPin className="h-3.5 w-3.5 text-gray-400" />
                    <span>{r.city}, {r.state}</span>
                  </div>

                  <p className="mt-3 text-xs text-gray-600 line-clamp-2">
                    {r.description || "E-waste dismantling and circular material recovery facility."}
                  </p>

                  <div className="mt-4">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                      Processing Capabilities
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {r.capabilities?.slice(0, 3).map((cap) => (
                        <span
                          key={cap}
                          className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700"
                        >
                          {WASTE_CATEGORY_LABELS[cap] || cap}
                        </span>
                      ))}
                      {r.capabilities?.length > 3 && (
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
                          +{r.capabilities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-gray-100 pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs">
                    <FiStar className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-gray-900">{r.rating || 4.8}</span>
                    <span className="text-gray-400">({r.reviewCount || 12} reviews)</span>
                  </div>

                  <Link href="/signup">
                    <Button size="sm">Book Pickup</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 mb-4">
              <FiTruck className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No matching recyclers</h3>
            <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
              Try expanding your search query or removing city and category filters.
            </p>
          </Card>
        )}
      </main>
    </div>
  );
}
