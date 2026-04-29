export function getDepositAmountCents(preferredDateIso: string): number {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(preferredDateIso)) {
		return 3500;
	}

	const [yearRaw, monthRaw, dayRaw] = preferredDateIso.split("-");
	const year = Number(yearRaw);
	const month = Number(monthRaw);
	const day = Number(dayRaw);

	if (
		!Number.isInteger(year) ||
		!Number.isInteger(month) ||
		!Number.isInteger(day)
	) {
		return 3500;
	}

	const parsed = new Date(year, month - 1, day);
	if (
		parsed.getFullYear() !== year ||
		parsed.getMonth() !== month - 1 ||
		parsed.getDate() !== day
	) {
		return 3500;
	}

	const dayOfWeek = parsed.getDay();
	const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
	return isWeekend ? 5000 : 3500;
}

export function formatUsdFromCents(amountCents: number): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	}).format(amountCents / 100);
}
