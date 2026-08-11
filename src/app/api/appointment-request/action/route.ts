import { NextResponse } from "next/server";
import { verifyAppointmentActionToken } from "@/lib/appointment-action-token";
import {
	deleteGoogleCalendarEvent,
	getGoogleCalendarEvent,
	updateGoogleCalendarEvent,
} from "@/lib/google-calendar";
import { siteConfig } from "@/lib/site";
import { sendSmsToClientRecipients, sendSmsToPhone } from "@/lib/twilio";

type ParsedAppointmentDetails = {
	name: string;
	email: string;
	phone: string;
	preferredDate: string;
	preferredTime: string;
	guestCount: string;
	streetSize: string;
	budgetRange: string;
	preferredDesigners: string;
	contactPreference: string;
	styleNotes: string;
	imageUrls: string[];
};

function htmlPage(title: string, body: string): NextResponse {
	return new NextResponse(
		`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    body { font-family: Manrope, Arial, sans-serif; background: #f8f3ea; color: #3f352c; margin: 0; }
    main { max-width: 40rem; margin: 0 auto; padding: 4rem 1.5rem; }
    .card { background: #fff; border: 1px solid #d9ccb6; padding: 2rem; }
    h1 { font-family: "Cormorant Garamond", Georgia, serif; font-size: 2.25rem; margin: 0 0 1rem; }
    p { line-height: 1.7; margin: 0.75rem 0; }
    a { color: #8c6735; }
  </style>
</head>
<body>
  <main>
    <div class="card">
      <h1>${title}</h1>
      ${body}
    </div>
  </main>
</body>
</html>`,
		{
			headers: {
				"Content-Type": "text/html; charset=utf-8",
			},
		},
	);
}

function parseAppointmentDetails(description: string): ParsedAppointmentDetails {
	const lines = description.split(/\r?\n/u);
	const values = new Map<string, string>();
	const imageUrls: string[] = [];
	let collectingImages = false;

	for (const rawLine of lines) {
		const line = rawLine.trim();
		if (!line) continue;
		if (line === "Bridal Inspiration:") {
			collectingImages = true;
			continue;
		}
		if (collectingImages) {
			imageUrls.push(line);
			continue;
		}

		const separatorIndex = line.indexOf(":");
		if (separatorIndex <= 0) continue;
		const key = line.slice(0, separatorIndex).trim();
		const value = line.slice(separatorIndex + 1).trim();
		values.set(key, value);
	}

	return {
		name: values.get("Name") ?? "Customer",
		email: values.get("Email") ?? "",
		phone: values.get("Phone") ?? "",
		preferredDate: values.get("Preferred Appointment Date") ?? "",
		preferredTime: values.get("Preferred Appointment Time") ?? "",
		guestCount: values.get("Guests Bringing") ?? "Not provided",
		streetSize: values.get("Approx. Street Size") ?? "Not provided",
		budgetRange: values.get("Budget Range") ?? "Not provided",
		preferredDesigners: values.get("Preferred Designers") ?? "Not provided",
		contactPreference: values.get("Contact Preference") ?? "Not provided",
		styleNotes: values.get("Style Notes") ?? "Not provided",
		imageUrls,
	};
}

function replaceStatusInDescription(
	description: string,
	nextStatus: string,
): string {
	if (description.includes("Status: ")) {
		return description.replace(
			/Status:\s*.*/u,
			`Status: ${nextStatus}`,
		);
	}

	return `Status: ${nextStatus}\n${description}`;
}

function buildClientConfirmationText(
	details: ParsedAppointmentDetails,
	location: string,
): string {
	const lines = [
		"Appointment Confirmed",
		`Name: ${details.name}`,
		`Phone: ${details.phone}`,
		`Email: ${details.email || "Not provided"}`,
		`Date: ${details.preferredDate}`,
		`Time: ${details.preferredTime}`,
		`Guests: ${details.guestCount}`,
		`Street Size: ${details.streetSize}`,
		`Budget: ${details.budgetRange}`,
		`Designers: ${details.preferredDesigners}`,
		`Contact Pref: ${details.contactPreference}`,
		`Style Notes: ${details.styleNotes}`,
		`Location: ${location}`,
	];

	if (details.imageUrls.length > 0) {
		lines.push("Image URLs:");
		lines.push(...details.imageUrls);
	}

	return lines.join("\n");
}

function buildCustomerConfirmationText(details: ParsedAppointmentDetails): string {
	return [
		`Bridal Elegance NM confirmed your appointment for ${details.preferredDate} at ${details.preferredTime}.`,
		`Location: ${siteConfig.addressLine1}, ${siteConfig.addressLine2}.`,
		`Call ${siteConfig.phoneDisplay} if you need anything before your visit.`,
	].join(" ");
}

function buildCustomerRejectionText(details: ParsedAppointmentDetails): string {
	return [
		`Bridal Elegance NM could not confirm your requested appointment for ${details.preferredDate} at ${details.preferredTime}.`,
		`Please submit another request or call ${siteConfig.phoneDisplay} for help choosing another time.`,
	].join(" ");
}

export async function GET(request: Request) {
	const token = new URL(request.url).searchParams.get("token")?.trim() ?? "";
	if (!token) {
		return htmlPage(
			"Missing Request Link",
			"<p>This approval link is incomplete. Please open the full message from the boutique.</p>",
		);
	}

	const payload = verifyAppointmentActionToken(token);
	if (!payload) {
		return htmlPage(
			"Link Expired",
			"<p>This approval link has expired or is invalid. Please return to the latest appointment request text.</p>",
		);
	}

	try {
		const event = await getGoogleCalendarEvent(payload.eventId);
		if (!event) {
			return htmlPage(
				"Request Already Handled",
				"<p>This appointment request has already been released or is no longer available.</p>",
			);
		}

		const details = parseAppointmentDetails(event.description);
		const location =
			event.location ??
			`${siteConfig.addressLine1}, ${siteConfig.addressLine2}`;
		const isConfirmed =
			event.summary.startsWith("Confirmed Bridal Appointment") ||
			event.description.includes("Status: Confirmed");

		if (payload.action === "approve") {
			if (isConfirmed) {
				return htmlPage(
					"Already Confirmed",
					`<p>${details.name}'s appointment is already confirmed.</p>`,
				);
			}

			const confirmedDescription = replaceStatusInDescription(
				event.description,
				`Confirmed on ${new Date().toISOString()}`,
			);
			await updateGoogleCalendarEvent(event.id, {
				summary: `Confirmed Bridal Appointment - ${details.name}`,
				description: confirmedDescription,
			});

			const clientMessage = buildClientConfirmationText(details, location);
			const customerMessage = buildCustomerConfirmationText(details);

			await sendSmsToClientRecipients(clientMessage);
			await sendSmsToPhone(details.phone, customerMessage);

			return htmlPage(
				"Appointment Confirmed",
				`<p>${details.name}'s appointment for ${details.preferredDate} at ${details.preferredTime} has been confirmed.</p>
<p>The client and customer confirmation texts were sent.</p>
<p><a href="${siteConfig.mapsHref}" target="_blank" rel="noreferrer">Open boutique location</a></p>`,
			);
		}

		if (isConfirmed) {
			return htmlPage(
				"Request Already Confirmed",
				`<p>${details.name}'s appointment is already confirmed, so this reject link is no longer active.</p>`,
			);
		}

		await deleteGoogleCalendarEvent(event.id);
		await sendSmsToPhone(details.phone, buildCustomerRejectionText(details));

		return htmlPage(
			"Appointment Rejected",
			`<p>${details.name}'s request for ${details.preferredDate} at ${details.preferredTime} was declined and the held slot has been released.</p>
<p>The customer rejection text was sent.</p>`,
		);
	} catch (error) {
		console.error("[appointment-request/action] Action handling failed", error);
		return htmlPage(
			"Action Failed",
			"<p>We couldn't complete that appointment action right now. Please try the link again or update the calendar manually if needed.</p>",
		);
	}
}
