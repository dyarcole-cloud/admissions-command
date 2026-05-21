import type { Metadata } from "next";
import { Suspense } from "react";
import { CallCockpit } from "@/components/cockpit/CallCockpit";

export const metadata: Metadata = {
  title: "Cockpit",
};

export default function CockpitPage() {
  return (
    <Suspense fallback={null}>
      <CallCockpit />
    </Suspense>
  );
}
