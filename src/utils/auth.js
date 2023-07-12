import React, { useState } from "react"
import { auth, googleProvider } from "../utils/firebase-config"
import {createUserWithEmailAndPassword, signInWithPopup, signOut} from "firebase/auth"

export const Auth = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const SignIn = async () => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // Signed in 
            const user = userCredential.user;
            console.log(user)
            // ...
          } catch (error) {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage)
            // ..
          }
    }

    const SignInWithGoogle = async () => {
        try {
            const userCredential = await signInWithPopup(auth, googleProvider);
            // Signed in
            const user = userCredential.user;
            console.log(user)
            // ...
        } catch (error) {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage)
            // ..
          }
    }

    const Logout = async () => {
        try {
            await signOut(auth);
            console.log("Signed Out")
            // Sign-out successful.
            } catch (error) {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode, errorMessage)
            }
    }

    return (
        <div>
            <h1>Auth</h1>
            <input placeholder="Email.." onChange={(e) => setEmail(e.target.value)}/>
            <input placeholder="password" onChange={(e) => setPassword(e.target.value)}/>
      <button onClick={SignIn}>Sign In</button>  
      <br />  
      <button onClick={SignInWithGoogle}>Sign In with Google</button>
      <br />  
      <button onClick={Logout}>Logout</button>



        </div>
    )
}