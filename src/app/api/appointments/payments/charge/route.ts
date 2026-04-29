import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getDepositAmountCents } from "@/lib/appointments";

type ChargePayload = {
	sourceId?: unknown;
	preferredDate?: unknown;
	fullName?: unknown;
	email?: unknown;
	phone?: unknown;
	paymentMethod?: unknown;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

function readString(value: unknown): string {
	return typeof value === "string" ? value.trim() : "";
}

function getSquareBaseUrl(): string {
	const env = (process.env.SQUARE_ENVIRONMENT ?? "production")
		.trim()
		.toLowerCase();

	return env === "sandbox"
		? "https://connect.squareupsandbox.com"
		: "https://connect.squareup.com";
}

export async function POST(request: Request) {
	let body: unknown;

	try {
		body = await request.json();
	} catch {
		return NextResponse.json(
			{ ok: false, message: "Invalid request payload." },
			{ status: 400 },
		);
	}

	if (!body || typeof body !== "object" || Array.isArray(body)) {
		return NextResponse.json(
			{ ok: false, message: "Invalid request payload." },
			{ status: 400 },
		);
	}

	const payload = body as ChargePayload;
	const sourceId = readString(payload.sourceId);
	const preferredDate = readString(payload.preferredDate);
	const fullName = readString(payload.fullName);
	const email = readString(payload.email).toLowerCase();
	const phone = readString(payload.phone);
	const paymentMethod = readString(payload.paymentMethod);

	const errors: string[] = [];
	if (!sourceId) {
		errors.push("Missing secure payment token.");
	}
	if (!isoDatePattern.test(preferredDate)) {
		errors.push("Please choose a valid appointment date.");
	}
	if (fullName.length < 2) {
		errors.push("Please enter your full name before payment.");
	}
	if (!emailPattern.test(email)) {
		errors.push("Please enter a valid email address before payment.");
	}
	if (phone.length < 7) {
		errors.push("Please enter a valid phone number before payment.");
	}
	if (
		paymentMethod !== "card" &&
		paymentMethod !== "apple-pay" &&
		paymentMethod !== "google-pay"
	) {
		errors.push("Invalid Square payment method selected.");
	}

	if (errors.length > 0) {
		return NextResponse.json(
			{ ok: false, message: "Please fix payment details and try again.", errors },
			{ status: 422 },
		);
	}

	const squareAccessToken = process.env.SQUARE_ACCESS_TOKEN?.trim();
	const squareLocationId = process.env.SQUARE_LOCATION_ID?.trim();
	const squareCurrency = (process.env.SQUARE_CURRENCY ?? "USD")
		.trim()
		.toUpperCase();
	const squareApiVersion = (process.env.SQUARE_API_VERSION ?? "2026-01-22").trim();

	if (!squareAccessToken || !squareLocationId) {
		return NextResponse.json(
			{
				ok: false,
				message:
					"Square payment is not configured. Add SQUARE_ACCESS_TOKEN and SQUARE_LOCATION_ID.",
			},
			{ status: 500 },
		);
	}

	const amountCents = getDepositAmountCents(preferredDate);
	const paymentPayload = {
		idempotency_key: randomUUID(),
		source_id: sourceId,
		location_id: squareLocationId,
		amount_money: {
			amount: amountCents,
			currency: squareCurrency,
		},
		autocomplete: true,
		buyer_email_address: email,
		note: `Bridal appointment deposit (${paymentMethod}) for ${fullName} (${phone})`,
	};

	let upstreamStatus = 500;
	let upstreamBody: unknown;

	try {
		const response = await fetch(`${getSquareBaseUrl()}/v2/payments`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${squareAccessToken}`,
				"Content-Type": "application/json",
				"Square-Version": squareApiVersion,
			},
			body: JSON.stringify(paymentPayload),
			cache: "no-store",
		});

		upstreamStatus = response.status;
		upstreamBody = await response.json();
	} catch (error) {
		console.error("[square-charge] upstream network error", error);
		return NextResponse.json(
			{
				ok: false,
				message:
					"We couldn't reach Square right now. Please try again in a moment.",
			},
			{ status: 502 },
		);
	}

	const upstream = upstreamBody as {
		payment?: {
			id?: string;
			status?: string;
			receipt_url?: string;
			card_details?: { card?: { card_brand?: string } };
			source_type?: string;
		};
		errors?: Array<{ detail?: string; code?: string }>;
	};

	if (upstreamStatus < 200 || upstreamStatus >= 300 || !upstream.payment?.id) {
		return NextResponse.json(
			{
				ok: false,
				message: "Square couldn't complete this payment.",
				errors: (upstream.errors ?? []).map(
					item => item.detail ?? item.code ?? "Unknown Square error",
				),
			},
			{ status: 502 },
		);
	}

	return NextResponse.json({
		ok: true,
		paymentId: upstream.payment.id,
		paymentStatus: upstream.payment.status ?? "",
		receiptUrl: upstream.payment.receipt_url ?? "",
		amountCents,
		currency: squareCurrency,
		sourceType: upstream.payment.source_type ?? "",
		cardBrand: upstream.payment.card_details?.card?.card_brand ?? "",
	});
}

