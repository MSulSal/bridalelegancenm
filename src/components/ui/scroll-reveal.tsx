"use client";

import {
	type CSSProperties,
	type ReactNode,
	useEffect,
	useRef,
	useState,
} from "react";
import styles from "./scroll-reveal.module.css";

type ScrollRevealProps = {
	children: ReactNode;
	className?: string;
	delayMs?: number;
	threshold?: number;
};

export function ScrollReveal({
	children,
	className,
	delayMs = 0,
	threshold = 0.18,
}: ScrollRevealProps) {
	const rootRef = useRef<HTMLDivElement>(null);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const node = rootRef.current;
		if (!node || isVisible) return;

		const observer = new IntersectionObserver(
			entries => {
				const [entry] = entries;
				if (entry?.isIntersecting) {
					setIsVisible(true);
					observer.disconnect();
				}
			},
			{
				threshold,
				rootMargin: "0px 0px -10% 0px",
			},
		);

		observer.observe(node);

		return () => {
			observer.disconnect();
		};
	}, [isVisible, threshold]);

	const inlineStyle = {
		"--reveal-delay": `${delayMs}ms`,
	} as CSSProperties;

	return (
		<div
			ref={rootRef}
			className={`${styles.reveal} ${isVisible ? styles.visible : ""}${className ? ` ${className}` : ""}`}
			style={inlineStyle}
		>
			{children}
		</div>
	);
}
