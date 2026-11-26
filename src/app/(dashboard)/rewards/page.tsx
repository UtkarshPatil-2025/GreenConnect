"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getCertificateEligibilityAPI, getDashboardStatsAPI } from "@/lib/api";
import type { CertificateEligibility } from "@/lib/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { FiAward, FiDownload, FiStar, FiTruck, FiTrendingUp } from "react-icons/fi";

interface RewardStats {
  rewardPoints: number;
  communityStars: number;
  completedPickups: number;
  weightRecycled: number;
  co2Saved: number;
}

export default function RewardsPage() {
  const [stats, setStats] = useState<RewardStats | null>(null);
  const [certificate, setCertificate] = useState<CertificateEligibility | null>(null);
  const [error, setError] = useState("");
  const [certificateError, setCertificateError] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    getDashboardStatsAPI()
      .then((response) => {
        if (response.success) setStats(response.data);
      })
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : "Could not load rewards.");
      });
    getCertificateEligibilityAPI()
      .then((response) => {
        if (response.success) setCertificate(response.data);
      })
      .catch((cause: unknown) => {
        setCertificateError(
          cause instanceof Error ? cause.message : "Could not check certificate eligibility.",
        );
      });
  }, []);

  const downloadCertificate = async () => {
    if (!certificate?.eligible || !certificate.recipientName) return;

    setDownloading(true);
    setCertificateError("");
    try {
      const { jsPDF } = await import("jspdf");
      const recipientName = certificate.recipientName.replace(/\s+/g, " ").trim();
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.setFillColor(248, 252, 248);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");
      pdf.setDrawColor(25, 99, 67);
      pdf.setLineWidth(2);
      pdf.rect(9, 9, pageWidth - 18, pageHeight - 18);
      pdf.setDrawColor(169, 209, 179);
      pdf.setLineWidth(0.5);
      pdf.rect(14, 14, pageWidth - 28, pageHeight - 28);

      pdf.setTextColor(25, 99, 67);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text("GREENCIRCUIT  |  CIRCULAR IMPACT", pageWidth / 2, 39, { align: "center" });

      pdf.setTextColor(27, 55, 40);
      pdf.setFontSize(25);
      pdf.text("GREEN ACHIEVEMENT CERTIFICATE", pageWidth / 2, 61, { align: "center" });

      pdf.setTextColor(90, 105, 94);
      pdf.setFont("times", "italic");
      pdf.setFontSize(16);
      pdf.text("This certificate is proudly presented to", pageWidth / 2, 82, { align: "center" });

      pdf.setTextColor(25, 99, 67);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(30);
      pdf.text(recipientName, pageWidth / 2, 105, {
        align: "center",
        maxWidth: pageWidth - 48,
      });

      pdf.setDrawColor(169, 209, 179);
      pdf.setLineWidth(0.7);
      pdf.line(69, 113, pageWidth - 69, 113);

      pdf.setTextColor(55, 65, 58);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(14);
      pdf.text("For earning five GreenCircuit community stars through", pageWidth / 2, 130, {
        align: "center",
      });
      pdf.text("non-cancelled e-waste pickup bookings.", pageWidth / 2, 138, { align: "center" });

      pdf.setFillColor(255, 247, 214);
      pdf.roundedRect(pageWidth / 2 - 28, 149, 56, 13, 3, 3, "F");
      pdf.setTextColor(141, 93, 0);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text("5 COMMUNITY STARS", pageWidth / 2, 157.5, { align: "center" });

      pdf.setTextColor(90, 105, 94);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.text(`Awarded ${new Date().toLocaleDateString("en-IN")}`, pageWidth / 2, 177, {
        align: "center",
      });
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(25, 99, 67);
      pdf.text("GreenCircuit", pageWidth / 2, 188, { align: "center" });

      pdf.save("GreenCircuit-5-Star-Green-Certificate.pdf");
    } catch (cause: unknown) {
      setCertificateError(
        cause instanceof Error ? cause.message : "Could not generate your certificate.",
      );
    } finally {
      setDownloading(false);
    }
  };

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

            <Card className="flex flex-col justify-between gap-5 border-emerald-100 bg-emerald-50/40 p-6 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-bold text-gray-900">Green achievement certificate</h2>
                {certificate?.eligible ? (
                  <p className="mt-1 text-sm text-gray-600">
                    Congratulations, {certificate.recipientName}! Your five-star certificate is ready to download.
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-gray-600">
                    Earn {Math.max(0, (certificate?.requiredStars ?? 5) - stats.communityStars)} more community star(s)
                    to unlock your personalized certificate.
                  </p>
                )}
                {certificateError && (
                  <p role="alert" className="mt-2 text-sm text-red-700">{certificateError}</p>
                )}
              </div>
              <Button
                className="shrink-0"
                disabled={!certificate?.eligible}
                loading={downloading}
                onClick={downloadCertificate}
              >
                <FiDownload aria-hidden="true" />
                Download certificate
              </Button>
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
