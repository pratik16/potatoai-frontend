import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './app/hooks';
import { AppLayout } from './components/layout/AppLayout';
import { AuthLayout } from './components/layout/AuthLayout';
import { Spinner } from './components/ui/Spinner';
import { isLocalDev } from './utils/env';

const LandingPage         = lazy(() => import('./pages/LandingPage'));
const LoginPage           = lazy(() => import('./pages/LoginPage'));
const RegisterPage        = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage  = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage   = lazy(() => import('./pages/ResetPasswordPage'));
const VerifyEmailPage     = lazy(() => import('./pages/VerifyEmailPage'));
const VerifyPage              = lazy(() => import('./pages/VerifyPage'));
const GithubOAuthCallbackPage = lazy(() => import('./pages/GithubOAuthCallbackPage'));
const SharedChatPage      = lazy(() => import('./pages/SharedChatPage'));
const PrivacyPolicyPage        = lazy(() => import('./pages/PrivacyPolicyPage'));
const DeleteAccountRequestPage = lazy(() => import('./pages/DeleteAccountRequestPage'));
const NewChatPage         = lazy(() => import('./pages/NewChatPage'));
const ChatPage            = lazy(() => import('./pages/ChatPage'));
const ProjectsPage        = lazy(() => import('./pages/ProjectsPage'));
const ProjectDetailPage   = lazy(() => import('./pages/ProjectDetailPage'));
const ProjectNewChatPage  = lazy(() => import('./pages/ProjectNewChatPage'));
const SettingsPage        = lazy(() => import('./pages/SettingsPage'));
const UsagePage           = lazy(() => import('./pages/UsagePage'));
const TeamAgentsPage = isLocalDev ? lazy(() => import('./pages/TeamAgentsPage')) : null;

function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicHome() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  return isAuthenticated ? <Navigate to="/chat/new" replace /> : <LandingPage />;
}

function Loading() {
  return (
    <div className="flex h-screen items-center justify-center bg-surface-0">
      <Spinner className="h-8 w-8" />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Public marketing home */}
        <Route path="/" element={<PublicHome />} />

        {/* Public auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/register"        element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password"  element={<ResetPasswordPage />} />
          <Route path="/verify-email"    element={<VerifyEmailPage />} />
          <Route path="/verify"          element={<VerifyPage />} />
        </Route>

        <Route path="/oauth/github/callback" element={<GithubOAuthCallbackPage />} />

        {/* Public shared chat */}
        <Route path="/shared/:token" element={<SharedChatPage />} />

        {/* Public legal */}
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/delete-account" element={<DeleteAccountRequestPage />} />

        {/* App routes */}
        <Route
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route path="/chat/new"        element={<NewChatPage />} />
          <Route path="/chat/:chatId"    element={<ChatPage />} />
          <Route path="/projects"             element={<ProjectsPage />} />
          <Route path="/projects/:id"         element={<ProjectDetailPage />} />
          <Route path="/projects/:id/new"     element={<ProjectNewChatPage />} />
          <Route path="/settings"        element={<SettingsPage />} />
          {isLocalDev && TeamAgentsPage && (
            <Route path="/team/agents" element={<TeamAgentsPage />} />
          )}
          <Route path="/usage"           element={<UsagePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
