import { Accessor, Match, Switch, createSignal } from "solid-js";

import "./FileViewer.css";

const textDecoder = new TextDecoder();

interface FilesViewerProps {
	file: Accessor<File>;
	hasSpoiler: Accessor<boolean>;
	removeDisabled: Accessor<boolean>
	toggleSpoiler: () => void;
	removeFile?: () => void;
}

export default function FileViewer(
	{ file, hasSpoiler, removeDisabled, toggleSpoiler, removeFile }: FilesViewerProps) {
	const [buffer, setBuffer] = createSignal(new ArrayBuffer(0));
	file().arrayBuffer().then(setBuffer);

	return <div class="file-viewer-body">
		<div class="file-viewer-titlebar">
			<div class="file-viewer-title">{file().name}</div>
			<div class="file-viewer-size">({formatByteUnit(file().size)})</div>
			<hr class="file-viewer-spacer"></hr>
			<button class="file-viewer-button" onClick={toggleSpoiler}>👁</button>
			<button class="file-viewer-button" onClick={removeFile}
				disabled={removeDisabled()}>⨯</button>
		</div>
		<div class="file-viewer-content">
			<Switch>
				<Match when={buffer().byteLength === 0}>
					<div class="throbber">Rendering file</div>
				</Match>
				<Match when={file().type.startsWith("text/") || file().type === "application/json"}>
					<div class={"file-viewer-text" + (hasSpoiler() ? " spoiler-light" : "")}>
						{textDecoder.decode(buffer())}
					</div>
				</Match>
				<Match when={file().type.startsWith("image/")}>
					<img class={(hasSpoiler() ? "spoiler-heavy" : "")}
						src={URL.createObjectURL(file())}></img>
				</Match>
				<Match when={file().type.startsWith("audio/")}>
					<audio controls class={"file-viewer-media" + (hasSpoiler() ? " spoiler-light" : "")}>
						<source src={URL.createObjectURL(file())} type={file().type}></source>
					</audio>
				</Match>
				<Match when={file().type.startsWith("video/")}>
					<video controls class={"file-viewer-media" + (hasSpoiler() ? " spoiler-heavy" : "")}>
						<source src={URL.createObjectURL(file())} type={file().type}></source>
					</video>
				</Match>
			</Switch>
		</div>
	</div>;
}

function formatByteUnit(bytes: number) {
	const units = ["B", "kB", "MB", "GB"];
	while (bytes > 1000 && units.length > 1) {
		bytes /= 1000;
		units.shift();
	}
	const roundedValue = Math.round(bytes * 10) / 10;
	return String(roundedValue) + units[0];
}