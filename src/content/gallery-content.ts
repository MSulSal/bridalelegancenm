import { legacySiteContent } from "@/content/migration/legacy-site/legacy-content";

type GalleryItem = {
	title: string;
	tag: string;
	localPath: string;
	alt: string;
	href?: string;
};

const designerNames = legacySiteContent.externalLinks.bridalDesigners.map(
	designer => designer.label,
);

const bridalDesignerItems: GalleryItem[] =
	legacySiteContent.imageLibrary.collectionHighlights.bridalDesigners.map(
		(image, index) => ({
			title: designerNames[index] ?? `Designer ${index + 1}`,
			tag: "Bridal Designer",
			localPath: image.localPath,
			alt: image.alt,
			href: legacySiteContent.externalLinks.bridalDesigners[index]?.href,
		}),
	);

const occasionItems: GalleryItem[] = [
	{
		title: "Mother of the Bride",
		tag: "Occasion Dressing",
		localPath:
			legacySiteContent.imageLibrary.collectionHighlights.motherOfBride
				.localPath,
		alt: legacySiteContent.imageLibrary.collectionHighlights.motherOfBride
			.alt,
		href: legacySiteContent.externalLinks.motherOfBride.href,
	},
	{
		title: "Accessories",
		tag: "Finishing Pieces",
		localPath:
			legacySiteContent.imageLibrary.collectionHighlights.accessories
				.localPath,
		alt: legacySiteContent.imageLibrary.collectionHighlights.accessories
			.alt,
		href: legacySiteContent.externalLinks.accessories.href,
	},
];

const boutiqueItems: GalleryItem[] = [
	{
		title: "Showroom Signature",
		tag: "Boutique Moment",
		localPath: legacySiteContent.imageLibrary.hero.localPath,
		alt: legacySiteContent.imageLibrary.hero.alt,
	},
	...legacySiteContent.imageLibrary.homeGallery.map((image, index) => ({
		title: `Boutique Edit ${index + 1}`,
		tag: "Boutique Moment",
		localPath: image.localPath,
		alt: image.alt,
	})),
];

export const galleryPageContent = {
	metadata: {
		title: "Gallery",
		description:
			"Browse bridal lookbook imagery from Bridal Elegance NM, including designer gowns, occasion styling, and boutique moments.",
	},
	hero: {
		eyebrow: "Gallery",
		title: "An Editorial Bridal Lookbook For New Mexico Brides",
		description:
			"Curated visuals from our migrated legacy collection, presented in a cleaner modern browsing experience.",
		images: [
			legacySiteContent.imageLibrary.hero,
			legacySiteContent.imageLibrary.homeGallery[0],
			legacySiteContent.imageLibrary.homeGallery[1],
		],
	},
	sections: [
		{
			id: "bridal-designers",
			heading: {
				eyebrow: "Designer Gallery",
				title: "Bridal Designer Highlights",
				description:
					"Signature silhouettes and styling direction from authorized designer collections.",
			},
			items: bridalDesignerItems,
		},
		{
			id: "occasion",
			heading: {
				eyebrow: "Occasion Styling",
				title: "Mother Of The Bride + Accessories",
				description:
					"Supporting categories for complete event styling and finishing details.",
			},
			items: occasionItems,
		},
		{
			id: "boutique",
			heading: {
				eyebrow: "Boutique Moments",
				title: "Showroom Atmosphere",
				description:
					"A closer look at boutique mood, craftsmanship details, and bridal presentation.",
			},
			items: boutiqueItems,
		},
	],
} as const;
