import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchInstances } from "../../api/prometheus";
import { MachineSelector } from "./MachineSelector";

vi.mock("../../api/prometheus", () => ({
	fetchInstances: vi.fn(),
}));

const mockedFetchInstances = vi.mocked(fetchInstances);

describe("MachineSelector", () => {
	afterEach(() => {
		mockedFetchInstances.mockReset();
	});

	it("displays the fetched machine names", async () => {
		mockedFetchInstances.mockResolvedValue(["server-a:9100", "server-b:9100"]);

		render(
			<MachineSelector baseUrl="http://localhost:9090" onSelect={vi.fn()} />,
		);

		expect(await screen.findByText("server-a:9100")).toBeInTheDocument();
		expect(screen.getByText("server-b:9100")).toBeInTheDocument();
	});

	it("calls onSelect with the chosen machine name when clicked", async () => {
		mockedFetchInstances.mockResolvedValue(["server-a:9100", "server-b:9100"]);
		const onSelect = vi.fn();

		render(
			<MachineSelector baseUrl="http://localhost:9090" onSelect={onSelect} />,
		);

		const option = await screen.findByText("server-b:9100");
		fireEvent.click(option);

		expect(onSelect).toHaveBeenCalledWith("server-b:9100");
	});

	it("shows a loading state before the machines arrive", () => {
		mockedFetchInstances.mockReturnValue(new Promise(() => {}));

		render(
			<MachineSelector baseUrl="http://localhost:9090" onSelect={vi.fn()} />,
		);

		expect(screen.getByText(/loading/i)).toBeInTheDocument();
	});

	it("shows a clear message when no machine is available", async () => {
		mockedFetchInstances.mockResolvedValue([]);

		render(
			<MachineSelector baseUrl="http://localhost:9090" onSelect={vi.fn()} />,
		);

		expect(
			await screen.findByText(/no machine available/i),
		).toBeInTheDocument();
	});

	it("shows an error message when the request fails", async () => {
		mockedFetchInstances.mockRejectedValue(new Error("network error"));

		render(
			<MachineSelector baseUrl="http://localhost:9090" onSelect={vi.fn()} />,
		);

		await waitFor(() => {
			expect(screen.getByRole("alert")).toHaveTextContent("network error");
		});
	});
});
