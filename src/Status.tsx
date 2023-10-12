import { Accessor, Match, Switch, createEffect, onMount } from "solid-js";

import "./Status.css";

export enum StatusState {
	None,
	Pending,
	Resolved,
	Rejected
}

interface StatusProps {
	state: Accessor<StatusState>;
	message: Accessor<string>;
}

export default function Status({ state, message }: StatusProps) {
	let statusElm: HTMLDivElement;

	return <Switch>
		<Match when={state() === StatusState.Pending}>
			<div class="status throbber">{message()}</div>
		</Match>
		<Match when={state() === StatusState.Resolved}>
			<div class="status status-resolved">{message()}</div>
		</Match>
		<Match when={state() === StatusState.Rejected}>
			<div class="status status-rejected">{message()}</div>
		</Match>
	</Switch>;
}