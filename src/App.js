import React, { useRef, useState } from "react";
import "./App.css";

import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import "firebase/compat/analytics";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

// Import CopilotKit components and styles
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import { CopilotTextarea } from "@copilotkit/react-textarea";

firebase.initializeApp({
  // Firebase config
  apiKey: "AIzaSyCdZO6DWKU_MdOC06zxg8HOorlfMYtEov4",
  authDomain: "madeup-a14d5.firebaseapp.com",
  databaseURL:
    "https://madeup-a14d5-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "madeup-a14d5",
  storageBucket: "madeup-a14d5.appspot.com",
  messagingSenderId: "116187214309",
  appId: "1:116187214309:web:d13a17a89c47428984ff0c",
  measurementId: "G-W4SXXYTKZK",
});

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>Convo</h1>
        <SignOut />
      </header>
      <div className="Column-Container">
        <div className="Column">
          <section>{user ? <ChatRoom /> : <SignIn />}</section>
        </div>
        <div className="Column">
          <CopilotKit publicApiKey="YOUR_PUBLIC_API_KEY">
            <CopilotSidebar>
              <CopilotTextarea
                autosuggestionsConfig={{
                  textareaPurpose: "Chatbot for answering questions",
                  chatApiConfigs: {
                    suggestionsApiConfig: {
                      forwardedParams: {
                        max_tokens: 25,
                        stop: ["\n", ".", ","],
                      },
                    },
                  },
                }}
              />
            </CopilotSidebar>
          </CopilotKit>
        </div>
      </div>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <div className="SignIn">
<p>
        Convo is a chat application designed to facilitate seamless
        communication among users.
      </p>
      <p>
        One of its standout features is its integrated chatbot powered by
        CopilotKit.
      </p>
      <button className="sign-in" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
    </div>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        Sign Out
      </button>
    )
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt").limit(25);

  const [messages] = useCollectionData(query, { idField: "id" });

  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}

        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="say something nice"
        />

        <button type="submit" disabled={!formValue}>
          🕊️
        </button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <>
      <div className={`message ${messageClass}`}>
        <img
          src={
            photoURL || "https://api.adorable.io/avatars/23/abott@adorable.png"
          }
        />
        <p>{text}</p>
      </div>
    </>
  );
}

export default App;
