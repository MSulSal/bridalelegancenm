import "server-only";

export type WeeklySlotRule = {
	id: string;
	startTime: string;
	durationMinutes: number;
	label?: string;
};

const defaultDurationMinutes = 30;

function createRule(
	startTime: string,
	durationMinutes = defaultDurationMinutes,
	label?: string,
): WeeklySlotRule {
	return {
		id: startTime,
		startTime,
		durationMinutes,
		label,
	};
}

// Slot start times come from client notes. Each slot is treated as a
// 30-minute bookable unit so matching calendar events can block it reliably.
export const weeklyAppointmentSlotRules: Record<number, WeeklySlotRule[]> = {
	0: [
		createRule("12:00"),
		createRule("13:30"),
	],
	1: [
		createRule("11:00"),
		createRule("12:30"),
		createRule("13:00"),
		createRule("14:30"),
	],
	2: [
		createRule("11:00"),
		createRule("12:30"),
		createRule("13:00"),
		createRule("14:30"),
	],
	3: [
		createRule("11:00"),
		createRule("12:30"),
		createRule("13:00"),
		createRule("14:30"),
	],
	4: [
		createRule("10:00"),
		createRule("11:30"),
	],
	5: [
		createRule("11:00"),
		createRule("12:30"),
		createRule("13:00"),
		createRule("14:30"),
	],
	6: [
		createRule("10:00"),
		createRule("11:30"),
		createRule("13:00"),
		createRule("14:20"),
	],
};
