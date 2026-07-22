import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import App from "./App";
import { fetchMetricNames } from "./api/prometheus";

vi.mock("./api/prometheus", () => ({
	fetchMetricNames: vi.fn(),
}));

const mockedFetchMetricNames = vi.mocked(fetchMetricNames);

describe("App", () => {
	it("renders the Prometheus Viewer heading", () => {
		mockedFetchMetricNames.mockReturnValue(new Promise(() => {}));

		render(<App />);

		expect(
			screen.getByRole("heading", { name: "Prometheus Viewer" }),
		).toBeInTheDocument();
	});

	it("fetches and displays metrics immediately, without any login step", async () => {
		mockedFetchMetricNames.mockResolvedValue(["http_requests_total"]);

		render(<App />);

		expect(await screen.findByText("http_requests_total")).toBeInTheDocument();
		expect(screen.queryByLabelText(/identifiant/i)).not.toBeInTheDocument();
	});
});
