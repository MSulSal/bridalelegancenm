import { siteConfig } from "@/lib/site";

function serializeJsonLd(data: object) {
	return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function LocalBusinessJsonLd() {
	const localBusiness = {
		"@context": "https://schema.org",
		"@type": "ClothingStore",
		"@id": `${siteConfig.url}/#bridal-elegance-nm`,
		name: siteConfig.name,
		url: siteConfig.url,
		image: `${siteConfig.url}/logo-og.png`,
		description: siteConfig.description,
		telephone: "+15058302110",
		address: {
			"@type": "PostalAddress",
			streetAddress: siteConfig.addressLine1,
			addressLocality: "Albuquerque",
			addressRegion: "NM",
			postalCode: "87104",
			addressCountry: "US",
		},
		areaServed: [
			{ "@type": "City", name: "Albuquerque" },
			{ "@type": "State", name: "New Mexico" },
		],
		sameAs: [siteConfig.instagramHref, siteConfig.tiktokHref],
		knowsAbout: [
			"Wedding dresses",
			"Bridal gowns",
			"Quick Ship wedding dresses",
			"Maggie Sottero wedding dresses",
			"Sottero and Midgley wedding dresses",
			"Rebecca Ingram wedding dresses",
		],
		hasOfferCatalog: {
			"@type": "OfferCatalog",
			name: "Bridal gown offerings",
			itemListElement: [
				{
					"@type": "Offer",
					itemOffered: {
						"@type": "Product",
						name: "Quick Ship Wedding Dresses",
						description:
							"Quick Ship wedding dress options available from Bridal Elegance NM.",
					},
				},
			],
		},
	};

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: serializeJsonLd(localBusiness) }}
		/>
	);
}
