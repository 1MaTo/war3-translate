/** Type safe to getting elements by index where miss is considered unexpected error */
export const fromIndex = <TItem>(list: TItem[], index: number): TItem => {
  if (list[index] === undefined) throw new Error(`Failed to get array item by index ${index}`);
  return list[index];
};
