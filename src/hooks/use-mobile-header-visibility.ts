"use client";

import { RefObject, useEffect, useState } from "react";

export function useMobileHeaderVisibility(
	menuRef: RefObject<HTMLDetailsElement | null>,
) {
	const [isHidden, setIsHidden] = useState(false);

	useEffect(() => {
		let lastY = window.scrollY;

		const onScroll = () => {
			const currentY = window.scrollY;
			const isMobileViewport = window.innerWidth < 1024;

			if (!isMobileViewport) {
				setIsHidden(false);
				lastY = currentY;
				return;
			}

			if (menuRef.current?.open) {
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
			}
		};

		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onResize);

		return () => {
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onResize);
		};
	}, [menuRef]);

	return isHidden;
}
