import * as firebase from 'firebase';

var firebaseConfig = {
    apiKey: "AIzaSyD6UY7KVsCAW7FCAw_ALUhjUOQLJNcj4TA",
    authDomain: "hackathon-5c5a7.firebaseapp.com",
    databaseURL: "https://hackathon-5c5a7.firebaseio.com",
    projectId: "hackathon-5c5a7",
    storageBucket: "hackathon-5c5a7.appspot.com",
    messagingSenderId: "65537485260",
    appId: "1:65537485260:web:895e581325d7ddf8db5569",
    measurementId: "G-8QNR616MK0"
  };

  var database = firebase.initializeApp(firebaseConfig);

  export default database;