import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';

export const checkUserDetails = () => {
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('User is logged in:', user.email);
      } else {
        console.log('No user is logged in');
      }
    });
  }, []);
};
