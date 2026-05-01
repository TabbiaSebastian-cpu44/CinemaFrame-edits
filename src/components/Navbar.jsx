/**
 * Navbar.jsx
 * Barra de navegación global con iconos SVG, animaciones y diseño luxury.
 */

import { Icon } from "../icons/Icons";

const NAV_LINKS = [
  { id: "home",   label: "Catálogo",  IconComponent: "Home"  },
  { id: "studio", label: "Estudio",   IconComponent: "Clapboard" },
  { id: "upload", label: "Subir",     IconComponent: "Upload" },
];

export default function Navbar({ currentView, onNavigate }) {
  return (
    <nav className="navbar">
      {/* Logo */}
      <div
        className="navbar-logo"
        onClick={() => onNavigate("home")}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onNavigate("home")}
        aria-label="Ir al inicio"
      >
        <div className="navbar-logo-mark">
          <Icon.Film size={18} color="#050507" strokeWidth={2} />
        </div>
        <div>
          <div className="navbar-logo-text">CinemaFrame</div>
          <div className="navbar-logo-sub">Frame Editor</div>
        </div>
      </div>

      {/* Links */}
      <div className="navbar-links">
        {NAV_LINKS.map(({ id, label, IconComponent }) => {
          const IconEl = Icon[IconComponent];
          const isActive = currentView === id;
          return (
            <button
              key={id}
              className={`navbar-link ${isActive ? "navbar-link--active" : ""}`}
              onClick={() => onNavigate(id)}
              aria-current={isActive ? "page" : undefined}
            >
              <IconEl
                size={16}
                color="currentColor"
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}