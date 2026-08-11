import "server-only";

import { Buffer } from "node:buffer";
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
		id?: string;
		summary?: string;
		description?: string;
		location?: string;
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

type GoogleCalendarMetadataResponse = {
	timeZone?: string;
};

type GoogleInsertEventInput = {
	summary: string;
	description: string;
	location?: string;
	startDateTimeIso: string;
	endDateTimeIso: string;
};

type GoogleUpdateEventInput = {
	summary?: string;
	description?: string;
	location?: string;
	startDateTimeIso?: string;
	endDateTimeIso?: string;
};

type GoogleInsertEventResponse = {
	id?: string;
	htmlLink?: string;
};

type GoogleEventResponse = {
	id?: string;
	summary?: string;
	description?: string;
	location?: string;
	htmlLink?: string;
	status?: string;
	start?: {
		date?: string;
		dateTime?: string;
	};
	end?: {
		date?: string;
		dateTime?: string;
	};
};

export type CalendarEventInterval = {
	start: Date;
	end: Date;
};

export type GoogleCalendarEvent = {
	id: string;
	summary: string;
	description: string;
	location?: string;
	htmlLink?: string;
	status?: string;
	startDateTimeIso?: string;
	endDateTimeIso?: string;
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

async function authorizedGoogleCalendarFetch(
	path: string,
	init: RequestInit,
): Promise<Response> {
	const config = getGoogleCalendarConfig();
	if (!config) {
		throw new Error("Google Calendar is not configured.");
	}

	const accessToken = await getGoogleAccessToken(config);

	return fetch(
		`${googleCalendarEventsUrl}/${encodeURIComponent(config.calendarId)}${path}`,
		{
			...init,
			headers: {
				Authorization: `Bearer ${accessToken}`,
				...(init.headers ?? {}),
			},
			cache: "no-store",
		},
	);
}

function parseGoogleEventDate(
	value: { date?: string; dateTime?: string } | undefined,
): Date | null {
	if (!value) return null;
	if (value.dateTime) {
		return new Date(value.dateTime);
	}
	if (value.date) {
		return new Date(`${value.date}T00:00:00.000Z`);
	}
	return null;
}

function mapGoogleCalendarEvent(
	json: GoogleEventResponse,
): GoogleCalendarEvent | null {
	if (!json.id) return null;

	return {
		id: json.id,
		summary: json.summary ?? "",
		description: json.description ?? "",
		location: json.location,
		htmlLink: json.htmlLink,
		status: json.status,
		startDateTimeIso: json.start?.dateTime,
		endDateTimeIso: json.end?.dateTime,
	};
}

export function getGoogleCalendarTimeZone(): string {
	return getGoogleCalendarConfig()?.timeZone ?? "America/Denver";
}

export function isGoogleCalendarAvailabilityConfigured(): boolean {
	return getGoogleCalendarConfig() !== null;
}

export async function fetchGoogleCalendarResolvedTimeZone(): Promise<string> {
	const config = getGoogleCalendarConfig();
	if (!config) return "America/Denver";

	const response = await authorizedGoogleCalendarFetch("", {
		method: "GET",
	});

	const json = (await response.json()) as GoogleCalendarMetadataResponse;
	if (!response.ok) {
		throw new Error(
			`Google calendar metadata request failed with status ${response.status}.`,
		);
	}

	return json.timeZone?.trim() || config.timeZone || "America/Denver";
}

export async function fetchGoogleCalendarEvents(
	timeMinIso: string,
	timeMaxIso: string,
): Promise<CalendarEventInterval[]> {
	const config = getGoogleCalendarConfig();
	if (!config) return [];

	const params = new URLSearchParams();
	params.set("timeMin", timeMinIso);
	params.set("timeMax", timeMaxIso);
	params.set("singleEvents", "true");
	params.set("orderBy", "startTime");

	const response = await authorizedGoogleCalendarFetch(
		`/events?${params.toString()}`,
		{
			method: "GET",
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

	const response = await authorizedGoogleCalendarFetch("/events?sendUpdates=none", {
		method: "POST",
		headers: {
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
	});

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

export async function getGoogleCalendarEvent(
	eventId: string,
): Promise<GoogleCalendarEvent | null> {
	const response = await authorizedGoogleCalendarFetch(
		`/events/${encodeURIComponent(eventId)}`,
		{
			method: "GET",
		},
	);

	if (response.status === 404) {
		return null;
	}

	const json = (await response.json()) as GoogleEventResponse;
	if (!response.ok) {
		throw new Error(
			`Google event fetch failed with status ${response.status}.`,
		);
	}

	return mapGoogleCalendarEvent(json);
}

export async function updateGoogleCalendarEvent(
	eventId: string,
	input: GoogleUpdateEventInput,
): Promise<GoogleCalendarEvent> {
	const config = getGoogleCalendarConfig();
	if (!config) {
		throw new Error("Google Calendar is not configured.");
	}

	const body: Record<string, unknown> = {};
	if (input.summary !== undefined) body.summary = input.summary;
	if (input.description !== undefined) body.description = input.description;
	if (input.location !== undefined) body.location = input.location;
	if (input.startDateTimeIso !== undefined) {
		body.start = {
			dateTime: input.startDateTimeIso,
			timeZone: config.timeZone,
		};
	}
	if (input.endDateTimeIso !== undefined) {
		body.end = {
			dateTime: input.endDateTimeIso,
			timeZone: config.timeZone,
		};
	}

	const response = await authorizedGoogleCalendarFetch(
		`/events/${encodeURIComponent(eventId)}?sendUpdates=none`,
		{
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		},
	);

	const json = (await response.json()) as GoogleEventResponse;
	if (!response.ok) {
		throw new Error(
			`Google event update failed with status ${response.status}.`,
		);
	}

	const event = mapGoogleCalendarEvent(json);
	if (!event) {
		throw new Error("Google event update did not return an event id.");
	}

	return event;
}

export async function deleteGoogleCalendarEvent(eventId: string): Promise<void> {
	const response = await authorizedGoogleCalendarFetch(
		`/events/${encodeURIComponent(eventId)}?sendUpdates=none`,
		{
			method: "DELETE",
		},
	);

	if (response.status === 404 || response.status === 410) {
		return;
	}

	if (!response.ok) {
		throw new Error(
			`Google event delete failed with status ${response.status}.`,
		);
	}
}
