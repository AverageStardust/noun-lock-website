// 10553181
import nouns from "./nouns.json";

export async function createPassword(id: number) {
	const key = await crypto.subtle.generateKey(
		{
			name: "AES-GCM",
			length: 192,
		},
		true,
		["encrypt", "decrypt"]);

	const idBytes = new Uint8Array(new Uint32Array([id]).buffer).subarray(0, 3);
	const keyBytes = new Uint8Array(await crypto.subtle.exportKey("raw", key));

	const passwordBytes = new Uint8Array(27);
	passwordBytes.set(idBytes, 0);
	passwordBytes.set(keyBytes, 3);

	const password = [];
	for (let i = 0; i < 24; i++) {
		const noun = readUint8Noun(passwordBytes, i);
		password.push(noun);
	}

	return {
		key,
		password
	}
}

export function validatePassword(password: (null | string)[]) {
	for (const noun of password) {
		if (nouns.findIndex((elm) => elm === noun) === -1) return false;
	}
	return true;
}

export async function readPassword(password: (null | string)[]) {
	const passwordBytes = new Uint8Array(27);

	for (let i = 0; i < 24; i++) {
		writeUint8Noun(passwordBytes, i, password[i])
	}

	const idBytes = new Uint8Array(4);
	idBytes.set(passwordBytes.slice(0, 3));
	const id = new Uint32Array(idBytes.buffer)[0];

	const key = await crypto.subtle.importKey(
		"raw",
		passwordBytes.slice(3, 27),
		{
			name: "AES-GCM",
			length: 192,
		},
		true,
		["encrypt", "decrypt"])

	return {
		id,
		key
	};
}

function readUint8Noun(arr: Uint8Array, nounIndex: number) {
	let value = 0;
	for (let i = 0; i < 9; i++) {
		value += readUint8Bit(arr, nounIndex * 9 + i) ? (1 << i) : 0;
	}

	return nouns[value];
}

function writeUint8Noun(arr: Uint8Array, nounIndex: number, noun: null | string) {
	const value = nouns.findIndex((elm) => elm === noun);

	if (value === -1) throw Error("Failed to read password noun");

	for (let i = 0; i < 9; i++) {
		writeUint8Bit(arr, nounIndex * 9 + i, !!(value & (1 << i)));
	}
}

function readUint8Bit(arr: Uint8Array, bitIndex: number) {
	const byteIndex = Math.floor(bitIndex / 8);
	return !!(arr[byteIndex] & (1 << (bitIndex % 8)))
}


function writeUint8Bit(arr: Uint8Array, bitIndex: number, value: boolean) {
	const byteIndex = Math.floor(bitIndex / 8);
	if (value) {
		arr[byteIndex] |= 1 << (bitIndex % 8);
	} else {
		arr[byteIndex] &= ~(1 << (bitIndex % 8));
	}
}