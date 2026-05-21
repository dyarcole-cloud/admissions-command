import type { Metadata } from "next";
import { CallCockpit } from "@/components/cockpit/CallCockpit";

export const metadata: Metadata = {
  title: "Cockpit",
};

export default function CockpitPage() {
  return <CallCockpit />;
}
