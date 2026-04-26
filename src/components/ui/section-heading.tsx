type SectionHeadingProps = {
	eyebrow: string;
	title: string;
	description?: string;
};

export function SectionHeading({
	eyebrow,
	title,
	description,
}: SectionHeadingProps) {
	return (
		<header className="flex flex-col gap-4">
			<p className="be-kicker">{eyebrow}</p>
			<h2 className="max-w-3xl text-4xl leading-tight sm:text-5xl">
				{title}
			</h2>
			{description ? <p className="be-body">{description}</p> : null}
		</header>
	);
}
