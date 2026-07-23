interface PrometheusApiResponse<T> {
	status: "success" | "error";
	data?: T;
	error?: string;
	errorType?: string;
}

async function fetchPrometheusApi<T>(url: string): Promise<T | undefined> {
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(
			`Prometheus request failed: ${response.status} ${response.statusText}`,
		);
	}

	const body = (await response.json()) as PrometheusApiResponse<T>;

	if (body.status === "error") {
		throw new Error(body.error ?? "Prometheus API returned an error");
	}

	return body.data;
}

async function fetchLabelValues(
	baseUrl: string,
	labelName: string,
	matchSelector?: string,
): Promise<string[]> {
	const query = matchSelector
		? `?${new URLSearchParams({ "match[]": matchSelector }).toString()}`
		: "";
	const data = await fetchPrometheusApi<string[]>(
		`${baseUrl}/api/v1/label/${labelName}/values${query}`,
	);

	return data ?? [];
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

export interface MetricMetadata {
	type: string;
	help: string;
}

interface RawMetricMetadataEntry {
	type: string;
	help: string;
	unit?: string;
}

export async function fetchMetricMetadata(
	baseUrl: string,
	metricName: string,
): Promise<MetricMetadata | null> {
	const query = new URLSearchParams({ metric: metricName }).toString();
	const data = await fetchPrometheusApi<
		Record<string, RawMetricMetadataEntry[]>
	>(`${baseUrl}/api/v1/metadata?${query}`);
	const entries = data?.[metricName];

	if (!entries || entries.length === 0) {
		return null;
	}

	return { type: entries[0].type, help: entries[0].help };
}
