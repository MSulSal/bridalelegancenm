import "server-only";

export type WeeklySlotRule = {
	id: string;
	startTime: string;
	durationMinutes: number;
	label?: string;
};

const defaultDurationMinutes = 75;

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

// The Monday/Tuesday/Wednesday/Friday pattern came from client notes and
// currently includes both 12:30 and 1:00. We preserve that exact list and
// keep the schedule centralized here so it can be refined quickly later.
export const weeklyAppointmentSlotRules: Record<number, WeeklySlotRule[]> = {
	0: [
		createRule("12:00", 75),
		createRule("13:30", 75),
	],
	1: [
		createRule("11:00", 75),
		createRule("12:30", 30),
		createRule("13:00", 75),
		createRule("14:30", 75),
	],
	2: [
		createRule("11:00", 75),
		createRule("12:30", 30),
		createRule("13:00", 75),
		createRule("14:30", 75),
	],
	3: [
		createRule("11:00", 75),
		createRule("12:30", 30),
		createRule("13:00", 75),
		createRule("14:30", 75),
	],
	4: [
		createRule("10:00", 75),
		createRule("11:30", 30),
	],
	5: [
		createRule("11:00", 75),
		createRule("12:30", 30),
		createRule("13:00", 75),
		createRule("14:30", 75),
	],
	6: [
		createRule("10:00", 75),
		createRule("11:30", 75),
		createRule("13:00", 80),
		createRule("14:20", 80),
	],
};
