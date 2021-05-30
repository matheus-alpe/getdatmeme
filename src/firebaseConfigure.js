const firebase = require("firebase");
require("firebase/firestore");

let firebaseConfig = {
    apiKey: "AIzaSyCn8S_WhOQ13WIcXBmmN5jLXxlS-bhvDlw",
    authDomain: "getdatmeme-pb.firebaseapp.com",
    projectId: "getdatmeme-pb",
    storageBucket: "getdatmeme-pb.appspot.com",
    messagingSenderId: "128680410427",
    appId: "1:128680410427:web:087ab271db77c515f04b1e",
    measurementId: "G-JRG2VRKL9T"
};

// Initialize Firebase
if(!firebase.apps.length){
    firebase.initializeApp(firebaseConfig);
}

module.exports = {
    firebase
};