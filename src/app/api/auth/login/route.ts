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
};

export async function POST(request: Request) {
  ensureDataFile();
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const data = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8")) as { users: UserRecord[] };
  const user = data.users.find((u) => u.email.toLowerCase() === (email as string).toLowerCase());
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    user: { id: user.id, email: user.email, name: user.name, university: user.university },
  });
}
