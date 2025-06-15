import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AuthComponent from './components/AuthComponent';
import QuizDashboard from './components/QuizDashboard';
import { AuthProvider } from './contexts/AuthContext';
import { FirebaseProvider } from './contexts/FirebaseContext';

// Firebase configuration - Replace with your actual config
const firebaseConfig = {
  apiKey: "AIzaSyD0MkcbzP4ygxaVgTxJckNP42J4YqvxFy0",
  authDomain: "login-56fda.firebaseapp.com",
  projectId: "login-56fda",
  storageBucket:"login-56fda.firebasestorage.app", 
  messagingSenderId: "21549012582",
  appId: "1:21549012582:web:93c4020cfbc6741a877fa7",
  measurementId: "G-SVNXXJ2N4T",

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <FirebaseProvider auth={auth} db={db}>
      <AuthProvider>
        <div className="min-h-screen">
          {user ? <QuizDashboard /> : <AuthComponent />}
        </div>
      </AuthProvider>
    </FirebaseProvider>
  );
}

export default App;