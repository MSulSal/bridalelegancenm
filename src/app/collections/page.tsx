import type { Metadata } from "next";
import {
	galleryPageContent,
	galleryShowcaseCollections,
} from "@/content/gallery-content";
import { CollectionParallaxShowcase } from "@/components/gallery/collection-parallax-showcase";
import { SiteShell } from "@/components/layout/site-shell";

export const metadata: Metadata = {
	title: galleryPageContent.metadata.title,
	description: galleryPageContent.metadata.description,
};

export default function CollectionsPage() {
	return (
		<SiteShell>
			<div className="relative left-1/2 w-screen -translate-x-1/2">
				<CollectionParallaxShowcase
					collections={galleryShowcaseCollections}
				/>
			</div>
		</SiteShell>
	);
}