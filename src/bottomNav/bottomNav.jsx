import React from "react";
import { NavLink } from "react-router-dom";
import "../styles.css";

// Simple outline icons (Feather-style paths). They take their color from the
// text color, so the active tab turns red with plain CSS.
const Icon = ({ children }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    {children}
  </svg>
);

const icons = {
  feed: (
    <Icon>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </Icon>
  ),
  drops: (
    <Icon>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </Icon>
  ),
  upload: (
    <Icon>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </Icon>
  ),
  profile: (
    <Icon>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </Icon>
  ),
};

// Phone-only tab bar for logged-in users (hidden on desktop by CSS)
const BottomNav = ({ username }) => (
  <nav className="bottom-nav" aria-label="Main">
    <NavLink to="/landingPage" className="bottom-nav-item">
      {icons.feed}
      <span>Feed</span>
    </NavLink>
    <NavLink to="/latestDrops" className="bottom-nav-item">
      {icons.drops}
      <span>Drops</span>
    </NavLink>
    <NavLink to="/uploadPhoto" className="bottom-nav-item">
      {icons.upload}
      <span>Upload</span>
    </NavLink>
    {username && (
      <NavLink
        to={`/profile/${encodeURIComponent(username)}`}
        className="bottom-nav-item"
      >
        {icons.profile}
        <span>Profile</span>
      </NavLink>
    )}
  </nav>
);

export default BottomNav;
