interface PrometheusLabelValuesResponse {
	status: "success" | "error";
	data?: string[];
	error?: string;
	errorType?: string;
}

interface PrometheusInstantQueryResult {
	metric: Record<string, string>;
	value: [number, string];
}

interface PrometheusInstantQueryResponse {
	status: "success" | "error";
	data?: {
		resultType: string;
		result: PrometheusInstantQueryResult[];
	};
	error?: string;
	errorType?: string;
}

export interface MetricSample {
	labels: Record<string, string>;
	value: string;
}

interface PrometheusRangeQueryResult {
	metric: Record<string, string>;
	values: [number, string][];
}

interface PrometheusRangeQueryResponse {
	status: "success" | "error";
	data?: {
		resultType: string;
		result: PrometheusRangeQueryResult[];
	};
	error?: string;
	errorType?: string;
}

export interface MetricRangePoint {
	timestamp: number;
	value: string;
}

export interface MetricRangeSeries {
	labels: Record<string, string>;
	points: MetricRangePoint[];
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

export async function fetchMetricValue(
	baseUrl: string,
	metricName: string,
	machine: string,
): Promise<MetricSample[]> {
	const query = `${metricName}{host="${machine}"}`;
	const response = await fetch(
		`${baseUrl}/api/v1/query?${new URLSearchParams({ query }).toString()}`,
	);

	if (!response.ok) {
		throw new Error(
			`Prometheus request failed: ${response.status} ${response.statusText}`,
		);
	}

	const body = (await response.json()) as PrometheusInstantQueryResponse;

	if (body.status === "error") {
		throw new Error(body.error ?? "Prometheus API returned an error");
	}

	if (!Array.isArray(body.data?.result)) {
		throw new Error("Malformed Prometheus response");
	}

	return body.data.result.map((series) => ({
		labels: series.metric,
		value: series.value[1],
	}));
}

export async function fetchMetricRange(
	baseUrl: string,
	metricName: string,
	machine: string,
	start: number,
	end: number,
	step: number,
): Promise<MetricRangeSeries[]> {
	const query = `${metricName}{host="${machine}"}`;
	const response = await fetch(
		`${baseUrl}/api/v1/query_range?${new URLSearchParams({
			query,
			start: String(start),
			end: String(end),
			step: String(step),
		}).toString()}`,
	);

	if (!response.ok) {
		throw new Error(
			`Prometheus request failed: ${response.status} ${response.statusText}`,
		);
	}

	const body = (await response.json()) as PrometheusRangeQueryResponse;

	if (body.status === "error") {
		throw new Error(body.error ?? "Prometheus API returned an error");
	}

	if (!Array.isArray(body.data?.result)) {
		throw new Error("Malformed Prometheus response");
	}

	return body.data.result.map((series) => {
		if (!Array.isArray(series.values)) {
			throw new Error("Malformed Prometheus response");
		}

		return {
			labels: series.metric,
			points: series.values.map(([timestamp, value]) => ({
				timestamp,
				value,
			})),
		};
	});
}
