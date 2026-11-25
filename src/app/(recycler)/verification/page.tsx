"use client";

import React, { useState } from "react";
import Link from "next/link";
import { updateRecyclerProfileAPI, submitVerificationAPI } from "@/lib/api";
import { WASTE_CATEGORY_LABELS } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import toast from "react-hot-toast";
import {
  FiShield,
  FiFileText,
  FiCheckCircle,
  FiUploadCloud,
  FiArrowRight,
  FiArrowLeft,
  FiAward,
} from "react-icons/fi";

const STEPS = ["Business Details", "Facility Capacities", "Compliance Documents", "Review & Submit"];

export default function VerificationPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form states
  const [businessName, setBusinessName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [facilityAddress, setFacilityAddress] = useState("");
  const [capacity, setCapacity] = useState(500);
  const [capabilities, setCapabilities] = useState<string[]>([
    "COMPUTERS",
    "MOBILES",
    "BATTERIES",
  ]);

  const toggleCapability = (cat: string) => {
    if (capabilities.includes(cat)) {
      setCapabilities(capabilities.filter((c) => c !== cat));
    } else {
      setCapabilities([...capabilities, cat]);
    }
  };

  const handleNext = () => {
    if (currentStep === 0 && !businessName) {
      toast.error("Please enter your registered enterprise name");
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await updateRecyclerProfileAPI({
        businessName,
        licenseNumber,
        registrationNumber,
        facilityAddress,
        capacity,
        capabilities,
      });

      await submitVerificationAPI();
      setSubmitted(true);
      toast.success("Compliance dossier submitted for State Board verification!");
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Failed to submit verification request.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl py-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 mb-6">
          <FiCheckCircle className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Application Under Review</h1>
        <p className="mt-2 text-sm text-gray-600">
          Your environmental credentials have been queued for administrative inspection. Our compliance team verifies Pollution Control Board filings within 24-48 business hours.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/recycler/dashboard">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-800">
          <FiShield className="h-3.5 w-3.5" />
          <span>Statutory Recycler Onboarding</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Recycler Facility Certification</h1>
        <p className="mt-1 text-sm text-gray-500">
          Complete compliance screening to receive verified collection requests and digital certificates.
        </p>
      </div>

      {/* Stepper Header */}
      <div className="grid grid-cols-4 gap-2 border-b border-gray-200 pb-4">
        {STEPS.map((s, idx) => (
          <div key={s} className="space-y-1">
            <div
              className={`h-1.5 rounded-full transition-all ${
                idx <= currentStep ? "bg-primary-600" : "bg-gray-200"
              }`}
            />
            <span
              className={`text-[11px] font-semibold block truncate ${
                idx === currentStep ? "text-primary-700" : "text-gray-400"
              }`}
            >
              Step {idx + 1}: {s}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1 */}
      {currentStep === 0 && (
        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">
            Registered Entity Information
          </h2>

          <Input
            label="Corporate / Facility Legal Name"
            type="text"
            placeholder="e.g. GreenTech Recyclers Pvt Ltd"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="E-Waste Authorization Number"
              type="text"
              placeholder="e.g. CPCB-EW-2024-9182"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
            />
            <Input
              label="Company Registration / CIN"
              type="text"
              placeholder="e.g. U37200MH2021PTC367812"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
            />
          </div>
        </Card>
      )}

      {/* Step 2 */}
      {currentStep === 1 && (
        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">
            Facility Processing Parameters
          </h2>

          <Input
            label="Physical Plant / Smelting Yard Address"
            type="text"
            placeholder="e.g. Plot 42, MIDC Industrial Area, Turbhe, Navi Mumbai"
            value={facilityAddress}
            onChange={(e) => setFacilityAddress(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Authorized Processing Capacity (kg per day)
            </label>
            <input
              type="number"
              min={50}
              step={50}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Permitted Recycling Categories (Select all that apply)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(WASTE_CATEGORY_LABELS).map(([key, label]) => {
                const checked = capabilities.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleCapability(key)}
                    className={`rounded-xl border p-2.5 text-left text-xs font-medium transition ${
                      checked
                        ? "border-primary-600 bg-primary-50 text-primary-900 font-semibold"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Step 3 */}
      {currentStep === 2 && (
        <Card className="p-6 space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">
            Mandatory Statutory Filings
          </h2>

          <div className="space-y-4">
            <div className="rounded-xl border-2 border-dashed border-gray-300 p-5 text-center bg-gray-50/50">
              <FiFileText className="h-6 w-6 text-primary-600 mx-auto" />
              <h4 className="mt-2 text-xs font-bold text-gray-800">State Pollution Control Board Consent (CTO/CTE)</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">Upload certified copy in PDF format (Max 10MB)</p>
              <div className="mt-3">
                <span className="cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                  Select PDF
                </span>
              </div>
            </div>

            <div className="rounded-xl border-2 border-dashed border-gray-300 p-5 text-center bg-gray-50/50">
              <FiFileText className="h-6 w-6 text-primary-600 mx-auto" />
              <h4 className="mt-2 text-xs font-bold text-gray-800">E-Waste Management Rules Authorization (Form 1)</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">Formal registration issued under CPCB statutory rules</p>
              <div className="mt-3">
                <span className="cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                  Select PDF
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Step 4 */}
      {currentStep === 3 && (
        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">
            Review Submission Dossier
          </h2>

          <div className="rounded-xl bg-gray-50 p-4 space-y-3 text-xs text-gray-700">
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500">Legal Business Name:</span>
              <span className="font-bold text-gray-900">{businessName || "Not set"}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500">Authorization / License:</span>
              <span className="font-semibold">{licenseNumber || "Pending input"}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500">Facility Location:</span>
              <span className="font-semibold text-right max-w-xs truncate">{facilityAddress || "MIDC Yard"}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500">Authorized Daily Throughput:</span>
              <span className="font-bold text-primary-700">{capacity} kg/day</span>
            </div>
            <div>
              <span className="text-gray-500 block mb-1">Approved Categories ({capabilities.length}):</span>
              <div className="flex flex-wrap gap-1">
                {capabilities.map((c) => (
                  <span key={c} className="rounded bg-white px-2 py-0.5 border text-[10px] font-semibold text-gray-700">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 flex items-center gap-3">
            <FiAward className="h-6 w-6 text-emerald-600 shrink-0" />
            <p className="text-xs text-emerald-800">
              Upon approval, your facility is awarded a <span className="font-bold">Verified Green Recycler</span> badge and automatically surfaced to municipal pickup requests.
            </p>
          </div>
        </Card>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          <FiArrowLeft className="mr-1.5 h-4 w-4" /> Previous
        </Button>

        {currentStep < STEPS.length - 1 ? (
          <Button type="button" onClick={handleNext}>
            Continue <FiArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        ) : (
          <Button type="button" loading={loading} onClick={handleSubmit}>
            Submit Compliance Application
          </Button>
        )}
      </div>
    </div>
  );
}
