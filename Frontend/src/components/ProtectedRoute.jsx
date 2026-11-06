import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";

// eslint-disable-next-line react/prop-types
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let active = true;
    axios
      .get(`${API_BASE_URL}/users/profile/me`)
      .then(() => active && setStatus("authenticated"))
      .catch(() => active && setStatus("unauthenticated"));
    return () => {
      active = false;
    };
  }, []);

  if (status === "checking") {
    return null;
  }
  if (status === "unauthenticated") {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }
  return children;
};

export default ProtectedRoute;
