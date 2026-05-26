import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";
import { Button } from "../ui/Button";
import { useState } from "react";

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { theme, toggle } = useThemeStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-bg-primary/90 backdrop-blur-md border-b border-border-subtle">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        <Link
          to="/"
          className="text-lg font-bold tracking-tight flex-shrink-0 text-text-primary"
        >
          Sport<span className="text-orange">Book</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
          <Link
            to="/"
            className="text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            Объекты
          </Link>
          <Link
            to="/about"
            className="text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            О платформе
          </Link>
          <Link
            to="/owners"
            className="text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            Для владельцев
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="w-9 h-9 rounded-btn border border-border-default flex items-center justify-center text-text-muted hover:border-orange hover:text-orange transition-colors flex-shrink-0"
          >
            {theme === "dark" ? (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="5" />
                <path
                  d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/my-bookings"
                  className="text-sm text-text-muted hover:text-text-primary transition-colors"
                >
                  Мои брони
                </Link>
                <div
                  className="w-8 h-8 rounded-full bg-bg-card border border-border-subtle flex items-center justify-center text-xs font-semibold text-orange cursor-pointer hover:border-orange transition-colors"
                  onClick={() => navigate("/profile")}
                >
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/login")}
                >
                  Войти
                </Button>
                <Button size="sm" onClick={() => navigate("/register")}>
                  Начать
                </Button>
              </>
            )}
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setMenuOpen((p) => !p)}
            className="md:hidden w-9 h-9 rounded-btn border border-border-default flex items-center justify-center text-text-muted"
          >
            {menuOpen ? (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border-subtle bg-bg-primary px-4 py-4 flex flex-col gap-3">
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="text-sm text-text-muted hover:text-text-primary py-2 transition-colors"
          >
            Объекты
          </Link>
          <Link
            to="/about"
            onClick={() => setMenuOpen(false)}
            className="text-sm text-text-muted hover:text-text-primary py-2 transition-colors"
          >
            О платформе
          </Link>
          <Link
            to="/owners"
            onClick={() => setMenuOpen(false)}
            className="text-sm text-text-muted hover:text-text-primary py-2 transition-colors"
          >
            Для владельцев
          </Link>
          <div className="h-px bg-border-subtle my-1" />
          {isAuthenticated ? (
            <>
              <Link
                to="/my-bookings"
                onClick={() => setMenuOpen(false)}
                className="text-sm text-text-muted hover:text-text-primary py-2 transition-colors"
              >
                Мои брони
              </Link>
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="text-sm text-text-muted hover:text-text-primary py-2 transition-colors"
              >
                Профиль
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
              >
                Выйти
              </Button>
            </>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigate("/login");
                  setMenuOpen(false);
                }}
              >
                Войти
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  navigate("/register");
                  setMenuOpen(false);
                }}
              >
                Начать
              </Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
