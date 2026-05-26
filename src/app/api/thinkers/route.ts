import { NextRequest, NextResponse } from "next/server";
import { searchThinkers, getAllThinkers } from "@/lib/thinkers";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") || "";
  if (!q || q.length < 1) {
    return NextResponse.json(
      getAllThinkers().map((t) => ({ id: t.id, name: t.name, tradition: t.tradition, avatar: t.avatar }))
    );
  }
  const results = searchThinkers(q).slice(0, 10);
  return NextResponse.json(
    results.map((t) => ({ id: t.id, name: t.name, tradition: t.tradition, avatar: t.avatar }))
  );
}
