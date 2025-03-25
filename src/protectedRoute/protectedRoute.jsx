import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ isAuthenticated, element: Component, ...rest }) => {
  if (!isAuthenticated) {
    return <Navigate to="/loginPage" replace />;
  }

  return <Component {...rest} />;
};

export default ProtectedRoute;
