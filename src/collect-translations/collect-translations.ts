import { Effect } from "effect";

export const collectTranslations = (/* store: TranslationStore, filePath: string */) =>
  Effect.gen(function* () {
    // read by chunks to make line
  });

/* const fs = require('node:fs');
const readline = require('node:readline');

async function processLineByLine() {
  const fileStream = fs.createReadStream('input.txt');
  const writeStream = fs.createWriteStream('output.txt');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity // Recognizes all instances of CR LF (\r\n) as a single line break
  });

  let lineCount = 1;

  for await (const line of rl) {
    // 1. Modify the line
    const modifiedLine = `${lineCount}: ${line.toUpperCase()}`;
    
    // 2. Write it to the new file (add \n because readline strips it)
    writeStream.write(modifiedLine + '\n');
    
    lineCount++;
  }

  writeStream.end();
  console.log('Finished processing line-by-line.');
}

processLineByLine().catch(console.error);
 */
