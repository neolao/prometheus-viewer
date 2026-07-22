import { MetricList } from "./features/metrics/MetricList";

const prometheusBaseUrl = "/prom-api";

function App() {
	return (
		<main>
			<h1>Prometheus Viewer</h1>
			<p>Web UI consommant l'API Prometheus.</p>
			<h2>Métriques disponibles</h2>
			<MetricList baseUrl={prometheusBaseUrl} />
		</main>
	);
}

export default App;
