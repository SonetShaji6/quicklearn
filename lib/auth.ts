import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { getEnv } from "./env";

const encoder = new TextEncoder();

export async function hashPassword(password: string) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createAuthToken(payload: { userId: string; email: string; status: string; role?: string; sessionToken?: string }) {
  const AUTH_SECRET = await getEnv("AUTH_SECRET");
  if (!AUTH_SECRET) throw new Error("AUTH_SECRET environment variable is not set.");
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encoder.encode(AUTH_SECRET));
}

export async function verifyAuthToken(token: string) {
  const AUTH_SECRET = await getEnv("AUTH_SECRET");
  if (!AUTH_SECRET) throw new Error("AUTH_SECRET environment variable is not set.");
  const { payload } = await jwtVerify(token, encoder.encode(AUTH_SECRET));
  return payload as { userId: string; email: string; status: string; role?: string; sessionToken?: string };
}
