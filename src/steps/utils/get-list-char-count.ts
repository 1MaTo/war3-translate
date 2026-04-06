import { fromIndex } from "./from-index";

export const getListCharCount = <T = string>(list: T[], getString?: (item: T) => string) => {
  let total = 0;
  const getStringFn = getString || ((item) => String(item));
  for (let index = 0; index < list.length; index++) {
    total += getStringFn(fromIndex(list, index)).length;
  }

  return total;
};
