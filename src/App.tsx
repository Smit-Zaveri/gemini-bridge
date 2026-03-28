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
        try {
          const userProfile = await getUserProfile(firebaseUser.uid);
          if (userProfile) {
            setProfile(userProfile);
          } else {
            // User exists in Auth but not in Firestore — build a fallback profile
            setProfile({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || undefined,
              role: UserRole.CIVILIAN,
              createdAt: new Date().toISOString(),
            });
          }
        } catch (error: any) {
          // Firestore may be offline — build fallback profile from Auth data
          const isOffline =
            error?.code === 'unavailable' ||
            (error?.message ?? '').toLowerCase().includes('offline');
          if (!isOffline) {
            console.error('Failed to load user profile:', error);
          }
          // Still set a usable profile so UI isn't broken
          setProfile({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || undefined,
            role: UserRole.CIVILIAN,
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-bg-base">
        <div className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-brand-primary border-8 border-text-main shadow-[12px_12px_0px_0px_#1C293C] animate-spin flex items-center justify-center">
            <div className="w-8 h-8 bg-bg-surface border-4 border-text-main shadow-[4px_4px_0px_0px_#1C293C]"></div>
          </div>
          <p className="text-text-main font-display font-black text-xl tracking-widest uppercase border-4 border-text-main px-6 py-2 bg-bg-surface shadow-[6px_6px_0px_0px_#1C293C] animate-pulse">Initializing Bridge</p>
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
          {user && <Navbar user={profile} firebaseUser={user} />}
          
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
