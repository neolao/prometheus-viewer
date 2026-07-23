import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchMachines } from "../../api/prometheus";
import { MachineSelector } from "./MachineSelector";

vi.mock("../../api/prometheus", () => ({
	fetchMachines: vi.fn(),
}));

const mockedFetchMachines = vi.mocked(fetchMachines);

describe("MachineSelector", () => {
	afterEach(() => {
		mockedFetchMachines.mockReset();
	});

	it("displays the fetched machine names", async () => {
		mockedFetchMachines.mockResolvedValue(["retrogaming", "workstation"]);

		render(
			<MachineSelector baseUrl="http://localhost:9090" onSelect={vi.fn()} />,
		);

		expect(await screen.findByText("retrogaming")).toBeInTheDocument();
		expect(screen.getByText("workstation")).toBeInTheDocument();
	});

	it("calls onSelect with the chosen machine name when clicked", async () => {
		mockedFetchMachines.mockResolvedValue(["retrogaming", "workstation"]);
		const onSelect = vi.fn();

		render(
			<MachineSelector baseUrl="http://localhost:9090" onSelect={onSelect} />,
		);

		const option = await screen.findByText("workstation");
		fireEvent.click(option);

		expect(onSelect).toHaveBeenCalledWith("workstation");
	});

	it("shows a loading state before the machines arrive", () => {
		mockedFetchMachines.mockReturnValue(new Promise(() => {}));

		render(
			<MachineSelector baseUrl="http://localhost:9090" onSelect={vi.fn()} />,
		);

		expect(screen.getByText(/loading/i)).toBeInTheDocument();
	});

	it("shows a clear message when no machine is available", async () => {
		mockedFetchMachines.mockResolvedValue([]);

		render(
			<MachineSelector baseUrl="http://localhost:9090" onSelect={vi.fn()} />,
		);

		expect(
			await screen.findByText(/no machine available/i),
		).toBeInTheDocument();
	});

	it("shows an error message when the request fails", async () => {
		mockedFetchMachines.mockRejectedValue(new Error("network error"));

		render(
			<MachineSelector baseUrl="http://localhost:9090" onSelect={vi.fn()} />,
		);

		await waitFor(() => {
			expect(screen.getByRole("alert")).toHaveTextContent("network error");
		});
	});
});
