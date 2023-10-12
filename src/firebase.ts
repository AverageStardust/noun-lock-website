import { FirebaseError, initializeApp } from "firebase/app";
import {
	getBytes, getStorage, list as listStorage, ref as refStorage, uploadBytes
} from "firebase/storage";

import { filesToPackage, packageToFiles } from "./filePackage";
import { readPassword, validatePassword } from "./password";

const firebaseConfig = {
	apiKey: "AIzaSyD6wNVZGxuhDufqu44JSAwIPoyggaqIDd8",
	authDomain: "nounlock-34fe7.firebaseapp.com",
	projectId: "nounlock-34fe7",
	storageBucket: "nounlock-34fe7.appspot.com",
	messagingSenderId: "105432555108",
	appId: "1:105432555108:web:1f179689d677210fb0c971"
};
const maxPackageSize = 25 * 1024 * 1024;

const firebaseApp = initializeApp(firebaseConfig);
const firebaseStorage = getStorage(firebaseApp);

export async function uploadFiles(files: File[]) {
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
	if (buffer.byteLength > maxPackageSize) throw Error("Upload to large");

	const location = refStorage(firebaseStorage, "packages/" + id);
	await uploadBytes(location, buffer);
	return packagePassword;
}

export async function downloadFiles(password: (null | string)[]) {
	const result = await readPassword(password);

	const { id, key } = result;

	const location = refStorage(firebaseStorage, "packages/" + id);
	let buffer;
	try {
		buffer = new Uint8Array(await getBytes(location, maxPackageSize));
	} catch (e) {
		if (e instanceof FirebaseError && e.message.endsWith("(storage/object-not-found)")) {
			throw Error("Failed to download, incorrect password");
		} else {
			throw e;
		}
	}

	const packageFiles = await packageToFiles(buffer, key);
	if (packageFiles.length === 0) {
		throw Error("Failed to display, no files in package");
	}
	return packageFiles;
}