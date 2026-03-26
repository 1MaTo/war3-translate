export type TestType = { text: string };

export const hello = ({ text }: TestType) => console.log(text);
