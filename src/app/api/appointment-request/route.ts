import { NextResponse } from "next/server";

type ContactPreference = "email" | "phone" | "text";
type ShoppingFocus =
	| "bridal-gown"
	| "mother-of-bride"
	| "accessories"
	| "special-occasion"
	| "not-sure";
type TimelineRange =
	| "asap"
	| "1-3-months"
	| "4-6-months"
	| "7-12-months"
	| "over-12-months"
	| "just-browsing";
type BudgetRange =
	| "under-1500"
	| "1500-2500"
	| "2500-4000"
	| "4000-plus"
	| "not-sure";

type AppointmentRequestData = {
	fullName: string;
	email: string;
	phone: string;
	shoppingFocus: ShoppingFocus;
	weddingDate?: string;
	preferredDate: string;
	preferredWindow: string;
	timeline: TimelineRange;
	guestCount?: number;
	budgetRange?: BudgetRange;
	preferredDesigners?: string;
	instagramHandle?: string;
	contactPreference: ContactPreference;
	styleNotes?: string;
};

type ValidationResult =
	| { ok: true; data: AppointmentRequestData }
	| { ok: false; errors: string[] };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

const allowedWindows = new Set([
	"weekday-morning",
	"weekday-afternoon",
	"weekday-evening",
	"saturday-morning",
	"saturday-afternoon",
	"flexible",
]);

const allowedContactPreferences = new Set(["email", "phone", "text"]);

const allowedShoppingFocus = new Set([
	"bridal-gown",
	"mother-of-bride",
	"accessories",
	"special-occasion",
	"not-sure",
]);

const allowedTimeline = new Set([
	"asap",
	"1-3-months",
	"4-6-months",
	"7-12-months",
	"over-12-months",
	"just-browsing",
]);

const allowedBudgetRanges = new Set([
	"under-1500",
	"1500-2500",
	"2500-4000",
	"4000-plus",
	"not-sure",
]);

function readString(value: unknown): string {
	return typeof value === "string" ? value.trim() : "";
}

function readOptionalDate(value: unknown): string | undefined {
	const dateValue = readString(value);
	if (!dateValue) return undefined;
	return isoDatePattern.test(dateValue) ? dateValue : undefined;
}

function validatePayload(raw: Record<string, unknown>): ValidationResult {
	const errors: string[] = [];

	const fullName = readString(raw.fullName);
	const email = readString(raw.email).toLowerCase();
	const phone = readString(raw.phone);
	const shoppingFocus = readString(raw.shoppingFocus);
	const weddingDateRaw = readString(raw.weddingDate);
	const weddingDate = readOptionalDate(raw.weddingDate);
	const preferredDate = readString(raw.preferredDate);
	const preferredWindow = readString(raw.preferredWindow);
	const timeline = readString(raw.timeline);
	const budgetRange = readString(raw.budgetRange);
	const preferredDesigners = readString(raw.preferredDesigners);
	const instagramHandle = readString(raw.instagramHandle);
	const contactPreference = readString(raw.contactPreference);
	const styleNotes = readString(raw.styleNotes);
	const guestCountRaw = readString(raw.guestCount);
	const policyAccepted = readString(raw.policyAccepted) === "on";

	if (fullName.length < 2) {
		errors.push("Please enter your full name.");
	}
	if (!emailPattern.test(email)) {
		errors.push("Please enter a valid email address.");
	}
	if (phone.length < 7) {
		errors.push("Please enter a valid phone number.");
	}
	if (!allowedShoppingFocus.has(shoppingFocus)) {
		errors.push("Please choose what you're shopping for.");
	}
	if (weddingDateRaw && !weddingDate) {
		errors.push("Please enter a valid event or wedding date.");
	}
	if (!isoDatePattern.test(preferredDate)) {
		errors.push("Please choose a preferred appointment date.");
	}
	if (!allowedWindows.has(preferredWindow)) {
		errors.push("Please choose a valid appointment time window.");
	}
	if (!allowedTimeline.has(timeline)) {
		errors.push("Please choose your timeline.");
	}
	if (budgetRange && !allowedBudgetRanges.has(budgetRange)) {
		errors.push("Please choose a valid budget range.");
	}
	if (!allowedContactPreferences.has(contactPreference)) {
		errors.push("Please choose a preferred contact method.");
	}
	if (preferredDesigners.length > 200) {
		errors.push(
			"Designer/style preferences must be 200 characters or less.",
		);
	}
	if (instagramHandle.length > 80) {
		errors.push("Instagram handle must be 80 characters or less.");
	}
	if (styleNotes.length > 1000) {
		errors.push("Style notes must be 1000 characters or less.");
	}
	if (!policyAccepted) {
		errors.push(
			"Please confirm that this is a request pending confirmation.",
		);
	}

	let guestCount: number | undefined;
	if (guestCountRaw) {
		const parsed = Number(guestCountRaw);
		if (!Number.isInteger(parsed) || parsed < 0 || parsed > 6) {
			errors.push(
				"Guests bringing must be a whole number between 0 and 6.",
			);
		} else {
			guestCount = parsed;
		}
	}

	if (errors.length > 0) {
		return { ok: false, errors };
	}

	return {
		ok: true,
		data: {
			fullName,
			email,
			phone,
			shoppingFocus: shoppingFocus as ShoppingFocus,
			weddingDate,
			preferredDate,
			preferredWindow,
			timeline: timeline as TimelineRange,
			guestCount,
			budgetRange: budgetRange ? (budgetRange as BudgetRange) : undefined,
			preferredDesigners: preferredDesigners || undefined,
			instagramHandle: instagramHandle || undefined,
			contactPreference: contactPreference as ContactPreference,
			styleNotes: styleNotes || undefined,
		},
	};
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

	const raw = body as Record<string, unknown>;

	if (readString(raw.website).length > 0) {
		return NextResponse.json({
			ok: true,
			message: "Thanks for your request. We will follow up shortly.",
		});
	}

	const validated = validatePayload(raw);
	if (!validated.ok) {
		return NextResponse.json(
			{
				ok: false,
				message: "Please review the form details and try again.",
				errors: validated.errors,
			},
			{ status: 422 },
		);
	}

	const submission = {
		...validated.data,
		submittedAt: new Date().toISOString(),
		source: "bridal-elegance-nm-website",
	};

	const formspreeEndpoint =
		process.env.FORMSPREE_APPOINTMENT_ENDPOINT?.trim();

	if (formspreeEndpoint) {
		try {
			const upstream = await fetch(formspreeEndpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				body: JSON.stringify(submission),
				cache: "no-store",
			});

			if (!upstream.ok) {
				console.error(
					"[appointment-request] Formspree submission failed",
					upstream.status,
				);

				return NextResponse.json(
					{
						ok: false,
						message:
							"We couldn't submit your request right now. Please call the boutique directly.",
					},
					{ status: 502 },
				);
			}
		} catch (error) {
			console.error("[appointment-request] Upstream error", error);

			return NextResponse.json(
				{
					ok: false,
					message:
						"We couldn't submit your request right now. Please call the boutique directly.",
				},
				{ status: 502 },
			);
		}
	} else {
		console.info(
			"[appointment-request] FORMSPREE_APPOINTMENT_ENDPOINT not set. Logging local submission only.",
			submission,
		);
	}

	return NextResponse.json({
		ok: true,
		message:
			"Appointment request received. Our team will confirm your time by email or phone.",
	});
}
