import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const tsUser = cookieStore.get("ts_user");
  if (!tsUser?.value) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  try {
    const user = JSON.parse(decodeURIComponent(tsUser.value));
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
}
