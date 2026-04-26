"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { siteConfig } from "@/lib/site";
import styles from "./site-header.module.css";

const navItems = [
	{ href: "/", label: "Home" },
	{ href: "/#collections-preview", label: "Collections" },
	{ href: "/#spotlights-preview", label: "Spotlights" },
	{ href: "/#about-preview", label: "About" },
] as const;

export function SiteHeader() {
	const mobileMenuRef = useRef<HTMLDetailsElement>(null);

	function closeMobileMenu() {
		if (mobileMenuRef.current) {
			mobileMenuRef.current.open = false;
		}
	}

	return (
		<header className="be-topbar">
			<div className="be-container be-topbar-inner">
				<div className={styles.mobileRow}>
					<div className={styles.mobileLeft}>
						<ThemeToggle align="left" size="compact" />
					</div>

					<div className={styles.logoClipMobile}>
						<Link
							href="/"
							aria-label={siteConfig.name}
							className={`be-logo-medallion be-logo-medallion-mobile ${styles.logoBadgeMobile}`}
							onClick={closeMobileMenu}
						>
							<Image
								src="/logo-text-v2.png"
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
						className={`be-menu ${styles.mobileRight}`}
					>
						<summary
							className="be-menu-trigger h-12 w-12"
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

						<div className="be-menu-panel">
							<div className="be-container">
								<nav aria-label="Mobile">
									<ul className="be-menu-list">
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
													className="be-nav-link"
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
								className="be-nav-link"
							>
								{item.label}
							</Link>
						))}
					</nav>

					<div className={styles.logoClipDesktop}>
						<Link
							href="/"
							aria-label={siteConfig.name}
							className={`be-logo-medallion ${styles.logoBadgeDesktop}`}
						>
							<Image
								src="/logo-text-v2.png"
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
							className="be-btn be-btn-primary be-topbar-cta shrink-0"
						>
							{siteConfig.appointmentLabel}
						</a>
					</div>
				</div>
			</div>
		</header>
	);
}
