import { NextRequest, NextResponse } from "next/server";
import { researchThinker } from "@/lib/search";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const cached = await db.thinkerCache.findUnique({ where: { name: q } });
  if (cached) {
    return NextResponse.json(JSON.parse(cached.data));
  }

  try {
    const result = await researchThinker(q);
    await db.thinkerCache.create({
      data: { name: q, data: JSON.stringify(result) },
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Search failed", name: q, era: "未知", tradition: "未知", coreIdeas: "", quotes: "", works: "" },
      { status: 500 }
    );
  }
}
