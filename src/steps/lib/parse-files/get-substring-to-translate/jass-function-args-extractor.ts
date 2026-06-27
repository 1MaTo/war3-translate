// Arg may be a plain "string" or wrapped in an extra layer: ("string")
function unwrapStringLiteral(arg: string) {
  const match = arg.match(/^\(?\s*"((?:[^"\\]|\\.)*)"\s*\)?$/);
  return match ? match[1] : arg; // fall back to raw text if not a string literal
}

function pushArg(args: string[], rawArg: string) {
  const trimmed = rawArg.trim();
  if (trimmed !== "") args.push(trimmed);
}

// Walks the text starting just after a call's opening "(", tracking paren
// depth and string state, and returns the top-level comma-separated args.
function parseArgsAt(text: string, startIndex: number) {
  const args: string[] = [];
  let depth = 1; // already inside the opening paren
  let insideString = false;
  let currentArg = "";
  let index = startIndex;

  while (index < text.length && depth > 0) {
    const char = text[index];

    if (insideString) {
      if (char === "\\" && index + 1 < text.length) {
        currentArg += char + text[index + 1];
        index += 2;
        continue;
      }
      if (char === '"') insideString = false;
      currentArg += char;
      index++;
      continue;
    }

    if (char === '"') {
      insideString = true;
      currentArg += char;
    } else if (char === "(") {
      depth++;
      currentArg += char;
    } else if (char === ")") {
      depth--;
      if (depth === 0) {
        pushArg(args, currentArg);
        index++;
        break;
      }
      currentArg += char;
    } else if (char === "," && depth === 1) {
      pushArg(args, currentArg);
      currentArg = "";
    } else {
      currentArg += char;
    }

    index++;
  }

  return { args, endIndex: index };
}

type ExtractArgsFromJASSFunctionsProps = {
  text: string;
  functionName: string;
  argIndexes: number[];
};

type ExtractedJassFunctionArgs = (string | undefined)[];

/** Function that take text, fn name and arg index and return extracted args */
export const extractArgsFromJASSFunctions = ({
  text,
  functionName,
  argIndexes,
}: ExtractArgsFromJASSFunctionsProps): ExtractedJassFunctionArgs[] => {
  const extractedRows = [];
  let cursor = 0;

  while (true) {
    const callStart = text.indexOf(functionName + "(", cursor);
    if (callStart === -1) break;

    const { args, endIndex } = parseArgsAt(text, callStart + functionName.length + 1);

    if (args.length > 0) {
      const picked = argIndexes.map((index) => {
        const raw = args[index];
        return raw !== undefined ? unwrapStringLiteral(raw) : undefined;
      });
      extractedRows.push(picked);
    }

    cursor = endIndex > callStart ? endIndex : callStart + 1;
  }

  return extractedRows;
};
