import React from "react";
import { Link } from "react-router-dom";
import "../styles.css";

// Only describe what the app really does today
const FEATURES = [
  {
    title: "Share your collection",
    text: "Upload photos of your kicks with a description, and let people like and comment on them.",
  },
  {
    title: "Follow your people",
    text: "Build a feed from the sneakerheads you follow. Want more control? Make your account private and approve who follows you.",
  },
  {
    title: "Find the community",
    text: "Search for other collectors by username, visit their profiles, and see what they are wearing.",
  },
];

const HomePage = ({ isAuthenticated }) => (
  <div className="home-page">
    <section className="home-hero">
      <h1>Show off your kicks.</h1>
      <p className="home-pitch">
        SneakPeek360 is a home for sneakerheads: post your collection, follow
        collectors you like, and keep up with the community.
      </p>
      <div className="home-actions">
        {isAuthenticated ? (
          <>
            <Link to="/landingPage" className="cta cta-primary">
              Go to your feed
            </Link>
            <Link to="/uploadPhoto" className="cta cta-secondary">
              Upload a photo
            </Link>
          </>
        ) : (
          <>
            <Link to="/signUp" className="cta cta-primary">
              Create account
            </Link>
            <Link to="/loginPage" className="cta cta-secondary">
              Log in
            </Link>
          </>
        )}
      </div>
    </section>

    <section className="home-features" aria-label="What you can do">
      {FEATURES.map(({ title, text }) => (
        <div key={title} className="home-feature">
          <h3>{title}</h3>
          <p>{text}</p>
        </div>
      ))}
    </section>

    <footer className="home-footer">
      <nav aria-label="Footer">
        <a href="https://github.com/keawe99/startup">GitHub</a>
        <Link to="/aboutUs">About Us</Link>
      </nav>
      <p>&copy; 2025-2026 Steven Armstrong. All rights reserved.</p>
    </footer>
  </div>
);

export default HomePage;
