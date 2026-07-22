interface PrometheusLabelValuesResponse {
	status: "success" | "error";
	data?: string[];
	error?: string;
	errorType?: string;
}

export async function fetchMetricNames(baseUrl: string): Promise<string[]> {
	const response = await fetch(`${baseUrl}/api/v1/label/__name__/values`);

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
