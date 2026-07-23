import { useEffect, useState } from "react";
import { fetchMetricValue, type MetricSample } from "../../api/prometheus";

interface MetricValueProps {
	baseUrl: string;
	machine: string;
	metricName: string;
}

type LoadState =
	| { status: "loading" }
	| { status: "success"; samples: MetricSample[] }
	| { status: "error"; message: string };

function formatLabels(labels: Record<string, string>): string {
	return Object.entries(labels)
		.map(([key, value]) => `${key}="${value}"`)
		.join(", ");
}

export function MetricValue({
	baseUrl,
	machine,
	metricName,
}: MetricValueProps) {
	const [state, setState] = useState<LoadState>({ status: "loading" });

	useEffect(() => {
		let cancelled = false;
		setState({ status: "loading" });

		fetchMetricValue(baseUrl, metricName, machine)
			.then((samples) => {
				if (!cancelled) {
					setState({ status: "success", samples });
				}
			})
			.catch((error: unknown) => {
				if (!cancelled) {
					const message =
						error instanceof Error ? error.message : "Unknown error";
					setState({ status: "error", message });
				}
			});

		return () => {
			cancelled = true;
		};
	}, [baseUrl, machine, metricName]);

	if (state.status === "loading") {
		return <p>Loading current value…</p>;
	}

	if (state.status === "error") {
		return <p role="alert">{state.message}</p>;
	}

	if (state.samples.length === 0) {
		return <p>No current value for this metric on this machine.</p>;
	}

	return (
		<ul>
			{state.samples.map((sample, index) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: samples have no stable identifier
				<li key={index}>
					{formatLabels(sample.labels)}: {sample.value}
				</li>
			))}
		</ul>
	);
}
