import { createSignal } from "solid-js";
import { initializeApp } from "firebase/app";
import { getStorage, list as listStorage, ref as storageRef, uploadBytes } from "firebase/storage";

import { filesToBuffer } from "./upload";

import PasswordInput from "./PasswordInput";
import UploadButton from "./UploadButton";
import DownloadButton from "./DownloadButton";
import "./App.css";

const firebaseConfig = {
	apiKey: "AIzaSyD6wNVZGxuhDufqu44JSAwIPoyggaqIDd8",
	authDomain: "noDownload-34fe7.firebaseapp.com",
	projectId: "noDownload-34fe7",
	storageBucket: "noDownload-34fe7.appspot.com",
	messagingSenderId: "105432555108",
	appId: "1:105432555108:web:1f179689d677210fb0c971"
};

export default function App() {
	const firebaseApp = initializeApp(firebaseConfig);
	const firebaseStorage = getStorage(firebaseApp);


	const [password, setPassword] = createSignal(Array(24).fill(null));

	async function uploadBlobs(files: File[]) {
		// find used ids
		const uploadFolderLocation = storageRef(firebaseStorage, "uploads");
		const usedIdSet = new Set(
			(await listStorage(uploadFolderLocation))
				.items.map(ref => Number(ref.name)));
		
		// pick unused id
		let id;
		do {
			id = Math.floor((Math.random() * 2**24))
		} while (usedIdSet.has(id));
		
		// encrypt files to buffer
		const { buffer, password: uploadPassword } = await filesToBuffer(files, 0);

		const uploadLocation = storageRef(firebaseStorage, "uploads/" + id);
		await uploadBytes(uploadLocation, buffer);
		setPassword(uploadPassword);
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