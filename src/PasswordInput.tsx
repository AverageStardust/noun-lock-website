import { For, Signal, createSignal } from "solid-js";
import nounList from "./nouns.json";
import "./PasswordInput.css";
import assert from "./assert";

const passwordLength = 24;

function PasswordInput() {
  const [password, _]: Signal<string[]> = createSignal(Array(passwordLength).fill(""));
  const [possibleNouns, setPossibleNouns]: Signal<string[]> = createSignal(nounList);

  function onInput(event: InputEvent) {
    assert(event.target instanceof HTMLInputElement);

    const newValue = event.target.value;
    setPossibleNouns(nounList.filter((noun) => noun.startsWith(newValue)));

    if (event.data && event.data.length > 0) {
      if (possibleNouns().length === 0) {
        event.target.value = event.target.value.slice(0, -event.data.length)
      }
    }
  }

  function onChange(event: Event) {
    assert(event.target instanceof HTMLInputElement);

    if (possibleNouns().length === 1) {
      event.target.value = possibleNouns()[0];
      const index = inputElmToIndex(event.target);
      if (index < passwordLength - 1) {
        indexToInputElm(index + 1)?.focus();
      }
    } else {
      event.target.value = "";
      event.target.focus();
    }
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
      <input class="password-input" type="text" list="nouns" value={noun}
        onInput={onInput} onChange={onChange} id={`password-input-${index()}`}></input>
    }
    </For>
  </div>;
}

export default PasswordInput
