import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import { getUserProfile, logout } from './lib/auth';
import { UserProfile, UserRole } from './types';

// Layouts
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';

// Pages (to be created)
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Report from './pages/Report';
import Medical from './pages/Medical';
import Dispatch from './pages/Dispatch';
import IncidentDetail from './pages/IncidentDetail';

interface ProtectedRouteProps {
  user: User | null;
  profile: UserProfile | null;
  allowedRoles?: UserRole[];
  children: React.ReactNode;
}

function ProtectedRoute({ user, profile, allowedRoles, children }: ProtectedRouteProps) {
  if (!user) return <Navigate to="/" />;
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/dashboard" />;
  }
  return <>{children}</>;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userProfile = await getUserProfile(firebaseUser.uid);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-bg-void">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-display animate-pulse">Initializing Gemini Bridge...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Router>
      <div className="flex min-h-screen bg-bg-base">
        {user && <Sidebar role={profile?.role} onLogout={handleLogout} />}
        
        <main className="flex-1 flex flex-col min-w-0">
          {user && <Navbar user={profile} />}
          
          <div className={user ? "p-8" : ""}>
            <Routes>
              <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
              
              <Route path="/dashboard" element={
                <ProtectedRoute user={user} profile={profile} allowedRoles={[UserRole.RESPONDER, UserRole.ADMIN]}>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/report" element={
                <ProtectedRoute user={user} profile={profile}>
                  <Report />
                </ProtectedRoute>
              } />
              
              <Route path="/medical" element={
                <ProtectedRoute user={user} profile={profile} allowedRoles={[UserRole.NURSE, UserRole.ADMIN]}>
                  <Medical />
                </ProtectedRoute>
              } />
              
              <Route path="/dispatch" element={
                <ProtectedRoute user={user} profile={profile} allowedRoles={[UserRole.RESPONDER, UserRole.ADMIN]}>
                  <Dispatch />
                </ProtectedRoute>
              } />
              
              <Route path="/incident/:id" element={
                <ProtectedRoute user={user} profile={profile}>
                  <IncidentDetail />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}
