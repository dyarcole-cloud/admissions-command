import { NextRequest, NextResponse } from "next/server";
import {
  searchPayors,
  payorCounts,
  type PayorFilter,
  type RowCategory,
} from "@/lib/data/payors";
import type { Light } from "@/lib/utils";

export const runtime = "nodejs";

const ALLOWED_LIGHTS: Array<Light | "ALL"> = ["GREEN", "YELLOW", "RED", "ALL"];
const ALLOWED_CATEGORIES: Array<RowCategory | "ALL"> = [
  "Commercial Carrier",
  "Medicaid",
  "Union / Public Sector",
  "Government / Military",
  "Legacy",
  "ALL",
];

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const q = sp.get("q") ?? undefined;
  const lightParam = sp.get("light") ?? "ALL";
  const categoryParam = sp.get("category") ?? "ALL";
  const limitParam = sp.get("limit");
  const limit = limitParam ? Math.min(500, Number(limitParam) || 25) : 25;

  const light = (ALLOWED_LIGHTS as string[]).includes(lightParam)
    ? (lightParam as PayorFilter["light"])
    : "ALL";
  const category = (ALLOWED_CATEGORIES as string[]).includes(categoryParam)
    ? (categoryParam as PayorFilter["category"])
    : "ALL";

  const results = searchPayors({ q, light, category, limit });
  return NextResponse.json({
    ok: true,
    count: results.length,
    total: payorCounts().total,
    results,
  });
}
