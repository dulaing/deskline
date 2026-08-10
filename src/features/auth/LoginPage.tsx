import { useState, type SubmitEvent } from "react";
import { Navigate, useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login, type LoginCredentials } from "../../api/authApi";
import { getSession, saveSession } from "./session";

export default function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const existingSession = getSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => login(credentials),

    onSuccess: (result) => {
      saveSession(result);
      queryClient.clear();

      const destination = result.user.role === "requester" ? "/my-requests" : "/queue";

      navigate(destination, { replace: true });
    }
  })

  if (existingSession) {
    const destination = existingSession.user.role === "requester" ? "/my-requests" : "/queue";

    return <Navigate to={destination} replace />;
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>): void {
    event.preventDefault();

    loginMutation.mutate({
      email: email.trim(),
      password,
    })
  };

  function handleEmailChange(value: string): void {
    setEmail(value);

    if (loginMutation.isError) {
      loginMutation.reset();
    }
  }

  function handlePasswordChange(value: string): void {
    setPassword(value);

    if (loginMutation.isError) {
      loginMutation.reset();
    }
  }

  return (
    <main>
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            disabled={loginMutation.isPending}
            onChange={(event) => handleEmailChange(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            autoComplete="current-password"
            type="password"
            value={password}
            disabled={loginMutation.isPending}
            onChange={(event) => handlePasswordChange(event.target.value)}
            required
          />
        </div>

        {loginMutation.isError && <p role="alert">
          {loginMutation.error instanceof Error ? loginMutation.error.message : "Login failed. Please try again."}
        </p>}

        <button type="submit" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? "Logging in..." : "Login"}
        </button>
      </form>

      <section aria-labelledby="demo-accounts-heading">
        <h2 id="demo-accounts-heading">Demo accounts</h2>

        <ul>
          <li>
            Requester: requester@deskline.test
          </li>
          <li>
            Technician: technician@deskline.test
          </li>
          <li>
            Admin: admin@deskline.test
          </li>
        </ul>

        <p>Password for every account: password</p>
      </section>
    </main>
  );
}
