import { Ref } from "effect";
import { produce } from "immer";

import { StoreError } from "./error";
import type { TranslateState } from "./store";

type AddFragmentProps = {
  fragment: string;
  lineIndex: number;
  fileName: string;
  hash: string;
};
export const addFragment = (
  ref: Ref.Ref<TranslateState>,
  { fileName, fragment, lineIndex, hash }: AddFragmentProps,
) =>
  Ref.update(ref, (state) =>
    produce(state, (draft) => {
      const fileInfo = draft.fileMap.get(fileName);
      if (!fileInfo) throw new StoreError(`${fileName} not found`);

      let dictionaryIndex = draft.dictionary.from.indexOf(fragment);
      if (dictionaryIndex === -1) {
        draft.dictionary.from.push(fragment);
        dictionaryIndex = draft.dictionary.from.length - 1;
      }

      if (!fileInfo.lineMap.has(lineIndex)) fileInfo.lineMap.set(lineIndex, []);
      const fragmentList = fileInfo.lineMap.get(lineIndex);
      if (!fragmentList) throw new StoreError(`${lineIndex} line not found`);

      fragmentList.push({ dictionaryIndex, hash });
    }),
  );
