import { createPassword } from "./password";

const
	textEncoder = new TextEncoder(),
	textDecoder = new TextDecoder();

export async function filesToPackage(files: File[], id: number) {
	const metaBuffer = filesToMetadata(files);
	const fileBuffers = await filesToBuffers(files);
	const unencryptedBuffer = joinBuffers([metaBuffer, ...fileBuffers], 256);

	// encrypt buffer
	const { key, password } = await createPassword(id);
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const encryptedBuffer = await crypto.subtle.encrypt(
		{
			name: "AES-GCM",
			iv
		},
		key,
		unencryptedBuffer
	);

	const buffer = joinBuffers([iv, encryptedBuffer]);

	return {
		buffer,
		password
	}
}

function filesToMetadata(files: File[]) {
	let metaSize = 256;
	while (metaSize <= 256 * 1024 * 1024) {
		const meta = filesToMetadataAtSize(files, metaSize);
		if (meta !== false) return meta;
		metaSize *= 2;
	}
	throw Error("Could not fit file metadata, to many files");
}

function filesToMetadataAtSize(files: File[], metaSize: number) {
	const metadata: { start: number, end: number, name: string, type: string }[] = [];

	let fileStart = metaSize;
	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		metadata.push({
			start: fileStart,
			end: fileStart + file.size,
			name: file.name,
			type: file.type
		});
		fileStart += file.size;
	}

	const metaBuffer = new ArrayBuffer(metaSize);
	const jsonBuffer = textEncoder.encode(JSON.stringify(metadata));

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

async function filesToBuffers(files: File[]) {
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

function joinBuffers(buffers: ArrayBuffer[], roundSize = 1) {
	let totalLength = 0;
	for (const buffer of buffers) {
		totalLength += buffer.byteLength
	}

	const targetBuffer = new Uint8Array(Math.ceil(totalLength / roundSize) * roundSize);

	let bufferStart = 0;
	for (const buffer of buffers) {
		targetBuffer.set(new Uint8Array(buffer), bufferStart);
		bufferStart += buffer.byteLength;
	}

	return targetBuffer;
}

export async function packageToFiles(buffer: Uint8Array, key: CryptoKey) {
	const iv = buffer.slice(0, 12);
	const encryptedBuffer = buffer.slice(12);

	let unencryptedBuffer: ArrayBuffer;
	try {
		unencryptedBuffer = await crypto.subtle.decrypt(
			{
				name: "AES-GCM",
				iv
			},
			key,
			encryptedBuffer
		);
	} catch (e) {
		if (e instanceof DOMException && e.name === "OperationError") {
			throw Error("Failed to decrypt, wrong password");
		} else {
			throw e;
		}
	}

	return unencryptedPackageToFiles(unencryptedBuffer);
}

function unencryptedPackageToFiles(buffer: ArrayBuffer) {
	const metaEnd = new DataView(buffer).getInt32(0);
	const metaBuffer = buffer.slice(4, metaEnd);
	const meta = JSON.parse(textDecoder.decode(metaBuffer)) as
		({ start: number, end: number, name: string, type: string }[]);

	const files = [];
	for (const { start, end, name, type } of meta) {
		files.push(new File([buffer.slice(start, end)], name, { type }));
	}

	return files;
}