import { useState } from "react";
import { Link } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import { ReviewBanner } from "./ReviewBanner";
import { BrandMark } from "./BrandMark";
const links = [
  { label: "Workspace", path: "/", id: "workspace" },
  { label: "Library", path: "/history", id: "library" },
  { label: "Reading guides", path: "/guides", id: "guides" },
  { label: "Methodology", path: "/methodology", id: "methodology" },
];
export function WorkspaceHeader({ active = "workspace" }: { active?: string }) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  return (
    <>
      <a className="ml-skip" href="#main-content">
        Skip to content
      </a>
      <ReviewBanner />
      <header className="ml-header">
        <div className="ml-header-inner">
          <Link href="/" className="ml-brand" accessibilityLabel="MedLit home">
            <BrandMark />
            <span>
              medlit<span>.</span>
            </span>
          </Link>
          <button
            className="ml-menu"
            type="button"
            aria-expanded={open}
            aria-controls="ml-nav"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close navigation" : "Open navigation"}
          >
            {open ? "Close" : "Menu"}{" "}
            <span aria-hidden="true">{open ? "×" : "≡"}</span>
          </button>
          <nav
            id="ml-nav"
            aria-label="Main navigation"
            className="ml-nav"
            data-open={open}
          >
            {links.map((item) => (
              <Link
                key={item.id}
                href={item.path as never}
                aria-current={active === item.id ? "page" : undefined}
                onPress={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/settings" onPress={() => setOpen(false)}>
              AI settings
            </Link>
            <Link
              href={user ? "/profile" : "/auth"}
              className="ml-account"
              onPress={() => setOpen(false)}
            >
              {user ? "Your account" : "Sign in"}{" "}
              <span aria-hidden="true">↗</span>
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
