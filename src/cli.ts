import { Argument, Command, Option } from "commander";

import { version } from "../package.json";
import {
  EN,
  GoogleFreeProvider,
  KO,
  RU,
  StringsFileProperties,
  translate,
  TranslateFromLocale,
  TranslateProvider,
  TranslateToLocale,
  ZH,
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
      .choices([GoogleFreeProvider.literals[0]] satisfies typeof TranslateProvider.literals)
      .default(GoogleFreeProvider.literals[0]),
  )
  .addOption(
    new Option(
      "--exclude-string-props <props...>",
      "Advanced setting, allow to exclude string file props from translation as some props may never be visible in game, useful when limited by translation api",
    ).choices(StringsFileProperties.literals satisfies typeof StringsFileProperties.literals),
  )
  .option(
    "-s, --save <path>",
    "Path, including filename where translated map will be saved, by default map will be saved in <from> folder with _translated attached to name",
  )
  .action(
    async (
      path,
      from,
      { to, provider, save, filesToExclude, filesToInclude, excludeStringProps },
    ) => {
      try {
        await translate({
          from,
          pathToMap: path,
          to,
          provider,
          filesToExclude,
          filesToInclude,
          pathToTranslatedMap: save,
          propertiesToExclude: excludeStringProps,
        });
      } catch (error) {
        console.log(`Error: ${error instanceof Error ? error.message : error}`);
      }
    },
  );

program.parse();
