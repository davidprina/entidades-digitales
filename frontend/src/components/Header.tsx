import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="app-header">
      <Link to="/" className="brand">
        entidades-digitales
      </Link>
      <nav className="btn-row" style={{ width: "auto" }}>
        {user ? (
          <>
            <Link to="/dashboard" className="btn" style={{ width: "auto" }}>
              Mis entidades
            </Link>
            <button type="button" className="btn" onClick={handleLogout}>
              Salir
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn" style={{ width: "auto" }}>
              Ingresar
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
