import { useEffect, useState } from "react";
import { fetchInstances } from "../../api/prometheus";

interface MachineSelectorProps {
	baseUrl: string;
	onSelect: (machine: string) => void;
}

type LoadState =
	| { status: "loading" }
	| { status: "success"; machines: string[] }
	| { status: "error"; message: string };

export function MachineSelector({ baseUrl, onSelect }: MachineSelectorProps) {
	const [state, setState] = useState<LoadState>({ status: "loading" });

	useEffect(() => {
		let cancelled = false;
		setState({ status: "loading" });

		fetchInstances(baseUrl)
			.then((machines) => {
				if (!cancelled) {
					setState({ status: "success", machines });
				}
			})
			.catch((error: unknown) => {
				if (!cancelled) {
					const message =
						error instanceof Error ? error.message : "Unknown error";
					setState({ status: "error", message });
				}
			});

		return () => {
			cancelled = true;
		};
	}, [baseUrl]);

	if (state.status === "loading") {
		return <p>Loading machines…</p>;
	}

	if (state.status === "error") {
		return <p role="alert">{state.message}</p>;
	}

	if (state.machines.length === 0) {
		return <p>No machine available.</p>;
	}

	return (
		<ul>
			{state.machines.map((machine) => (
				<li key={machine}>
					<button type="button" onClick={() => onSelect(machine)}>
						{machine}
					</button>
				</li>
			))}
		</ul>
	);
}
