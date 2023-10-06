import { createSignal } from "solid-js";
// import { initializeApp } from "firebase/app";

import PasswordInput from "./PasswordInput";
import UploadButton from "./UploadButton";
import DownloadButton from "./DownloadButton";
import "./App.css";

// const firebaseConfig = {
//  apiKey: "AIzaSyD6wNVZGxuhDufqu44JSAwIPoyggaqIDd8",
//  authDomain: "noDownload-34fe7.firebaseapp.com",
//  projectId: "noDownload-34fe7",
//  storageBucket: "noDownload-34fe7.appspot.com",
//  messagingSenderId: "105432555108",
//  appId: "1:105432555108:web:1f179689d677210fb0c971"
// };

export default function App() {
	// const firebaseApp = initializeApp(firebaseConfig);
	const [password, setPassword] = createSignal(Array(24).fill(null));

	function uploadBlobs(files: File[]) {

	}

	function downloadBlobs() {

	}

	return <>
		<PasswordInput password={password} setPassword={setPassword}></PasswordInput>
		<div class="button-section ">
			<DownloadButton onClick={downloadBlobs}></DownloadButton>
			<UploadButton onClick={uploadBlobs}></UploadButton>
		</div>
	</>
}