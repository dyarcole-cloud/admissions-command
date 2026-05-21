import type { Metadata } from "next";
import { AssessmentShell } from "@/components/preadmit/AssessmentShell";
import { ActiveCallBanner } from "@/components/app/ActiveCallBanner";

export const metadata: Metadata = { title: "Pre-Admit Assessment" };

export default function PreAdmitPage() {
  return (
    <div className="space-y-6">
      <div>
        <span className="overline">Pre-Admit · 10-section clinical intake</span>
        <h1
          className="font-display mt-1 text-3xl text-white"
          style={{ fontVariationSettings: "'opsz' 96" }}
        >
          Assessment
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--ink-2)]">
          Demographics, presenting problem, substance use, safety (PHQ-9 ·
          GAD-7 · C-SSRS), legal &amp; diagnoses, ASD/IDD screen, treatment
          history, medical, environment, and admin. Autosaves locally. Submit
          runs DEID on PHI before it leaves your device.
        </p>
      </div>
      <ActiveCallBanner />
      <AssessmentShell />
    </div>
  );
}
