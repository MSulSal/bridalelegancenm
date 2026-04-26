import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

const navItems = [
	{ href: "/#collections-preview", label: "Collections" },
	{ href: "/#spotlights-preview", label: "Spotlights" },
	{ href: "/#about-preview", label: "About" },
] as const;

export function SiteHeader() {
	return (
		<header className="be-topbar">
			<div className="be-container be-topbar-inner">
				<div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
					<nav className="hidden items-center gap-7 xl:flex">
						{navItems.map(item => (
							<Link
								key={item.href}
								href={item.href}
								className="be-nav-link"
							>
								{item.label}
							</Link>
						))}
					</nav>

					<Link
						href="/"
						className="be-logo-medallion justify-self-center inline-flex items-center justify-center"
					>
						<Image
							src="/logo-text-v2.png"
							alt={siteConfig.name}
							width={220}
							height={56}
							priority
							className="h-auto w-[136px] sm:w-[172px] lg:w-[210px]"
						/>
					</Link>

					<div className="flex items-center justify-end gap-2">
						<a
							href={siteConfig.appointmentHref}
							className="be-btn be-btn-primary hidden shrink-0 xl:inline-flex"
						>
							{siteConfig.appointmentLabel}
						</a>

						<details className="be-menu xl:hidden">
							<summary
								className="be-menu-trigger"
								aria-label="Open menu"
							>
								<span>Menu</span>
								<svg
									aria-hidden="true"
									viewBox="0 0 24 24"
									className="h-4 w-4"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.5"
								>
									<path d="M4 7h16M4 12h16M4 17h16" />
								</svg>
							</summary>

							<div className="be-menu-panel">
								<ul className="grid gap-3">
									{navItems.map(item => (
										<li key={item.href}>
											<Link
												href={item.href}
												className="be-nav-link"
											>
												{item.label}
											</Link>
										</li>
									))}
								</ul>

								<a
									href={siteConfig.appointmentHref}
									className="be-btn be-btn-primary mt-5 w-full"
								>
									{siteConfig.appointmentLabel}
								</a>
							</div>
						</details>
					</div>
				</div>
			</div>
		</header>
	);
}
