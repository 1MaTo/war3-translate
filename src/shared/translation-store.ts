import { Ref, Effect } from "effect";
import { produce } from "immer";

export type FileTranslateInfo = {
  /** List of strings extracted from files */
  rawList: string[];
  /** List of translated strings */
  translateList: string[];
};

/** Store raw / translated info */
export class TranslationStore {
  /** Add new string to translate list, return index to get raw or translated variant */
  add: (record: string) => Effect.Effect<number>;

  constructor(state: Ref.Ref<FileTranslateInfo>) {
    this.add = (record: string) =>
      Effect.gen(function* () {
        const result = yield* Ref.updateAndGet(state, (draft) =>
          produce(draft, (state) => {
            state.rawList.push(record);
          }),
        );

        return result.rawList.length - 1;
      });
  }
}
