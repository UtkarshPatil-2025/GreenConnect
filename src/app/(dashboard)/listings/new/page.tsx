"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createListingAPI } from "@/lib/api";
import { WASTE_CATEGORY_LABELS } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiUploadCloud,
  FiAlertTriangle,
  FiInfo,
} from "react-icons/fi";

export default function NewListingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [category, setCategory] = useState("COMPUTERS");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [estimatedWeight, setEstimatedWeight] = useState(2);
  const [condition, setCondition] = useState<"working" | "damaged" | "non-functional">("damaged");
  const [isHazardous, setIsHazardous] = useState(false);
  const [hazardousDetails, setHazardousDetails] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a title for the item");
      return;
    }

    setLoading(true);
    try {
      const res = await createListingAPI({
        title,
        category,
        description,
        quantity: Number(quantity),
        estimatedWeight: Number(estimatedWeight),
        condition,
        isHazardous,
        hazardousDetails: isHazardous ? hazardousDetails : undefined,
        address: address || undefined,
        city: city || undefined,
        state: state || undefined,
        pincode: pincode || undefined,
      });

      if (res.success) {
        toast.success("E-waste item added successfully!");
        router.push("/listings");
      }
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Failed to create listing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/listings"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900"
      >
        <FiArrowLeft className="h-4 w-4" /> Back to Listings
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">List an E-Waste Item</h1>
        <p className="mt-1 text-sm text-gray-500">
          Enter item details. Recyclers prioritize transparent listings with accurate weights.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">Item Details</h2>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Waste Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                const val = e.target.value;
                setCategory(val);
                if (val === "BATTERIES" || val === "PCBS") {
                  setIsHazardous(true);
                }
              }}
              className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            >
              {Object.entries(WASTE_CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Item Title"
            type="text"
            placeholder="e.g. Dell Inspiron 15 (Broken Display)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Description & Specifications
            </label>
            <textarea
              rows={3}
              placeholder="Mention model number, year, working parts, or internal contents..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Weight (kg approx)</label>
              <input
                type="number"
                step="0.1"
                min={0.1}
                value={estimatedWeight}
                onChange={(e) => setEstimatedWeight(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as "working" | "damaged" | "non-functional")}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="working">Functional</option>
                <option value="damaged">Partially Damaged</option>
                <option value="non-functional">Scrap / Dead</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Hazard Protocol Card */}
        <Card className="p-6 space-y-4 border-amber-200 bg-amber-50/30">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <FiAlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Hazardous Materials Disclosure</h3>
              <p className="text-xs text-gray-500">
                Batteries, cathode rays, liquid mercury, and cadmium require certified containment boxes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              id="hazard"
              type="checkbox"
              checked={isHazardous}
              onChange={(e) => setIsHazardous(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
            />
            <label htmlFor="hazard" className="text-xs font-semibold text-gray-700">
              This item contains lithium batteries, heavy metals, or toxic chemicals
            </label>
          </div>

          {isHazardous && (
            <input
              type="text"
              placeholder="e.g. Swollen Li-ion battery pack, lead capacitor"
              value={hazardousDetails}
              onChange={(e) => setHazardousDetails(e.target.value)}
              className="w-full rounded-xl border border-amber-300 bg-white px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:ring-2 focus:ring-amber-400/40"
            />
          )}
        </Card>

        {/* Visual photo dropzone */}
        <Card className="p-6">
          <label className="block text-xs font-semibold text-gray-700 mb-2">Item Photos</label>
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-6 text-center">
            <FiUploadCloud className="h-8 w-8 text-gray-400" />
            <p className="mt-2 text-xs font-semibold text-gray-700">
              Drag and drop images, or <span className="text-primary-600 cursor-pointer">browse</span>
            </p>
            <p className="text-[11px] text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB (AI auto-tags items)</p>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href="/listings">
            <Button variant="ghost" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" loading={loading}>
            Save Item to Inventory
          </Button>
        </div>
      </form>
    </div>
  );
}
