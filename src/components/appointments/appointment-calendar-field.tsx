"use client";

import { useEffect, useMemo, useState } from "react";

type AppointmentCalendarFieldProps = {
	id: string;
	name: string;
	label: string;
	value: string;
	onChange: (nextValue: string) => void;
	required?: boolean;
};

type CalendarCell = {
	date: Date;
	iso: string;
	dayNumber: number;
	inMonth: boolean;
	isDisabled: boolean;
};

type AvailabilityResponse = {
	ok?: boolean;
	configured?: boolean;
	availableDates?: string[];
	message?: string;
	timeZone?: string;
};

const weekdayLabels = [
	"Sun",
	"Mon",
	"Tue",
	"Wed",
	"Thu",
	"Fri",
	"Sat",
] as const;

const monthLabelFormatter = new Intl.DateTimeFormat("en-US", {
	month: "long",
	year: "numeric",
});

const selectedDateFormatter = new Intl.DateTimeFormat("en-US", {
	weekday: "short",
	month: "short",
	day: "numeric",
	year: "numeric",
});

function pad(value: number): string {
	return String(value).padStart(2, "0");
}

function toIsoDate(date: Date): string {
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseIsoDate(value: string): Date | null {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
	const [yearRaw, monthRaw, dayRaw] = value.split("-");
	const year = Number(yearRaw);
	const month = Number(monthRaw);
	const day = Number(dayRaw);

	if (
		!Number.isInteger(year) ||
		!Number.isInteger(month) ||
		!Number.isInteger(day)
	) {
		return null;
	}

	const parsed = new Date(year, month - 1, day);
	if (
		parsed.getFullYear() !== year ||
		parsed.getMonth() !== month - 1 ||
		parsed.getDate() !== day
	) {
		return null;
	}

	return parsed;
}

function startOfDay(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, delta: number): Date {
	return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function toIsoMonth(date: Date): string {
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

function buildCalendarCells(
	monthDate: Date,
	minDate: Date,
	availableDates: Set<string>,
	hasLiveAvailability: boolean,
): CalendarCell[] {
	const monthStart = startOfMonth(monthDate);
	const firstVisible = new Date(monthStart);
	firstVisible.setDate(1 - monthStart.getDay());

	const cells: CalendarCell[] = [];

	for (let offset = 0; offset < 42; offset += 1) {
		const date = new Date(firstVisible);
		date.setDate(firstVisible.getDate() + offset);

		const normalized = startOfDay(date);
		cells.push({
			date: normalized,
			iso: toIsoDate(normalized),
			dayNumber: normalized.getDate(),
			inMonth: normalized.getMonth() === monthStart.getMonth(),
			isDisabled:
				normalized.getTime() < minDate.getTime() ||
				normalized.getMonth() !== monthStart.getMonth() ||
				(hasLiveAvailability &&
					!availableDates.has(toIsoDate(normalized))),
		});
	}

	return cells;
}

export function AppointmentCalendarField({
	id,
	name,
	label,
	value,
	onChange,
	required = false,
}: AppointmentCalendarFieldProps) {
	const today = useMemo(() => startOfDay(new Date()), []);
	const selectedDate = useMemo(() => parseIsoDate(value), [value]);
	const [availableDates, setAvailableDates] = useState<string[]>([]);
	const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
	const [availabilityError, setAvailabilityError] = useState("");
	const [hasLiveAvailability, setHasLiveAvailability] = useState(false);

	const [visibleMonth, setVisibleMonth] = useState<Date>(() => {
		const parsed = parseIsoDate(value);
		return startOfMonth(parsed ?? today);
	});
	const visibleMonthKey = useMemo(() => toIsoMonth(visibleMonth), [visibleMonth]);
	const availableDateSet = useMemo(
		() => new Set(availableDates),
		[availableDates],
	);

	useEffect(() => {
		const controller = new AbortController();

		async function loadAvailability() {
			setIsLoadingAvailability(true);
			setAvailabilityError("");

			try {
				const response = await fetch(
					`/api/appointment-availability?month=${visibleMonthKey}`,
					{
						signal: controller.signal,
					},
				);
				const json = (await response.json()) as AvailabilityResponse;

				if (controller.signal.aborted) return;

				setHasLiveAvailability(Boolean(json.configured));
				setAvailableDates(json.availableDates ?? []);
				if (!response.ok || json.ok === false) {
					setAvailabilityError(
						json.message ??
							"We couldn't load live availability for this month.",
					);
				}
			} catch (error) {
				if (controller.signal.aborted) return;
				setHasLiveAvailability(false);
				setAvailableDates([]);
				setAvailabilityError(
					error instanceof Error
						? error.message
						: "We couldn't load live availability for this month.",
				);
			} finally {
				if (!controller.signal.aborted) {
					setIsLoadingAvailability(false);
				}
			}
		}

		void loadAvailability();

		return () => controller.abort();
	}, [visibleMonthKey]);

	const calendarCells = useMemo(
		() =>
			buildCalendarCells(
				visibleMonth,
				today,
				availableDateSet,
				hasLiveAvailability,
			),
		[availableDateSet, hasLiveAvailability, visibleMonth, today],
	);

	const monthLabel = monthLabelFormatter.format(visibleMonth);

	return (
		<div>
			<label
				htmlFor={id}
				className="text-xs uppercase tracking-[0.14em] text-[color:var(--ink-500)]"
			>
				{label}
				{required ? " *" : ""}
			</label>

			<input id={id} name={name} type="hidden" value={value} />

			<div className="mt-2 flex items-center justify-between border border-[color:var(--line-subtle)] bg-[color:var(--surface-elevated)] px-3 py-2">
				<button
					type="button"
					onClick={() =>
						setVisibleMonth(current => addMonths(current, -1))
					}
					className="inline-flex h-8 w-8 items-center justify-center border border-[color:var(--line-subtle)] text-sm text-[color:var(--ink-700)] transition hover:border-[color:var(--ink-900)] hover:text-[color:var(--ink-900)]"
					aria-label="View previous month"
				>
					&#8592;
				</button>

				<p className="text-sm font-medium text-[color:var(--ink-900)]">
					{monthLabel}
				</p>

				<button
					type="button"
					onClick={() =>
						setVisibleMonth(current => addMonths(current, 1))
					}
					className="inline-flex h-8 w-8 items-center justify-center border border-[color:var(--line-subtle)] text-sm text-[color:var(--ink-700)] transition hover:border-[color:var(--ink-900)] hover:text-[color:var(--ink-900)]"
					aria-label="View next month"
				>
					&#8594;
				</button>
			</div>

			<div className="mt-2 grid grid-cols-7 gap-1 text-center text-[11px] uppercase tracking-[0.08em] text-[color:var(--ink-500)]">
				{weekdayLabels.map(day => (
					<div key={day}>{day}</div>
				))}
			</div>

			<div
				className="mt-1 grid grid-cols-7 gap-1"
				role="grid"
				aria-label={`Appointment date calendar for ${monthLabel}`}
			>
				{calendarCells.map(cell => {
					const isSelected = cell.iso === value;
					const baseClass =
						"inline-flex h-10 w-10 items-center justify-center text-sm transition";
					const stateClass = cell.isDisabled
						? "cursor-not-allowed border border-transparent text-[color:var(--ink-500)] opacity-35"
						: isSelected
							? "border border-[color:var(--color-gold)] bg-[color:var(--accent-500)] text-white"
							: cell.inMonth
								? "border border-[color:var(--line-subtle)] text-[color:var(--ink-900)] hover:border-[color:var(--ink-900)]"
								: "border border-transparent text-[color:var(--ink-500)] opacity-65 hover:border-[color:var(--line-subtle)]";

					return (
						<button
							key={cell.iso}
							type="button"
							onClick={() => {
								if (!cell.isDisabled) {
									onChange(cell.iso);
								}
							}}
							disabled={cell.isDisabled}
							aria-pressed={isSelected}
							className={`${baseClass} ${stateClass}`}
						>
							{cell.dayNumber}
						</button>
					);
				})}
			</div>

			<p className="mt-2 text-xs uppercase tracking-[0.12em] text-[color:var(--ink-500)]">
				{selectedDate
					? `Selected: ${selectedDateFormatter.format(selectedDate)}`
					: "No appointment date selected yet."}
			</p>

			<p className="mt-2 text-[11px] uppercase tracking-[0.1em] text-[color:var(--ink-500)]">
				{isLoadingAvailability
					? "Checking available appointment dates..."
					: hasLiveAvailability
						? "Only dates that are currently available can be selected."
						: "Available appointment dates will appear here shortly."}
			</p>

			{availabilityError ? (
				<p className="mt-2 text-xs uppercase tracking-[0.12em] text-[color:#8a5a2b]">
					{availabilityError}
				</p>
			) : null}
		</div>
	);
}
