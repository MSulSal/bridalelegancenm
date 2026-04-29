"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import {
	useCallback,
	useEffect,
	useRef,
	useState,
	useSyncExternalStore,
} from "react";
import { BrandToggle } from "@/components/brand/brand-toggle";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useMobileHeaderVisibility } from "@/hooks/use-mobile-header-visibility";
import {
	defaultBrand,
	readBrand,
	subscribeBrand,
	type BrandId,
} from "@/lib/brand";
import { defaultTheme, readTheme, subscribeTheme, type ThemeId } from "@/lib/theme";
import { siteConfig } from "@/lib/site";
import styles from "./site-header.module.css";

const navItems = [
	{ href: "/", label: "Home" },
	{ href: "/collections", label: "Collections" },
	{ href: "/mother-of-the-bride", label: "Mother of the Bride" },
	{ href: "/accessories", label: "Accessories" },
	{ href: "/#about-preview", label: "About" },
] as const;

function getServerThemeSnapshot(): ThemeId {
	return defaultTheme;
}

function getServerBrandSnapshot(): BrandId {
	return defaultBrand;
}

export function SiteHeader() {
	const headerRef = useRef<HTMLElement>(null);
	const mobileMenuRef = useRef<HTMLDetailsElement>(null);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [hasMobileMenuInteracted, setHasMobileMenuInteracted] = useState(false);
	const hideMobileHeader = useMobileHeaderVisibility(mobileMenuRef);

	const activeTheme = useSyncExternalStore(
		subscribeTheme,
		readTheme,
		getServerThemeSnapshot,
	);
	const activeBrand = useSyncExternalStore(
		subscribeBrand,
		readBrand,
		getServerBrandSnapshot,
	);

	const monochromeBadgeStyle: CSSProperties | undefined =
		activeTheme === "monochrome" ? { borderColor: "#111111" } : undefined;
	const siteNameForBrand =
		activeBrand === "nm" ? "Bridal Elegance NM" : "Bridal Elegance Atelier";

	const closeMobileMenu = useCallback(() => {
		const menu = mobileMenuRef.current;
		if (menu?.open) {
			menu.open = false;
		}
		setMobileMenuOpen(false);
	}, []);

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
							aria-label={siteNameForBrand}
							className={`${styles.logoMedallion} ${styles.logoBadgeMobile}`}
							style={monochromeBadgeStyle}
						>
							{activeBrand === "nm" ? (
								<span
									aria-hidden="true"
									className={`${styles.logoNmMask} ${styles.logoAtelierMobile}`}
								/>
							) : (
								<span
									aria-hidden="true"
									className={`${styles.logoAtelierMask} ${styles.logoAtelierMobile}`}
								/>
							)}
						</Link>
					</div>

					<details
						ref={mobileMenuRef}
						className={`${styles.menu} ${styles.mobileRight}`}
						onToggle={() =>
							{
								setHasMobileMenuInteracted(true);
								setMobileMenuOpen(
									Boolean(mobileMenuRef.current?.open),
								);
							}
						}
					>
						<summary
							className={styles.menuTrigger}
							aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
						>
							<span className="sr-only">
								{mobileMenuOpen ? "Close menu" : "Open menu"}
							</span>
							<span
								className={`${styles.menuTriggerWheel} ${
									hasMobileMenuInteracted
										? mobileMenuOpen
											? styles.menuTriggerWheelOpen
											: styles.menuTriggerWheelClosed
										: ""
								}`}
							>
								<span
									aria-hidden="true"
									className={styles.logoCircleMask}
								/>
							</span>
						</summary>

						<div className={styles.menuPanel}>
							<div className="be-container">
								<nav aria-label="Mobile">
									<ul className={styles.menuList}>
										<li className={styles.mobileBrandItem}>
											<span className={styles.mobileBrandLabel}>
												Brand
											</span>
											<BrandToggle size="compact" />
										</li>

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
												onClick={closeMobileMenu}
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
													onClick={closeMobileMenu}
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
							aria-label={siteNameForBrand}
							className={styles.logoBadgeDesktop}
							style={monochromeBadgeStyle}
						>
							<span className={styles.desktopBadgeStack}>
								{activeBrand === "nm" ? (
									<span
										aria-hidden="true"
										className={`${styles.logoNmMask} ${styles.logoAtelierDesktop}`}
									/>
								) : (
									<span
										aria-hidden="true"
										className={`${styles.logoAtelierMask} ${styles.logoAtelierDesktop}`}
									/>
								)}
							</span>
						</Link>
					</div>

					<div className={styles.rightRail}>
						<ThemeToggle align="right" />
						<BrandToggle />
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
