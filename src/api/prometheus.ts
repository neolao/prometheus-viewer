interface PrometheusLabelValuesResponse {
	status: "success" | "error";
	data?: string[];
	error?: string;
	errorType?: string;
}

async function fetchLabelValues(
	baseUrl: string,
	labelName: string,
	matchSelector?: string,
): Promise<string[]> {
	const query = matchSelector
		? `?${new URLSearchParams({ "match[]": matchSelector }).toString()}`
		: "";
	const response = await fetch(
		`${baseUrl}/api/v1/label/${labelName}/values${query}`,
	);

	if (!response.ok) {
		throw new Error(
			`Prometheus request failed: ${response.status} ${response.statusText}`,
		);
	}

	const body = (await response.json()) as PrometheusLabelValuesResponse;

	if (body.status === "error") {
		throw new Error(body.error ?? "Prometheus API returned an error");
	}

	return body.data ?? [];
}

export function fetchMetricNames(
	baseUrl: string,
	machine?: string,
): Promise<string[]> {
	const matchSelector = machine ? `{host="${machine}"}` : undefined;
	return fetchLabelValues(baseUrl, "__name__", matchSelector);
}

export function fetchMachines(baseUrl: string): Promise<string[]> {
	return fetchLabelValues(baseUrl, "host");
}
