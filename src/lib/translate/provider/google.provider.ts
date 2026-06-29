import translate from "google-translate-api-x";

import { fromIndex } from "../../utils/from-index";
import type { MakeTranslateApiFn } from "../common";

export const translateGoogleFree: MakeTranslateApiFn =
  () =>
  async ({ from, list, to }) => {
    const result = await translate(list, { forceBatch: false, from, to });
    const resultList: string[] = [];
    for (let index = 0; index < result.length; index++) {
      const item = fromIndex(result, index);
      resultList.push(item.text);
    }
    return resultList;
  };
