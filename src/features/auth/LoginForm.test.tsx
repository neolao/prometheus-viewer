import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LoginForm } from "./LoginForm";

function fillAndSubmit(username: string, password: string) {
	fireEvent.change(screen.getByLabelText(/identifiant/i), {
		target: { value: username },
	});
	fireEvent.change(screen.getByLabelText(/mot de passe/i), {
		target: { value: password },
	});
	fireEvent.click(screen.getByRole("button", { name: /se connecter/i }));
}

describe("LoginForm", () => {
	it("calls onSubmit with the entered credentials", () => {
		const onSubmit = vi.fn();
		render(<LoginForm onSubmit={onSubmit} onSkip={vi.fn()} />);

		fillAndSubmit("alice", "s3cret");

		expect(onSubmit).toHaveBeenCalledWith({
			username: "alice",
			password: "s3cret",
		});
	});

	it("calls onSkip when the user chooses to continue without authentication", () => {
		const onSkip = vi.fn();
		render(<LoginForm onSubmit={vi.fn()} onSkip={onSkip} />);

		fireEvent.click(
			screen.getByRole("button", { name: /continuer sans authentification/i }),
		);

		expect(onSkip).toHaveBeenCalled();
	});

	it("does not submit and shows a validation message when both fields are empty", () => {
		const onSubmit = vi.fn();
		render(<LoginForm onSubmit={onSubmit} onSkip={vi.fn()} />);

		fireEvent.click(screen.getByRole("button", { name: /se connecter/i }));

		expect(onSubmit).not.toHaveBeenCalled();
		expect(screen.getByRole("alert")).toBeInTheDocument();
	});

	it("does not submit and shows a validation message when only the password is filled in", () => {
		const onSubmit = vi.fn();
		render(<LoginForm onSubmit={onSubmit} onSkip={vi.fn()} />);

		fireEvent.change(screen.getByLabelText(/mot de passe/i), {
			target: { value: "s3cret" },
		});
		fireEvent.click(screen.getByRole("button", { name: /se connecter/i }));

		expect(onSubmit).not.toHaveBeenCalled();
		expect(screen.getByRole("alert")).toBeInTheDocument();
	});
});
