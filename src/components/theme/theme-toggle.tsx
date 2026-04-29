"use client";

import {
	useEffect,
	useMemo,
	useRef,
	useState,
	useSyncExternalStore,
} from "react";
import {
	applyTheme,
	defaultTheme,
	subscribeTheme,
	readTheme,
	themeOptions,
	type ThemeId,
} from "@/lib/theme";
import styles from "./theme-toggle.module.css";

type ThemeToggleProps = {
	align?: "left" | "right";
	size?: "default" | "compact";
};

function getServerThemeSnapshot(): ThemeId {
	return defaultTheme;
}

export function ThemeToggle({
	align = "right",
	size = "default",
}: ThemeToggleProps) {
	const [isOpen, setIsOpen] = useState(false);
	const rootRef = useRef<HTMLDivElement>(null);

	const theme = useSyncExternalStore(
		subscribeTheme,
		readTheme,
		getServerThemeSnapshot,
	);

	const activeTheme = useMemo(
		() =>
			themeOptions.find(option => option.id === theme) ?? themeOptions[0],
		[theme],
	);

	useEffect(() => {
		if (!isOpen) return;

		const onPointerDown = (event: PointerEvent) => {
			const target = event.target;
			if (!(target instanceof Node)) return;
			if (!rootRef.current) return;
			if (!rootRef.current.contains(target)) {
				setIsOpen(false);
			}
		};

		const onEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setIsOpen(false);
			}
		};

		document.addEventListener("pointerdown", onPointerDown);
		document.addEventListener("keydown", onEscape);

		return () => {
			document.removeEventListener("pointerdown", onPointerDown);
			document.removeEventListener("keydown", onEscape);
		};
	}, [isOpen]);

	function applyAndClose(nextTheme: ThemeId) {
		applyTheme(nextTheme);
		setIsOpen(false);
	}

	const triggerClass =
		size === "compact"
			? `${styles.trigger} ${styles.triggerCompact} ${isOpen ? styles.triggerOpen : styles.triggerClosed}`
			: `${styles.trigger} ${isOpen ? styles.triggerOpen : styles.triggerClosed}`;

	const popoverClass =
		align === "left"
			? `${styles.popover} ${styles.popoverLeft}`
			: `${styles.popover} ${styles.popoverRight}`;

	return (
		<div ref={rootRef} className={styles.root}>
			<button
				type="button"
				className={triggerClass}
				aria-label={`Theme: ${activeTheme.name}`}
				aria-expanded={isOpen}
				aria-haspopup="menu"
				onClick={() => setIsOpen(open => !open)}
			/>

			{isOpen ? (
				<div
					className={popoverClass}
					role="menu"
					aria-label="Theme options"
				>
					<ul className={styles.options} role="none">
						{themeOptions.map(option => {
							const isActive = option.id === theme;

							return (
								<li key={option.id} role="none">
									<button
										type="button"
										role="menuitemradio"
										aria-checked={isActive}
										className={`${styles.option} ${isActive ? styles.active : ""}`}
										onClick={() => applyAndClose(option.id)}
									>
										<span
											className={styles.swatch}
											style={{
												backgroundColor: option.swatch,
											}}
											aria-hidden="true"
										/>
										<span className={styles.label}>
											{option.name}
										</span>
									</button>
								</li>
							);
						})}
					</ul>
				</div>
			) : null}
		</div>
	);
}
