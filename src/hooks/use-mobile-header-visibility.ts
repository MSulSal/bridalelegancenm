"use client";

import { RefObject, useEffect, useState } from "react";

export function useMobileHeaderVisibility(
	menuRef: RefObject<HTMLDetailsElement | null>,
) {
	const [isHidden, setIsHidden] = useState(false);

	useEffect(() => {
		let lastY = window.scrollY;
		let awaitingUserScrollIntent = false;

		const onUserScrollIntent = () => {
			awaitingUserScrollIntent = false;
		};

		const onMenuToggle = () => {
			const menuIsOpen = Boolean(menuRef.current?.open);
			setIsHidden(false);
			lastY = window.scrollY;

			// After menu closes, wait for an actual user scroll gesture
			// before allowing hide-on-scroll logic again.
			awaitingUserScrollIntent = !menuIsOpen;
		};

		const onScroll = () => {
			const currentY = window.scrollY;
			const isMobileViewport = window.innerWidth < 1024;

			if (!isMobileViewport) {
				setIsHidden(false);
				lastY = currentY;
				awaitingUserScrollIntent = false;
				return;
			}

			if (menuRef.current?.open) {
				setIsHidden(false);
				lastY = currentY;
				awaitingUserScrollIntent = false;
				return;
			}

			if (awaitingUserScrollIntent) {
				setIsHidden(false);
				lastY = currentY;
				return;
			}

			const delta = currentY - lastY;

			if (currentY <= 24 || delta < -4) {
				setIsHidden(false);
			} else if (delta > 7) {
				setIsHidden(true);
			}

			lastY = currentY;
		};

		const onResize = () => {
			if (window.innerWidth >= 1024) {
				setIsHidden(false);
				awaitingUserScrollIntent = false;
			}
		};

		const onVirtualScroll = (event: Event) => {
			const isMobileViewport = window.innerWidth < 1024;
			if (!isMobileViewport) return;

			if (menuRef.current?.open) {
				setIsHidden(false);
				return;
			}

			if (awaitingUserScrollIntent) {
				setIsHidden(false);
				return;
			}

			const maybeCustom = event as CustomEvent<{ deltaY?: number }>;
			const delta = maybeCustom.detail?.deltaY ?? 0;

			if (delta < -4) {
				setIsHidden(false);
			} else if (delta > 7) {
				setIsHidden(true);
			}
		};

		const menuElement = menuRef.current;
		menuElement?.addEventListener("toggle", onMenuToggle);

		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onResize);
		window.addEventListener("touchmove", onUserScrollIntent, {
			passive: true,
		});
		window.addEventListener("wheel", onUserScrollIntent, { passive: true });
		window.addEventListener("be:virtual-scroll", onVirtualScroll);

		return () => {
			menuElement?.removeEventListener("toggle", onMenuToggle);

			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onResize);
			window.removeEventListener("touchmove", onUserScrollIntent);
			window.removeEventListener("wheel", onUserScrollIntent);
			window.removeEventListener("be:virtual-scroll", onVirtualScroll);
		};
	}, [menuRef]);

	return isHidden;
}
