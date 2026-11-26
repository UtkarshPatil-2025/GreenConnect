import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function VerificationPage() {
  return (
    <div className="mx-auto max-w-xl py-12">
      <Card className="p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">No verification required</h1>
        <p className="mt-2 text-sm text-gray-600">
          Recycler accounts are approved automatically. Active recyclers can receive pickup requests without submitting verification documents.
        </p>
        <Link href="/recycler/dashboard" className="mt-6 inline-flex">
          <Button>Return to Dashboard</Button>
        </Link>
      </Card>
    </div>
  );
}
