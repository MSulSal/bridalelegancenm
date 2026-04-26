"use client";

import { FormEvent, useState } from "react";

type ApiResponse = {
	ok?: boolean;
	message?: string;
	errors?: string[];
};

const windows = [
	{ value: "weekday-morning", label: "Weekday Morning" },
	{ value: "weekday-afternoon", label: "Weekday Afternoon" },
	{ value: "weekday-evening", label: "Weekday Evening" },
	{ value: "saturday-morning", label: "Saturday Morning" },
	{ value: "saturday-afternoon", label: "Saturday Afternoon" },
	{ value: "flexible", label: "Flexible" },
] as const;

const fieldClass =
	"mt-2 w-full border border-[color:var(--line-subtle)] bg-white px-3 py-2 text-sm text-[color:var(--ink-900)] outline-none transition focus:border-[color:var(--ink-900)]";
const labelClass =
	"text-xs uppercase tracking-[0.14em] text-[color:var(--ink-500)]";

export function AppointmentRequestForm() {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [successMessage, setSuccessMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [errorList, setErrorList] = useState<string[]>([]);

	async function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (isSubmitting) return;

		setIsSubmitting(true);
		setSuccessMessage("");
		setErrorMessage("");
		setErrorList([]);

		const form = event.currentTarget;
		const formData = new FormData(form);
		const payload = Object.fromEntries(formData.entries());

		try {
			const response = await fetch("/api/appointment-request", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			const json = (await response.json()) as ApiResponse;

			if (!response.ok || !json.ok) {
				setErrorMessage(
					json.message ??
						"We couldn't submit your request right now. Please try again.",
				);
				setErrorList(json.errors ?? []);
				return;
			}

			form.reset();
			setSuccessMessage(
				json.message ??
					"Appointment request received. We will follow up shortly.",
			);
		} catch {
			setErrorMessage(
				"Network issue while submitting. Please retry in a moment.",
			);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<form onSubmit={onSubmit} className="be-card relative p-6 sm:p-8">
			<div
				className="absolute left-[-5000px] top-auto h-px w-px overflow-hidden"
				aria-hidden="true"
			>
				<label htmlFor="website">Website</label>
				<input
					id="website"
					name="website"
					type="text"
					tabIndex={-1}
					autoComplete="off"
				/>
			</div>

			<div className="grid gap-5 md:grid-cols-2">
				<div>
					<label htmlFor="fullName" className={labelClass}>
						Your Name *
					</label>
					<input
						id="fullName"
						name="fullName"
						type="text"
						required
						autoComplete="name"
						className={fieldClass}
					/>
				</div>

				<div>
					<label htmlFor="email" className={labelClass}>
						Email *
					</label>
					<input
						id="email"
						name="email"
						type="email"
						required
						autoComplete="email"
						className={fieldClass}
					/>
				</div>

				<div>
					<label htmlFor="phone" className={labelClass}>
						Phone *
					</label>
					<input
						id="phone"
						name="phone"
						type="tel"
						required
						autoComplete="tel"
						className={fieldClass}
					/>
				</div>

				<div>
					<label htmlFor="weddingDate" className={labelClass}>
						Wedding Date
					</label>
					<input
						id="weddingDate"
						name="weddingDate"
						type="date"
						className={fieldClass}
					/>
				</div>

				<div>
					<label htmlFor="preferredDate" className={labelClass}>
						Preferred Appointment Date *
					</label>
					<input
						id="preferredDate"
						name="preferredDate"
						type="date"
						required
						className={fieldClass}
					/>
				</div>

				<div>
					<label htmlFor="preferredWindow" className={labelClass}>
						Preferred Time Window *
					</label>
					<select
						id="preferredWindow"
						name="preferredWindow"
						required
						defaultValue=""
						className={fieldClass}
					>
						<option value="" disabled>
							Select a window
						</option>
						{windows.map(window => (
							<option key={window.value} value={window.value}>
								{window.label}
							</option>
						))}
					</select>
				</div>

				<div>
					<label htmlFor="guestCount" className={labelClass}>
						Guests Bringing (0-6)
					</label>
					<input
						id="guestCount"
						name="guestCount"
						type="number"
						min={0}
						max={6}
						step={1}
						className={fieldClass}
					/>
				</div>

				<div>
					<p className={labelClass}>Preferred Contact Method *</p>
					<div className="mt-2 flex flex-wrap gap-4 text-sm text-[color:var(--ink-700)]">
						<label className="inline-flex items-center gap-2">
							<input
								type="radio"
								name="contactPreference"
								value="email"
								defaultChecked
							/>
							Email
						</label>
						<label className="inline-flex items-center gap-2">
							<input
								type="radio"
								name="contactPreference"
								value="phone"
							/>
							Phone
						</label>
						<label className="inline-flex items-center gap-2">
							<input
								type="radio"
								name="contactPreference"
								value="text"
							/>
							Text
						</label>
					</div>
				</div>
			</div>

			<div className="mt-5">
				<label htmlFor="styleNotes" className={labelClass}>
					Style Notes
				</label>
				<textarea
					id="styleNotes"
					name="styleNotes"
					rows={5}
					maxLength={1000}
					placeholder="Silhouettes, designers, vibe, budget notes, or anything else we should know."
					className={fieldClass}
				/>
			</div>

			<label className="mt-4 flex items-start gap-3 text-xs leading-6 text-[color:var(--ink-700)]">
				<input
					name="policyAccepted"
					type="checkbox"
					required
					className="mt-1 h-4 w-4"
				/>
				I understand this is an appointment request and the boutique
				will confirm my final date and time.
			</label>

			{successMessage ? (
				<p className="mt-5 border border-[color:var(--line-subtle)] bg-[color:var(--surface-soft)] px-4 py-3 text-sm text-[color:var(--ink-900)]">
					{successMessage}
				</p>
			) : null}

			{errorMessage ? (
				<div className="mt-5 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
					<p>{errorMessage}</p>
					{errorList.length > 0 ? (
						<ul className="mt-2 list-disc pl-5">
							{errorList.map(item => (
								<li key={item}>{item}</li>
							))}
						</ul>
					) : null}
				</div>
			) : null}

			<div className="mt-6 flex flex-wrap items-center gap-3">
				<button
					type="submit"
					disabled={isSubmitting}
					className="be-btn be-btn-primary disabled:cursor-not-allowed disabled:opacity-60"
				>
					{isSubmitting
						? "Submitting..."
						: "Submit Appointment Request"}
				</button>
				<p className="text-xs uppercase tracking-[0.14em] text-[color:var(--ink-500)]">
					Manual Confirmation
				</p>
			</div>
		</form>
	);
}
