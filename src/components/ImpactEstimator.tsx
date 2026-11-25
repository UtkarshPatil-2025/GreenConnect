"use client";

import { useState } from "react";
import { FiArrowUpRight, FiRefreshCw } from "react-icons/fi";

export default function ImpactEstimator() {
  const [weight, setWeight] = useState(12);
  const lowerEstimate = Math.round(weight * 0.8);
  const upperEstimate = Math.round(weight * 1.6);

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-[#123b30] p-7 text-white shadow-2xl shadow-emerald-950/15 sm:p-10">
      <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-emerald-400/15 blur-3xl" />
      <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-100">
            <FiRefreshCw aria-hidden="true" />
            A little more impact
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
            What could your old tech do?
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-emerald-100/80">
            Estimate the weight you could keep in the circular economy. Adjust
            the slider to explore your potential contribution.
          </p>
          <label
            htmlFor="impact-weight"
            className="mt-6 flex items-center justify-between text-sm font-medium"
          >
            <span>Estimated e-waste</span>
            <span className="font-bold text-white">{weight} kg</span>
          </label>
          <input
            id="impact-weight"
            type="range"
            min="1"
            max="100"
            value={weight}
            onChange={(event) => setWeight(Number(event.target.value))}
            className="mt-3 h-2 w-full cursor-pointer accent-emerald-300"
          />
          <div className="mt-1 flex justify-between text-xs text-emerald-100/60">
            <span>1 kg</span>
            <span>100 kg</span>
          </div>
        </div>

        <div
          className="min-w-52 rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur"
          aria-live="polite"
        >
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-100/70">
            Your impact preview
          </p>
          <p className="mt-3 text-4xl font-extrabold tracking-tight">
            {weight} <span className="text-lg font-semibold">kg</span>
          </p>
          <p className="mt-1 text-sm text-emerald-100">potentially diverted</p>
          <div className="my-4 h-px bg-white/10" />
          <p className="text-xs text-emerald-100/70">Illustrative CO₂e range</p>
          <p className="mt-1 text-lg font-bold">
            {lowerEstimate}–{upperEstimate} kg
          </p>
        </div>
      </div>
      <p className="relative mt-6 text-[11px] leading-5 text-emerald-100/55">
        Planning estimate only, using an illustrative range of 0.8–1.6 kg
        CO₂e per kg of e-waste. Actual impact depends on materials and
        processing; this is not a verified environmental claim.
      </p>
      <a
        href="/signup"
        className="relative mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 transition hover:text-white"
      >
        Make your next item count <FiArrowUpRight aria-hidden="true" />
      </a>
    </div>
  );
}
