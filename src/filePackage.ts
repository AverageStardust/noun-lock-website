import { createPassword } from "./password";

const textEncoder = new TextEncoder();

export async function filesToPackage(files: File[], id: number) {
	const metaBuffer = sizeAndCreatePackageMeta(files);
	const fileBuffers = await getFileBuffers(files);
	const unencryptedBuffer = joinBuffers([metaBuffer, ...fileBuffers], 1024);

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

	const buffer = joinBuffers([iv, encryptedBuffer]);

	return {
		buffer,
		password
	}
}

function joinBuffers(buffers: ArrayBuffer[], roundSize = 1) {
	let totalLength = 0;
	for (const buffer of buffers) {
		totalLength += buffer.byteLength
	}

	const targetSize = Math.ceil(totalLength / roundSize) * roundSize;
	const targetBuffer = new Uint8Array(targetSize);

	let bufferStart = 0;
	for (const buffer of buffers) {
		targetBuffer.set(new Uint8Array(buffer), bufferStart);
		bufferStart += buffer.byteLength;
	}

	return targetBuffer;
}

function sizeAndCreatePackageMeta(files: File[]) {
	for (const metaKilobytes of [4, 16, 64, 256]) {
		const meta = createPackageMeta(files, metaKilobytes * 1024);
		if (meta !== false) return meta;
	}
	throw Error("Could not fit file metadata, to many files");
}

function createPackageMeta(files: File[], metaSize: number) {
	const metaData: { start: number, size: number, type: string }[] = [];

	let fileStart = metaSize;
	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		metaData.push({
			start: fileStart,
			size: file.size,
			type: file.type
		});
		fileStart += file.size;
	}

	const metaBuffer = new ArrayBuffer(metaSize);
	const jsonBuffer = textEncoder.encode(JSON.stringify(metaData));

	// write location of metadata end
	new DataView(metaBuffer).setInt32(0, jsonBuffer.byteLength + 4);
	// write metadata
	try {
		new Uint8Array(metaBuffer).set(jsonBuffer, 4);
	} catch (e) {
		if (e instanceof RangeError) return false;
		else throw e;
	}

	return metaBuffer;
}

async function getFileBuffers(files: File[]) {
	const filePromises: Promise<void>[] = [];
	const fileBuffers: ArrayBuffer[] = [];

	for (let i = 0; i < files.length; i++) {
		const promise = files[i].arrayBuffer().then(buffer => {
			buffer.byteLength
			fileBuffers[i] = buffer;
		})
		filePromises.push(promise);
	}

	await Promise.all(filePromises);

	return fileBuffers;
}