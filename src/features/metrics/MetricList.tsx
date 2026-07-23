import { useEffect, useState } from "react";
import { fetchMetricNames } from "../../api/prometheus";

interface MetricListProps {
	baseUrl: string;
	machine: string;
}

type LoadState =
	| { status: "loading" }
	| { status: "success"; metricNames: string[] }
	| { status: "error"; message: string };

export function MetricList({ baseUrl, machine }: MetricListProps) {
	const [state, setState] = useState<LoadState>({ status: "loading" });
	const [searchText, setSearchText] = useState("");

	useEffect(() => {
		let cancelled = false;
		setState({ status: "loading" });

		fetchMetricNames(baseUrl, machine)
			.then((metricNames) => {
				if (!cancelled) {
					setState({ status: "success", metricNames });
				}
			})
			.catch((error: unknown) => {
				if (!cancelled) {
					const message =
						error instanceof Error ? error.message : "Erreur inconnue";
					setState({ status: "error", message });
				}
			});

		return () => {
			cancelled = true;
		};
	}, [baseUrl, machine]);

	if (state.status === "loading") {
		return <p>Chargement des métriques…</p>;
	}

	if (state.status === "error") {
		return <p role="alert">{state.message}</p>;
	}

	if (state.metricNames.length === 0) {
		return <p>Aucune métrique disponible pour cette machine.</p>;
	}

	const filteredMetricNames = state.metricNames.filter((metricName) =>
		metricName.toLowerCase().includes(searchText.toLowerCase()),
	);

	return (
		<>
			<input
				type="search"
				aria-label="Search metrics"
				value={searchText}
				onChange={(event) => setSearchText(event.target.value)}
			/>
			{filteredMetricNames.length === 0 ? (
				<p>No metric matches "{searchText}".</p>
			) : (
				<ul>
					{filteredMetricNames.map((metricName) => (
						<li key={metricName}>{metricName}</li>
					))}
				</ul>
			)}
		</>
	);
}
