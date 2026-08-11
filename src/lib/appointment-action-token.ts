import "server-only";

import { Buffer } from "node:buffer";
import { createHmac, timingSafeEqual } from "node:crypto";

export type AppointmentAction = "approve" | "reject";

type AppointmentActionTokenPayload = {
	action: AppointmentAction;
	eventId: string;
	expiresAt: string;
};

function encodeBase64Url(value: string): string {
	return Buffer.from(value)
		.toString("base64")
		.replaceAll("+", "-")
		.replaceAll("/", "_")
		.replace(/=+$/u, "");
}

function decodeBase64Url(value: string): string {
	const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
	const paddingLength = (4 - (normalized.length % 4)) % 4;
	return Buffer.from(`${normalized}${"=".repeat(paddingLength)}`, "base64").toString(
		"utf8",
	);
}

function getAppointmentActionSecret(): string {
	const secret = process.env.APPOINTMENT_ACTION_SECRET?.trim() ?? "";
	if (!secret) {
		throw new Error("APPOINTMENT_ACTION_SECRET is not configured.");
	}
	return secret;
}

function signPayload(encodedPayload: string): string {
	const signature = createHmac("sha256", getAppointmentActionSecret())
		.update(encodedPayload)
		.digest("base64");

	return signature
		.replaceAll("+", "-")
		.replaceAll("/", "_")
		.replace(/=+$/u, "");
}

export function createAppointmentActionToken(
	payload: AppointmentActionTokenPayload,
): string {
	const encodedPayload = encodeBase64Url(JSON.stringify(payload));
	const signature = signPayload(encodedPayload);
	return `${encodedPayload}.${signature}`;
}

export function verifyAppointmentActionToken(
	token: string,
): AppointmentActionTokenPayload | null {
	const [encodedPayload, signature] = token.split(".");
	if (!encodedPayload || !signature) return null;

	const expectedSignature = signPayload(encodedPayload);
	const providedBuffer = Buffer.from(signature, "utf8");
	const expectedBuffer = Buffer.from(expectedSignature, "utf8");

	if (
		providedBuffer.length !== expectedBuffer.length ||
		!timingSafeEqual(providedBuffer, expectedBuffer)
	) {
		return null;
	}

	try {
		const parsed = JSON.parse(
			decodeBase64Url(encodedPayload),
		) as Partial<AppointmentActionTokenPayload>;

		if (
			(parsed.action !== "approve" && parsed.action !== "reject") ||
			typeof parsed.eventId !== "string" ||
			typeof parsed.expiresAt !== "string"
		) {
			return null;
		}

		const expiresAtMs = Date.parse(parsed.expiresAt);
		if (!Number.isFinite(expiresAtMs) || expiresAtMs < Date.now()) {
			return null;
		}

		return {
			action: parsed.action,
			eventId: parsed.eventId,
			expiresAt: parsed.expiresAt,
		};
	} catch {
		return null;
	}
}
