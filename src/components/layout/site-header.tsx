import { siteConfig } from "@/lib/site";

export function SiteHeader() {
	return (
		<header className="border-b border-stone-200 bg-white/90 backdrop-blur">
			<div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 sm:px-10">
				<div className="flex flex-col">
					<span className="text-xs uppercase tracking-[0.22em] text-stone-500">
						{siteConfig.cityState}
					</span>
					<span className="text-lg font-semibold text-stone-900">
						{siteConfig.name}
					</span>
				</div>

				<button
					type="button"
					className="rounded-full border border-stone-300 px-4 py-2 text-xs uppercase tracking-[0.15em] text-stone-700"
					aria-label={siteConfig.appointmentLabel}
				>
					{siteConfig.appointmentLabel}
				</button>
			</div>
		</header>
	);
}
