import "server-only";

import { Buffer } from "node:buffer";

type TwilioConfig = {
	accountSid: string;
	authToken: string;
	fromPhone: string;
	clientRecipients: string[];
};

function getTwilioConfig(): TwilioConfig | null {
	const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim() ?? "";
	const authToken = process.env.TWILIO_AUTH_TOKEN?.trim() ?? "";
	const fromPhone = process.env.TWILIO_FROM_PHONE?.trim() ?? "";
	const clientRecipients = (process.env.APPOINTMENT_NOTIFICATION_SMS_TO ?? "")
		.split(",")
		.map(value => value.trim())
		.filter(Boolean);

	if (!accountSid || !authToken || !fromPhone || clientRecipients.length === 0) {
		return null;
	}

	return {
		accountSid,
		authToken,
		fromPhone,
		clientRecipients,
	};
}

export function isTwilioConfigured(): boolean {
	return getTwilioConfig() !== null;
}

export function getTwilioClientRecipients(): string[] {
	return getTwilioConfig()?.clientRecipients ?? [];
}

async function sendTwilioMessage(to: string, body: string): Promise<void> {
	const config = getTwilioConfig();
	if (!config) {
		throw new Error("Twilio is not configured.");
	}

	const payload = new URLSearchParams();
	payload.set("To", to);
	payload.set("From", config.fromPhone);
	payload.set("Body", body);

	const auth = Buffer.from(
		`${config.accountSid}:${config.authToken}`,
		"utf8",
	).toString("base64");

	const response = await fetch(
		`https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`,
		{
			method: "POST",
			headers: {
				Authorization: `Basic ${auth}`,
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: payload.toString(),
			cache: "no-store",
		},
	);

	if (!response.ok) {
		const message = await response.text();
		throw new Error(
			`Twilio SMS failed with status ${response.status}: ${message}`,
		);
	}
}

export async function sendSmsToClientRecipients(body: string): Promise<void> {
	const recipients = getTwilioClientRecipients();
	for (const recipient of recipients) {
		await sendTwilioMessage(recipient, body);
	}
}

export async function sendSmsToPhone(to: string, body: string): Promise<void> {
	await sendTwilioMessage(to, body);
}
