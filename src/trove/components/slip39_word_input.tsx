import * as React from "jsx-dom"; // Fake React for JSX->DOM support
import {
  SuggestionInput,
  SuggestionInputRef,
} from "../../platform/components/suggestion_input";
import { SLIP39_WORDS } from "../util/slip39_wrapper";
import levenshtein = require("js-levenshtein");
import { compRef } from "../../platform/util/component_references";

export interface Slip39WordInputRef {
  setValue: (index: number, text: string, fireEvent?: boolean) => void;
  focusAndSelect: () => void;
  hide: () => void;
}

export const Slip39WordInput = ({
  slip39WordInput,
  onWord,
}: {
  slip39WordInput?: Slip39WordInputRef;
  onWord?: (slip39Word: string) => void;
}) => {
  const suggestionInput = compRef<SuggestionInputRef>();
  slip39WordInput.setValue = (
    index: number,
    text: string,
    fireEvent?: boolean
  ) => {
    suggestionInput.setPretext(index + 1 + "");
    suggestionInput.setPlaceHolder("Enter word #" + (index + 1));
    suggestionInput.setValue(text, fireEvent);
  };
  slip39WordInput.focusAndSelect = () => {
    suggestionInput.focusAndSelect();
  };
  slip39WordInput.hide = () => {
    suggestionInput.hide();
  };

  return (
    <SuggestionInput
      suggestionInput={suggestionInput}
      onInput={(e) => {
        const value = (e.srcElement as HTMLInputElement).value;
        const allWords = value.split(" ");
        if (onWord) {
          while (allWords.length > 0 && SLIP39_WORDS.has(allWords[0])) {
            const nextWord = allWords.shift();
            if (SLIP39_WORDS.has(nextWord)) {
              onWord(nextWord);
            } else {
              suggestionInput.setValue(allWords.join(" "), false);
              break;
            }
          }
        }
      }}
      getSuggestions={(value) => {
        const NUM_RESULTS = 8;
        let suggestedWords: string[] = [];

        // No suggestions if you have no value, or already have a matched word
        if (!value || SLIP39_WORDS.has(value)) {
          return suggestedWords;
        }

        // First find words that start with the user entered text
        suggestedWords = Array.from(SLIP39_WORDS)
          .filter((slip39Word) => slip39Word.startsWith(value))
          .slice(0, NUM_RESULTS);
        if (suggestedWords.length == 1) {
          // safe to autocomplete word
          suggestionInput.autoComplete(suggestedWords[0]);
        }
        const suggestedAlready = new Set<string>(suggestedWords);

        // Then find words which closely match the user entered text
        if (suggestedWords.length < NUM_RESULTS) {
          Array.from(SLIP39_WORDS)
            .filter((w) => !suggestedAlready.has(w))
            .map((slip39Word) => {
              return {
                word: slip39Word,
                distance: levenshtein(slip39Word, value),
              };
            })
            .sort((a, b) => {
              if (a.distance === b.distance) {
                return a.word.localeCompare(b.word);
              }
              return a.distance - b.distance;
            })
            .map((option) => option.word)
            .slice(0, NUM_RESULTS - suggestedWords.length)
            .forEach((w) => {
              suggestedWords.push(w);
            });
        }

        return suggestedWords;
      }}
    ></SuggestionInput>
  );
};
