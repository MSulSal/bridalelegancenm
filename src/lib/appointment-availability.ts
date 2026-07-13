import "server-only";

import { weeklyAppointmentSlotRules } from "./appointment-slot-rules";
import {
	fetchGoogleCalendarEvents,
	fetchGoogleCalendarResolvedTimeZone,
	getGoogleCalendarTimeZone,
	isGoogleCalendarAvailabilityConfigured,
} from "./google-calendar";

export type AvailableAppointmentSlot = {
	id: string;
	label: string;
	startTime: string;
	endTime: string;
	startDateTimeIso: string;
	endDateTimeIso: string;
};

type AvailabilitySnapshot = {
	configured: boolean;
	timeZone: string;
	availableDates: string[];
	slotsByDate: Record<string, AvailableAppointmentSlot[]>;
};

const isoMonthPattern = /^\d{4}-\d{2}$/;
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

function pad(value: number): string {
	return String(value).padStart(2, "0");
}

function parseIsoMonth(value: string): { year: number; month: number } | null {
	if (!isoMonthPattern.test(value)) return null;
	const [yearRaw, monthRaw] = value.split("-");
	const year = Number(yearRaw);
	const month = Number(monthRaw);
	if (!Number.isInteger(year) || !Number.isInteger(month)) return null;
	if (month < 1 || month > 12) return null;
	return { year, month };
}

function toIsoDate(year: number, month: number, day: number): string {
	return `${year}-${pad(month)}-${pad(day)}`;
}

function parseTimeToMinutes(value: string): number {
	const match = value.match(timePattern);
	if (!match) return 0;
	return Number(match[1]) * 60 + Number(match[2]);
}

function formatMinutesToTime(value: number): string {
	const hours = Math.floor(value / 60);
	const minutes = value % 60;
	return `${pad(hours)}:${pad(minutes)}`;
}

function formatSlotLabel(startTime: string): string {
	const [hoursRaw, minutesRaw] = startTime.split(":");
	const hours = Number(hoursRaw);
	const minutes = Number(minutesRaw);
	const suffix = hours >= 12 ? "PM" : "AM";
	const hour12 = hours % 12 === 0 ? 12 : hours % 12;
	if (minutes === 0) {
		return `${hour12}:00 ${suffix}`;
	}
	return `${hour12}:${pad(minutes)} ${suffix}`;
}

function getAppointmentLeadDays(): number {
	const parsed = Number(process.env.APPOINTMENT_LEAD_DAYS ?? "1");
	return Number.isFinite(parsed) && parsed >= 0 ? parsed : 1;
}

function getAppointmentMaxDaysAhead(): number {
	const parsed = Number(process.env.APPOINTMENT_MAX_DAYS_AHEAD ?? "120");
	return Number.isFinite(parsed) && parsed > 0 ? parsed : 120;
}

function parseOffsetMinutes(offsetLabel: string): number {
	const match = offsetLabel.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/u);
	if (!match) return 0;

	const sign = match[1] === "-" ? -1 : 1;
	const hours = Number(match[2]);
	const minutes = Number(match[3] ?? "0");
	return sign * (hours * 60 + minutes);
}

function getTimeZoneOffsetMinutes(date: Date, timeZone: string): number {
	const formatter = new Intl.DateTimeFormat("en-US", {
		timeZone,
		timeZoneName: "shortOffset",
		hour: "2-digit",
		minute: "2-digit",
	});
	const offsetPart = formatter
		.formatToParts(date)
		.find(part => part.type === "timeZoneName");

	return parseOffsetMinutes(offsetPart?.value ?? "GMT");
}

function zonedDateTimeToUtc(
	isoDate: string,
	minutesAfterMidnight: number,
	timeZone: string,
): Date {
	const [yearRaw, monthRaw, dayRaw] = isoDate.split("-");
	const year = Number(yearRaw);
	const month = Number(monthRaw);
	const day = Number(dayRaw);
	const hours = Math.floor(minutesAfterMidnight / 60);
	const minutes = minutesAfterMidnight % 60;
	const utcGuess = Date.UTC(year, month - 1, day, hours, minutes, 0, 0);
	const offsetMinutes = getTimeZoneOffsetMinutes(new Date(utcGuess), timeZone);

	return new Date(utcGuess - offsetMinutes * 60_000);
}

function getCurrentIsoDateInTimeZone(timeZone: string): string {
	const formatter = new Intl.DateTimeFormat("en-US", {
		timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
	const parts = formatter.formatToParts(new Date());
	const year = parts.find(part => part.type === "year")?.value ?? "0000";
	const month = parts.find(part => part.type === "month")?.value ?? "01";
	const day = parts.find(part => part.type === "day")?.value ?? "01";
	return `${year}-${month}-${day}`;
}

function addDaysToIsoDate(isoDate: string, daysToAdd: number): string {
	const [yearRaw, monthRaw, dayRaw] = isoDate.split("-");
	const nextDate = new Date(
		Date.UTC(Number(yearRaw), Number(monthRaw) - 1, Number(dayRaw) + daysToAdd),
	);

	return toIsoDate(
		nextDate.getUTCFullYear(),
		nextDate.getUTCMonth() + 1,
		nextDate.getUTCDate(),
	);
}

function getWeekdayIndex(isoDate: string): number {
	const [yearRaw, monthRaw, dayRaw] = isoDate.split("-");
	return new Date(
		Date.UTC(Number(yearRaw), Number(monthRaw) - 1, Number(dayRaw)),
	).getUTCDay();
}

function buildScheduledSlotsForDate(
	isoDate: string,
	timeZone: string,
): AvailableAppointmentSlot[] {
	const weekdayIndex = getWeekdayIndex(isoDate);
	const rules = weeklyAppointmentSlotRules[weekdayIndex] ?? [];

	return rules.map(rule => {
		const startMinutes = parseTimeToMinutes(rule.startTime);
		const endMinutes = startMinutes + rule.durationMinutes;
		const startDateTime = zonedDateTimeToUtc(isoDate, startMinutes, timeZone);
		const endDateTime = zonedDateTimeToUtc(isoDate, endMinutes, timeZone);

		return {
			id: rule.id,
			label: rule.label ?? formatSlotLabel(rule.startTime),
			startTime: rule.startTime,
			endTime: formatMinutesToTime(endMinutes),
			startDateTimeIso: startDateTime.toISOString(),
			endDateTimeIso: endDateTime.toISOString(),
		};
	});
}

function doesEventOverlapSlot(
	eventInterval: { start: Date; end: Date },
	slot: AvailableAppointmentSlot,
): boolean {
	const slotStart = new Date(slot.startDateTimeIso).getTime();
	const slotEnd = new Date(slot.endDateTimeIso).getTime();
	const overlapStart = Math.max(eventInterval.start.getTime(), slotStart);
	const overlapEnd = Math.min(eventInterval.end.getTime(), slotEnd);
	return overlapEnd > overlapStart;
}

function getMonthDateRange(
	parsedMonth: { year: number; month: number },
	timeZone: string,
) {
	const monthStartIso = `${parsedMonth.year}-${pad(parsedMonth.month)}-01`;
	const nextMonthYear =
		parsedMonth.month === 12 ? parsedMonth.year + 1 : parsedMonth.year;
	const nextMonthNumber = parsedMonth.month === 12 ? 1 : parsedMonth.month + 1;
	const nextMonthStartIso = `${nextMonthYear}-${pad(nextMonthNumber)}-01`;

	return {
		monthStartUtc: zonedDateTimeToUtc(monthStartIso, 0, timeZone),
		nextMonthStartUtc: zonedDateTimeToUtc(nextMonthStartIso, 0, timeZone),
	};
}

export async function getMonthAvailability(
	monthValue: string,
): Promise<AvailabilitySnapshot> {
	const parsedMonth = parseIsoMonth(monthValue);
	const configuredTimeZone = getGoogleCalendarTimeZone();

	if (!parsedMonth) {
		return {
			configured: isGoogleCalendarAvailabilityConfigured(),
			timeZone: configuredTimeZone,
			availableDates: [],
			slotsByDate: {},
		};
	}

	if (!isGoogleCalendarAvailabilityConfigured()) {
		return {
			configured: false,
			timeZone: configuredTimeZone,
			availableDates: [],
			slotsByDate: {},
		};
	}

	let timeZone = configuredTimeZone;
	try {
		timeZone = await fetchGoogleCalendarResolvedTimeZone();
	} catch (error) {
		console.error(
			"[appointment-availability] Falling back to configured timezone",
			error,
		);
	}

	const { monthStartUtc, nextMonthStartUtc } = getMonthDateRange(
		parsedMonth,
		timeZone,
	);
	const eventIntervals = await fetchGoogleCalendarEvents(
		monthStartUtc.toISOString(),
		nextMonthStartUtc.toISOString(),
	);
	const leadDateIso = addDaysToIsoDate(
		getCurrentIsoDateInTimeZone(timeZone),
		getAppointmentLeadDays(),
	);
	const maxDateIso = addDaysToIsoDate(
		getCurrentIsoDateInTimeZone(timeZone),
		getAppointmentMaxDaysAhead(),
	);

	const availableDates: string[] = [];
	const slotsByDate: Record<string, AvailableAppointmentSlot[]> = {};
	const totalDaysInMonth = new Date(
		Date.UTC(parsedMonth.year, parsedMonth.month, 0),
	).getUTCDate();

	for (let day = 1; day <= totalDaysInMonth; day += 1) {
		const isoDate = toIsoDate(parsedMonth.year, parsedMonth.month, day);
		if (isoDate < leadDateIso || isoDate > maxDateIso) continue;

		const scheduledSlots = buildScheduledSlotsForDate(isoDate, timeZone);
		const openSlots = scheduledSlots.filter(
			slot =>
				!eventIntervals.some(eventInterval =>
					doesEventOverlapSlot(eventInterval, slot),
				),
		);

		if (openSlots.length > 0) {
			availableDates.push(isoDate);
			slotsByDate[isoDate] = openSlots;
		}
	}

	return {
		configured: true,
		timeZone,
		availableDates,
		slotsByDate,
	};
}

export async function getAvailableSlotsForDate(
	isoDate: string,
): Promise<AvailableAppointmentSlot[]> {
	if (!isoDatePattern.test(isoDate)) return [];
	const [year, month] = isoDate.split("-");
	const monthAvailability = await getMonthAvailability(`${year}-${month}`);
	return monthAvailability.slotsByDate[isoDate] ?? [];
}

export async function findAvailableSlotForDate(
	isoDate: string,
	slotId: string,
): Promise<AvailableAppointmentSlot | null> {
	const availableSlots = await getAvailableSlotsForDate(isoDate);
	return availableSlots.find(slot => slot.id === slotId) ?? null;
}

export async function isAppointmentDateAvailable(
	isoDate: string,
): Promise<boolean> {
	const slots = await getAvailableSlotsForDate(isoDate);
	return slots.length > 0;
}
