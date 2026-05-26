import { cookies } from "next/headers";
import { db } from "./db";

const COOKIE_NAME = "sg_guest_id";

async function findOrCreateUser(cookieStore: ReturnType<typeof cookies> extends Promise<infer T> ? T : never): Promise<string> {
  let guestId = cookieStore.get(COOKIE_NAME)?.value;

  if (guestId) {
    const existing = await db.user.findUnique({ where: { id: guestId } });
    if (existing) return guestId;
  }

  const user = await db.user.create({
    data: { email: `guest-${crypto.randomUUID()}@anonymous.dev` },
  });
  guestId = user.id;

  cookieStore.set(COOKIE_NAME, guestId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 365 * 24 * 60 * 60,
    path: "/",
  });

  return guestId;
}

export async function getGuestId(): Promise<string> {
  const cookieStore = await cookies();
  let guestId = cookieStore.get(COOKIE_NAME)?.value;

  if (guestId) {
    const existing = await db.user.findUnique({ where: { id: guestId } });
    if (existing) return guestId;
  }

  const user = await db.user.create({
    data: { email: `guest-${crypto.randomUUID()}@anonymous.dev` },
  });
  return user.id;
}

export async function setGuestCookie() {
  const cookieStore = await cookies();
  return findOrCreateUser(cookieStore);
}
