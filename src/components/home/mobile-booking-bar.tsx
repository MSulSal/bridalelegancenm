import { siteConfig } from "@/lib/site";

export function MobileBookingBar() {
	return (
		<div className="be-mobile-booking-bar md:hidden">
			<div className="be-container">
				<div className="be-mobile-booking-inner">
					<p className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--ink-500)]">
						Bridal Appointment
					</p>
					<a
						href={siteConfig.appointmentHref}
						className="be-btn be-btn-primary w-full"
					>
						{siteConfig.appointmentLabel}
					</a>
				</div>
			</div>
		</div>
	);
}
