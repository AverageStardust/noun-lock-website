import { Accessor, Match, Signal, Switch, createEffect, createSignal, onMount } from "solid-js";

import "./FileViewer.css";

const textDecoder = new TextDecoder();

interface FilesViewerProps {
	file: File;
	setFileName: (name: string) => void;
	removeFile: () => void;
	removeDisabled: Accessor<boolean>
}

export default function FileViewer(
	{ file, setFileName, removeDisabled, removeFile }: FilesViewerProps) {
	const [buffer, setBuffer] = createSignal(new ArrayBuffer(0));
	const [name, setName] = createSignal(file.name) as Signal<string>;
	createEffect(() => setFileName(name()));

	function hasSpoiler() {
		return name().startsWith("||") && name().endsWith("||");
	}

	function toggleSpoiler() {
		if (hasSpoiler()) {
			setName(name().slice(2, -2));
		} else {
			setName("||" + name() + "||");
		}
	}

	let contentElm: any = undefined;

	file.arrayBuffer().then((_buffer) => {
		setBuffer(_buffer);
		createEffect(() => {
			if (hasSpoiler()) {
				contentElm.classList.add("spoiler");
			} else {
				contentElm.classList.remove("spoiler");
			}
		});
	});

	return <div class="file-viewer-body">
		<div class="file-viewer-titlebar">
			<div class="file-viewer-title">{name()}</div>
			<div class="file-viewer-size">({formatByteUnit(file.size)})</div>
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
				<Match when={file.type.startsWith("text/") || file.type === "application/json"}>
					<div class="file-viewer-text" ref={contentElm}>
						{textDecoder.decode(buffer())}
					</div>
				</Match>
				<Match when={file.type.startsWith("image/")}>
					<img src={URL.createObjectURL(file)} ref={contentElm}></img>
				</Match>
				<Match when={file.type.startsWith("audio/")}>
					<audio controls class="file-viewer-media" ref={contentElm}>
						<source src={URL.createObjectURL(file)} type={file.type}></source>
					</audio>
				</Match>
				<Match when={file.type.startsWith("video/")}>
					<video controls class="file-viewer-media" ref={contentElm}>
						<source src={URL.createObjectURL(file)} type={file.type}></source>
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