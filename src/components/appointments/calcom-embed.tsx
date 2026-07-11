"use client";

import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

type CalcomEmbedProps = {
	calLink: string;
	namespace: string;
};

export function CalcomEmbed({ calLink, namespace }: CalcomEmbedProps) {
	useEffect(() => {
		let isMounted = true;

		(async () => {
			const cal = await getCalApi({ namespace });
			if (!isMounted) return;

			cal("ui", {
				theme: "light",
				cssVarsPerTheme: {
					light: {
						"cal-brand": "#111111",
					},
					dark: {
						"cal-brand": "#111111",
					},
				},
				hideEventTypeDetails: false,
				layout: "month_view",
			});
		})();

		return () => {
			isMounted = false;
		};
	}, [namespace]);

	return (
		<Cal
			namespace={namespace}
			calLink={calLink}
			style={{ width: "100%", height: "100%", overflow: "scroll" }}
			config={{
				layout: "month_view",
				useSlotsViewOnSmallScreen: "true",
				theme: "light",
			}}
		/>
	);
}
