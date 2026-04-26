import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

const navItems = [
	{ href: "#collections-preview", label: "Collections" },
	{ href: "#spotlights-preview", label: "Spotlights" },
	{ href: "#about-preview", label: "About" },
	{ href: "#appointment-intent", label: "Appointments" },
] as const;

export function SiteHeader() {
	return (
		<header className="be-topbar">
			<div className="be-container flex items-center justify-between">
				<Link href="/" className="inline-flex items-center">
					<Image
						src="/logo-text-v2.png"
						alt={siteConfig.name}
						width={220}
						height={56}
						priority
						className="h-auto w-[150px] sm:w-[150px]"
					/>
				</Link>

				<nav className="hidden items-center gap-6 lg:flex">
					{navItems.map(item => (
						<a
							key={item.href}
							href={item.href}
							className="be-nav-link"
						>
							{item.label}
						</a>
					))}
				</nav>

				<a
					href={siteConfig.appointmentAnchor}
					className="be-btn be-btn-primary shrink-0"
				>
					{siteConfig.appointmentLabel}
				</a>
			</div>
		</header>
	);
}
