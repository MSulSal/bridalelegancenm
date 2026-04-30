import { randomUUID } from "node:crypto";
import { Buffer } from "node:buffer";
import { NextResponse } from "next/server";
import { formatUsdFromCents, getDepositAmountCents } from "@/lib/appointments";

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
	streetSizeApprox: string;
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
	paymentMethod: "card" | "apple-pay" | "google-pay" | "paypal";
	cardholderName?: string;
	billingPostalCode?: string;
	billingAddressLine1?: string;
	billingAddressLine2?: string;
	billingCity?: string;
	billingState?: string;
	expectedDepositAmountCents: number;
	squarePaymentId?: string;
	squareReceiptUrl?: string;
	squareSourceType?: string;
	paypalPayerEmail?: string;
	paymentReference?: string;
};

type ValidationResult =
	| {
			ok: true;
			data: AppointmentRequestData;
			photos: {
				bride: File[];
				motherOfBride: File[];
				motherOfGroom: File[];
			};
	  }
	| { ok: false; errors: string[] };

type UploadedPhotoGroup = {
	bride: string[];
	motherOfBride: string[];
	motherOfGroom: string[];
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const maxImageBytes = 5 * 1024 * 1024;
const maxImagesPerGroup = 12;

const allowedWindows = new Set([
	"weekday-morning",
	"weekday-afternoon",
	"weekday-evening",
	"saturday-morning",
	"saturday-afternoon",
	"flexible",
]);

const windowLabels: Record<string, string> = {
	"weekday-morning": "Weekday Morning",
	"weekday-afternoon": "Weekday Afternoon",
	"weekday-evening": "Weekday Evening",
	"saturday-morning": "Saturday Morning",
	"saturday-afternoon": "Saturday Afternoon",
	flexible: "Flexible",
};

const contactLabels: Record<string, string> = {
	email: "Email",
	phone: "Phone",
	text: "Text",
};

const shoppingFocusLabels: Record<string, string> = {
	"bridal-gown": "Bridal Gown",
	"mother-of-bride": "Mother of the Bride",
	accessories: "Accessories",
	"special-occasion": "Special Occasion",
	"not-sure": "Not Sure Yet",
};

const timelineLabels: Record<string, string> = {
	asap: "As soon as possible",
	"1-3-months": "1 to 3 months out",
	"4-6-months": "4 to 6 months out",
	"7-12-months": "7 to 12 months out",
	"over-12-months": "More than 12 months out",
	"just-browsing": "Just browsing for now",
};

const budgetLabels: Record<string, string> = {
	"under-1500": "Under $1,500",
	"1500-2500": "$1,500 to $2,500",
	"2500-4000": "$2,500 to $4,000",
	"4000-plus": "$4,000+",
	"not-sure": "Not sure yet",
};

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

const allowedPaymentMethods = new Set([
	"card",
	"apple-pay",
	"google-pay",
	"paypal",
]);

function readString(value: FormDataEntryValue | null): string {
	return typeof value === "string" ? value.trim() : "";
}

type NotificationMode = "both" | "text" | "email";

function getNotificationMode(): NotificationMode {
	const raw = (process.env.APPOINTMENT_NOTIFICATION_MODE ?? "both")
		.trim()
		.toLowerCase();
	if (raw === "text" || raw === "email" || raw === "both") return raw;
	return "both";
}

function readOptionalDate(value: FormDataEntryValue | null): string | undefined {
	const dateValue = readString(value);
	if (!dateValue) return undefined;
	return isoDatePattern.test(dateValue) ? dateValue : undefined;
}

function readImageFiles(formData: FormData, key: string): File[] {
	return formData
		.getAll(key)
		.filter(entry => entry instanceof File && entry.size > 0) as File[];
}

function isValidUrl(value: string): boolean {
	try {
		const parsed = new URL(value);
		return parsed.protocol === "http:" || parsed.protocol === "https:";
	} catch {
		return false;
	}
}

function validateImageGroup(
	files: File[],
	label: string,
	errors: string[],
): void {
	if (files.length > maxImagesPerGroup) {
		errors.push(`${label}: upload up to ${maxImagesPerGroup} images.`);
	}

	for (const file of files) {
		if (!file.type.startsWith("image/")) {
			errors.push(`${label}: ${file.name} is not an image file.`);
		}
		if (file.size > maxImageBytes) {
			errors.push(
				`${label}: ${file.name} exceeds 5MB and can't be accepted.`,
			);
		}
	}
}

function validateFormData(formData: FormData): ValidationResult {
	const errors: string[] = [];

	const fullName = readString(formData.get("fullName"));
	const email = readString(formData.get("email")).toLowerCase();
	const phone = readString(formData.get("phone"));
	const shoppingFocus = readString(formData.get("shoppingFocus"));
	const streetSizeApprox = readString(formData.get("streetSizeApprox"));
	const weddingDateRaw = readString(formData.get("weddingDate"));
	const weddingDate = readOptionalDate(formData.get("weddingDate"));
	const preferredDate = readString(formData.get("preferredDate"));
	const preferredWindow = readString(formData.get("preferredWindow"));
	const timeline = readString(formData.get("timeline"));
	const budgetRange = readString(formData.get("budgetRange"));
	const preferredDesigners = readString(formData.get("preferredDesigners"));
	const instagramHandle = readString(formData.get("instagramHandle"));
	const contactPreference = readString(formData.get("contactPreference"));
	const styleNotes = readString(formData.get("styleNotes"));
	const guestCountRaw = readString(formData.get("guestCount"));
	const policyAccepted = readString(formData.get("policyAccepted")) === "on";
	const paymentMethod = readString(formData.get("paymentMethod"));
	const cardholderName = readString(formData.get("cardholderName"));
	const billingPostalCode = readString(formData.get("billingPostalCode"));
	const billingAddressLine1 = readString(formData.get("billingAddressLine1"));
	const billingAddressLine2 = readString(formData.get("billingAddressLine2"));
	const billingCity = readString(formData.get("billingCity"));
	const billingState = readString(formData.get("billingState")).toUpperCase();
	const squarePaymentId = readString(formData.get("squarePaymentId"));
	const squareReceiptUrl = readString(formData.get("squareReceiptUrl"));
	const squareSourceType = readString(formData.get("squareSourceType"));
	const squareAmountCentsRaw = readString(formData.get("squareAmountCents"));
	const paypalPayerEmail = readString(
		formData.get("paypalPayerEmail"),
	).toLowerCase();
	const paymentReference = readString(formData.get("paymentReference"));

	const bridePhotos = readImageFiles(formData, "brideInspirationPhotos");
	const motherOfBridePhotos = readImageFiles(
		formData,
		"motherOfBrideInspirationPhotos",
	);
	const motherOfGroomPhotos = readImageFiles(
		formData,
		"motherOfGroomInspirationPhotos",
	);

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
	if (streetSizeApprox.length < 1 || streetSizeApprox.length > 24) {
		errors.push("Please enter an approximate street size.");
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
	if (!allowedPaymentMethods.has(paymentMethod)) {
		errors.push("Please choose a payment method.");
	}
	if (squareReceiptUrl && !isValidUrl(squareReceiptUrl)) {
		errors.push("Square receipt URL is invalid.");
	}
	if (paymentReference.length > 120) {
		errors.push("Payment reference must be 120 characters or less.");
	}

	const expectedDepositAmountCents = getDepositAmountCents(preferredDate);
	let squareAmountCents: number | undefined;
	if (squareAmountCentsRaw) {
		const parsed = Number(squareAmountCentsRaw);
		if (!Number.isInteger(parsed) || parsed < 100) {
			errors.push("Square payment amount is invalid.");
		} else {
			squareAmountCents = parsed;
		}
	}

	let guestCount: number | undefined;
	if (guestCountRaw) {
		const parsed = Number(guestCountRaw);
		if (!Number.isInteger(parsed) || parsed < 0 || parsed > 6) {
			errors.push("Guests bringing must be a whole number between 0 and 6.");
		} else {
			guestCount = parsed;
		}
	}

	if (bridePhotos.length < 1) {
		errors.push("Please upload at least one bridal inspiration photo.");
	}
	if (motherOfBridePhotos.length + motherOfGroomPhotos.length < 1) {
		errors.push(
			"Please upload inspiration for the mother of the bride and/or mother of the groom.",
		);
	}

	validateImageGroup(bridePhotos, "Bride inspiration photos", errors);
	validateImageGroup(
		motherOfBridePhotos,
		"Mother of the bride inspiration photos",
		errors,
	);
	validateImageGroup(
		motherOfGroomPhotos,
		"Mother of the groom inspiration photos",
		errors,
	);

	if (paymentMethod === "paypal") {
		if (!emailPattern.test(paypalPayerEmail)) {
			errors.push("Please enter a valid PayPal email.");
		}
	} else if (
		paymentMethod === "card" ||
		paymentMethod === "apple-pay" ||
		paymentMethod === "google-pay"
	) {
		if (!squarePaymentId) {
			errors.push("Square payment is required before submitting.");
		}
		if (paymentMethod === "card") {
			if (cardholderName.length < 2) {
				errors.push("Please provide the cardholder name.");
			}
			if (billingAddressLine1.length < 3) {
				errors.push("Please provide a valid billing street address.");
			}
			if (billingCity.length < 2) {
				errors.push("Please provide a valid billing city.");
			}
			if (!/^[A-Z]{2}$/.test(billingState)) {
				errors.push("Please provide a valid 2-letter billing state.");
			}
			if (!/^\d{5}(-\d{4})?$/.test(billingPostalCode)) {
				errors.push("Please provide a valid billing ZIP code.");
			}
		}
		if (
			squareAmountCents === undefined ||
			squareAmountCents !== expectedDepositAmountCents
		) {
			errors.push(
				`Square payment amount must match the required deposit (${formatUsdFromCents(
					expectedDepositAmountCents,
				)}).`,
			);
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
			streetSizeApprox,
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
				paymentMethod: paymentMethod as
					| "card"
					| "apple-pay"
					| "google-pay"
					| "paypal",
				cardholderName: cardholderName || undefined,
				billingPostalCode: billingPostalCode || undefined,
				billingAddressLine1: billingAddressLine1 || undefined,
				billingAddressLine2: billingAddressLine2 || undefined,
				billingCity: billingCity || undefined,
				billingState: billingState || undefined,
				expectedDepositAmountCents,
				squarePaymentId: squarePaymentId || undefined,
				squareReceiptUrl: squareReceiptUrl || undefined,
			squareSourceType: squareSourceType || undefined,
			paypalPayerEmail: paypalPayerEmail || undefined,
			paymentReference: paymentReference || undefined,
		},
		photos: {
			bride: bridePhotos,
			motherOfBride: motherOfBridePhotos,
			motherOfGroom: motherOfGroomPhotos,
		},
	};
}

function ensureNotificationEnv(mode: NotificationMode): string[] {
	const missing: string[] = [];

	if (!process.env.CLOUDINARY_CLOUD_NAME?.trim()) {
		missing.push("CLOUDINARY_CLOUD_NAME");
	}
	if (!process.env.CLOUDINARY_UPLOAD_PRESET?.trim()) {
		missing.push("CLOUDINARY_UPLOAD_PRESET");
	}

	const shouldRequireEmail = mode === "both" || mode === "email";
	const shouldRequireSms = mode === "both" || mode === "text";

	if (shouldRequireEmail) {
		if (!process.env.RESEND_API_KEY?.trim()) {
			missing.push("RESEND_API_KEY");
		}
		if (!process.env.APPOINTMENT_NOTIFICATION_EMAIL_FROM?.trim()) {
			missing.push("APPOINTMENT_NOTIFICATION_EMAIL_FROM");
		}
		if (!process.env.APPOINTMENT_NOTIFICATION_EMAIL_TO?.trim()) {
			missing.push("APPOINTMENT_NOTIFICATION_EMAIL_TO");
		}
	}

	if (shouldRequireSms) {
		if (!process.env.TWILIO_ACCOUNT_SID?.trim()) {
			missing.push("TWILIO_ACCOUNT_SID");
		}
		if (!process.env.TWILIO_AUTH_TOKEN?.trim()) {
			missing.push("TWILIO_AUTH_TOKEN");
		}
		if (!process.env.TWILIO_FROM_PHONE?.trim()) {
			missing.push("TWILIO_FROM_PHONE");
		}
		if (!process.env.APPOINTMENT_NOTIFICATION_SMS_TO?.trim()) {
			missing.push("APPOINTMENT_NOTIFICATION_SMS_TO");
		}
	}

	return missing;
}

async function uploadImageToCloudinary(file: File): Promise<string> {
	const cloudName = process.env.CLOUDINARY_CLOUD_NAME!.trim();
	const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET!.trim();
	const folder =
		process.env.CLOUDINARY_APPOINTMENT_FOLDER?.trim() ||
		"bridal-elegance-appointments";

	const uploadData = new FormData();
	uploadData.set("file", file);
	uploadData.set("upload_preset", uploadPreset);
	uploadData.set("folder", folder);

	const response = await fetch(
		`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
		{
			method: "POST",
			body: uploadData,
			cache: "no-store",
		},
	);

	const json = (await response.json()) as {
		secure_url?: string;
		error?: { message?: string };
	};

	if (!response.ok || !json.secure_url) {
		throw new Error(
			json.error?.message ??
				`Cloudinary upload failed with status ${response.status}`,
		);
	}

	return json.secure_url;
}

function escapeHtml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#039;");
}

function formatKeyValueRows(data: AppointmentRequestData): Array<[string, string]> {
	const paymentMethodLabel =
		data.paymentMethod === "card"
			? "Card"
			: data.paymentMethod === "apple-pay"
				? "Apple Pay"
				: data.paymentMethod === "google-pay"
					? "Google Pay"
					: "PayPal";

	return [
		["Name", data.fullName],
		["Email", data.email],
		["Phone", data.phone],
		["Shopping For", shoppingFocusLabels[data.shoppingFocus] ?? data.shoppingFocus],
		["Approx. Street Size", data.streetSizeApprox],
		["Preferred Appointment Date", data.preferredDate],
		["Preferred Time Window", windowLabels[data.preferredWindow] ?? data.preferredWindow],
		["Timeline", timelineLabels[data.timeline] ?? data.timeline],
		["Event / Wedding Date", data.weddingDate ?? "Not provided"],
		[
			"Guests Bringing",
			data.guestCount !== undefined ? String(data.guestCount) : "Not provided",
		],
		[
			"Budget Range",
			data.budgetRange
				? (budgetLabels[data.budgetRange] ?? data.budgetRange)
				: "Not provided",
		],
		["Preferred Designers", data.preferredDesigners ?? "Not provided"],
		["Instagram", data.instagramHandle ?? "Not provided"],
		[
			"Contact Preference",
			contactLabels[data.contactPreference] ?? data.contactPreference,
		],
		["Style Notes", data.styleNotes ?? "Not provided"],
			["Payment Method", paymentMethodLabel],
			["Cardholder Name", data.cardholderName ?? "Not provided"],
			["Billing Street Address", data.billingAddressLine1 ?? "Not provided"],
			[
				"Billing Address Line 2",
				data.billingAddressLine2 ?? "Not provided",
			],
			["Billing City", data.billingCity ?? "Not provided"],
			["Billing State", data.billingState ?? "Not provided"],
			["Billing ZIP", data.billingPostalCode ?? "Not provided"],
			[
				"Required Deposit",
				formatUsdFromCents(data.expectedDepositAmountCents),
		],
		["Square Payment ID", data.squarePaymentId ?? "Not provided"],
		["Square Receipt URL", data.squareReceiptUrl ?? "Not provided"],
		["Square Source Type", data.squareSourceType ?? "Not provided"],
		["PayPal Payer Email", data.paypalPayerEmail ?? "Not provided"],
		[
			"Payment Reference",
			data.paymentReference ?? "Not provided",
		],
	];
}

function buildEmailHtml(
	data: AppointmentRequestData,
	photos: UploadedPhotoGroup,
	submittedAtIso: string,
): string {
	const rows = formatKeyValueRows(data)
		.map(
			([label, value]) =>
				`<tr><td style="padding:8px 12px;border:1px solid #ddd;background:#fafafa;font-weight:600;">${escapeHtml(
					label,
				)}</td><td style="padding:8px 12px;border:1px solid #ddd;">${escapeHtml(
					value,
				)}</td></tr>`,
		)
		.join("");

	const renderPhotoSection = (title: string, urls: string[]) => {
		if (urls.length === 0) {
			return `<h3 style=\"margin:20px 0 8px;\">${escapeHtml(title)}</h3><p style=\"margin:0;\">No images uploaded.</p>`;
		}

		const links = urls
			.map(
				url =>
					`<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer" style="display:inline-block;margin:0 8px 8px 0;"><img src="${escapeHtml(
						url,
					)}" alt="${escapeHtml(title)}" style="width:160px;height:auto;border:1px solid #e5e5e5;" /></a>`,
			)
			.join("");

		return `<h3 style=\"margin:20px 0 8px;\">${escapeHtml(title)}</h3><div>${links}</div>`;
	};

	return `
		<div style="font-family: Arial, sans-serif; color: #111; line-height: 1.5;">
			<h2 style="margin:0 0 8px;">New Appointment Request</h2>
			<p style="margin:0 0 16px; color:#444;">Submitted: ${escapeHtml(submittedAtIso)}</p>
			<table style="border-collapse:collapse; width:100%; max-width:820px;">${rows}</table>
			${renderPhotoSection("Bride Inspiration", photos.bride)}
			${renderPhotoSection("Mother of the Bride Inspiration", photos.motherOfBride)}
			${renderPhotoSection("Mother of the Groom Inspiration", photos.motherOfGroom)}
		</div>
	`;
}

function buildEmailText(
	data: AppointmentRequestData,
	photos: UploadedPhotoGroup,
	submittedAtIso: string,
): string {
	const rows = formatKeyValueRows(data)
		.map(([label, value]) => `${label}: ${value}`)
		.join("\n");

	const joinLinks = (label: string, urls: string[]) =>
		`${label}:\n${urls.length > 0 ? urls.join("\n") : "No images uploaded."}`;

	return [
		"New Appointment Request",
		`Submitted: ${submittedAtIso}`,
		"",
		rows,
		"",
		joinLinks("Bride Inspiration", photos.bride),
		"",
		joinLinks("Mother of the Bride Inspiration", photos.motherOfBride),
		"",
		joinLinks("Mother of the Groom Inspiration", photos.motherOfGroom),
	].join("\n");
}

async function sendNotificationEmail(
	data: AppointmentRequestData,
	photos: UploadedPhotoGroup,
	submittedAtIso: string,
): Promise<void> {
	const resendApiKey = process.env.RESEND_API_KEY!.trim();
	const from = process.env.APPOINTMENT_NOTIFICATION_EMAIL_FROM!.trim();
	const toList = process.env.APPOINTMENT_NOTIFICATION_EMAIL_TO!.split(",")
		.map(item => item.trim())
		.filter(Boolean);

	const payload = {
		from,
		to: toList,
		subject: `New Appointment Request: ${data.fullName}`,
		html: buildEmailHtml(data, photos, submittedAtIso),
		text: buildEmailText(data, photos, submittedAtIso),
	};

	const response = await fetch("https://api.resend.com/emails", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${resendApiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
		cache: "no-store",
	});

	if (!response.ok) {
		const errorBody = await response.text();
		throw new Error(
			`Resend email failed (${response.status}): ${errorBody || "Unknown error"}`,
		);
	}
}

function buildSmsBody(
	data: AppointmentRequestData,
	submittedAtIso: string,
	photoCounts: { bride: number; motherOfBride: number; motherOfGroom: number },
): string {
	const paymentMethodLabel =
		data.paymentMethod === "card"
			? "Card"
			: data.paymentMethod === "apple-pay"
				? "Apple Pay"
				: data.paymentMethod === "google-pay"
					? "Google Pay"
					: "PayPal";

	const paymentSummary =
		data.paymentMethod === "paypal"
			? `PayPal: ${data.paypalPayerEmail ?? "pending"}`
			: `Square: ${data.squarePaymentId ?? "n/a"}`;

	return [
		"New Bridal Appointment Request",
		`Name: ${data.fullName}`,
		`Phone: ${data.phone}`,
		`Email: ${data.email}`,
		`Shopping: ${shoppingFocusLabels[data.shoppingFocus] ?? data.shoppingFocus}`,
		`Date: ${data.preferredDate} (${windowLabels[data.preferredWindow] ?? data.preferredWindow})`,
		`Street Size: ${data.streetSizeApprox}`,
		`Payment: ${paymentMethodLabel} ${formatUsdFromCents(data.expectedDepositAmountCents)}`,
		paymentSummary,
		`Submitted: ${submittedAtIso}`,
		`Images - Bride: ${photoCounts.bride}, MOB: ${photoCounts.motherOfBride}, MOG: ${photoCounts.motherOfGroom}`,
	].join("\n");
}

async function sendNotificationSms(
	data: AppointmentRequestData,
	photos: UploadedPhotoGroup,
	submittedAtIso: string,
): Promise<void> {
	const accountSid = process.env.TWILIO_ACCOUNT_SID!.trim();
	const authToken = process.env.TWILIO_AUTH_TOKEN!.trim();
	const from = process.env.TWILIO_FROM_PHONE!.trim();
	const to = process.env.APPOINTMENT_NOTIFICATION_SMS_TO!.trim();

	const photoUrls = [...photos.bride, ...photos.motherOfBride, ...photos.motherOfGroom].slice(
		0,
		10,
	);
	const body = buildSmsBody(data, submittedAtIso, {
		bride: photos.bride.length,
		motherOfBride: photos.motherOfBride.length,
		motherOfGroom: photos.motherOfGroom.length,
	});

	const params = new URLSearchParams();
	params.set("From", from);
	params.set("To", to);
	params.set("Body", body);
	for (const url of photoUrls) {
		params.append("MediaUrl", url);
	}

	const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
	const response = await fetch(
		`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
		{
			method: "POST",
			headers: {
				Authorization: `Basic ${basicAuth}`,
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: params.toString(),
			cache: "no-store",
		},
	);

	if (!response.ok) {
		const errorBody = await response.text();
		throw new Error(
			`Twilio SMS failed (${response.status}): ${errorBody || "Unknown error"}`,
		);
	}
}

export async function POST(request: Request) {
	let formData: FormData;

	try {
		formData = await request.formData();
	} catch {
		return NextResponse.json(
			{ ok: false, message: "Invalid request payload." },
			{ status: 400 },
		);
	}

	if (readString(formData.get("website")).length > 0) {
		return NextResponse.json({
			ok: true,
			message: "Thanks for your request. We will follow up shortly.",
		});
	}

	const notificationMode = getNotificationMode();
	const missingEnv = ensureNotificationEnv(notificationMode);
	if (missingEnv.length > 0) {
		return NextResponse.json(
			{
				ok: false,
				message:
					"Appointment delivery is not configured yet. Please contact support.",
				errors: [
					`Missing environment variables: ${missingEnv.join(", ")}`,
				],
			},
			{ status: 500 },
		);
	}

	const validated = validateFormData(formData);
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

	let uploadedPhotos: UploadedPhotoGroup;

	try {
		uploadedPhotos = {
			bride: await Promise.all(
				validated.photos.bride.map(file => uploadImageToCloudinary(file)),
			),
			motherOfBride: await Promise.all(
				validated.photos.motherOfBride.map(file =>
					uploadImageToCloudinary(file),
				),
			),
			motherOfGroom: await Promise.all(
				validated.photos.motherOfGroom.map(file =>
					uploadImageToCloudinary(file),
				),
			),
		};
	} catch (error) {
		console.error("[appointment-request] Cloudinary upload error", error);
		return NextResponse.json(
			{
				ok: false,
				message:
					"We couldn't upload inspiration photos right now. Please try again.",
			},
			{ status: 502 },
		);
	}

	const submittedAtIso = new Date().toISOString();
	const deliveredChannels: string[] = [];
	const notificationErrors: string[] = [];

	if (notificationMode === "both" || notificationMode === "email") {
		try {
			await sendNotificationEmail(
				validated.data,
				uploadedPhotos,
				submittedAtIso,
			);
			deliveredChannels.push("email");
		} catch (error) {
			console.error("[appointment-request] Email delivery error", error);
			notificationErrors.push("email");
		}
	}

	if (notificationMode === "both" || notificationMode === "text") {
		try {
			await sendNotificationSms(validated.data, uploadedPhotos, submittedAtIso);
			deliveredChannels.push("text");
		} catch (error) {
			console.error("[appointment-request] SMS delivery error", error);
			notificationErrors.push("text");
		}
	}

	if (deliveredChannels.length === 0) {
		return NextResponse.json(
			{
				ok: false,
				message:
					"Your payment and details were received, but notifications failed to send. Please call the boutique now.",
			},
			{ status: 502 },
		);
	}

	const submissionId = randomUUID();
	console.info("[appointment-request] submission delivered", {
		submissionId,
		submittedAt: submittedAtIso,
		requester: {
			fullName: validated.data.fullName,
			email: validated.data.email,
			phone: validated.data.phone,
		},
		photos: {
			bride: uploadedPhotos.bride.length,
			motherOfBride: uploadedPhotos.motherOfBride.length,
			motherOfGroom: uploadedPhotos.motherOfGroom.length,
		},
	});

	return NextResponse.json({
		ok: true,
		message: `Appointment request received. Payment verified and details delivered by ${deliveredChannels.join(
			" and ",
		)}.`,
	});
}

