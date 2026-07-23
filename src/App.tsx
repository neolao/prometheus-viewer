import { useState } from "react";
import { MachineSelector } from "./features/machines/MachineSelector";
import { MetricList } from "./features/metrics/MetricList";

const prometheusBaseUrl = "/prom-api";

function App() {
	const [selectedMachine, setSelectedMachine] = useState<string | null>(null);

	return (
		<main>
			<h1>Prometheus Viewer</h1>
			{selectedMachine === null ? (
				<>
					<h2>Select a machine</h2>
					<MachineSelector
						baseUrl={prometheusBaseUrl}
						onSelect={setSelectedMachine}
					/>
				</>
			) : (
				<>
					<p>
						Selected machine: <strong>{selectedMachine}</strong>
					</p>
					<h2>Available metrics</h2>
					<MetricList baseUrl={prometheusBaseUrl} />
				</>
			)}
		</main>
	);
}

export default App;
