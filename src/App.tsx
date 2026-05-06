import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.tsx";
import Home from "./pages/Home.tsx";
import Display from "./pages/Display.tsx";
import Counter from "./pages/Counter.tsx";
import Admin from "./pages/Admin.tsx";
import Analytics from "./pages/Analytics.tsx";
import Services from "./pages/Services.tsx";
import Settings from "./pages/Settings.tsx";
import Login from "./pages/Login.tsx";

// Simple Protected Route Component
const ProtectedRoute = ({ children, role }: { children: React.ReactNode; role?: string }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role) {
    if (role === "admin" && user.role !== "admin") {
      return <Navigate to="/" replace />;
    }
    if (role === "staff" && user.role !== "staff" && user.role !== "admin") {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/display" element={<Display />} />
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/counter" 
            element={
              <ProtectedRoute role="staff">
                <Counter />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute role="admin">
                <Admin />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute role="admin">
                <Analytics />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/services" 
            element={
              <ProtectedRoute role="admin">
                <Services />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/settings" 
            element={
              <ProtectedRoute role="admin">
                <Settings />
              </ProtectedRoute>
            } 
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

