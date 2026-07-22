import { useState } from "react";
import type { PrometheusCredentials } from "./api/prometheus";
import { LoginForm } from "./features/auth/LoginForm";
import { MetricList } from "./features/metrics/MetricList";

const prometheusBaseUrl: string =
	import.meta.env.VITE_PROMETHEUS_URL ?? "http://localhost:9090";

type AuthState =
	| { status: "pending" }
	| { status: "skipped" }
	| { status: "authenticated"; credentials: PrometheusCredentials };

function App() {
	const [auth, setAuth] = useState<AuthState>({ status: "pending" });

	return (
		<main>
			<h1>Prometheus Viewer</h1>
			<p>Web UI consommant l'API Prometheus.</p>
			{auth.status === "pending" ? (
				<LoginForm
					onSubmit={(credentials) =>
						setAuth({ status: "authenticated", credentials })
					}
					onSkip={() => setAuth({ status: "skipped" })}
				/>
			) : (
				<>
					<h2>Métriques disponibles</h2>
					<MetricList
						baseUrl={prometheusBaseUrl}
						credentials={
							auth.status === "authenticated" ? auth.credentials : undefined
						}
					/>
				</>
			)}
		</main>
	);
}

export default App;
