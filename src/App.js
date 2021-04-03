import React, { useRef, useState } from 'react';
import logo from './logo.svg';
import './App.css';

//firebase sdk import
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';

//hooks
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  
})

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();

//main app function
function App() {
  //Check if user is logged in via a state hook
  const [user] = useAuthState(auth);

  //Check what {user ? <ChatRoom /> : <SignIn />} does
  return (
    <div className="App">
      <header className="App-header">
        
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
    
  );
}

//sign in function
function SignIn() {

  const signInWithGoogle = () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider);
  }

  return(
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  )
}

//sign out function
function SignOut() {
   return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign out</button>
   )
}

//chat room function
function ChatRoom() {

  const dummy = useRef();
  
  //grab messages from the database, sort and order by date time
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  //listen to data with a hook
  const [messages] = useCollectionData(query, {idField: 'id'});

  //add a stateful component? called formValue
  const [formValue, setFormValue] = useState('');

  //listen to onSubmit event and trigger event handler called sendMessage
  const sendMessage = async(e) => {
    e.preventDefault();

    const {uid, photoURL} = auth.currentUser;

    //write a new document to the firestore database
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    });

    setFormValue('');

    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  //wtf does map do? arrow function to create a chat message
  //Form with a button to submit a msg into the database
  return (
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

        <div ref={dummy}></div>
      </main>

      <form onSubmit={sendMessage}>

        <input value={formValue} onChange={(e) => setFormValue(e.target.value)}/>
        <button type="submit">Send</button>
        
      </form>
    </>
  )

}

//chat message component
function ChatMessage(props) {
  const {text, uid, photoURL} = props.message;

  //check if message belongs to a user
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
  //apply different styling if msg is sent or received
    <div className={`message ${messageClass}`}>
      <img src={photoURL} />
      <p>{text}</p>

    </div>
  )
   
  
}

export default App;
