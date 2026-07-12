import { type NextRequest, NextResponse } from "next/server";
import { getMonthAvailability } from "@/lib/appointment-availability";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
	const month = request.nextUrl.searchParams.get("month")?.trim() ?? "";

	try {
		const availability = await getMonthAvailability(month);
		return NextResponse.json({
			ok: true,
			...availability,
		});
	} catch (error) {
		console.error("[appointment-availability] Google Calendar lookup failed", error);
		return NextResponse.json(
			{
				ok: false,
				configured: false,
				availableDates: [],
				message:
					"We couldn't load live appointment availability right now.",
			},
			{ status: 502 },
		);
	}
}
