"use client";

import React, { useEffect, useState } from "react";
import { getPickupsAPI, updatePickupStatusAPI, updateWasteItemProcessingAPI } from "@/lib/api";
import type { ProcessingUpdateInput } from "@/lib/validations";
import StatusBadge from "@/components/ui/StatusBadge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import toast from "react-hot-toast";
import {
  FiCalendar,
  FiCheckCircle,
  FiMapPin,
  FiPackage,
  FiTruck,
} from "react-icons/fi";

type ProcessingStage = ProcessingUpdateInput["status"];

interface RecyclerPickup {
  id: string;
  scheduledDate: string;
  status: string;
  address: string;
  itemCount: number;
  estimatedWeight: number;
  specialInstructions?: string;
  generatorName?: string;
  items: Array<{
    id: string;
    title: string;
    category: string;
    estimatedWeight: number;
    processingStatus: string;
    processingUpdates: Array<{
      id: string;
      eventType: string;
      notes: string | null;
      timestamp: string;
    }>;
  }>;
}

const PROCESSING_NEXT: Record<string, ProcessingStage[]> = {
  RECEIVED: ["SORTED"],
  SORTED: ["DISMANTLED"],
  DISMANTLED: ["MATERIAL_RECOVERY"],
  MATERIAL_RECOVERY: ["DISPOSED", "COMPLETED"],
  DISPOSED: ["COMPLETED"],
  COMPLETED: [],
};

const PROCESSING_LABELS: Record<string, string> = {
  RECEIVED: "Received at facility",
  SORTED: "Sorted",
  DISMANTLED: "Dismantled",
  MATERIAL_RECOVERY: "Materials recovered",
  DISPOSED: "Residuals safely disposed",
  COMPLETED: "Processing completed",
};

const PICKUP_NEXT: Record<string, { status: string; label: string }> = {
  REQUESTED: { status: "CONFIRMED", label: "Accept pickup" },
  CONFIRMED: { status: "AGENT_ASSIGNED", label: "Assign collection logistics" },
  AGENT_ASSIGNED: { status: "EN_ROUTE", label: "Dispatch collection" },
  EN_ROUTE: { status: "ARRIVED", label: "Mark arrival" },
  ARRIVED: { status: "PICKED_UP", label: "Confirm handover" },
  PICKED_UP: { status: "IN_TRANSIT", label: "Start transport" },
  IN_TRANSIT: { status: "AT_FACILITY", label: "Mark received at facility" },
  AT_FACILITY: { status: "PROCESSING", label: "Start recycling" },
};

function getNextStages(status: string) {
  return PROCESSING_NEXT[status] || [];
}

function formatStage(status: string) {
  return PROCESSING_LABELS[status] || status.replace(/_/g, " ").toLowerCase();
}

export default function RecyclerPickupsPage() {
  const [pickups, setPickups] = useState<RecyclerPickup[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [handoverOtps, setHandoverOtps] = useState<Record<string, string>>({});
  const [notesByItem, setNotesByItem] = useState<Record<string, string>>({});

  const loadPickups = async () => {
    try {
      setLoadError("");
      const response = await getPickupsAPI();
      if (response.success) setPickups(response.data);
    } catch (cause: unknown) {
      setLoadError(cause instanceof Error ? cause.message : "Could not load pickup requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPickups();
  }, []);

  const handleUpdateStatus = async (id: string, nextStatus: string, otpCode?: string) => {
    setUpdatingId(id);
    try {
      await updatePickupStatusAPI(
        id,
        nextStatus,
        otpCode ? { otpCode } : undefined,
      );
      if (nextStatus === "PICKED_UP") {
        setHandoverOtps((current) => {
          const next = { ...current };
          delete next[id];
          return next;
        });
      }
      toast.success(`Pickup updated to ${formatStage(nextStatus)}.`);
      await loadPickups();
    } catch (cause: unknown) {
      toast.error(cause instanceof Error ? cause.message : "Could not update pickup.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleProcessingUpdate = async (
    pickupId: string,
    itemId: string,
    status: ProcessingStage,
  ) => {
    const notes = notesByItem[itemId]?.trim() || "";
    if (notes.length < 3) {
      toast.error("Add a short note describing what was done to this item.");
      return;
    }

    setUpdatingItemId(itemId);
    try {
      await updateWasteItemProcessingAPI(pickupId, itemId, { status, notes });
      setNotesByItem((current) => ({ ...current, [itemId]: "" }));
      toast.success(
        status === "COMPLETED"
          ? "Item marked as processing complete."
          : "Recycling update shared with the customer.",
      );
      await loadPickups();
    } catch (cause: unknown) {
      toast.error(cause instanceof Error ? cause.message : "Could not post recycling update.");
    } finally {
      setUpdatingItemId(null);
    }
  };

  return (
    <section className="animate-fade-up space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-700">Facility operations</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">Incoming pickups</h1>
        <p className="mt-1 text-sm text-gray-500">
          Move each collection through its lifecycle and share item-by-item recycling updates with customers.
        </p>
      </header>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((row) => <div key={row} className="h-48 animate-pulse rounded-2xl bg-gray-100" />)}
        </div>
      ) : loadError ? (
        <div role="alert"><Card className="p-6 text-sm text-red-700">{loadError}</Card></div>
      ) : pickups.length > 0 ? (
        <div className="space-y-4">
          {pickups.map((pickup) => {
            const allItemsComplete =
              pickup.items.length > 0 &&
              pickup.items.every((item) => item.processingStatus === "COMPLETED");
            const nextPickup = pickup.status === "PROCESSING" && allItemsComplete
              ? { status: "COMPLETED", label: "Complete recycling" }
              : PICKUP_NEXT[pickup.status];

            return (
              <Card key={pickup.id} className="animate-fade-up space-y-5 p-4 transition duration-200 hover:shadow-md sm:p-6">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-bold text-gray-900">Batch #{pickup.id.slice(0, 8)}</span>
                      <StatusBadge status={pickup.status} />
                    </div>
                    <p className="text-sm font-semibold text-gray-800">
                      Customer: {pickup.generatorName || "GreenCircuit user"}
                    </p>
                    <p className="flex items-start gap-1.5 text-xs text-gray-500">
                      <FiCalendar className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>{new Date(pickup.scheduledDate).toLocaleString()}</span>
                    </p>
                    <p className="flex items-start gap-1.5 text-xs text-gray-500">
                      <FiMapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span className="break-words">{pickup.address}</span>
                    </p>
                    {pickup.specialInstructions && (
                      <p className="text-xs italic text-amber-700">Note: {pickup.specialInstructions}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                    <div className="text-xs lg:text-right">
                      <div className="font-bold text-gray-900">{pickup.itemCount} item(s)</div>
                      <div className="text-gray-500">~{pickup.estimatedWeight} kg</div>
                    </div>
                    {nextPickup && pickup.status === "ARRIVED" ? (
                      <form
                        className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-end"
                        onSubmit={(event) => {
                          event.preventDefault();
                          handleUpdateStatus(
                            pickup.id,
                            nextPickup.status,
                            handoverOtps[pickup.id],
                          );
                        }}
                      >
                        <label
                          htmlFor={`handover-otp-${pickup.id}`}
                          className="min-w-0 text-[11px] font-medium text-gray-700 sm:w-40 sm:flex-none"
                        >
                          Handover OTP from driver
                          <input
                            id={`handover-otp-${pickup.id}`}
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            pattern="[0-9]{4}"
                            maxLength={4}
                            value={handoverOtps[pickup.id] || ""}
                            onChange={(event) => {
                              const digits = event.target.value.replace(/\D/g, "").slice(0, 4);
                              setHandoverOtps((current) => ({ ...current, [pickup.id]: digits }));
                            }}
                            required
                            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                            aria-describedby={`handover-otp-help-${pickup.id}`}
                          />
                          <span id={`handover-otp-help-${pickup.id}`} className="mt-1 block font-normal text-gray-500">
                            Ask the doorstep collector for the 4-digit code.
                          </span>
                        </label>
                        <Button
                          type="submit"
                          size="sm"
                          loading={updatingId === pickup.id}
                          disabled={!/^\d{4}$/.test(handoverOtps[pickup.id] || "")}
                        >
                          Confirm handover
                        </Button>
                      </form>
                    ) : nextPickup ? (
                      <Button
                        size="sm"
                        loading={updatingId === pickup.id}
                        disabled={pickup.status === "PROCESSING" && !allItemsComplete}
                        onClick={() => handleUpdateStatus(pickup.id, nextPickup.status)}
                      >
                        {nextPickup.label}
                      </Button>
                    ) : pickup.status === "PROCESSING" ? (
                      <span className="text-xs text-gray-500">Finish every item update to complete this pickup.</span>
                    ) : pickup.status === "COMPLETED" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                        <FiCheckCircle aria-hidden="true" /> Recycling complete
                      </span>
                    ) : null}
                  </div>
                </div>

                {["AT_FACILITY", "PROCESSING"].includes(pickup.status) && (
                  <div className="border-t border-gray-100 pt-4">
                    <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
                      <FiPackage className="h-4 w-4 text-primary-700" aria-hidden="true" />
                      Item processing updates
                    </h2>
                    <div className="grid gap-3 lg:grid-cols-2">
                      {pickup.items.map((item) => {
                        const nextStages = getNextStages(item.processingStatus);
                        const updateStages = nextStages.filter((stage) => stage !== "COMPLETED");
                        return (
                          <article key={item.id} className="min-w-0 rounded-xl border border-gray-200 bg-gray-50/70 p-4">
                            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                              <div className="min-w-0">
                                <h3 className="break-words text-sm font-semibold text-gray-900">{item.title}</h3>
                                <p className="mt-1 text-xs text-gray-500">
                                  {item.category.replace(/_/g, " ").toLowerCase()} · {item.estimatedWeight} kg
                                </p>
                              </div>
                              <span className="shrink-0 rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-semibold text-primary-800">
                                {formatStage(item.processingStatus)}
                              </span>
                            </div>

                            {item.processingUpdates.length > 0 && (
                              <p className="mt-3 line-clamp-2 text-xs leading-5 text-gray-600">
                                Latest: {item.processingUpdates[0].notes || formatStage(item.processingUpdates[0].eventType)}
                              </p>
                            )}

                            {item.processingStatus !== "COMPLETED" ? (
                              <div className="mt-4 space-y-3">
                                <label className="block text-xs font-medium text-gray-700">
                                  Update for the customer
                                  <textarea
                                    required
                                    minLength={3}
                                    maxLength={1000}
                                    rows={2}
                                    value={notesByItem[item.id] || ""}
                                    onChange={(event) => setNotesByItem((current) => ({
                                      ...current,
                                      [item.id]: event.target.value,
                                    }))}
                                    placeholder="Describe the sorting, dismantling, or recovery work completed."
                                    className="mt-1 w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                                  />
                                </label>
                                <div className="flex flex-wrap justify-between gap-2">
                                  {updateStages.length > 0 && (
                                    <Button
                                      type="button"
                                      size="sm"
                                      loading={updatingItemId === item.id}
                                      disabled={!notesByItem[item.id]?.trim()}
                                      onClick={() => handleProcessingUpdate(pickup.id, item.id, updateStages[0])}
                                    >
                                      Post update
                                    </Button>
                                  )}
                                  <Button
                                    type="button"
                                    size="sm"
                                    loading={updatingItemId === item.id}
                                    disabled={!notesByItem[item.id]?.trim()}
                                    onClick={() => handleProcessingUpdate(pickup.id, item.id, "COMPLETED")}
                                  >
                                    Complete item
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="mt-3 text-xs font-medium text-emerald-700">Item processing is complete.</p>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-10 text-center sm:p-12">
          <FiTruck className="mx-auto h-8 w-8 text-gray-300" aria-hidden="true" />
          <h2 className="mt-3 font-bold text-gray-900">No pickups assigned yet</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
            Requests assigned to your facility will appear here with controls for sharing recycling progress.
          </p>
        </Card>
      )}
    </section>
  );
}
