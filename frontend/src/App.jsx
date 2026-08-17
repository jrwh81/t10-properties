import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import HomePage from "./pages/HomePage";
import PropertiesPage from "./pages/PropertiesPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import DestinationsPage from "./pages/DestinationsPage";
import DestinationDetailPage from "./pages/DestinationDetailPage";
import BlogPage from "./pages/BlogPage";
import BlogPostDetailPage from "./pages/BlogPostDetailPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AcceptInvitePage from "./pages/AcceptInvitePage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminPropertiesPage from "./pages/admin/AdminPropertiesPage";
import AdminDestinationsPage from "./pages/admin/AdminDestinationsPage";
import AdminBlogPostsPage from "./pages/admin/AdminBlogPostsPage";
import AdminInvitationsPage from "./pages/admin/AdminInvitationsPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/properties" element={<PropertiesPage />} />
        <Route path="/properties/:slug" element={<PropertyDetailPage />} />
        <Route path="/destinations" element={<DestinationsPage />} />
        <Route path="/destinations/:slug" element={<DestinationDetailPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/admin/accept-invite/:token" element={<AcceptInvitePage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="properties" replace />} />
          <Route path="properties" element={<AdminPropertiesPage />} />
          <Route path="destinations" element={<AdminDestinationsPage />} />
          <Route path="blog" element={<AdminBlogPostsPage />} />
          <Route path="admins" element={<AdminInvitationsPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}
