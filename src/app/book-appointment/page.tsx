import type { Metadata } from "next";
import { appointmentPageContent } from "@/content/site-content";
import { AppointmentRequestForm } from "@/components/appointments/appointment-request-form";
import { SiteShell } from "@/components/layout/site-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
	title: appointmentPageContent.metadata.title,
	description: appointmentPageContent.metadata.description,
};

const nextStepPoints = [
	"Choose payment method: card, Apple Pay, Google Pay, or PayPal.",
	"Weekend deposits are $50 and weekday deposits are $35.",
	"We review your requested date, timeline, size notes, and inspiration photos.",
	"We contact you by your preferred method to confirm final appointment time.",
	"If needed, we suggest the next closest available appointment window.",
] as const;

export default function BookAppointmentPage() {
	return (
		<SiteShell>
			<section className="be-section pt-12 md:pt-20">
				<SectionHeading
					eyebrow={appointmentPageContent.heading.eyebrow}
					title={appointmentPageContent.heading.title}
					description={appointmentPageContent.heading.description}
				/>

				<div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
					<AppointmentRequestForm />

					<aside className="space-y-4">
						<article className="be-card p-6 sm:p-7">
							<p className="be-kicker">
								{appointmentPageContent.experienceCard.kicker}
							</p>
							<h2 className="mt-3 text-3xl leading-tight">
								{appointmentPageContent.experienceCard.title}
							</h2>
							<ul className="mt-5 grid gap-3">
								{appointmentPageContent.experienceCard.points.map(
									item => (
										<li
											key={item}
											className="text-sm leading-7 text-[color:var(--ink-700)]"
										>
											{item}
										</li>
									),
								)}
							</ul>
						</article>

						<article className="be-card p-6 sm:p-7">
							<p className="be-kicker">Location</p>
							<h3 className="mt-3 text-2xl leading-tight">
								Visit Us In Albuquerque's Sawmill District
							</h3>
							<p className="mt-5 text-sm leading-7 text-[color:var(--ink-700)]">
								{siteConfig.addressLine1}
								<br />
								{siteConfig.addressLine2}
							</p>
							<p className="mt-3 text-xs uppercase tracking-[0.14em] text-[color:var(--ink-500)]">
								Near Historic Old Town Albuquerque
							</p>
							<div className="mt-5 overflow-hidden border border-[color:var(--line-subtle)] bg-white">
								<iframe
									title="Bridal Elegance location map"
									src={siteConfig.mapsEmbedSrc}
									width="100%"
									height="260"
									loading="lazy"
									referrerPolicy="no-referrer-when-downgrade"
									className="block w-full"
								/>
							</div>
							<a
								href={siteConfig.mapsHref}
								target="_blank"
								rel="noreferrer"
								className="mt-4 inline-block text-xs uppercase tracking-[0.14em] text-[color:var(--ink-900)]"
							>
								Open In Google Maps
							</a>
						</article>

						<article className="be-card p-6 sm:p-7">
							<p className="be-kicker">After You Submit</p>
							<h3 className="mt-3 text-2xl leading-tight">
								We confirm directly with you.
							</h3>
							<ul className="mt-5 grid gap-3">
								{nextStepPoints.map(item => (
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
