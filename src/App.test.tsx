import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import App from "./App";
import { fetchMetricNames } from "./api/prometheus";

vi.mock("./api/prometheus", () => ({
	fetchMetricNames: vi.fn(),
}));

describe("App", () => {
	it("renders the Prometheus Viewer heading", () => {
		vi.mocked(fetchMetricNames).mockReturnValue(new Promise(() => {}));

		render(<App />);

		expect(
			screen.getByRole("heading", { name: "Prometheus Viewer" }),
		).toBeInTheDocument();
	});
});
