import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";
import { NextRequest } from "next/server";
import { createServiceSupabase } from "@/lib/supabaseServer";

export const ADMIN_SESSION_COOKIE = "admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7;

type AdminAuthFailure = {
  ok: false;
  status: number;
  code: string;
  message: string;
};

export type AdminAuthResult =
  | AdminAuthFailure
  | {
      ok: true;
      serviceClient: ReturnType<typeof createServiceSupabase>;
    };

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD;
}

function hash(value: string) {
  return createHash("sha256").update(value).digest();
}

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function timingSafeStringEqual(left: string, right: string) {
  return timingSafeEqual(hash(left), hash(right));
}

export function verifyAdminPassword(password: string) {
  const expected = getAdminPassword();

  if (!expected) {
    return { ok: false as const, code: "admin_password_unconfigured" };
  }

  return {
    ok: timingSafeStringEqual(password, expected),
    code: "password_checked"
  };
}

export function createAdminSessionValue() {
  const secret = getAdminPassword();

  if (!secret) {
    throw new Error("ADMIN_PASSWORD is not configured.");
  }

  const payload = `${Date.now()}.${randomBytes(24).toString("base64url")}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyAdminSessionValue(value: string | undefined) {
  const secret = getAdminPassword();

  if (!secret) {
    return { ok: false as const, code: "admin_password_unconfigured" };
  }

  if (!value) {
    return { ok: false as const, code: "missing_admin_session" };
  }

  const parts = value.split(".");
  if (parts.length !== 3) {
    return { ok: false as const, code: "invalid_admin_session_format" };
  }

  const [issuedAtText, nonce, signature] = parts;
  const issuedAt = Number(issuedAtText);
  const payload = `${issuedAtText}.${nonce}`;

  if (!Number.isFinite(issuedAt)) {
    return { ok: false as const, code: "invalid_admin_session_timestamp" };
  }

  if (Date.now() - issuedAt > ADMIN_SESSION_MAX_AGE * 1000) {
    return { ok: false as const, code: "expired_admin_session" };
  }

  const expectedSignature = sign(payload, secret);
  if (!timingSafeStringEqual(signature, expectedSignature)) {
    return { ok: false as const, code: "invalid_admin_session_signature" };
  }

  return { ok: true as const };
}

export function verifyAdminRequest(request: NextRequest): { ok: true } | AdminAuthFailure {
  const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const verified = verifyAdminSessionValue(session);

  if (!verified.ok) {
    return {
      ok: false,
      status: verified.code === "admin_password_unconfigured" ? 500 : 401,
      code: verified.code,
      message:
        verified.code === "admin_password_unconfigured"
          ? "ADMIN_PASSWORD is not configured."
          : "Admin login required."
    };
  }

  return { ok: true };
}

export function requireAdminFromRequest(request: NextRequest): AdminAuthResult {
  const verified = verifyAdminRequest(request);

  if (!verified.ok) {
    return verified;
  }

  return {
    ok: true,
    serviceClient: createServiceSupabase()
  };
}
