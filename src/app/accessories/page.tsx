import type { Metadata } from "next";
import Image from "next/image";
import { SiteShell } from "@/components/layout/site-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { accessoriesPageContent } from "@/content/site-content";

export const metadata: Metadata = {
	title: accessoriesPageContent.metadata.title,
	description: accessoriesPageContent.metadata.description,
};

export default function AccessoriesPage() {
	return (
		<SiteShell>
			<section className="be-section pt-12 md:pt-20">
				<SectionHeading
					eyebrow={accessoriesPageContent.heading.eyebrow}
					title={accessoriesPageContent.heading.title}
					description={accessoriesPageContent.heading.description}
				/>

				<div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
					<article className="be-card overflow-hidden">
						<div className="border-b border-[color:var(--line-subtle)]">
							<Image
								src={accessoriesPageContent.previewImage.localPath}
								alt={accessoriesPageContent.previewImage.alt}
								width={1200}
								height={1600}
								sizes="(min-width: 1024px) 52vw, 100vw"
								className="block h-auto w-full"
							/>
						</div>
						<div className="p-6 sm:p-8">
							<p className="text-sm leading-7 text-[color:var(--ink-700)]">
								{accessoriesPageContent.summary}
							</p>
							<ul className="mt-6 grid gap-3">
								{accessoriesPageContent.featurePoints.map(point => (
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
								{accessoriesPageContent.externalCollection.label}
							</h2>
							<p className="mt-4 text-sm leading-7 text-[color:var(--ink-700)]">
								Explore source accessory styles directly while finalizing your complete look through in-boutique appointment guidance.
							</p>
							<a
								href={accessoriesPageContent.externalCollection.href}
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