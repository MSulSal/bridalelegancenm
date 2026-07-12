import "server-only";

import { createSign } from "node:crypto";

type GoogleCalendarConfig = {
	calendarId: string;
	serviceAccountEmail: string;
	privateKey: string;
	timeZone: string;
};

type GoogleTokenResponse = {
	access_token?: string;
	token_type?: string;
	expires_in?: number;
};

type GoogleCalendarListResponse = {
	items?: Array<{
		start?: {
			date?: string;
			dateTime?: string;
		};
		end?: {
			date?: string;
			dateTime?: string;
		};
		status?: string;
		transparency?: string;
	}>;
};

export type CalendarEventInterval = {
	start: Date;
	end: Date;
};

type GoogleInsertEventInput = {
	summary: string;
	description: string;
	location?: string;
	startDateTimeIso: string;
	endDateTimeIso: string;
};

type GoogleInsertEventResponse = {
	id?: string;
	htmlLink?: string;
};

const googleTokenUrl = "https://oauth2.googleapis.com/token";
const googleCalendarEventsUrl = "https://www.googleapis.com/calendar/v3/calendars";
const googleCalendarScope = "https://www.googleapis.com/auth/calendar";

function encodeBase64Url(value: string): string {
	return Buffer.from(value)
		.toString("base64")
		.replaceAll("+", "-")
		.replaceAll("/", "_")
		.replace(/=+$/u, "");
}

function getGoogleCalendarConfig(): GoogleCalendarConfig | null {
	const calendarId = process.env.GOOGLE_CALENDAR_ID?.trim() ?? "";
	const serviceAccountEmail =
		process.env.GOOGLE_CALENDAR_SERVICE_ACCOUNT_EMAIL?.trim() ?? "";
	const privateKeyRaw =
		process.env.GOOGLE_CALENDAR_SERVICE_ACCOUNT_PRIVATE_KEY?.trim() ?? "";
	const timeZone =
		process.env.GOOGLE_CALENDAR_TIMEZONE?.trim() ?? "America/Denver";

	if (!calendarId || !serviceAccountEmail || !privateKeyRaw) {
		return null;
	}

	return {
		calendarId,
		serviceAccountEmail,
		privateKey: privateKeyRaw.replace(/\\n/g, "\n"),
		timeZone,
	};
}

function buildSignedJwt(config: GoogleCalendarConfig): string {
	const issuedAtSeconds = Math.floor(Date.now() / 1000);
	const header = {
		alg: "RS256",
		typ: "JWT",
	};
	const payload = {
		iss: config.serviceAccountEmail,
		scope: googleCalendarScope,
		aud: googleTokenUrl,
		exp: issuedAtSeconds + 3600,
		iat: issuedAtSeconds,
	};

	const signingInput = `${encodeBase64Url(JSON.stringify(header))}.${encodeBase64Url(
		JSON.stringify(payload),
	)}`;

	const signer = createSign("RSA-SHA256");
	signer.update(signingInput);
	signer.end();

	const signature = signer.sign(config.privateKey, "base64");
	const signatureBase64Url = signature
		.replaceAll("+", "-")
		.replaceAll("/", "_")
		.replace(/=+$/u, "");

	return `${signingInput}.${signatureBase64Url}`;
}

async function getGoogleAccessToken(
	config: GoogleCalendarConfig,
): Promise<string> {
	const assertion = buildSignedJwt(config);
	const body = new URLSearchParams();
	body.set("grant_type", "urn:ietf:params:oauth:grant-type:jwt-bearer");
	body.set("assertion", assertion);

	const response = await fetch(googleTokenUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: body.toString(),
		cache: "no-store",
	});

	const json = (await response.json()) as GoogleTokenResponse;

	if (!response.ok || !json.access_token) {
		throw new Error(
			`Google token request failed with status ${response.status}.`,
		);
	}

	return json.access_token;
}

export function getGoogleCalendarTimeZone(): string {
	return getGoogleCalendarConfig()?.timeZone ?? "America/Denver";
}

export function isGoogleCalendarAvailabilityConfigured(): boolean {
	return getGoogleCalendarConfig() !== null;
}

function parseGoogleEventDate(value: { date?: string; dateTime?: string } | undefined): Date | null {
	if (!value) return null;
	if (value.dateTime) {
		return new Date(value.dateTime);
	}
	if (value.date) {
		return new Date(`${value.date}T00:00:00.000Z`);
	}
	return null;
}

export async function fetchGoogleCalendarEvents(
	timeMinIso: string,
	timeMaxIso: string,
): Promise<CalendarEventInterval[]> {
	const config = getGoogleCalendarConfig();
	if (!config) return [];

	const accessToken = await getGoogleAccessToken(config);
	const params = new URLSearchParams();
	params.set("timeMin", timeMinIso);
	params.set("timeMax", timeMaxIso);
	params.set("singleEvents", "true");
	params.set("orderBy", "startTime");

	const response = await fetch(
		`${googleCalendarEventsUrl}/${encodeURIComponent(config.calendarId)}/events?${params.toString()}`,
		{
			method: "GET",
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			cache: "no-store",
		},
	);

	const json = (await response.json()) as GoogleCalendarListResponse;
	if (!response.ok) {
		throw new Error(
			`Google events request failed with status ${response.status}.`,
		);
	}

	const intervals =
		json.items
			?.filter(event => event.status !== "cancelled")
			.map(event => {
				const start = parseGoogleEventDate(event.start);
				const end = parseGoogleEventDate(event.end);
				if (!start || !end) return null;

				return {
					start,
					end,
				};
			})
			.filter(
				(interval): interval is CalendarEventInterval => interval !== null,
			) ?? [];

	return intervals.sort(
		(left, right) => left.start.getTime() - right.start.getTime(),
	);
}

export async function createGoogleCalendarEvent(
	input: GoogleInsertEventInput,
): Promise<{ id: string; htmlLink?: string }> {
	const config = getGoogleCalendarConfig();
	if (!config) {
		throw new Error("Google Calendar is not configured.");
	}

	const accessToken = await getGoogleAccessToken(config);
	const response = await fetch(
		`${googleCalendarEventsUrl}/${encodeURIComponent(config.calendarId)}/events?sendUpdates=none`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				summary: input.summary,
				description: input.description,
				location: input.location,
				start: {
					dateTime: input.startDateTimeIso,
					timeZone: config.timeZone,
				},
				end: {
					dateTime: input.endDateTimeIso,
					timeZone: config.timeZone,
				},
			}),
			cache: "no-store",
		},
	);

	const json = (await response.json()) as GoogleInsertEventResponse;
	if (!response.ok || !json.id) {
		throw new Error(
			`Google event insert failed with status ${response.status}.`,
		);
	}

	return {
		id: json.id,
		htmlLink: json.htmlLink,
	};
}
