import { Navigate, useLocation } from "react-router-dom";
import jwtDecode from "jwt-decode";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  try {
    const { exp } = jwtDecode(token);
    if (!exp || exp * 1000 <= Date.now()) {
      localStorage.removeItem("token");
      return <Navigate to="/" replace state={{ from: location.pathname }} />;
    }
  } catch {
    localStorage.removeItem("token");
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default ProtectedRoute;
