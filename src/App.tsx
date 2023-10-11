import { createSignal } from "solid-js";
import { initializeApp } from "firebase/app";
import {
	getBytes, getStorage, list as listStorage, ref as refStorage, uploadBytes
} from "firebase/storage";

import { filesToPackage } from "./filePackage";

import PasswordInput from "./PasswordInput";
import UploadButton from "./UploadButton";
import "./App.css";
import { readPassword } from "./password";

const firebaseConfig = {
	apiKey: "AIzaSyD6wNVZGxuhDufqu44JSAwIPoyggaqIDd8",
	authDomain: "nounlock-34fe7.firebaseapp.com",
	projectId: "nounlock-34fe7",
	storageBucket: "nounlock-34fe7.appspot.com",
	messagingSenderId: "105432555108",
	appId: "1:105432555108:web:1f179689d677210fb0c971"
};

export default function App() {
	const firebaseApp = initializeApp(firebaseConfig);
	const firebaseStorage = getStorage(firebaseApp);

	const [password, setPassword] = createSignal(Array(24).fill(null));

	async function uploadBlobs(files: File[]) {
		// find used ids
		const folderLocation = refStorage(firebaseStorage, "packages");
		const usedIdSet = new Set(
			(await listStorage(folderLocation))
				.items.map(ref => Number(ref.name)));

		// pick unused id
		let id;
		do {
			id = Math.floor((Math.random() * 2 ** 24))
		} while (usedIdSet.has(id));

		// encrypt files to buffer
		const { buffer, password: packagePassword } = await filesToPackage(files, id);

		const location = refStorage(firebaseStorage, "packages/" + id);
		await uploadBytes(location, buffer);
		setPassword(packagePassword);
	}

	function downloadBlobs() {

	}

	return <>
		<PasswordInput password={password} setPassword={setPassword}></PasswordInput>
		<div class="button-section">
			<button class="upload-download-button" onClick={downloadBlobs}>Download</button>
			<UploadButton onUploadFiles={uploadBlobs}></UploadButton>
		</div>
	</>
}