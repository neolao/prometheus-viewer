import { type FormEvent, useState } from "react";

interface LoginFormProps {
	onSubmit: (credentials: { username: string; password: string }) => void;
	onSkip: () => void;
}

export function LoginForm({ onSubmit, onSkip }: LoginFormProps) {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [validationError, setValidationError] = useState<string | null>(null);

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!username.trim() || !password.trim()) {
			setValidationError("Identifiant et mot de passe sont requis.");
			return;
		}

		setValidationError(null);
		onSubmit({ username, password });
	}

	return (
		<form onSubmit={handleSubmit}>
			<div>
				<label htmlFor="prometheus-username">Identifiant</label>
				<input
					id="prometheus-username"
					name="username"
					autoComplete="username"
					value={username}
					onChange={(event) => setUsername(event.target.value)}
				/>
			</div>
			<div>
				<label htmlFor="prometheus-password">Mot de passe</label>
				<input
					id="prometheus-password"
					name="password"
					type="password"
					autoComplete="current-password"
					value={password}
					onChange={(event) => setPassword(event.target.value)}
				/>
			</div>
			{validationError && <p role="alert">{validationError}</p>}
			<button type="submit">Se connecter</button>
			<button type="button" onClick={onSkip}>
				Continuer sans authentification
			</button>
		</form>
	);
}
