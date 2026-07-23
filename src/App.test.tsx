import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import App from "./App";
import { fetchInstances, fetchMetricNames } from "./api/prometheus";

vi.mock("./api/prometheus", () => ({
	fetchInstances: vi.fn(),
	fetchMetricNames: vi.fn(),
}));

const mockedFetchInstances = vi.mocked(fetchInstances);
const mockedFetchMetricNames = vi.mocked(fetchMetricNames);

describe("App", () => {
	it("renders the Prometheus Viewer heading", () => {
		mockedFetchInstances.mockReturnValue(new Promise(() => {}));

		render(<App />);

		expect(
			screen.getByRole("heading", { name: "Prometheus Viewer" }),
		).toBeInTheDocument();
	});

	it("shows the machine selector before any metric is fetched, without any login step", async () => {
		mockedFetchInstances.mockResolvedValue(["server-a:9100"]);

		render(<App />);

		expect(await screen.findByText("server-a:9100")).toBeInTheDocument();
		expect(mockedFetchMetricNames).not.toHaveBeenCalled();
		expect(screen.queryByLabelText(/username/i)).not.toBeInTheDocument();
	});

	it("displays the metric list and keeps the selected machine visible after a machine is chosen", async () => {
		mockedFetchInstances.mockResolvedValue(["server-a:9100"]);
		mockedFetchMetricNames.mockResolvedValue(["http_requests_total"]);

		render(<App />);

		const machineOption = await screen.findByText("server-a:9100");
		fireEvent.click(machineOption);

		expect(await screen.findByText("http_requests_total")).toBeInTheDocument();
		expect(screen.getByText("server-a:9100")).toBeInTheDocument();
	});
});
