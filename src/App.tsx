// import { initializeApp } from "firebase/app";

import PasswordInput from "./PasswordInput";
import LockButton from "./LockButton";
import OpenButton from "./OpenButton";
import "./App.css";

// const firebaseConfig = {
//  apiKey: "AIzaSyD6wNVZGxuhDufqu44JSAwIPoyggaqIDd8",
//  authDomain: "noOpen-34fe7.firebaseapp.com",
//  projectId: "noOpen-34fe7",
//  storageBucket: "noOpen-34fe7.appspot.com",
//  messagingSenderId: "105432555108",
//  appId: "1:105432555108:web:1f179689d677210fb0c971"
// };

// const firebaseApp = initializeApp(firebaseConfig);

export default function App() {
	return <>
		<PasswordInput></PasswordInput>
		<div class="button-section ">
			<OpenButton></OpenButton>
			<LockButton></LockButton>
		</div>
	</>
}