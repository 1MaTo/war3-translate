import { Argument, Command, Option } from "commander";

import { version } from "../package.json";
import {
  EN,
  KO,
  RU,
  translate,
  TranslateFromLocale,
  TranslateToLocale,
  ZH,
  DeeplProvider,
  GoogleFreeProvider,
  TranslateProvider,
} from "./index.ts";

const program = new Command();

program
  .name("war3translate")
  .description("Command to translate unprotected warcraft 3 maps with list files")
  .version(version)
  .addArgument(new Argument("<map-path>", "Path to map to translate"))
  .addArgument(
    new Argument("<from>", "Language to translate from, any other language will be ignored,")
      .choices([KO.literals[0], ZH.literals[0]] satisfies typeof TranslateFromLocale.literals)
      .argRequired(),
  )
  .addOption(
    new Option("-t, --to <to>", "Language to translate to")
      .choices([EN.literals[0], RU.literals[0]] satisfies typeof TranslateToLocale.literals)
      .default(EN.literals[0]),
  )
  .addOption(
    new Option(
      "-p, --provider <provider>",
      "Translation service, default is free google translation api",
    )
      .choices([
        GoogleFreeProvider.literals[0],
        DeeplProvider.literals[0],
      ] satisfies typeof TranslateProvider.literals)
      .default(GoogleFreeProvider.literals[0]),
  )
  .addOption(
    new Option(
      "--include-files <regex...>",
      "JS Regular expression to include files for translations, example: \\.txt will translate only text files",
    ),
  )
  .addOption(
    new Option(
      "--exclude-files <regex...>",
      "JS Regular expression to exclude files for translations, example: \\.j will skip any code file; This option overwrite --include-files",
    ),
  )
  .option(
    "-s, --save <path>",
    "Path, including filename where translated map will be saved, by default map will be saved in <from> folder with _translated attached to name",
  )
  .option(
    "--deepl-auth-key <deeplAuthKey>",
    "Your api/auth key when using paid translation provider",
  )
  .option(
    "--deepl-context <deeplContext>",
    "Context options for deepl api, for more info check deepl api documentation",
  )
  .option(
    "--deepl-glossary-id <deeplGlossaryId>",
    "Glossary id for deepl api, for more info check deepl api documentation",
  )
  .option(
    "--manual <path>",
    "Manual translation json file (key - raw string, value - desired translation) that will be checked against raw, must specify whole string, will not be applied for partial match, manual translations are not cached",
  )
  .option("--ignore-cache", "Ignore cache for translations", false)
  .option("-d, --debug", "Run in debug mode", false)
  .hook("preAction", (thisCommand) => {
    const { provider, deeplAuthKey } = thisCommand.opts();

    if (provider === DeeplProvider.literals[0] && !deeplAuthKey)
      thisCommand.error("--deepl-auth-key required when using deepl provider");
  })
  .action(
    async (
      path,
      from,
      {
        to,
        provider,
        save,
        includeFiles,
        excludeFiles,
        debug,
        deeplAuthKey,
        deeplContext,
        deeplGlossaryId,
        ignoreCache,
        manual,
      },
    ) => {
      try {
        await translate({
          from,
          to,
          provider,
          pathToMap: path,
          pathToTranslatedMap: save,
          pathToManualTranslations: manual,
          fileFilter: {
            include: includeFiles ? new RegExp(includeFiles) : undefined,
            exclude: excludeFiles ? new RegExp(excludeFiles) : undefined,
          },
          ignoreCache,
          options: {
            deepl: { apiKey: deeplAuthKey, context: deeplContext, glossary: deeplGlossaryId },
          },
          debug,
        });
      } catch (error) {
        console.log(`Error: ${error instanceof Error ? error.message : error}`);
      }
    },
  );

program.parse();
