// Import stylesheets
import './style.css';
// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase/app";

// Add the Firebase products that you want to use
import "firebase/auth";
import "firebase/firestore";

import * as firebaseui from 'firebaseui';

// Document elements
const startRsvpButton = document.getElementById('startRsvp');
const guestbookContainer = document.getElementById('guestbook-container');

const form = document.getElementById('leave-message');
const input = document.getElementById('message');
const guestbook = document.getElementById('guestbook');
const numberAttending = document.getElementById('number-attending');
const rsvpYes = document.getElementById('rsvp-yes');
const rsvpNo = document.getElementById('rsvp-no');

var rsvpListener = null;
var guestbookListener = null;

async function main() {

  // Add Firebase project configuration object here
  var firebaseConfig = {
  
    apiKey: "AIzaSyB_s-PuNOWscZ_Ge7N6GT22rEs27ZgrIrI",
    authDomain: "fir-web-codelab-54bef.firebaseapp.com",
    databaseURL: "https://fir-web-codelab-54bef.firebaseio.com",
    projectId: "fir-web-codelab-54bef",
    storageBucket: "fir-web-codelab-54bef.appspot.com",
    messagingSenderId: "297860157811",
    appId: "1:297860157811:web:f7efd48c6e46844c84f506",
    measurementId: "G-6CG4BDHV6N"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  //firebase.analytics();

  // firebase.initializeApp(firebaseConfig);

  // FirebaseUI config
  const uiConfig = {
    credentialHelper: firebaseui.auth.CredentialHelper.NONE,
    signInOptions: [
      // Email / Password Provider.
      firebase.auth.EmailAuthProvider.PROVIDER_ID
    ],
    callbacks: {
      signInSuccessWithAuthResult: function(authResult, redirectUrl) {
        // Handle sign-in.
        // Return false to avoid redirect.
        return false;
      }
    }
  };

  //Initialize the FirebaseUI widget using Firebase
  const ui = new firebaseui.auth.AuthUI(firebase.auth());

  //Listen to RSVP button clicks
  startRsvpButton.addEventListener("click", ()=>{
    if(firebase.auth().currentUser){
      //If a user has signed in, clicking this button will allow the user to sign out
      firebase.auth().signOut();
    } else {
      ui.start("#firebaseui-auth-container",uiConfig);
    }
  });

  firebase.auth().onAuthStateChanged((user) => {
    if(user){
      startRsvpButton.textContent = "LOGOUT";
      guestbookContainer.style.display = "block";
      subscribeGuestbook();
      subscribeCurrentRSVP(user);
    }
    else {
      startRsvpButton.textContent = "RSVP";
      guestbookContainer.style.display = "none";
      unsubscribeGuestbook();
      unsubscribeCurrentRSVP();
    }
  });

  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    firebase.firestore().collection("guestbook").add({
      text: input.value, 
      timestamp: Date.now(),
      name: firebase.auth().currentUser.displayName,
      userId:firebase.auth().currentUser.uid
    })

    input.value = "";

    return false;
  });

  //Listens to guestbook updates
  function subscribeGuestbook(){
    firebase.firestore().collection("guestbook").orderBy("timestamp", "desc")
    .onSnapshot((snaps) =>{
      guestbook.innerHTML ="";
      snaps.forEach((doc)=>{
        const entry = document.createElement("p");
        entry.textContent = doc.data().name+":"+doc.data().text;
        guestbook.appendChild(entry);
      });
    });
  };

  //Unsubscribe from guestbook updates
  function unsubscribeGuestbook(){
    if(guestbookListener != null){
      guestbookListener();
      guestbookListener = null;
    }
  };

  //Listen to RSVP responses
  rsvpYes.onclick=()=>{
    const userDoc =
      firebase.firestore().collection('attendees').doc(firebase.auth().currentUser.uid);
    
    userDoc.set({
      attending: true
    }).catch(console.error)
  }
  rsvpNo.onclick=()=>{
    const userDoc=
    firebase.firestore().collection('attendees').doc(firebase.auth().currentUser.uid);

    userDoc.set({
      attending: false
    }).catch(console.error)
  }

  //Listen for attendee list
  
  firebase.firestore().collection('attendees')
  .where("attending", "==", true)
  .onSnapshot(snap=>{
    const newAttendeeCount = snap.docs.length;

    numberAttending.innerHTML = newAttendeeCount+'people going';
  })

  function subscribeCurrentRSVP(user){
    rsvpListener =  firebase.firestore().collection('attendees')
    .doc(user.uid)
    .onSnapshot((doc)=>{
      if(doc && doc.data()){
        const attendingResponse = doc.data().attending;

        if(attendingResponse){
          rsvpYes.className="clicked";
          rsvpNo.className="";
        }
        else{
          rsvpYes.className ="";
          rsvpNo.className="clicked";
        }
      }
    });
  }

  function unsubscribeCurrentRSVP(){
    if(rsvpListener != null){
      rsvpListner();
      rsvpListner = null;
    }
    rsvpYes.className="";
    rsvpNo.className="";
  }
}
main();

