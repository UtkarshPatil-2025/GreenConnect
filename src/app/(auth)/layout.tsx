import React from "react";
import Link from "next/link";
import { FiRefreshCw, FiShield, FiTruck, FiAward } from "react-icons/fi";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left Brand Panel (hidden on small mobile) */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 p-12 text-white lg:flex">
        {/* Decorative background glow */}
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-accent-400/20 blur-3xl" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary-700 shadow-md">
              <FiRefreshCw className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              Green<span className="text-primary-300">Circuit</span>
            </span>
          </Link>

          <div className="mt-20">
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              Turn your old tech into verified circular resources.
            </h2>
            <p className="mt-4 text-primary-100 text-sm leading-relaxed max-w-md">
              A trusted regulatory-compliant portal linking waste generators with authorized recycling processors through live GPS tracking and blockchain-verified manifests.
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3.5 backdrop-blur-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500/30 text-primary-200">
              <FiShield className="h-5 w-5" />
            </div>
            <div className="text-xs">
              <p className="font-semibold text-white">100% Certified Recyclers</p>
              <p className="text-primary-200">Strict regulatory vetting & pollution clearances</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3.5 backdrop-blur-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500/30 text-primary-200">
              <FiTruck className="h-5 w-5" />
            </div>
            <div className="text-xs">
              <p className="font-semibold text-white">Live Tracking & Doorstep OTP Handover</p>
              <p className="text-primary-200">Real-time GPS updates and zero lost assets</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3.5 backdrop-blur-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500/30 text-primary-200">
              <FiAward className="h-5 w-5" />
            </div>
            <div className="text-xs">
              <p className="font-semibold text-white">Green Recycling Certificate</p>
              <p className="text-primary-200">Earn ESG compliance proofs and eco-rewards</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Content */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16 xl:px-24 bg-gray-50/50">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile brand header */}
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
                <FiRefreshCw className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-gray-900">
                Green<span className="text-primary-600">Circuit</span>
              </span>
            </Link>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
