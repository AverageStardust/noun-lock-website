import { Accessor, For, Setter } from "solid-js";
import nounList from "./nouns.json";
import "./PasswordInput.css";
import assert from "./assert";

interface PasswordInputProps {
  password: Accessor<(null | string)[]>;
  setPassword: Setter<(null | string)[]>;
}

export default function PasswordInput({ password, setPassword }: PasswordInputProps) {
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
      const index = inputElmToIndex(event.target);
      if (index < 23) {
        indexToInputElm(index + 1)?.focus();
      }
    } else {
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
    return nounList.filter((noun) => noun.startsWith(input.value));
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
      <input class="password-input" type="text" list="nouns" value={noun ?? ""}
        onInput={onInput} onChange={onChange} id={`password-input-${index()}`}></input>
    }
    </For>
  </div>;
}