import { Accessor, For, Setter } from "solid-js";

import assert from "./assert";
import nounList from "./nouns.json";
import "./PasswordInput.css";

interface PasswordInputProps {
  password: Accessor<(null | string)[]>;
  setPassword: Setter<(null | string)[]>;
  disabled: Accessor<boolean>;
}

export default function PasswordInput({ password, setPassword, disabled }: PasswordInputProps) {
  function onInput(event: InputEvent) {
    assert(event.target instanceof HTMLInputElement);
    const possibleNouns = getPossibleNouns(event.target);

    if (event.data && event.data.length > 0) {
      if (possibleNouns.length === 0) {
        event.target.value = event.target.value.slice(0, -event.data.length)
      }
    }
  }

  function onChange(event: Event) {
    assert(event.target instanceof HTMLInputElement);
    const possibleNouns = getPossibleNouns(event.target);

    if (possibleNouns.length === 1) {
      setInputNoun(event.target, possibleNouns[0]);
      event.target.value = possibleNouns[0];
      const index = inputElmToIndex(event.target);
      indexToInputElm(index + 1)?.focus();
    } else {
      setInputNoun(event.target, null);
      event.target.value = "";
      event.target.focus();
    }
  }

  function setInputNoun(input: HTMLInputElement, value: string | null) {
    const index = inputElmToIndex(input);

    if (password()[index] !== value) {
      const newPassword = Array.from(password());
      newPassword[index] = value;
      setPassword(newPassword);
    }
  }

  function getPossibleNouns(input: HTMLInputElement) {
    return nounList.filter((noun) => noun.startsWith(input.value.toLowerCase()));
  }

  function inputElmToIndex(elm: HTMLInputElement) {
    assert(elm.id.startsWith("password-input-"));
    return Number(elm.id.slice(15, Infinity));
  }

  function indexToInputElm(index: number) {
    return document.getElementById(`password-input-${index}`);
  }

  return <div class="password-grid">
    <For each={password()}>{(noun, index) =>
      <input class="password-input" type="text" value={noun ?? ""} disabled={disabled()}
        autocapitalize="off" autocorrect="off" autocomplete="off" spellcheck={false}
        onInput={onInput} onChange={onChange} id={`password-input-${index()}`}></input>
    }
    </For>
  </div>;
}