import { useEffect, useState } from "react";
import { fetchMetricMetadata } from "../../api/prometheus";

interface MetricDetailsProps {
	baseUrl: string;
	metricName: string;
}

type DetailsState =
	| { status: "loading" }
	| { status: "success"; type: string; help: string }
	| { status: "empty" }
	| { status: "error"; message: string };

export function MetricDetails({ baseUrl, metricName }: MetricDetailsProps) {
	const [state, setState] = useState<DetailsState>({ status: "loading" });

	useEffect(() => {
		let cancelled = false;
		setState({ status: "loading" });

		fetchMetricMetadata(baseUrl, metricName)
			.then((metadata) => {
				if (cancelled) {
					return;
				}
				if (metadata === null) {
					setState({ status: "empty" });
				} else {
					setState({
						status: "success",
						type: metadata.type,
						help: metadata.help,
					});
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
	}, [baseUrl, metricName]);

	if (state.status === "loading") {
		return <p>Chargement des détails…</p>;
	}

	if (state.status === "error") {
		return <p role="alert">{state.message}</p>;
	}

	if (state.status === "empty") {
		return <p>Aucune information disponible pour cette métrique.</p>;
	}

	return (
		<dl>
			<dt>Type</dt>
			<dd>{state.type}</dd>
			<dt>Description</dt>
			<dd>{state.help}</dd>
		</dl>
	);
}
