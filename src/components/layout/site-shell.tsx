import type { ReactNode } from "react";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

type SiteShellProps = {
	children: ReactNode;
};

export function SiteShell({ children }: SiteShellProps) {
	return (
		<div className="min-h-screen text-[color:var(--ink-900)]">
			<a
				href="#main-content"
				className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm"
			>
				Skip to content
			</a>
			<SiteHeader />
			<main id="main-content" className="be-container pb-16">
				{children}
			</main>
			<SiteFooter />
		</div>
	);
}
