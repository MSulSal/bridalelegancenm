import type { Metadata } from "next";
import { AppointmentRequestForm } from "@/components/appointments/appointment-request-form";
import { SiteShell } from "@/components/layout/site-shell";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
	title: "Book Appointment",
	description:
		"Request a bridal appointment with Bridal Elegance NM. Our team confirms availability by email or phone.",
};

const experiencePoints = [
	"One-on-one stylist support in a calm showroom setting.",
	"Curated pulls based on your date, style, and priorities.",
	"Clear next steps after your appointment request is reviewed.",
] as const;

const prepareList = [
	"Wedding date (or estimated timeline).",
	"Any inspiration photos or silhouettes you love.",
	"Preferred appointment days and times.",
	"How many guests you plan to bring.",
] as const;

export default function BookAppointmentPage() {
	return (
		<SiteShell>
			<section className="be-section pt-12 md:pt-20">
				<SectionHeading
					eyebrow="Book Appointment"
					title="Request Your Bridal Appointment"
					description="Phase 1: submit your request and our team confirms availability directly by email or phone."
				/>

				<div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
					<AppointmentRequestForm />

					<aside className="space-y-4">
						<article className="be-card p-6 sm:p-7">
							<p className="be-kicker">Showroom Experience</p>
							<h2 className="mt-3 text-3xl leading-tight">
								Personal, calm, and intentionally guided.
							</h2>
							<ul className="mt-5 grid gap-3">
								{experiencePoints.map(item => (
									<li
										key={item}
										className="text-sm leading-7 text-[color:var(--ink-700)]"
									>
										{item}
									</li>
								))}
							</ul>
						</article>

						<article className="be-card p-6 sm:p-7">
							<p className="be-kicker">Before You Submit</p>
							<h3 className="mt-3 text-2xl leading-tight">
								Bring These Details
							</h3>
							<ul className="mt-5 grid gap-3">
								{prepareList.map(item => (
									<li
										key={item}
										className="text-sm leading-7 text-[color:var(--ink-700)]"
									>
										{item}
									</li>
								))}
							</ul>
						</article>
					</aside>
				</div>
			</section>
		</SiteShell>
	);
}
