import type { Metadata } from "next";
import Image from "next/image";
import { BrandText } from "@/components/brand/brand-text";
import { SiteShell } from "@/components/layout/site-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { motherOfBridePageContent } from "@/content/site-content";

export const metadata: Metadata = {
	title: motherOfBridePageContent.metadata.title,
	description: motherOfBridePageContent.metadata.description,
};

export default function MotherOfTheBridePage() {
	return (
		<SiteShell>
			<section className="be-section pt-12 md:pt-20">
				<SectionHeading
					eyebrow={motherOfBridePageContent.heading.eyebrow}
					title={motherOfBridePageContent.heading.title}
					description={motherOfBridePageContent.heading.description}
				/>

				<div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
					<article className="be-card overflow-hidden">
						<div className="border-b border-[color:var(--line-subtle)]">
							<Image
								src={motherOfBridePageContent.previewImage.localPath}
								alt={motherOfBridePageContent.previewImage.alt}
								width={1200}
								height={1600}
								sizes="(min-width: 1024px) 52vw, 100vw"
								className="block h-auto w-full"
							/>
						</div>
						<div className="p-6 sm:p-8">
							<p className="text-sm leading-7 text-[color:var(--ink-700)]">
								{motherOfBridePageContent.summary}
							</p>
							<ul className="mt-6 grid gap-3">
								{motherOfBridePageContent.featurePoints.map(point => (
									<li
										key={point}
										className="text-sm leading-7 text-[color:var(--ink-700)]"
									>
										{point}
									</li>
								))}
							</ul>
						</div>
					</article>

					<aside className="space-y-4">
						<article className="be-card p-6 sm:p-7">
							<p className="be-kicker">Designer Source</p>
							<h2 className="mt-3 text-2xl leading-tight">
								{motherOfBridePageContent.externalCollection.label}
							</h2>
							<p className="mt-4 text-sm leading-7 text-[color:var(--ink-700)]">
								Browse source styles directly while keeping your appointment-based boutique guidance with{" "}
								<BrandText
									nm="Bridal Elegance NM"
									atelier="Bridal Elegance Atelier"
								/>
								.
							</p>
							<a
								href={motherOfBridePageContent.externalCollection.href}
								target="_blank"
								rel="noreferrer"
								className="mt-6 inline-flex be-btn be-btn-ghost"
							>
								View Source Collection
							</a>
						</article>
					</aside>
				</div>
			</section>
		</SiteShell>
	);
}
