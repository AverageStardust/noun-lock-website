import { createPassword } from "./password";

const textEncoder = new TextEncoder();

export async function filesToBuffer(files: File[], id: number) {
	const uploadMetaSize = 2 ** 12;
	let lastFileEnd = uploadMetaSize;
	const fileMeta: { start: number, size: number, type: string }[] = [];
	const fileBuffers: Uint8Array[] = [];
	const fileBuffersPromises: Promise<void | ArrayBuffer>[] = [];

	// collect data from files
	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		fileBuffersPromises.push(
			file.arrayBuffer().then((buffer) => {
				fileBuffers[i] = new Uint8Array(buffer);
			}));
		fileMeta.push({
			start: lastFileEnd,
			size: file.size,
			type: file.type
		});
		lastFileEnd += file.size;
	}

	// create buffers
	const unencryptedBuffer = new Uint8Array(lastFileEnd);
	const metaBuffer = textEncoder.encode(JSON.stringify(fileMeta));
	if (metaBuffer.byteLength >= uploadMetaSize - 4) {
		throw Error("Metadata to large");
	}

	// set metadata length
	new DataView(unencryptedBuffer.buffer).setInt32(0, metaBuffer.byteLength);

	// set metadata
	unencryptedBuffer.set(metaBuffer, 4);

	// promise file buffers
	await Promise.all(fileBuffersPromises);

	// set file buffers
	for (let i = 0; i < fileMeta.length; i++) {
		const { start } = fileMeta[i];
		unencryptedBuffer.set(fileBuffers[i], start);
	}

	// encrypt buffer
	const { key, password } = await createPassword(id);
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const encryptedBuffer = new Uint8Array(await crypto.subtle.encrypt(
		{
			name: "AES-GCM",
			iv
		},
		key,
		unencryptedBuffer
	));

	// create final upload buffer
	const buffer = new Uint8Array(encryptedBuffer.byteLength + 12);

	// add iv
	buffer.set(iv, 0);

	// add encrypted data
	buffer.set(encryptedBuffer, 12);

	return {
		buffer,
		password
	}
}