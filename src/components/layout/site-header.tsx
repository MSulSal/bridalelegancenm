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
				<div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 lg:hidden">
					<span
						aria-hidden="true"
						className="be-menu-slot justify-self-start"
					/>

					<Link
						href="/"
						aria-label={siteConfig.name}
						className="be-logo-medallion be-logo-medallion-mobile justify-self-center inline-flex items-center justify-center"
					>
						<Image
							src="/logo-text-v2.png"
							alt={siteConfig.name}
							width={280}
							height={72}
							priority
							className="h-auto w-[168px] sm:w-[186px]"
						/>
					</Link>

					<details className="be-menu justify-self-end">
						<summary
							className="be-menu-trigger"
							aria-label="Open menu"
						>
							<span className="sr-only">Open menu</span>
							<svg
								aria-hidden="true"
								viewBox="0 0 24 24"
								className="be-menu-icon"
								fill="none"
								stroke="currentColor"
							>
								<path d="M4 7h16M4 12h16M4 17h16" />
							</svg>
						</summary>

						<div className="be-menu-panel">
							<div className="be-container">
								<nav aria-label="Mobile">
									<ul className="be-menu-list">
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
								</nav>
							</div>
						</div>
					</details>
				</div>

				<div className="hidden grid-cols-[1fr_auto_1fr] items-center gap-6 lg:grid">
					<nav className="flex items-center gap-7">
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
						aria-label={siteConfig.name}
						className="be-logo-medallion justify-self-center inline-flex items-center justify-center"
					>
						<Image
							src="/logo-text-v2.png"
							alt={siteConfig.name}
							width={340}
							height={92}
							priority
							className="h-auto w-[236px] xl:w-[260px]"
						/>
					</Link>

					<div className="flex items-center justify-end">
						<a
							href={siteConfig.appointmentHref}
							className="be-btn be-btn-primary shrink-0"
						>
							{siteConfig.appointmentLabel}
						</a>
					</div>
				</div>
			</div>
		</header>
	);
}
