import type { ReactNode } from "react";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

type SiteShellProps = {
	children: ReactNode;
};

export function SiteShell({ children }: SiteShellProps) {
	return (
		<div className="flex min-h-screen flex-col bg-stone-50 text-stone-900">
			<SiteHeader />
			<main
				id="main-content"
				className="mx-auto w-full max-w-6xl flex-1 px-6 py-16 sm:px-10"
			>
				{children}
			</main>
			<SiteFooter />
		</div>
	);
}
