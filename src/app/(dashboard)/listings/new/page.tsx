"use client";

import React, { useState } from "react";
import Image from "next/image";
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
  FiX,
} from "react-icons/fi";

const MAX_PHOTOS = 5;
const MAX_SOURCE_SIZE = 5 * 1024 * 1024;
const MAX_COMPRESSED_SIZE = 250 * 1024;
const MAX_IMAGE_DIMENSION = 1440;

async function compressPhoto(file: File): Promise<string> {
  if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Choose a JPG, PNG, or WEBP image.");
  }
  if (file.size > MAX_SOURCE_SIZE) {
    throw new Error("Each photo must be 5 MB or smaller.");
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const loadedImage = new window.Image();
      loadedImage.onload = () => resolve(loadedImage);
      loadedImage.onerror = () => reject(new Error("This photo could not be opened."));
      loadedImage.src = objectUrl;
    });

    const scale = Math.min(
      1,
      MAX_IMAGE_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Your browser could not prepare this photo.");
    }

    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    let compressed: Blob | null = null;
    for (let quality = 0.82; quality >= 0.42; quality -= 0.1) {
      const webp = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/webp", quality);
      });
      compressed =
        webp?.type === "image/webp"
          ? webp
          : await new Promise<Blob | null>((resolve) => {
              canvas.toBlob(resolve, "image/jpeg", quality);
            });
      if (compressed && compressed.size <= MAX_COMPRESSED_SIZE) {
        break;
      }
    }

    if (!compressed || compressed.size > MAX_COMPRESSED_SIZE) {
      throw new Error("This photo could not be compressed enough. Try a smaller image.");
    }

    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("This photo could not be prepared for upload."));
        }
      };
      reader.onerror = () => reject(new Error("This photo could not be read."));
      reader.readAsDataURL(compressed);
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function NewListingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [processingPhotos, setProcessingPhotos] = useState(false);
  const [draggingPhotos, setDraggingPhotos] = useState(false);
  const [images, setImages] = useState<string[]>([]);

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

  const addPhotos = async (files: File[]) => {
    if (files.length === 0) return;

    const remaining = MAX_PHOTOS - images.length;
    if (remaining <= 0) {
      toast.error(`You can add up to ${MAX_PHOTOS} photos.`);
      return;
    }
    if (files.length > remaining) {
      toast.error(`Only ${MAX_PHOTOS} photos can be added to one listing.`);
    }

    setProcessingPhotos(true);
    try {
      const results = await Promise.all(
        files.slice(0, remaining).map(async (file) => {
          try {
            return await compressPhoto(file);
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Could not prepare this photo.";
            toast.error(`${file.name}: ${message}`);
            return null;
          }
        }),
      );
      const validImages = results.filter((image): image is string => image !== null);
      if (validImages.length > 0) {
        setImages((current) => [...current, ...validImages].slice(0, MAX_PHOTOS));
      }
    } finally {
      setProcessingPhotos(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (processingPhotos) {
      toast.error("Please wait for the selected photos to finish preparing.");
      return;
    }
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
        images,
        hazardDetails: isHazardous ? hazardousDetails : undefined,
        addressLine1: address || undefined,
        city: city || undefined,
        state: state || undefined,
        postalCode: pincode || undefined,
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
          <label className="mb-2 block text-xs font-semibold text-gray-700">Item Photos</label>
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDraggingPhotos(true);
            }}
            onDragLeave={() => setDraggingPhotos(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDraggingPhotos(false);
              void addPhotos(Array.from(event.dataTransfer.files));
            }}
            className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
              draggingPhotos
                ? "border-primary-500 bg-primary-50"
                : "border-gray-300 bg-gray-50/50"
            }`}
          >
            <input
              id="item-photos"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={processingPhotos || images.length >= MAX_PHOTOS}
              onChange={(event) => {
                const files = event.currentTarget.files;
                if (files) void addPhotos(Array.from(files));
                event.currentTarget.value = "";
              }}
              className="sr-only"
            />
            <FiUploadCloud className="h-8 w-8 text-gray-400" />
            <p className="mt-2 text-xs font-semibold text-gray-700">
              Drag and drop images, or{" "}
              <label
                htmlFor="item-photos"
                className="cursor-pointer text-primary-600 hover:text-primary-700"
              >
                browse
              </label>
            </p>
            <p className="mt-1 text-[11px] text-gray-400">
              JPG, PNG, or WEBP · up to 5 photos · 5 MB each
            </p>
            {processingPhotos && (
              <p className="mt-2 text-xs text-primary-700" role="status">
                Preparing photos for upload…
              </p>
            )}
          </div>
          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {images.map((image, index) => (
                <div key={image.slice(0, 80)} className="relative">
                  <Image
                    src={image}
                    alt={`Item photo ${index + 1}`}
                    width={320}
                    height={200}
                    unoptimized
                    className="h-28 w-full rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    aria-label={`Remove photo ${index + 1}`}
                    onClick={() =>
                      setImages((current) => current.filter((_, photoIndex) => photoIndex !== index))
                    }
                    className="absolute right-1 top-1 rounded-full bg-black/70 p-1.5 text-white transition hover:bg-black"
                  >
                    <FiX className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="flex justify-end gap-3">
          <Link href="/listings">
            <Button variant="ghost" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" loading={loading || processingPhotos}>
            {processingPhotos ? "Preparing Photos..." : "Save Item to Inventory"}
          </Button>
        </div>
      </form>
    </div>
  );
}
