import { Route, Routes, Navigate } from "react-router-dom";
import Layout from "../components/Layout";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Analyze from "../pages/Analyze";
import JobStatus from "../pages/JobStatus";
import NotFound from "../pages/NotFound";
import History from "../pages/History";
import Summary from "../pages/Summary";
import Leaders from "../pages/Leaders";
import Trends from "../pages/Trends";
import { useAuth } from "../auth/AuthContext";

const Protected = ({ children }) => {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AppRouter = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/analyze"
          element={
            <Protected>
              <Analyze />
            </Protected>
          }
        />
        <Route
          path="/jobs/:jobId"
          element={
            <Protected>
              <JobStatus />
            </Protected>
          }
        />
        <Route
          path="/history"
          element={
            <Protected>
              <History />
            </Protected>
          }
        />
        <Route
          path="/summary"
          element={
            <Protected>
              <Summary />
            </Protected>
          }
        />
        <Route
          path="/leaders"
          element={
            <Protected>
              <Leaders />
            </Protected>
          }
        />
        <Route
          path="/trends"
          element={
            <Protected>
              <Trends />
            </Protected>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

export default AppRouter;
