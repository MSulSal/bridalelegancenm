import { SiteShell } from "@/components/layout/site-shell";

const shellMilestones = [
	"Design tokens and typography foundation",
	"Responsive navigation and footer links",
	"Editorial homepage sections with strong appointment CTAs",
] as const;

export default function HomePage() {
	return (
		<SiteShell>
			<section className="flex flex-col gap-6">
				<p className="text-xs uppercase tracking-[0.22em] text-stone-500">
					Bridal Elegance NM
				</p>

				<h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
					Premium Bridal Experience Website In Progress
				</h1>

				<p className="max-w-2xl text-base leading-7 text-stone-700">
					This shell establishes shared structure for every page so we
					can build a memorable, high-conversion boutique experience
					commit by commit.
				</p>
			</section>

			<section className="mt-12 grid gap-4 sm:grid-cols-3">
				{shellMilestones.map(item => (
					<article
						key={item}
						className="rounded-2xl border border-stone-200 bg-white p-5 text-sm text-stone-700"
					>
						{item}
					</article>
				))}
			</section>
		</SiteShell>
	);
}
