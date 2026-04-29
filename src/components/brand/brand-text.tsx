import type { ReactNode } from "react";

type BrandTextProps = {
	nm: ReactNode;
	atelier: ReactNode;
};

export function BrandText({ nm }: BrandTextProps) {
	return <>{nm}</>;
}

