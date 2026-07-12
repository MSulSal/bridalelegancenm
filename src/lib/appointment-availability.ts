import "server-only";

import {
	fetchGoogleCalendarBusyIntervals,
	getGoogleCalendarTimeZone,
	isGoogleCalendarAvailabilityConfigured,
} from "./google-calendar";

type AvailabilityWindow = {
	startMinutes: number;
	endMinutes: number;
};

type AvailabilitySnapshot = {
	configured: boolean;
	timeZone: string;
	availableDates: string[];
};

const weekdayEnvKeys = [
	"APPOINTMENT_HOURS_SUNDAY",
	"APPOINTMENT_HOURS_MONDAY",
	"APPOINTMENT_HOURS_TUESDAY",
	"APPOINTMENT_HOURS_WEDNESDAY",
	"APPOINTMENT_HOURS_THURSDAY",
	"APPOINTMENT_HOURS_FRIDAY",
	"APPOINTMENT_HOURS_SATURDAY",
] as const;

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

function parseTimeToMinutes(value: string): number | null {
	const match = value.match(timePattern);
	if (!match) return null;
	const hours = Number(match[1]);
	const minutes = Number(match[2]);
	return hours * 60 + minutes;
}

function parseWindow(rawValue: string): AvailabilityWindow | null {
	const [startRaw, endRaw] = rawValue.split("-");
	if (!startRaw || !endRaw) return null;

	const startMinutes = parseTimeToMinutes(startRaw.trim());
	const endMinutes = parseTimeToMinutes(endRaw.trim());
	if (startMinutes === null || endMinutes === null) return null;
	if (endMinutes <= startMinutes) return null;

	return { startMinutes, endMinutes };
}

function parseDailyWindows(rawValue: string | undefined): AvailabilityWindow[] {
	if (!rawValue) return [];

	return rawValue
		.split(",")
		.map(segment => parseWindow(segment.trim()))
		.filter((window): window is AvailabilityWindow => window !== null)
		.sort((left, right) => left.startMinutes - right.startMinutes);
}

function getWeeklyAvailabilityHours(): AvailabilityWindow[][] {
	return weekdayEnvKeys.map(key =>
		parseDailyWindows(process.env[key]?.trim() ?? ""),
	);
}

function getAppointmentDurationMinutes(): number {
	const parsed = Number(process.env.APPOINTMENT_DURATION_MINUTES ?? "90");
	return Number.isFinite(parsed) && parsed > 0 ? parsed : 90;
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
	return formatDateInTimeZone(new Date(), timeZone);
}

function formatDateInTimeZone(date: Date, timeZone: string): string {
	const formatter = new Intl.DateTimeFormat("en-US", {
		timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
	const parts = formatter.formatToParts(date);
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

function hasFreeTimeInWindow(
	windowStart: Date,
	windowEnd: Date,
	minimumFreeMinutes: number,
	busyIntervals: Array<{ start: Date; end: Date }>,
): boolean {
	const minimumFreeMilliseconds = minimumFreeMinutes * 60_000;
	let cursor = windowStart.getTime();

	for (const interval of busyIntervals) {
		const overlapStart = Math.max(interval.start.getTime(), windowStart.getTime());
		const overlapEnd = Math.min(interval.end.getTime(), windowEnd.getTime());

		if (overlapEnd <= overlapStart) continue;
		if (overlapStart - cursor >= minimumFreeMilliseconds) {
			return true;
		}

		cursor = Math.max(cursor, overlapEnd);
	}

	return windowEnd.getTime() - cursor >= minimumFreeMilliseconds;
}

export async function getMonthAvailability(
	monthValue: string,
): Promise<AvailabilitySnapshot> {
	const parsedMonth = parseIsoMonth(monthValue);
	const timeZone = getGoogleCalendarTimeZone();

	if (!parsedMonth) {
		return {
			configured: isGoogleCalendarAvailabilityConfigured(),
			timeZone,
			availableDates: [],
		};
	}

	if (!isGoogleCalendarAvailabilityConfigured()) {
		return {
			configured: false,
			timeZone,
			availableDates: [],
		};
	}

	const monthStartIso = `${parsedMonth.year}-${pad(parsedMonth.month)}-01`;
	const nextMonthYear =
		parsedMonth.month === 12 ? parsedMonth.year + 1 : parsedMonth.year;
	const nextMonthNumber = parsedMonth.month === 12 ? 1 : parsedMonth.month + 1;
	const nextMonthStartIso = `${nextMonthYear}-${pad(nextMonthNumber)}-01`;
	const monthStartUtc = zonedDateTimeToUtc(monthStartIso, 0, timeZone);
	const nextMonthStartUtc = zonedDateTimeToUtc(nextMonthStartIso, 0, timeZone);

	const busyIntervals = await fetchGoogleCalendarBusyIntervals(
		monthStartUtc.toISOString(),
		nextMonthStartUtc.toISOString(),
	);

	const weeklyHours = getWeeklyAvailabilityHours();
	const minimumFreeMinutes = getAppointmentDurationMinutes();
	const leadDateIso = addDaysToIsoDate(
		getCurrentIsoDateInTimeZone(timeZone),
		getAppointmentLeadDays(),
	);
	const maxDateIso = addDaysToIsoDate(
		getCurrentIsoDateInTimeZone(timeZone),
		getAppointmentMaxDaysAhead(),
	);

	const availableDates: string[] = [];
	const totalDaysInMonth = new Date(
		Date.UTC(parsedMonth.year, parsedMonth.month, 0),
	).getUTCDate();

	for (let day = 1; day <= totalDaysInMonth; day += 1) {
		const isoDate = toIsoDate(parsedMonth.year, parsedMonth.month, day);
		if (isoDate < leadDateIso || isoDate > maxDateIso) continue;

		const weekdayIndex = getWeekdayIndex(isoDate);
		const windows = weeklyHours[weekdayIndex] ?? [];
		if (windows.length === 0) continue;

		const isAvailable = windows.some(window => {
			const windowStart = zonedDateTimeToUtc(
				isoDate,
				window.startMinutes,
				timeZone,
			);
			const windowEnd = zonedDateTimeToUtc(isoDate, window.endMinutes, timeZone);

			return hasFreeTimeInWindow(
				windowStart,
				windowEnd,
				minimumFreeMinutes,
				busyIntervals,
			);
		});

		if (isAvailable) {
			availableDates.push(isoDate);
		}
	}

	return {
		configured: true,
		timeZone,
		availableDates,
	};
}

export async function isAppointmentDateAvailable(
	isoDate: string,
): Promise<boolean> {
	if (!isoDatePattern.test(isoDate)) return false;

	const [year, month] = isoDate.split("-");
	const monthAvailability = await getMonthAvailability(`${year}-${month}`);
	if (!monthAvailability.configured) return true;

	return monthAvailability.availableDates.includes(isoDate);
}
