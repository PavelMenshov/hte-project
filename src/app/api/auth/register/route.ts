import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }));
  }
}

type UserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  university: string;
  createdAt: string;
  depositTxHash: string | null;
  poolDistrict: string | null;
};

export async function POST(request: Request) {
  ensureDataFile();
  let body: { email?: string; password?: string; name?: string; university?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { email, password, name, university } = body;

  if (!email || typeof email !== "string" || !email.includes("@") || !email.includes(".")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }
  if (!name || typeof name !== "string" || name.trim() === "") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const data = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8")) as { users: UserRecord[] };
  if (data.users.some((u) => u.email.toLowerCase() === (email as string).toLowerCase())) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user: UserRecord = {
    id: crypto.randomUUID(),
    email: (email as string).trim().toLowerCase(),
    passwordHash,
    name: (name as string).trim(),
    university: (university as string) || "HKUST",
    createdAt: new Date().toISOString(),
    depositTxHash: null,
    poolDistrict: null,
  };
  data.users.push(user);
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));

  return NextResponse.json(
    {
      success: true,
      user: { id: user.id, email: user.email, name: user.name, university: user.university },
    },
    { status: 201 }
  );
}
