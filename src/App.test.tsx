import { fireEvent, render, screen } from "@testing-library/react";
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

	it("shows the login form before fetching any metrics", () => {
		render(<App />);

		expect(screen.getByLabelText(/identifiant/i)).toBeInTheDocument();
		expect(mockedFetchMetricNames).not.toHaveBeenCalled();
	});

	it("fetches metrics without credentials when the user skips authentication", async () => {
		mockedFetchMetricNames.mockResolvedValue(["http_requests_total"]);

		render(<App />);
		fireEvent.click(
			screen.getByRole("button", { name: /continuer sans authentification/i }),
		);

		expect(await screen.findByText("http_requests_total")).toBeInTheDocument();
		expect(mockedFetchMetricNames).toHaveBeenCalledWith(
			expect.any(String),
			undefined,
		);
	});

	it("fetches metrics with the entered credentials when the user logs in", async () => {
		mockedFetchMetricNames.mockResolvedValue(["http_requests_total"]);

		render(<App />);
		fireEvent.change(screen.getByLabelText(/identifiant/i), {
			target: { value: "alice" },
		});
		fireEvent.change(screen.getByLabelText(/mot de passe/i), {
			target: { value: "s3cret" },
		});
		fireEvent.click(screen.getByRole("button", { name: /se connecter/i }));

		expect(await screen.findByText("http_requests_total")).toBeInTheDocument();
		expect(mockedFetchMetricNames).toHaveBeenCalledWith(expect.any(String), {
			username: "alice",
			password: "s3cret",
		});
	});
});
