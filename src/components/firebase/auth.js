



import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from './firebase'; // Adjust the path as necessary

export const signUpWithEmailAndPassword = (email, password) => {
  // Validate if the email is a valid Gmail account
  if (!email.endsWith('@gmail.com')) {
    throw new Error("Please use a valid Gmail account.");
  }

  // Create a new user with email and password
  return createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Successfully created new user
      const user = userCredential.user;
      console.log('User signed up:', user);

      // Send email verification
      return sendEmailVerification(user).then(() => {
        console.log('Verification email sent to:', user.email);
        return user;
      });
    })
    .catch((error) => {
      // Handle errors here
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(`Error [${errorCode}]: ${errorMessage}`);;
      throw error;
    });
};


