import { randomUUID } from "node:crypto";
import { Buffer } from "node:buffer";
import { NextResponse } from "next/server";
import {
	findAvailableSlotForDate,
	type AvailableAppointmentSlot,
} from "@/lib/appointment-availability";
import { createGoogleCalendarEvent } from "@/lib/google-calendar";
import { siteConfig } from "@/lib/site";

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
	| "500-1000"
	| "1500-2500"
	| "2500-3000"
	| "3000-plus";

type AppointmentRequestData = {
	fullName: string;
	email: string;
	phone: string;
	shoppingFocus: ShoppingFocus;
	streetSizeApprox: string;
	weddingDate?: string;
	preferredDate: string;
	preferredTimeSlot: string;
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
const timeSlotPattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
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
	"500-1000": "$500 to $1,000",
	"1500-2500": "$1,500 to $2,500",
	"2500-3000": "$2,500 to $3,000",
	"3000-plus": "$3,000+",
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
	"500-1000",
	"1500-2500",
	"2500-3000",
	"3000-plus",
]);

type NotificationMode = "both" | "text" | "email";

function readString(value: FormDataEntryValue | null): string {
	return typeof value === "string" ? value.trim() : "";
}

function shouldUploadImages(): boolean {
	return true;
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
	const preferredTimeSlot = readString(formData.get("preferredTimeSlot"));
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
	if (!timeSlotPattern.test(preferredTimeSlot)) {
		errors.push("Please choose a valid appointment time.");
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
			preferredTimeSlot,
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

function ensureAppointmentEnv(): string[] {
	const missing: string[] = [];

	if (!process.env.GOOGLE_CALENDAR_ID?.trim()) {
		missing.push("GOOGLE_CALENDAR_ID");
	}
	if (!process.env.GOOGLE_CALENDAR_SERVICE_ACCOUNT_EMAIL?.trim()) {
		missing.push("GOOGLE_CALENDAR_SERVICE_ACCOUNT_EMAIL");
	}
	if (!process.env.GOOGLE_CALENDAR_SERVICE_ACCOUNT_PRIVATE_KEY?.trim()) {
		missing.push("GOOGLE_CALENDAR_SERVICE_ACCOUNT_PRIVATE_KEY");
	}

	if (!process.env.CLOUDINARY_CLOUD_NAME?.trim()) {
		missing.push("CLOUDINARY_CLOUD_NAME");
	}
	if (!process.env.CLOUDINARY_UPLOAD_PRESET?.trim()) {
		missing.push("CLOUDINARY_UPLOAD_PRESET");
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
		["Preferred Appointment Time", data.preferredTimeSlot],
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

function buildCalendarEventDescription(
	data: AppointmentRequestData,
	photos: UploadedPhotoGroup,
): string {
	const rows = formatKeyValueRows(data)
		.map(([label, value]) => `${label}: ${value}`)
		.join("\n");

	return [
		"Bridal Elegance NM appointment booked from the website.",
		"",
		rows,
		"",
		"Bridal Inspiration:",
		photos.bride.length > 0 ? photos.bride.join("\n") : "No images uploaded.",
	].join("\n");
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
		`Time: ${data.preferredTimeSlot}`,
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


export async function POST(request: Request) {
	try {
		let formData: FormData;

		try {
			formData = await request.formData();
		} catch {
			return NextResponse.json(
				{
					ok: false,
					message:
						"Invalid request payload.",
				},
				{ status: 400 },
			);
		}

		if (readString(formData.get("website")).length > 0) {
			return NextResponse.json({
				ok: true,
				message: "Thanks for your request. We will follow up shortly.",
			});
		}

		const missingEnv = ensureAppointmentEnv();
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

		let selectedSlot: AvailableAppointmentSlot | null = null;
		try {
			selectedSlot = await findAvailableSlotForDate(
				validated.data.preferredDate,
				validated.data.preferredTimeSlot,
			);
			if (!selectedSlot) {
				return NextResponse.json(
					{
						ok: false,
						message:
							"That appointment time is no longer available. Please choose another open time.",
					},
					{ status: 409 },
				);
			}
		} catch (error) {
			console.error("[appointment-request] Availability validation error", error);
			return NextResponse.json(
				{
					ok: false,
					message:
						"We couldn't verify that appointment time right now. Please try again.",
				},
				{ status: 502 },
			);
		}

		let uploadedPhotos: UploadedPhotoGroup = {
			bride: [],
		};

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

		let calendarEventId = "";

		try {
			const createdEvent = await createGoogleCalendarEvent({
				summary: `Bridal Appointment - ${validated.data.fullName}`,
				description: buildCalendarEventDescription(
					validated.data,
					uploadedPhotos,
				),
				location: `${siteConfig.addressLine1}, ${siteConfig.addressLine2}`,
				startDateTimeIso: selectedSlot.startDateTimeIso,
				endDateTimeIso: selectedSlot.endDateTimeIso,
			});
			calendarEventId = createdEvent.id;
		} catch (error) {
			console.error("[appointment-request] Google Calendar booking error", error);
			return NextResponse.json(
				{
					ok: false,
					message:
						"We couldn't reserve that appointment time right now. Please choose another available time and try again.",
				},
				{ status: 502 },
			);
		}

		const submissionId = randomUUID();
		console.info("[appointment-request] submission delivered", {
			submissionId,
			calendarEventId,
			submittedAt: new Date().toISOString(),
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
			message: `Appointment reserved for ${validated.data.preferredDate} at ${validated.data.preferredTimeSlot}.`,
		});
	} catch (error) {
		console.error("[appointment-request] Unhandled route error", error);
		return NextResponse.json(
			{
				ok: false,
				message:
					"We hit an unexpected problem while finalizing that appointment. Please try again.",
			},
			{ status: 500 },
		);
	}
}
