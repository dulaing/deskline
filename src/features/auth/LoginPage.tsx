import { useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router";

import { users } from "../../mocks/data";
import { saveSession } from "./session";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const matchedUser = users.find(
      (user) =>
        user.email.toLowerCase() === email.trim().toLowerCase() &&
        user.password === password,
    );

    if (!matchedUser) {
      setError("Incorrect email or password.");
      return;
    }

    saveSession(matchedUser);
    setError("");

    if (matchedUser.role === "requester") {
      navigate("/my-requests");
    } else {
      navigate("/queue");
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
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {error && <p role="alert">{error}</p>}

        <button type="submit">Login</button>
      </form>
    </main>
  );
}