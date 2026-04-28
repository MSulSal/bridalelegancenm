"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useMobileHeaderVisibility } from "@/hooks/use-mobile-header-visibility";
import {
	defaultTheme,
	readTheme,
	subscribeTheme,
	type ThemeId,
} from "@/lib/theme";
import { siteConfig } from "@/lib/site";
import styles from "./site-header.module.css";

const navItems = [
	{ href: "/", label: "Home" },
	{ href: "/collections", label: "Collections" },
	{ href: "/mother-of-the-bride", label: "Mother of the Bride" },
	{ href: "/accessories", label: "Accessories" },
	{ href: "/#about-preview", label: "About" },
] as const;

const logoByTheme: Record<ThemeId, string> = {
	blue: "/logo-text-v5.png",
	blush: "/logo-text-v4.png",
	turquoise: "/logo-text-v3.png",
	sapphire: "/logo-text-v3.png",
	sand: "/logo-text-v3.png",
	"red-rock": "/logo-text-v3.png",
	brown: "/logo-text-v3.png",
	lilac: "/logo-text-v3.png",
	lavender: "/logo-text-v3.png",
	monochrome: "/logo-text-v3.png",
};

function getServerThemeSnapshot(): ThemeId {
	return defaultTheme;
}

export function SiteHeader() {
	const headerRef = useRef<HTMLElement>(null);
	const mobileMenuRef = useRef<HTMLDetailsElement>(null);
	const hideMobileHeader = useMobileHeaderVisibility(mobileMenuRef);

	const activeTheme = useSyncExternalStore(
		subscribeTheme,
		readTheme,
		getServerThemeSnapshot,
	);

	const monochromeBadgeStyle: CSSProperties | undefined =
		activeTheme === "monochrome" ? { borderColor: "#111111" } : undefined;

	useEffect(() => {
		const headerEl = headerRef.current;
		if (!headerEl) return;

		const setHeaderHeightVar = () => {
			document.documentElement.style.setProperty(
				"--site-header-height",
				`${headerEl.offsetHeight}px`,
			);
		};

		setHeaderHeightVar();
		const observer = new ResizeObserver(setHeaderHeightVar);
		observer.observe(headerEl);
		window.addEventListener("resize", setHeaderHeightVar, { passive: true });

		return () => {
			observer.disconnect();
			window.removeEventListener("resize", setHeaderHeightVar);
		};
	}, []);

	return (
		<header
			ref={headerRef}
			className={`${styles.topbar} ${hideMobileHeader ? styles.topbarMobileHidden : ""}`}
		>
			<div className={styles.topbarInner}>
				<div className={styles.mobileRow}>
					<div className={styles.mobileLeft}>
						<ThemeToggle align="left" size="compact" />
					</div>

					<div className={styles.logoClipMobile}>
						<Link
							href="/"
							aria-label={siteConfig.name}
							className={`${styles.logoMedallion} ${styles.logoBadgeMobile}`}
							style={monochromeBadgeStyle}
						>
							<Image
								src={logoByTheme[activeTheme]}
								alt={siteConfig.name}
								width={280}
								height={72}
								priority
								className={`${styles.logoImage} ${styles.logoImageMobile}`}
							/>
						</Link>
					</div>

					<details
						ref={mobileMenuRef}
						className={`${styles.menu} ${styles.mobileRight}`}
					>
						<summary
							className={styles.menuTrigger}
							style={{ color: "var(--theme-toggle-circle)" }}
							aria-label="Open menu"
						>
							<span className="sr-only">Open menu</span>
							<svg
								aria-hidden="true"
								viewBox="0 0 24 24"
								className="h-7 w-7"
								fill="none"
								stroke="currentColor"
								strokeWidth="2.1"
							>
								<path d="M4 7h16M4 12h16M4 17h16" />
							</svg>
						</summary>

						<div className={styles.menuPanel}>
							<div className="be-container">
								<nav aria-label="Mobile">
									<ul className={styles.menuList}>
										<li
											className={
												styles.mobileInstagramItem
											}
										>
											<a
												href={siteConfig.instagramHref}
												target="_blank"
												rel="noreferrer"
												className={
													styles.mobileInstagramLink
												}
											>
												<svg
													aria-hidden="true"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="1.8"
												>
													<rect
														x="3"
														y="3"
														width="18"
														height="18"
														rx="5"
													/>
													<circle
														cx="12"
														cy="12"
														r="4.25"
													/>
													<circle
														cx="17.5"
														cy="6.5"
														r="1"
													/>
												</svg>
												<span>Instagram</span>
											</a>
										</li>

										{navItems.map(item => (
											<li key={item.href}>
												<Link
													href={item.href}
													className={styles.navLink}
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

				<div className={styles.desktopRow}>
					<nav
						className={styles.leftRail}
						aria-label="Desktop primary"
					>
						{navItems.map(item => (
							<Link
								key={item.href}
								href={item.href}
								className={styles.navLink}
							>
								{item.label}
							</Link>
						))}
					</nav>

					<div className={styles.logoClipDesktop}>
						<Link
							href="/"
							aria-label={siteConfig.name}
							className={`${styles.logoMedallion} ${styles.logoBadgeDesktop}`}
							style={monochromeBadgeStyle}
						>
							<Image
								src={logoByTheme[activeTheme]}
								alt={siteConfig.name}
								width={340}
								height={92}
								priority
								className={`${styles.logoImage} ${styles.logoImageDesktop}`}
							/>
						</Link>
					</div>

					<div className={styles.rightRail}>
						<ThemeToggle align="right" />
						<a
							href={siteConfig.instagramHref}
							target="_blank"
							rel="noreferrer"
							aria-label="Visit us on Instagram (opens in new tab)"
							className={styles.instagramIconLink}
						>
							<svg
								aria-hidden="true"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.8"
							>
								<rect
									x="3"
									y="3"
									width="18"
									height="18"
									rx="5"
								/>
								<circle cx="12" cy="12" r="4.25" />
								<circle cx="17.5" cy="6.5" r="1" />
							</svg>
						</a>
						<a
							href={siteConfig.appointmentHref}
							className={`be-btn be-btn-primary ${styles.topbarCta} shrink-0`}
						>
							{siteConfig.appointmentLabel}
						</a>
					</div>
				</div>
			</div>
		</header>
	);
}
