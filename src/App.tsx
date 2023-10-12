import { For, Show, Signal, createEffect, createSignal } from "solid-js";

import { downloadFiles, uploadFiles } from "./firebase";
import { validatePassword } from "./password";
import Status, { StatusState } from "./Status";
import FileViewer from "./FileViewer";
import PasswordInput from "./PasswordInput";
import "./App.css";

export enum AppState {
	Ready,
	Working,
	Uploaded,
	Downloaded
}

export default function App() {
	const [state, setState] = createSignal(AppState.Ready) as Signal<AppState>;
	const [statusState, setStatusState] = createSignal(StatusState.None) as Signal<StatusState>;
	const [statusMessage, setStatusMessage] = createSignal("") as Signal<string>;
	const [password, setPassword] = createSignal(new Array(24)) as Signal<(null | string)[]>;
	const [files, setFiles] = createSignal([] as File[]) as Signal<File[]>;

	const fileInput = document.createElement("input");
	fileInput.type = "file";
	fileInput.accept = "text/plain, application/json, image/*, audio/*, video/*";
	fileInput.multiple = true;
	fileInput.addEventListener("change", () => {
		if (fileInput.files === null) return;
		setFiles([...files(), ...fileInput.files]);
	});

	function runWithStatus(func: () => Promise<unknown>, jobMessage: string, showDone = true) {
		const _state = state();
		setState(AppState.Working);

		setStatusState(StatusState.Pending);
		setStatusMessage(jobMessage);
		func().then(() => {
			if (showDone) {
				setStatusState(StatusState.Resolved);
				setStatusMessage("Done");
			} else {
				setStatusState(StatusState.None);
				setStatusMessage("");
			}
		}, (err: Error) => {
			setStatusState(StatusState.Rejected);
			setStatusMessage(err.message);
			setState(_state);
		});
	}

	function renameFile(file: File, name: string) {
		const _files = files();
		const index = _files.findIndex(_file => _file === file);
		const renamedFile = new File([file], name, { type: file.type });
		_files.splice(index, 1, renamedFile);
		setFiles(_files);
	}

	function removeFile(file: File,) {
		const _files = files();
		const index = _files.findIndex(_file => _file === file);
		_files.splice(index, 1);
		setFiles(Array.from(_files));
	}

	return <>
		<PasswordInput password={password} setPassword={setPassword}
			disabled={() => state() !== AppState.Ready}></PasswordInput>
		<div class="network-section">
			<button class="network-button" onClick={() => runWithStatus(
				async () => {
					setFiles(await downloadFiles(password()));
					setState(AppState.Downloaded);
				}, "Downloading", false)}
				disabled={
					files().length > 0 ||
					state() !== AppState.Ready ||
					!validatePassword(password())}
			>{state() === AppState.Downloaded ? "Downloaded" : "Download"}</button>
			<button class="network-button" onClick={() => runWithStatus(
				async () => {
					setPassword(await uploadFiles(files()));
					setState(AppState.Uploaded);
				}, "Uploading", true)}
				disabled={
					files().length === 0 ||
					state() !== AppState.Ready}
			>{state() === AppState.Uploaded ? "Uploaded" : "Upload"}</button>
		</div >
		<hr></hr>
		<Status state={statusState} message={statusMessage}></Status>
		<For each={files()}>{(file, index) =>
			<FileViewer file={file}
				setFileName={(fileName: string) => renameFile(files()[index()], fileName)}
				removeFile={() => removeFile(files()[index()])}
				removeDisabled={() => state() !== AppState.Ready}></FileViewer>
		}</For>
		<Show when={state() === AppState.Ready}>
			<button class="file-add-button" onClick={() => fileInput.click()}>
				<i class="file-add-i gg-file-add"></i>
			</button>
		</Show>
	</>
}