import React from "react";
import { Link } from "react-router-dom";
import "../styles.css";

const NotFound = ({ isAuthenticated }) => (
  <div className="container text-center not-found">
    <h2>Page not found</h2>
    <p className="muted-text">That address doesn't exist.</p>
    <Link to={isAuthenticated ? "/landingPage" : "/"} className="cta cta-primary">
      {isAuthenticated ? "Back to your feed" : "Back to home"}
    </Link>
  </div>
);

export default NotFound;
