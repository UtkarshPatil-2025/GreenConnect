"use client";

import React, { useEffect, useState } from "react";
import { getMeAPI, getRecyclerReviewsAPI } from "@/lib/api";
import Card from "@/components/ui/Card";
import { FiMessageSquare, FiStar } from "react-icons/fi";

interface RecyclerReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { name: string };
}

export default function RecyclerReviewsPage() {
  const [reviews, setReviews] = useState<RecyclerReview[]>([]);
  const [rating, setRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadReviews() {
      try {
        const account = await getMeAPI();
        const recyclerId = account.data.recyclerProfile?.id;
        if (!recyclerId) {
          setError("Recycler profile not found.");
          return;
        }

        const response = await getRecyclerReviewsAPI(recyclerId);
        if (response.success) {
          setReviews(response.data.reviews);
          setRating(response.data.rating);
          setTotalReviews(response.data.totalReviews);
        }
      } catch (cause: unknown) {
        setError(cause instanceof Error ? cause.message : "Could not load reviews.");
      } finally {
        setLoading(false);
      }
    }

    loadReviews();
  }, []);

  return (
    <section className="animate-fade-up space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-700">Facility feedback</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="mt-1 text-sm text-gray-500">See feedback shared by the people who booked your facility.</p>
        </div>
        <Card className="flex items-center gap-3 p-4">
          <FiStar className="h-6 w-6 fill-amber-400 text-amber-500" aria-hidden="true" />
          <div>
            <p className="text-xl font-bold text-gray-900">{rating.toFixed(1)} / 5</p>
            <p className="text-xs text-gray-500">{totalReviews} review{totalReviews === 1 ? "" : "s"}</p>
          </div>
        </Card>
      </header>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((row) => <div key={row} className="h-28 animate-pulse rounded-2xl bg-gray-100" />)}
        </div>
      ) : error ? (
        <div role="alert"><Card className="p-6 text-sm text-red-700">{error}</Card></div>
      ) : reviews.length ? (
        <div className="space-y-3">
          {reviews.map((review) => (
            <Card
              key={review.id}
              className="animate-fade-up p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6"
            >
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <p className="font-semibold text-gray-900">{review.user.name}</p>
                  <p className="mt-1 text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-1" aria-label={`${review.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }, (_, star) => (
                    <FiStar
                      key={star}
                      className={`h-4 w-4 ${star < review.rating ? "fill-amber-400 text-amber-500" : "text-gray-300"}`}
                      aria-hidden="true"
                    />
                  ))}
                </div>
              </div>
              <p className="mt-4 flex gap-2 text-sm leading-6 text-gray-700">
                <FiMessageSquare className="mt-1 h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
                <span>{review.comment || "No written feedback was added."}</span>
              </p>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-10 text-center">
          <FiMessageSquare className="mx-auto h-8 w-8 text-gray-300" aria-hidden="true" />
          <h2 className="mt-3 font-bold text-gray-900">No reviews yet</h2>
          <p className="mt-1 text-sm text-gray-500">Customer feedback will appear here after it is submitted.</p>
        </Card>
      )}
    </section>
  );
}
