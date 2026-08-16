import { legacySiteContent } from "@/content/migration/legacy-site/legacy-content";

export type GalleryShowcaseCollection = {
	id: string;
	name: string;
	descriptor: string;
	summary: string;
	collectionHref: string;
	coverFocus?: string;
	coverScale?: number;
	cover: {
		localPath: string;
		alt: string;
	};
	hoverSlides: Array<{
		localPath: string;
		alt: string;
	}>;
	hoverVideoSrc?: string;
};

export const galleryPageContent = {
	metadata: {
		title: "Collections",
		description:
			"Explore Bridal Elegance NM collections featuring Sottero and Midgley, Maggie Sottero, and Rebecca Ingram.",
	},
	collections: [
		{
			id: "sottero-and-midgley",
			name: "Sottero and Midgley",
			descriptor: "Designer Collection",
			summary:
				"Bold couture direction with sculpted structure and modern statement silhouettes.",
			coverFocus: "96% 34%",
			coverScale: 1.05,
			cover: {
				localPath:
					legacySiteContent.imageLibrary.collectionHighlights
						.bridalDesigners[0].localPath,
				alt: legacySiteContent.imageLibrary.collectionHighlights
					.bridalDesigners[0].alt,
			},
			collectionHref:
				legacySiteContent.externalLinks.bridalDesigners[0]?.href ??
				"https://www.maggiesottero.com/find-your-style/sottero-and-midgley",
		},
		{
			id: "maggie-sottero",
			name: "Maggie Sottero",
			descriptor: "Designer Collection",
			summary:
				"Romantic craftsmanship with timeless bridal lines and soft editorial movement.",
			coverFocus: "4% 42%",
			coverScale: 1,
			cover: {
				localPath:
					legacySiteContent.imageLibrary.collectionHighlights
						.bridalDesigners[1].localPath,
				alt: legacySiteContent.imageLibrary.collectionHighlights
					.bridalDesigners[1].alt,
			},
			collectionHref:
				legacySiteContent.externalLinks.bridalDesigners[1]?.href ??
				"https://www.maggiesottero.com/find-your-style/maggie-sottero",
		},
		{
			id: "rebecca-ingram",
			name: "Rebecca Ingram",
			descriptor: "Designer Collection",
			summary:
				"Refined silhouettes designed for effortless elegance and approachable luxury.",
			coverFocus: "100% 42%",
			coverScale: 1,
			cover: {
				localPath:
					legacySiteContent.imageLibrary.collectionHighlights
						.bridalDesigners[2].localPath,
				alt: legacySiteContent.imageLibrary.collectionHighlights
					.bridalDesigners[2].alt,
			},
			collectionHref:
				legacySiteContent.externalLinks.bridalDesigners[2]?.href ??
				"https://www.maggiesottero.com/find-your-style/rebecca-ingram",
		},
	],
} as const;

export const galleryShowcaseCollections: GalleryShowcaseCollection[] =
	galleryPageContent.collections.map(collection => ({
		id: collection.id,
		name: collection.name,
		descriptor: collection.descriptor,
		summary: collection.summary,
		collectionHref: collection.collectionHref,
		coverFocus: collection.coverFocus,
		coverScale: collection.coverScale,
		cover: {
			localPath: collection.cover.localPath,
			alt: collection.cover.alt,
		},
		hoverSlides: [
			{
				localPath: collection.cover.localPath,
				alt: collection.cover.alt,
			},
		],
	}));
