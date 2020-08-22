"use strict";
let Caf = require("caffeine-script-runtime");
Caf.defMod(module, () => {
  return Caf.importInvoke(
    [
      "describe",
      "test",
      "assert",
      "getUpToNextSlash",
      "debugKey",
      "repeat",
      "lastKeyChar",
      "getBisectKey",
      "middleKeyChar",
      "getLastKeyWithPrefix",
    ],
    [global, require("../StandardImport")],
    (
      describe,
      test,
      assert,
      getUpToNextSlash,
      debugKey,
      repeat,
      lastKeyChar,
      getBisectKey,
      middleKeyChar,
      getLastKeyWithPrefix
    ) => {
      return describe({
        getUpToNextSlash: function () {
          test(":this/is/ok 0 -> :this/   ", () =>
            assert.eq("this/", getUpToNextSlash("this/is/ok", 0)));
          test(":this/is/ok 4 -> :this/   ", () =>
            assert.eq("this/", getUpToNextSlash("this/is/ok", 4)));
          test(":this/is/ok 5 -> :this/is/", () =>
            assert.eq("this/is/", getUpToNextSlash("this/is/ok", 5)));
          test(":this/is/ok 6 -> :this/is/", () =>
            assert.eq("this/is/", getUpToNextSlash("this/is/ok", 6)));
          test(":this/is/ok 7 -> :this/is/", () =>
            assert.eq("this/is/", getUpToNextSlash("this/is/ok", 7)));
          test("undefined if no /", () =>
            assert.eq(undefined, getUpToNextSlash("this", 0)));
          test("undefined if > last /", () =>
            assert.eq(undefined, getUpToNextSlash("this/is/okthere", 10)));
          return test("undefined if > length", () =>
            assert.eq(undefined, getUpToNextSlash("this/is/ok", 100)));
        },
        debugKey: function () {
          test("debugKey :a", () => assert.match(debugKey("a"), /^a +$/));
          test("debugKey ''", () =>
            assert.match(debugKey(""), "''                  "));
          return test("debugKey :ab~~~~~~~~~~~", () =>
            assert.eq(
              debugKey("ab" + repeat(lastKeyChar, 10)),
              "ab(~*10)            "
            ));
        },
        getBisectKey: {
          nulls_and_errors: function () {
            test("matching returns null", () =>
              assert.notPresent(getBisectKey("a", "a")));
            test("invalid char in first param", () =>
              assert.rejects(() => getBisectKey("\n", "a")));
            test("invalid char in second param", () =>
              assert.rejects(() => getBisectKey("b", "😀")));
            return test("reverse-order returns null", () =>
              assert.notPresent(getBisectKey("b", "a")));
          },
          basic: function () {
            test(":alpha :alphadude -> :b", () =>
              assert.eq("alphaB", getBisectKey("alpha", "alphadude")));
            test('"alpha" "alpha me" -> "alpha "', () =>
              assert.eq("alpha ", getBisectKey("alpha", "alpha me")));
            test('"alpha" "alpha " -> "alpha "', () =>
              assert.eq("alpha ", getBisectKey("alpha", "alpha ")));
            test(":a :c -> :b", () => assert.eq("b", getBisectKey("a", "c")));
            test(":alphabet :c -> :b", () =>
              assert.eq("b", getBisectKey("alphabet", "c")));
            test(":aa :ac -> :ab", () =>
              assert.eq(
                `aa${Caf.toString(middleKeyChar)}`,
                getBisectKey("aa", "ab")
              ));
            return test("with spaces", () =>
              assert.eq(
                "My `",
                getBisectKey("My Other thing.bar", "My report.foo")
              ));
          },
          bisectPrefix: {
            dirAware: function () {
              return Caf.each2(
                [
                  ["alpha/beta", "z", getLastKeyWithPrefix("alpha/")],
                  [
                    "alpha/beta/gamma",
                    "alpha/boomTown",
                    getLastKeyWithPrefix("alpha/beta/"),
                  ],
                  ["alpha/beta", "alpha/foo", "alpha/d"],
                  [
                    "run2/bcl-sync-status/39e8278706c47520c03865b84b06921a",
                    "u",
                    getLastKeyWithPrefix("run2/"),
                  ],
                ],
                ([a, b, out]) =>
                  test(`${Caf.toString(a)} ${Caf.toString(b)} -> ${Caf.toString(
                    out.slice(0, 25)
                  )}${Caf.toString(out.length > 25 ? "..." : undefined)}`, () =>
                    assert.eq(out, getBisectKey(a, b, true)))
              );
            },
          },
          regressions: function () {
            test(":alpha :T -> notPresent", () =>
              assert.notPresent(getBisectKey("alpha", "T")));
            test(`:alpha :alphb -> :alpha${Caf.toString(middleKeyChar)}`, () =>
              assert.eq(
                `alpha${Caf.toString(middleKeyChar)}`,
                getBisectKey("alpha", "alphb")
              ));
            return test(":./.git/objects/17/3d216b08fff7c71eeb7bf1c7d5e8aef789461e :./.git/obk -> :./.git/objq", () =>
              assert.eq(
                "./.git/objq",
                getBisectKey(
                  "./.git/objects/17/3d216b08fff7c71eeb7bf1c7d5e8aef789461e",
                  "./.git/obk"
                )
              ));
          },
        },
      });
    }
  );
});
