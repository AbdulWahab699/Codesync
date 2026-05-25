import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import HomePage from "../pages/HomePage";
import RoomPage from "../pages/RoomPage";

const PrivateRoute = ({ user, children }) => {
  return user ? children : <Navigate to="/login" />;
};

function AppRoutes({ user, onLogin, onLogout }) {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/room" />
            ) : (
              <LoginPage
                onLogin={onLogin}
                onNavigateRegister={() => (window.location.href = "/register")}
              />
            )
          }
        />
        <Route
          path="/register"
          element={
            user ? (
              <Navigate to="/room" />
            ) : (
              <RegisterPage
                onRegister={onLogin}
                onNavigateLogin={() => (window.location.href = "/login")}
              />
            )
          }
        />
        <Route
          path="/room"
          element={
            <PrivateRoute user={user}>
              <RoomPage user={user} onLogout={onLogout} />
            </PrivateRoute>
          }
        />
        <Route
  path="/"
  element={user ? <Navigate to="/room" /> : <HomePage />}
/>
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
