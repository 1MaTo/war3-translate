import { Logger } from "effect";

export const SimpleLogger = Logger.make(({ message }) => {
  if (Array.isArray(message)) return console.log(message.join("; "));
  return console.log(message);
});
