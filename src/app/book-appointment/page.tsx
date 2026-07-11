import type { Metadata } from "next";
import { appointmentPageContent } from "@/content/site-content";
import { AppointmentRequestForm } from "@/components/appointments/appointment-request-form";
import { CalcomEmbed } from "@/components/appointments/calcom-embed";
import { SiteShell } from "@/components/layout/site-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
	title: appointmentPageContent.metadata.title,
	description: appointmentPageContent.metadata.description,
};

function normalizeCalcomLink(rawValue: string): string {
	if (!rawValue) return "";

	try {
		const parsed = new URL(rawValue);
		return parsed.pathname.replace(/^\/+/, "");
	} catch {
		return rawValue.replace(/^\/+/, "");
	}
}

function deriveCalcomNamespace(calLink: string): string {
	const segments = calLink.split("/").filter(Boolean);
	return segments.at(-1) ?? "";
}

export default function BookAppointmentPage() {
	const calcomLink = normalizeCalcomLink(
		process.env.NEXT_PUBLIC_CALCOM_LINK?.trim() ??
			process.env.NEXT_PUBLIC_CALCOM_EMBED_URL?.trim() ??
			"",
	);
	const calcomNamespace =
		process.env.NEXT_PUBLIC_CALCOM_NAMESPACE?.trim() ??
		deriveCalcomNamespace(calcomLink);
	const hasCalcomEmbed =
		calcomNamespace.length > 0 && calcomLink.length > 0;
	const nextStepPoints = hasCalcomEmbed
		? [
				"Submit your bridal details in the intake form so the boutique keeps the extra notes, sizing, budget, and inspiration fields that matter.",
				"Choose from the live appointment dates and times the boutique makes available in Cal.com.",
				"The boutique can adjust availability, buffers, and blackout dates directly in Cal.com without a custom backend.",
				"For now, bridal appointments may include up to 4 guests.",
			]
		: [
				"Choose your preferred appointment day and share your wedding timeline.",
				"Upload at least one bridal inspiration image in a single upload field.",
				"We review your size notes, guest count, and style direction before reaching out.",
				"We contact you directly to confirm an available appointment time.",
				"For now, bridal appointments may include up to 4 guests.",
			];

	return (
		<SiteShell>
			<section className="be-section pt-12 md:pt-20">
				<SectionHeading
					eyebrow={appointmentPageContent.heading.eyebrow}
					title={appointmentPageContent.heading.title}
					description={appointmentPageContent.heading.description}
				/>

				<div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
					<div className="space-y-6">
						<AppointmentRequestForm />

						{hasCalcomEmbed ? (
							<article className="be-card overflow-hidden bg-white">
								<div className="border-b border-[color:var(--line-subtle)] px-6 py-6 sm:px-7">
									<p className="be-kicker">Step 2: Live Appointment Calendar</p>
									<h2 className="mt-2 text-2xl leading-tight">
										Choose an available appointment time.
									</h2>
									<p className="mt-3 text-sm leading-7 text-[color:var(--ink-700)]">
										Your detailed intake stays with Bridal Elegance here, and the scheduler only handles the live date and time selection.
									</p>
								</div>
								<div className="bg-white p-2 sm:p-3">
									<div className="min-h-[980px] rounded-[2px] border border-[color:var(--line-subtle)] bg-white">
										<CalcomEmbed
											namespace={calcomNamespace}
											calLink={calcomLink}
										/>
									</div>
								</div>
							</article>
						) : null}
					</div>

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
								Visit Us In Albuquerque
							</h3>
							<p className="mt-5 text-sm leading-7 text-[color:var(--ink-700)]">
								{siteConfig.addressLine1}
								<br />
								{siteConfig.addressLine2}
							</p>
							<p className="mt-3 text-xs uppercase tracking-[0.14em] text-[color:var(--ink-500)]">
								North of Sawmill District and Old Town
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
							<p className="be-kicker">
								{hasCalcomEmbed ? "How Scheduling Works" : "After You Submit"}
							</p>
							<h3 className="mt-3 text-2xl leading-tight">
								{hasCalcomEmbed
									? "The boutique controls availability directly."
									: "We confirm directly with you."}
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
