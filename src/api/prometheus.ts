interface PrometheusLabelValuesResponse {
	status: "success" | "error";
	data?: string[];
	error?: string;
	errorType?: string;
}

export interface PrometheusCredentials {
	username: string;
	password: string;
}

export async function fetchMetricNames(
	baseUrl: string,
	credentials?: PrometheusCredentials,
): Promise<string[]> {
	const url = `${baseUrl}/api/v1/label/__name__/values`;
	const response = credentials
		? await fetch(url, {
				headers: {
					Authorization: `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`,
				},
			})
		: await fetch(url);

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
