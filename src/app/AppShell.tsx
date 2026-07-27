import { useEffect, useState } from "react";
import { Link, Navigate, Outlet, useNavigate} from "react-router";
import { clearSession, getSession } from "../features/auth/session";

type Theme = "light" | "dark";

// constant names for values stored in localStorage.
const THEME_KEY = "deskline-theme";
const MOTION_KEY = "deskline-reduce-motion";

function getStartingTheme(): Theme {
  const savedTheme = localStorage.getItem(THEME_KEY);

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return "dark";

  // return window.matchMedia("(prefers-color-scheme: dark)").matches
  //   ? "dark"
  //   : "light";
}

function getStartingMotionPreference(): boolean {
  const savedPreference = localStorage.getItem(MOTION_KEY);

  if (savedPreference !== null) {
    return savedPreference === "true";
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function AppShell() {
  const navigate = useNavigate();
  const currentUser = getSession();
  const [theme, setTheme] = useState<Theme>(getStartingTheme);
  const [reduceMotion, setReduceMotion] = useState(getStartingMotionPreference);

  // if the theme changes, React runs the effect again
  useEffect(() => {
    document.documentElement.dataset.theme = theme; //produces HTML, so the css reads that attribute
    localStorage.setItem(THEME_KEY, theme); 
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.reduceMotion = String(reduceMotion);
    localStorage.setItem(MOTION_KEY, String(reduceMotion));
  }, [reduceMotion]);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  function handleLogout(): void {
    clearSession();
    navigate("/login", { replace: true });
  }

  const nextTheme: Theme = theme === "light" ? "dark" : "light";
  const homePath = currentUser.role === "requester" ? "/my-requests" : "/queue";

  return (
    <div className="app-shell">
      <header className="app-header">

        <Link className="brand" to={homePath}> Deskline </Link>

        <nav className="main-navigation" aria-label="Main navigation">
          {currentUser.role === "requester" ? (
            <>
              <Link to="/my-requests">My requests</Link>
              <Link to="/requests/new">New request</Link>
            </>
          ) : ( <Link to="/queue">Queue</Link> )}
        </nav>

        <div className="user-controls">
          <p className="current-user">
            <strong>{currentUser.name}</strong>
            <span>{currentUser.role}</span>
          </p>

          <button
            type="button"
            aria-label={`Use ${nextTheme} theme`}
            onClick={() => setTheme(nextTheme)}
          >
            {theme === "light" ? "Dark theme" : "Light theme"}
          </button>

          <button
            type="button"
            aria-pressed={reduceMotion}
            onClick={() => setReduceMotion((current) => !current)}
          >
            Reduce motion: {reduceMotion ? "On" : "Off"}
          </button>

          <button type="button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <main className="page-content">
        <Outlet />
      </main>
    </div>
  );
}
