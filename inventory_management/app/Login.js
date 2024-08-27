import React, { useState, useEffect } from 'react';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase';
import { TextField, Button, Box, Typography } from '@mui/material';

// Initialize the Google provider
const provider = new GoogleAuthProvider();

export default function Auth() {
  const [user, setUser] = useState(null);

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error("Error during Google Sign-In:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  // Monitor auth state and update user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
    return unsubscribe;
  }, []);

  if (!user) {
    return (
      <div>
        <button onClick={handleGoogleSignIn}>Sign in with Google</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Welcome, {user.displayName}</h1>
      <button onClick={handleLogout}>Logout</button>
      {/* Rest of your app here */}
    </div>
  );
}

