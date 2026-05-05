import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.tsx";
import Home from "./pages/Home.tsx";
import Display from "./pages/Display.tsx";
import Counter from "./pages/Counter.tsx";
import Admin from "./pages/Admin.tsx";
import Login from "./pages/Login.tsx";

// Simple Protected Route Component
const ProtectedRoute = ({ children, role }: { children: React.ReactNode; role?: string }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
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

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

