import { legacySiteContent } from "@/content/migration/legacy-site/legacy-content";

export const homeContent = {
	hero: {
		title: "Bridal Elegance",
		supportLine: legacySiteContent.business.authorizedLine,
		description:
			"Appointment-first bridal boutique service with curated designer selections, one-on-one guidance, and clear next steps.",
		secondaryCtaLabel: "View Bridal Gowns",
	},
	aboutPreview: {
		kicker: "Showroom Experience",
		copy: "A calm, one-on-one consultation experience shaped around your timeline and style preferences.",
	},
	homeGallery: legacySiteContent.imageLibrary.homeGallery,
	collectionSection: {
		heading: {
			eyebrow: "Collections",
			title: "Bridal Gowns, Mother Of The Bride, And Accessories",
			description:
				"Migrated from the original Bridal Elegance site and elevated for a modern editorial boutique experience.",
		},
		items: [
			{
				title: "Sottero and Midgley",
				copy: "Designer wedding gowns carried through our authorized salon relationship.",
				tag: "Bridal Designer",
				href: legacySiteContent.externalLinks.bridalDesigners[0].href,
				image: legacySiteContent.imageLibrary.collectionHighlights
					.bridalDesigners[0],
			},
			{
				title: "Maggie Sottero",
				copy: "Wedding gown collection from Maggie Sottero.",
				tag: "Bridal Designer",
				href: legacySiteContent.externalLinks.bridalDesigners[1].href,
				image: legacySiteContent.imageLibrary.collectionHighlights
					.bridalDesigners[1],
			},
			{
				title: "Rebecca Ingram",
				copy: "Wedding gown collection from Rebecca Ingram.",
				tag: "Bridal Designer",
				href: legacySiteContent.externalLinks.bridalDesigners[2].href,
				image: legacySiteContent.imageLibrary.collectionHighlights
					.bridalDesigners[2],
			},
		],
	},
	spotlightSection: {
		heading: {
			eyebrow: "Featured Categories",
			title: "Legacy Offerings Preserved And Presented With Better Clarity",
			description:
				"These offerings stay true to business continuity while modernizing the customer experience.",
		},
		ctaLabel: "Book Styling Appointment",
		items: [
			{
				title: "Mother of the Bride",
				copy: "Featured connection to Jasmine Bridal mother-of-the-bride styles.",
				ctaLabel: "View Source Collection",
				href: legacySiteContent.externalLinks.motherOfBride.href,
				image: legacySiteContent.imageLibrary.collectionHighlights
					.motherOfBride,
			},
			{
				title: "Accessories",
				copy: "Bel Aire Bridal veils and headpieces to complete your look.",
				ctaLabel: "View Source Collection",
				href: legacySiteContent.externalLinks.accessories.href,
				image: legacySiteContent.imageLibrary.collectionHighlights
					.accessories,
			},
			{
				title: "Appointment-Only Experience",
				copy: "Personalized in-store guidance with direct boutique confirmation.",
				ctaLabel: "Book Appointment",
				href: "/book-appointment",
				image: legacySiteContent.imageLibrary.hero,
			},
		],
	},
	journeySection: {
		heading: {
			eyebrow: "Boutique Journey",
			title: "A Personal Appointment-First Process",
			description:
				"Built around high-touch consultation and confident next-step guidance.",
		},
		steps: [
			{
				step: "01",
				title: "Send Appointment Request",
				body: "Share your timeline, style direction, and preferred appointment windows.",
			},
			{
				step: "02",
				title: "Availability Confirmation",
				body: "Our team confirms by phone or email based on boutique availability.",
			},
			{
				step: "03",
				title: "Guided Try-On Session",
				body: "Receive one-on-one support with curated gowns and styling direction.",
			},
			{
				step: "04",
				title: "Plan Next Steps",
				body: "Leave with clear recommendations for ordering, styling, and follow-up.",
			},
		],
	},
	appointmentSection: {
		heading: {
			eyebrow: "Contact + Booking",
			title: "Appointment-Only Service",
			description:
				"We preserved the legacy appointment-first model and made requests faster on every device.",
		},
		promises: [
			legacySiteContent.business.showroomUpdate,
			`Call us: ${legacySiteContent.business.phoneDisplay}`,
			"Instagram: @bridalelegancenm",
		],
	},
} as const;

export const appointmentPageContent = {
	metadata: {
		title: "Book Appointment",
		description:
			"Request a bridal appointment with Bridal Elegance NM. Our team confirms availability directly by phone or email.",
	},
	heading: {
		eyebrow: "Book Appointment",
		title: "Request Your Bridal Appointment",
		description:
			"Appointment-only service in New Mexico. Submit your request and our team confirms directly.",
	},
	experienceCard: {
		kicker: "Showroom Experience",
		title: "Personal, calm, and intentionally guided.",
		points: [
			legacySiteContent.business.authorizedLine,
			legacySiteContent.business.welcomeParagraphs[0],
			legacySiteContent.business.welcomeParagraphs[1],
		],
	},
	prepareCard: {
		kicker: "Before You Submit",
		title: "Bring These Details",
		points: [
			"Wedding date or estimated timeline.",
			"Preferred appointment days and times.",
			`Phone: ${legacySiteContent.business.phoneDisplay}`,
			legacySiteContent.business.showroomUpdate,
		],
	},
} as const;
