import { randomUUID } from "node:crypto";
import { Buffer } from "node:buffer";
import { NextResponse } from "next/server";

type ContactPreference = "email" | "phone" | "text";
type ShoppingFocus = "bridal-gown";
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
	timeline: TimelineRange;
	guestCount?: number;
	budgetRange?: BudgetRange;
	preferredDesigners?: string;
	instagramHandle?: string;
	contactPreference: ContactPreference;
	styleNotes?: string;
};

type ValidationResult =
	| {
			ok: true;
			data: AppointmentRequestData;
			photos: {
				bride: File[];
			};
	  }
	| { ok: false; errors: string[] };

type UploadedPhotoGroup = {
	bride: string[];
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const maxImageBytes = 5 * 1024 * 1024;
const maxImagesPerGroup = 12;

const contactLabels: Record<string, string> = {
	email: "Email",
	phone: "Phone",
	text: "Text",
};

const shoppingFocusLabels: Record<string, string> = {
	"bridal-gown": "Bridal Gown",
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
const allowedShoppingFocus = new Set(["bridal-gown"]);
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

type NotificationMode = "both" | "text" | "email";

function readString(value: FormDataEntryValue | null): string {
	return typeof value === "string" ? value.trim() : "";
}

function getNotificationMode(): NotificationMode {
	const raw = (process.env.APPOINTMENT_NOTIFICATION_MODE ?? "both")
		.trim()
		.toLowerCase();
	if (raw === "text" || raw === "email" || raw === "both") return raw;
	return "both";
}

function shouldUploadImages(mode: NotificationMode): boolean {
	return mode === "both" || mode === "email" || mode === "text";
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
	const timeline = readString(formData.get("timeline"));
	const budgetRange = readString(formData.get("budgetRange"));
	const preferredDesigners = readString(formData.get("preferredDesigners"));
	const instagramHandle = readString(formData.get("instagramHandle"));
	const contactPreference = readString(formData.get("contactPreference"));
	const styleNotes = readString(formData.get("styleNotes"));
	const guestCountRaw = readString(formData.get("guestCount"));
	const policyAccepted = readString(formData.get("policyAccepted")) === "on";

	const bridePhotos = readImageFiles(formData, "brideInspirationPhotos");

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
		errors.push("This request form is currently limited to bridal gown appointments.");
	}
	if (streetSizeApprox.length < 1 || streetSizeApprox.length > 24) {
		errors.push("Please enter an approximate street size.");
	}
	if (weddingDateRaw && !weddingDate) {
		errors.push("Please enter a valid wedding date.");
	}
	if (!isoDatePattern.test(preferredDate)) {
		errors.push("Please choose a preferred appointment date.");
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
		if (!Number.isInteger(parsed) || parsed < 0 || parsed > 4) {
			errors.push("Guests bringing must be a whole number between 0 and 4.");
		} else {
			guestCount = parsed;
		}
	}

	if (bridePhotos.length < 1) {
		errors.push("Please upload at least one bridal inspiration photo.");
	}

	validateImageGroup(bridePhotos, "Bride inspiration photos", errors);

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
			timeline: timeline as TimelineRange,
			guestCount,
			budgetRange: budgetRange ? (budgetRange as BudgetRange) : undefined,
			preferredDesigners: preferredDesigners || undefined,
			instagramHandle: instagramHandle || undefined,
			contactPreference: contactPreference as ContactPreference,
			styleNotes: styleNotes || undefined,
		},
		photos: {
			bride: bridePhotos,
		},
	};
}

function ensureNotificationEnv(mode: NotificationMode): string[] {
	const missing: string[] = [];

	if (shouldUploadImages(mode)) {
		if (!process.env.CLOUDINARY_CLOUD_NAME?.trim()) {
			missing.push("CLOUDINARY_CLOUD_NAME");
		}
		if (!process.env.CLOUDINARY_UPLOAD_PRESET?.trim()) {
			missing.push("CLOUDINARY_UPLOAD_PRESET");
		}
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
	return [
		["Name", data.fullName],
		["Email", data.email],
		["Phone", data.phone],
		["Shopping For", shoppingFocusLabels[data.shoppingFocus] ?? data.shoppingFocus],
		["Approx. Street Size", data.streetSizeApprox],
		["Preferred Appointment Date", data.preferredDate],
		["Timeline", timelineLabels[data.timeline] ?? data.timeline],
		["Wedding Date", data.weddingDate ?? "Not provided"],
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

	const brideSection =
		photos.bride.length === 0
			? `<h3 style="margin:20px 0 8px;">Bride Inspiration</h3><p style="margin:0;">No images uploaded.</p>`
			: `<h3 style="margin:20px 0 8px;">Bride Inspiration</h3><div>${photos.bride
					.map(
						url =>
							`<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer" style="display:inline-block;margin:0 8px 8px 0;"><img src="${escapeHtml(
								url,
							)}" alt="Bride inspiration" style="width:160px;height:auto;border:1px solid #e5e5e5;" /></a>`,
					)
					.join("")}</div>`;

	return `
		<div style="font-family: Arial, sans-serif; color: #111; line-height: 1.5;">
			<h2 style="margin:0 0 8px;">New Appointment Request</h2>
			<p style="margin:0 0 16px; color:#444;">Submitted: ${escapeHtml(submittedAtIso)}</p>
			<table style="border-collapse:collapse; width:100%; max-width:820px;">${rows}</table>
			${brideSection}
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

	return [
		"New Appointment Request",
		`Submitted: ${submittedAtIso}`,
		"",
		rows,
		"",
		"Bridge Inspiration:",
		photos.bride.length > 0 ? photos.bride.join("\n") : "No images uploaded.",
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
	photoUrls: string[],
): string {
	const lines = [
		"New Bridal Appointment Request",
		`Name: ${data.fullName}`,
		`Phone: ${data.phone}`,
		`Email: ${data.email}`,
		`Date: ${data.preferredDate}`,
		`Timeline: ${timelineLabels[data.timeline] ?? data.timeline}`,
		`Street Size: ${data.streetSizeApprox}`,
		`Guests: ${data.guestCount ?? "Not provided"}`,
		`Contact Pref: ${contactLabels[data.contactPreference] ?? data.contactPreference}`,
		`Submitted: ${submittedAtIso}`,
	];

	if (photoUrls.length > 0) {
		lines.push("Image URLs:");
		lines.push(...photoUrls);
	}

	return lines.join("\n");
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

	const body = buildSmsBody(
		data,
		submittedAtIso,
		photos.bride.slice(0, 10),
	);

	const params = new URLSearchParams();
	params.set("From", from);
	params.set("To", to);
	params.set("Body", body);

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
				errors: [`Missing environment variables: ${missingEnv.join(", ")}`],
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

	let uploadedPhotos: UploadedPhotoGroup = {
		bride: [],
	};

	if (shouldUploadImages(notificationMode)) {
		try {
			uploadedPhotos = {
				bride: await Promise.all(
					validated.photos.bride.map(file => uploadImageToCloudinary(file)),
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
	}

	const submittedAtIso = new Date().toISOString();
	const deliveredChannels: string[] = [];

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
		}
	}

	if (notificationMode === "both" || notificationMode === "text") {
		try {
			await sendNotificationSms(
				validated.data,
				uploadedPhotos,
				submittedAtIso,
			);
			deliveredChannels.push("text");
		} catch (error) {
			console.error("[appointment-request] SMS delivery error", error);
		}
	}

	if (deliveredChannels.length === 0) {
		return NextResponse.json(
			{
				ok: false,
				message:
					"Your appointment details were received, but notifications failed to send. Please call the boutique now.",
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
		},
	});

	return NextResponse.json({
		ok: true,
		message: `Appointment request received. Details delivered by ${deliveredChannels.join(
			" and ",
		)}.`,
	});
}
