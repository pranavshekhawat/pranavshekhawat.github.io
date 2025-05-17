<<<<<<< HEAD
import React, { useState, useEffect } from "react";
import { auth, googleProvider, db } from "../utils/firebase-config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";

import { doc, setDoc, updateDoc } from "firebase/firestore";
import "../css/auth.css";

export const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [authOption, setAuthOption] = useState("login"); // "login", "signup"
  const [signedIn, setSignedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [editingUserName, setEditingUserName] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setSignedIn(true);
        setUserName(user.displayName || ""); // Set user name if available
      } else {
        setSignedIn(false);
        setUserName("");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignUp = async () => {
    setLoading(true);
    setErrorMessage("");

    if (userName.trim() === "") {
      setErrorMessage("Please enter your name.");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log(user);

      // Store user information in Firestore collection
      const usersRef = doc(db, "users", user.uid);
      await setDoc(usersRef, { userName: userName, userId: user.uid });

      await updateProfile(user, { displayName: userName });
      setUserName(userName);
      setSignedIn(true);
    } catch (error) {
      if (error.code === "auth/provider-already-linked") {
        // User already signed up with Google, try signing in instead
        handleSignInWithGoogle();
        return;
      }

      const errorCode = error.code;
      let errorMessage = error.message;

      if (errorCode === "auth/invalid-email") {
        errorMessage = "Invalid email address. Please enter a valid email.";
      }
      if (errorCode === "auth/network-request-failed") {
        errorMessage = "Check your internet connection and try again.";}

        if (errorCode === "auth/missing-password") {
          errorMessage = "Enter a password to sign up.";

      } else if (errorCode === "auth/email-already-in-use") {
        errorMessage =
          "Email address is already in use. Please use a different email.";
      }

      console.log("Signup Error:", errorCode, errorMessage);
      setErrorMessage(errorMessage);
    }

    setLoading(false);
  };

  const handleLogin = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log(user);
      setUserName(user.displayName || "");
      setSignedIn(true);
    } catch (error) {
      const errorCode = error.code;
      let errorMessage = error.message;

      if (errorCode === "auth/wrong-password") {
        errorMessage =
          "Wrong password. Please check your password and try again.";
      }

      if (errorCode === "auth/invalid-email") {
        errorMessage =
          "Invalid email. Please check your email address and try again.";
      }

      if (errorCode === "auth/user-not-found") {
        errorMessage =
          "No user found with this email. Please check your email address and try again.";
      }

      if (errorCode === "auth/network-request-failed") {
        errorMessage = "Check your internet connection and try again.";
      }

      console.log("Login Error:", errorCode, errorMessage);
      setErrorMessage(errorMessage);
    }

    setLoading(false);
  };

  const handleSignInWithGoogle = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;
      console.log(user);

      if (user.displayName) {
        // Store user information in Firestore collection
        const usersRef = doc(db, "users", user.uid);
        await setDoc(usersRef, {
          userName: user.displayName,
          userId: user.uid,
        });
      }

      setSignedIn(true);
    } catch (error) {
      const errorMessage = "Failed to sign in with Google. Please try again.";
      console.log(errorMessage);
      setErrorMessage(errorMessage);
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      await signOut(auth);
      console.log("Signed Out");
      setSignedIn(false);
      setUserName("");
      setAuthOption("login");
    } catch (error) {
      const errorMessage = "Failed to sign out. Please try again.";
      console.log(errorMessage);
      setErrorMessage(errorMessage);
    }

    setLoading(false);
  };

  const handlePasswordReset = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      await sendPasswordResetEmail(auth, email);
      console.log("Password reset email sent");
      setErrorMessage(
        "Password reset email has been sent to your email address."
      );
    } catch (error) {
      const errorCode = error.code;
      let errorMessage = error.message;

      if (errorCode === "auth/invalid-email") {
        errorMessage =
          "Email address not found. Please enter a registered email address.";
      }

      if (errorCode === "auth/missing-email") {
        errorMessage =
          "Please enter your email address to receive the password reset link.";
      }

      console.log("Password Reset Error:", errorCode, errorMessage);
      setErrorMessage(errorMessage);
    }

    setLoading(false);
  };

  const handleAuthOptionChange = (option) => {
    setAuthOption(option);
    if (errorMessage !== "") {
      setErrorMessage(""); // Clear the error message
    }
  };

  const handleUpdateUserName = async () => {
    setLoading(true);
    setErrorMessage("");

    if (newUserName === "") {
      setErrorMessage("Please enter a name.");
      setLoading(false);
      return;
    }

    try {
      await updateProfile(auth.currentUser, { displayName: newUserName });
      // Update user name in Firestore collection
      const usersRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(usersRef, { userName: newUserName });

      console.log("User profile updated successfully");
      setUserName(newUserName);
      setEditingUserName(false);
    } catch (error) {
      // Handle error
      console.error("Error updating user name:", error);
      setErrorMessage("Failed to update user name. Please try again.");
    }

    setLoading(false);
    setNewUserName("");
  };

  const renderLoginForm = () => {
    return (
      <div>
        {/* <h1>Login</h1> */}
        {/* <br /> */}
        New user?{" "}
        <button
          className="linkbtn"
          onClick={() => handleAuthOptionChange("signup")}
        >
          Sign up here.
        </button>
        <br />
        <br />
        <br />
        <p className="inputtag">Email address</p>
        <input
          className="inputstyle"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <br />
        <p className="inputtag">Password</p>
        <input
          className="inputstyle"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <br />
        {errorMessage && <p>{errorMessage}</p>}
        {loading && <div>Loading...</div>}
        <br />
        <button className="bigbtn" onClick={handleLogin} disabled={loading}>
          Log In
        </button>
        &nbsp; &nbsp;
        <button
          className="bigbtn"
          onClick={handleSignInWithGoogle}
          disabled={loading}
        >
          <svg className="googlelogo" viewBox="0 0 48 48">
            <clipPath id="g">
              <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" />
            </clipPath>
            <g class="colors" clip-path="url(#g)">
              <path fill="#FBBC05" d="M0 37V11l17 13z" />
              <path fill="#EA4335" d="M0 11l17 13 7-6.1L48 14V0H0z" />
              <path fill="#34A853" d="M0 37l30-23 7.9 1L48 0v48H0z" />
              <path fill="#4285F4" d="M48 48L17 24l-4-3 35-10z" />
            </g>
          </svg>{" "}
          Continue with Google
        </button>
        {/* <br /> */}
      </div>
    );
  };

  const renderSignUpForm = () => {
    return (
      <div>
        <br />
        {/* <h1>Sign Up</h1> */}
        Don't worry, signing up simply authenticates your interactions with the
        webpage. We won't spam your inbox.
        <br />
        <br />
        <br />
        <p className="inputtag">Full name</p>
        <input
          className="inputstyle"
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <br />
        <br />
        <p className="inputtag">Email address</p>
        <input
          className="inputstyle"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <br />
        <p className="inputtag">Password</p>
        <input
          className="inputstyle"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <br />
        {errorMessage && <p>{errorMessage}</p>}{loading && <div>Loading...</div>}
        <br />
        <button className="bigbtn" onClick={handleSignUp} disabled={loading}>
          Sign Up
        </button>
        &nbsp; &nbsp;
        <button
          className="bigbtn"
          onClick={handleSignInWithGoogle}
          disabled={loading}
        >
         <svg className="googlelogo" viewBox="0 0 48 48">
            <clipPath id="g">
              <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" />
            </clipPath>
            <g class="colors" clip-path="url(#g)">
              <path fill="#FBBC05" d="M0 37V11l17 13z" />
              <path fill="#EA4335" d="M0 11l17 13 7-6.1L48 14V0H0z" />
              <path fill="#34A853" d="M0 37l30-23 7.9 1L48 0v48H0z" />
              <path fill="#4285F4" d="M48 48L17 24l-4-3 35-10z" />
            </g>
          </svg>{" "} Sign Up with Google
        </button>
        <br />
        <br />
        <button
          className="linkbtn"
          onClick={() => handleAuthOptionChange("login")}
        >
          &#60;&#60; Back to Login
        </button>
        
      </div>
    );
  };

  return (
    <div className=" grid_container_25">
      <div className="colstart2 colend25">
        {/* <br /> */}

        {signedIn ? (
          <div className="signinitems">
            <br />

            <h1>Welcome, {userName || "User"}!</h1>
            <br />
           
            <button className="bigbtn" onClick={handleLogout} disabled={loading}>
              Logout
            </button>
           &nbsp;&nbsp;
            {!editingUserName && (
              <button className="bigbtn" onClick={() => setEditingUserName(true)}>
                Edit Your Name
              </button>
            )}
            {editingUserName && (
              <div>
                <br />
                <input
                  className="newnameinput"
                  type="text"
                  placeholder="Enter new name.."
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                />
                <br />

                {errorMessage && <p>{errorMessage}</p>}
                <br />
                <button className="bigbtn" onClick={handleUpdateUserName} disabled={loading}>
                  Save
                </button>
                &nbsp;
                &nbsp;
                <button className="bigbtn"
                  onClick={() => {
                    setEditingUserName(false);
                    setNewUserName("");
                    setErrorMessage("");
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="signinitems">
            {authOption === "signup" && <div>{renderSignUpForm()}</div>}
            {authOption === "login" && (
              <div>
                {renderLoginForm()}
                <br />
                <span className="inputtag">
                  {" "}
                  Forgot passowrd?{" "}
                  <button
                    className="resetpasswordbtn"
                    onClick={handlePasswordReset}
                  >
                    Send reset link
                  </button>{" "}
                  to the your email.
                </span>
              </div>
            )}
          </div>
        )}
        {/* <br /> */}
        {/* <br /> */}
      </div>
    </div>
  );
};
=======
import React, { useState, useEffect } from "react";
import { auth, googleProvider, db } from "../utils/firebase-config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";

import { doc, setDoc, updateDoc } from "firebase/firestore";
import "../css/auth.css";

export const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [authOption, setAuthOption] = useState("login"); // "login", "signup"
  const [signedIn, setSignedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [editingUserName, setEditingUserName] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setSignedIn(true);
        setUserName(user.displayName || ""); // Set user name if available
      } else {
        setSignedIn(false);
        setUserName("");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignUp = async () => {
    setLoading(true);
    setErrorMessage("");

    if (userName.trim() === "") {
      setErrorMessage("Please enter your name.");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log(user);

      // Store user information in Firestore collection
      const usersRef = doc(db, "users", user.uid);
      await setDoc(usersRef, { userName: userName, userId: user.uid });

      await updateProfile(user, { displayName: userName });
      setUserName(userName);
      setSignedIn(true);
    } catch (error) {
      if (error.code === "auth/provider-already-linked") {
        // User already signed up with Google, try signing in instead
        handleSignInWithGoogle();
        return;
      }

      const errorCode = error.code;
      let errorMessage = error.message;

      if (errorCode === "auth/invalid-email") {
        errorMessage = "Invalid email address. Please enter a valid email.";
      }
      if (errorCode === "auth/network-request-failed") {
        errorMessage = "Check your internet connection and try again.";}

        if (errorCode === "auth/missing-password") {
          errorMessage = "Enter a password to sign up.";

      } else if (errorCode === "auth/email-already-in-use") {
        errorMessage =
          "Email address is already in use. Please use a different email.";
      }

      console.log("Signup Error:", errorCode, errorMessage);
      setErrorMessage(errorMessage);
    }

    setLoading(false);
  };

  const handleLogin = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log(user);
      setUserName(user.displayName || "");
      setSignedIn(true);
    } catch (error) {
      const errorCode = error.code;
      let errorMessage = error.message;

      if (errorCode === "auth/wrong-password") {
        errorMessage =
          "Wrong password. Please check your password and try again.";
      }

      if (errorCode === "auth/invalid-email") {
        errorMessage =
          "Invalid email. Please check your email address and try again.";
      }

      if (errorCode === "auth/user-not-found") {
        errorMessage =
          "No user found with this email. Please check your email address and try again.";
      }

      if (errorCode === "auth/network-request-failed") {
        errorMessage = "Check your internet connection and try again.";
      }

      console.log("Login Error:", errorCode, errorMessage);
      setErrorMessage(errorMessage);
    }

    setLoading(false);
  };

  const handleSignInWithGoogle = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;
      console.log(user);

      if (user.displayName) {
        // Store user information in Firestore collection
        const usersRef = doc(db, "users", user.uid);
        await setDoc(usersRef, {
          userName: user.displayName,
          userId: user.uid,
        });
      }

      setSignedIn(true);
    } catch (error) {
      const errorMessage = "Failed to sign in with Google. Please try again.";
      console.log(errorMessage);
      setErrorMessage(errorMessage);
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      await signOut(auth);
      console.log("Signed Out");
      setSignedIn(false);
      setUserName("");
      setAuthOption("login");
    } catch (error) {
      const errorMessage = "Failed to sign out. Please try again.";
      console.log(errorMessage);
      setErrorMessage(errorMessage);
    }

    setLoading(false);
  };

  const handlePasswordReset = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      await sendPasswordResetEmail(auth, email);
      console.log("Password reset email sent");
      setErrorMessage(
        "Password reset email has been sent to your email address."
      );
    } catch (error) {
      const errorCode = error.code;
      let errorMessage = error.message;

      if (errorCode === "auth/invalid-email") {
        errorMessage =
          "Email address not found. Please enter a registered email address.";
      }

      if (errorCode === "auth/missing-email") {
        errorMessage =
          "Please enter your email address to receive the password reset link.";
      }

      console.log("Password Reset Error:", errorCode, errorMessage);
      setErrorMessage(errorMessage);
    }

    setLoading(false);
  };

  const handleAuthOptionChange = (option) => {
    setAuthOption(option);
    if (errorMessage !== "") {
      setErrorMessage(""); // Clear the error message
    }
  };

  const handleUpdateUserName = async () => {
    setLoading(true);
    setErrorMessage("");

    if (newUserName === "") {
      setErrorMessage("Please enter a name.");
      setLoading(false);
      return;
    }

    try {
      await updateProfile(auth.currentUser, { displayName: newUserName });
      // Update user name in Firestore collection
      const usersRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(usersRef, { userName: newUserName });

      console.log("User profile updated successfully");
      setUserName(newUserName);
      setEditingUserName(false);
    } catch (error) {
      // Handle error
      console.error("Error updating user name:", error);
      setErrorMessage("Failed to update user name. Please try again.");
    }

    setLoading(false);
    setNewUserName("");
  };

  const renderLoginForm = () => {
    return (
      <div>
        {/* <h1>Login</h1> */}
        {/* <br /> */}
        New user?{" "}
        <button
          className="linkbtn"
          onClick={() => handleAuthOptionChange("signup")}
        >
          Sign up here.
        </button>
        <br />
        <br />
        <br />
        <p className="inputtag">Email address</p>
        <input
          className="inputstyle"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <br />
        <p className="inputtag">Password</p>
        <input
          className="inputstyle"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <br />
        {errorMessage && <p>{errorMessage}</p>}
        {loading && <div>Loading...</div>}
        <br />
        <button className="bigbtn" onClick={handleLogin} disabled={loading}>
          Log In
        </button>
        &nbsp; &nbsp;
        <button
          className="bigbtn"
          onClick={handleSignInWithGoogle}
          disabled={loading}
        >
          <svg className="googlelogo" viewBox="0 0 48 48">
            <clipPath id="g">
              <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" />
            </clipPath>
            <g class="colors" clip-path="url(#g)">
              <path fill="#FBBC05" d="M0 37V11l17 13z" />
              <path fill="#EA4335" d="M0 11l17 13 7-6.1L48 14V0H0z" />
              <path fill="#34A853" d="M0 37l30-23 7.9 1L48 0v48H0z" />
              <path fill="#4285F4" d="M48 48L17 24l-4-3 35-10z" />
            </g>
          </svg>{" "}
          Continue with Google
        </button>
        {/* <br /> */}
      </div>
    );
  };

  const renderSignUpForm = () => {
    return (
      <div>
        <br />
        {/* <h1>Sign Up</h1> */}
        Don't worry, signing up simply authenticates your interactions with the
        webpage. We won't spam your inbox.
        <br />
        <br />
        <br />
        <p className="inputtag">Full name</p>
        <input
          className="inputstyle"
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <br />
        <br />
        <p className="inputtag">Email address</p>
        <input
          className="inputstyle"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <br />
        <p className="inputtag">Password</p>
        <input
          className="inputstyle"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <br />
        {errorMessage && <p>{errorMessage}</p>}{loading && <div>Loading...</div>}
        <br />
        <button className="bigbtn" onClick={handleSignUp} disabled={loading}>
          Sign Up
        </button>
        &nbsp; &nbsp;
        <button
          className="bigbtn"
          onClick={handleSignInWithGoogle}
          disabled={loading}
        >
         <svg className="googlelogo" viewBox="0 0 48 48">
            <clipPath id="g">
              <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" />
            </clipPath>
            <g class="colors" clip-path="url(#g)">
              <path fill="#FBBC05" d="M0 37V11l17 13z" />
              <path fill="#EA4335" d="M0 11l17 13 7-6.1L48 14V0H0z" />
              <path fill="#34A853" d="M0 37l30-23 7.9 1L48 0v48H0z" />
              <path fill="#4285F4" d="M48 48L17 24l-4-3 35-10z" />
            </g>
          </svg>{" "} Sign Up with Google
        </button>
        <br />
        <br />
        <button
          className="linkbtn"
          onClick={() => handleAuthOptionChange("login")}
        >
          &#60;&#60; Back to Login
        </button>
        
      </div>
    );
  };

  return (
    <div className=" grid_container_25">
      <div className="colstart2 colend25">
        {/* <br /> */}

        {signedIn ? (
          <div className="signinitems">
            <br />

            <h1>Welcome, {userName || "User"}!</h1>
            <br />
           
            <button className="bigbtn" onClick={handleLogout} disabled={loading}>
              Logout
            </button>
           &nbsp;&nbsp;
            {!editingUserName && (
              <button className="bigbtn" onClick={() => setEditingUserName(true)}>
                Edit Your Name
              </button>
            )}
            {editingUserName && (
              <div>
                <br />
                <input
                  className="newnameinput"
                  type="text"
                  placeholder="Enter new name.."
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                />
                <br />

                {errorMessage && <p>{errorMessage}</p>}
                <br />
                <button className="bigbtn" onClick={handleUpdateUserName} disabled={loading}>
                  Save
                </button>
                &nbsp;
                &nbsp;
                <button className="bigbtn"
                  onClick={() => {
                    setEditingUserName(false);
                    setNewUserName("");
                    setErrorMessage("");
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="signinitems">
            {authOption === "signup" && <div>{renderSignUpForm()}</div>}
            {authOption === "login" && (
              <div>
                {renderLoginForm()}
                <br />
                <span className="inputtag">
                  {" "}
                  Forgot passowrd?{" "}
                  <button
                    className="resetpasswordbtn"
                    onClick={handlePasswordReset}
                  >
                    Send reset link
                  </button>{" "}
                  to the your email.
                </span>
              </div>
            )}
          </div>
        )}
        {/* <br /> */}
        {/* <br /> */}
      </div>
    </div>
  );
};
>>>>>>> b4b4bc20d0426045ab9c3733a0f91ede447c11c5
