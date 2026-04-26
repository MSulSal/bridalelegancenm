import { siteConfig } from "@/lib/site";

export function SiteFooter() {
	return (
		<footer className="border-t border-stone-200 bg-white">
			<div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-stone-600 sm:px-10">
				<p className="font-medium text-stone-800">{siteConfig.name}</p>
				<p>Editorial bridal experience in {siteConfig.cityState}.</p>
			</div>
		</footer>
	);
}
