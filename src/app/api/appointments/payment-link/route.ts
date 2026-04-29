import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

type Payload = {
	fullName?: unknown;
	email?: unknown;
	phone?: unknown;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

function getDepositAmountCents(): number {
	const parsed = Number(process.env.SQUARE_APPOINTMENT_DEPOSIT_CENTS ?? "5000");
	if (!Number.isInteger(parsed) || parsed < 100) {
		return 5000;
	}
	return parsed;
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

	const payload = body as Payload;
	const fullName = readString(payload.fullName);
	const email = readString(payload.email).toLowerCase();
	const phone = readString(payload.phone);

	const errors: string[] = [];
	if (fullName.length < 2) {
		errors.push("Please enter your full name before payment.");
	}
	if (!emailPattern.test(email)) {
		errors.push("Please enter a valid email before payment.");
	}
	if (phone.length < 7) {
		errors.push("Please enter a valid phone before payment.");
	}

	if (errors.length > 0) {
		return NextResponse.json(
			{ ok: false, message: "Please complete required fields.", errors },
			{ status: 422 },
		);
	}

	const squareAccessToken = process.env.SQUARE_ACCESS_TOKEN?.trim();
	const squareLocationId = process.env.SQUARE_LOCATION_ID?.trim();
	const squareCurrency = (process.env.SQUARE_CURRENCY ?? "USD").trim().toUpperCase();
	const squareApiVersion = (process.env.SQUARE_API_VERSION ?? "2026-01-22").trim();

	if (!squareAccessToken || !squareLocationId) {
		return NextResponse.json(
			{
				ok: false,
				message:
					"Square payment is not configured yet. Add SQUARE_ACCESS_TOKEN and SQUARE_LOCATION_ID.",
			},
			{ status: 500 },
		);
	}

	const redirectUrl =
		process.env.SQUARE_CHECKOUT_REDIRECT_URL?.trim() ||
		process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
		"http://localhost:3000/book-appointment";

	const depositAmountCents = getDepositAmountCents();
	const depositLabel =
		process.env.SQUARE_APPOINTMENT_DEPOSIT_NAME?.trim() ||
		"Bridal Appointment Deposit";

	const squarePayload = {
		idempotency_key: randomUUID(),
		quick_pay: {
			name: depositLabel,
			price_money: {
				amount: depositAmountCents,
				currency: squareCurrency,
			},
			location_id: squareLocationId,
		},
		checkout_options: {
			redirect_url: redirectUrl,
		},
		pre_populated_data: {
			buyer_email: email,
		},
		note: `Appointment request deposit for ${fullName} (${phone})`,
	};

	let upstreamJson: unknown;
	let upstreamStatus = 500;

	try {
		const response = await fetch(
			`${getSquareBaseUrl()}/v2/online-checkout/payment-links`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${squareAccessToken}`,
					"Content-Type": "application/json",
					"Square-Version": squareApiVersion,
				},
				body: JSON.stringify(squarePayload),
				cache: "no-store",
			},
		);

		upstreamStatus = response.status;
		upstreamJson = await response.json();
	} catch (error) {
		console.error("[square-payment-link] Upstream error", error);
		return NextResponse.json(
			{
				ok: false,
				message:
					"Unable to reach Square right now. Please try again in a moment.",
			},
			{ status: 502 },
		);
	}

	const upstream = upstreamJson as {
		payment_link?: { id?: string; url?: string; long_url?: string; checkout_url?: string };
		errors?: Array<{ detail?: string; code?: string }>;
	};

	if (upstreamStatus < 200 || upstreamStatus >= 300) {
		return NextResponse.json(
			{
				ok: false,
				message: "Square could not generate a payment link.",
				errors: (upstream.errors ?? []).map(
					err => err.detail ?? err.code ?? "Unknown Square error",
				),
			},
			{ status: 502 },
		);
	}

	const checkoutUrl =
		upstream.payment_link?.url ??
		upstream.payment_link?.long_url ??
		upstream.payment_link?.checkout_url ??
		"";

	if (!checkoutUrl) {
		return NextResponse.json(
			{
				ok: false,
				message:
					"Square did not return a checkout URL. Please try generating the link again.",
			},
			{ status: 502 },
		);
	}

	return NextResponse.json({
		ok: true,
		checkoutUrl,
		paymentLinkId: upstream.payment_link?.id ?? "",
	});
}

