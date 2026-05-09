import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { useLearner } from "./context/LearnerContext.jsx";

import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import LearnerSelect from "./pages/LearnerSelect.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ScenarioLibrary from "./pages/ScenarioLibrary.jsx";
import ScenarioConfig from "./pages/ScenarioConfig.jsx";
import PracticeSession from "./pages/PracticeSession.jsx";
import SessionSummary from "./pages/SessionSummary.jsx";
import LearnerProfile from "./pages/LearnerProfile.jsx";
import Settings from "./pages/Settings.jsx";
import AppLayout from "./components/AppLayout.jsx";

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-slate-500">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RequireLearner({ children }) {
  const { learner } = useLearner();
  if (!learner) return <Navigate to="/learners" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/learners"
        element={
          <RequireAuth>
            <LearnerSelect />
          </RequireAuth>
        }
      />

      <Route
        element={
          <RequireAuth>
            <RequireLearner>
              <AppLayout />
            </RequireLearner>
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/scenarios" element={<ScenarioLibrary />} />
        <Route path="/scenarios/:id/configure" element={<ScenarioConfig />} />
        <Route path="/scenarios/:id/session" element={<PracticeSession />} />
        <Route path="/scenarios/:id/summary" element={<SessionSummary />} />
        <Route path="/profile" element={<LearnerProfile />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
