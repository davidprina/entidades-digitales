import { Route, Routes } from "react-router-dom";
import { Header } from "./components/Header";
import { RequireAuth } from "./components/RequireAuth";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ResolvePage } from "./pages/ResolvePage";
import { DashboardPage } from "./pages/DashboardPage";
import { EntityFormPage } from "./pages/EntityFormPage";

export function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/q/:slug" element={<ResolvePage />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="/entities/new"
          element={
            <RequireAuth>
              <EntityFormPage />
            </RequireAuth>
          }
        />
        <Route
          path="/entities/:id/edit"
          element={
            <RequireAuth>
              <EntityFormPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<div className="page center-note">Página no encontrada</div>} />
      </Routes>
    </>
  );
}
