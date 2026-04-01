/* import { Effect } from "effect";

import { translateMap } from "./translate";

const program = Effect.gen(function* () {
  const result = yield* translateMap({
    pathToMap: "C:\\Users\\mato\\Desktop\\MpqEditor\\maps\\translate.w3x",
    from: "ko",
    to: "en",
  });

  console.log(result);
});

Effect.runPromise(program); */

import { NodeRuntime } from "@effect/platform-node";
import { Effect } from "effect";

import { TranslateService } from "./steps/store/service/translate.service/translate.service";
import {
  warcraftString,
  type WarcraftStringParseProps,
} from "./steps/utils/warcraft-string-parser";

NodeRuntime.runMain(
  Effect.provide(
    Effect.gen(function* () {
      yield* Effect.log("DEBUG START");

      const testString =
        "|CffFFFF00적에게 간직한 보물을 던집니다. 적에게 1.5초간 총 800의 데미지를 주고 1.5초동안 침묵시킵니다.|r 최대 민첩x80의 + 지능X15의 데미지와 2초 스턴을 입힙니다. |Cff00ff00기술타입 : 타겟팅|n피해타입 : 물리피해|n물리등급 : LV1|n사정거리 : 1200|n최대거리 : 1200|n쿨타임 : 30초|r, 부활 플랑드르|Cff00ffff[「포 오브 어 카인드」]|r";

      const props: Omit<WarcraftStringParseProps, "value"> = { from: "ko" };

      const encodedString = warcraftString.encode({ value: testString, ...props });
      const cleanString = warcraftString.clean(testString);

      yield* Effect.log("RAW", testString);
      yield* Effect.log("CLEAN", cleanString);
      yield* Effect.log("ENCODE", encodedString);

      const translation = yield* TranslateService;
      const result = yield* translation.translate({
        from: "ko",
        to: "en",
        provider: "google-free",
        rawList: [encodedString, cleanString],
      });

      yield* Effect.log("TRANSLATED", result);
      yield* Effect.log(
        "DECODE TRANSLATED",
        warcraftString.decode({ value: result[0] as string, ...props }),
      );

      yield* Effect.log("DEBUG END");
    }),
    TranslateService.Default,
  ),
);
