import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from './utils/firebase-config';
import { onAuthStateChanged } from 'firebase/auth';

const AdminRoute = ({ element }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email.toLowerCase() === "pranavshekhawat.nift@gmail.com") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAdmin ? element : <Navigate to="/" replace />;
};

export default AdminRoute;
