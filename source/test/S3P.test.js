"use strict";
let Caf = require("caffeine-script-runtime");
Caf.defMod(module, () => {
  return Caf.importInvoke(
    [
      "describe",
      "test",
      "S3Comprehensions",
      "mockS3",
      "assert",
      "getLargeFileList",
    ],
    [global, require("./StandardImport"), require("./TestLib")],
    (describe, test, S3Comprehensions, mockS3, assert, getLargeFileList) => {
      return describe({
        each: function () {
          test("3-items", () =>
            S3Comprehensions.each({
              limit: 2,
              quiet: true,
              s3: mockS3("alpha", "beta", "gamma"),
            }).then((out) => assert.selectedEq({ items: 3 }, out)));
          test("limit:3", () =>
            S3Comprehensions.each({
              quiet: true,
              limit: 3,
              s3: mockS3("alpha", "beta", "gamma"),
            }).then((out) => assert.selectedEq({ items: 3 }, out)));
          test("limit:4", () =>
            S3Comprehensions.each({
              quiet: true,
              limit: 4,
              s3: mockS3("alpha", "beta", "gamma"),
            }).then((out) => assert.selectedEq({ items: 3 }, out)));
          test("limit:2 large common prefix", () =>
            S3Comprehensions.each({
              quiet: true,
              limit: 2,
              s3: mockS3(
                "some/path/to/my/files/alpha",
                "some/path/to/my/files/beta",
                "some/path/to/my/files/gamma"
              ),
            }).then((out) => assert.selectedEq({ items: 3 }, out)));
          test("each_custom_count_3", () => {
            let count, files;
            count = 0;
            return S3Comprehensions.each({
              quiet: true,
              limit: 2,
              map: () => count++,
              s3: mockS3((files = ["alpha", "beta", "gamma"])),
            }).then((out) => {
              assert.eq(files.length, count);
              return assert.eq(out.items, count);
            });
          });
          test("each_custom_count_10", () => {
            let count, files;
            count = 0;
            return S3Comprehensions.each({
              quiet: true,
              limit: 2,
              map: () => count++,
              s3: mockS3(
                (files = [
                  "059",
                  "0934t09g",
                  "alpha",
                  "alpha123",
                  "alpha9",
                  "as09df",
                  "asd",
                  "asdf",
                  "beta",
                  "gamma",
                ])
              ),
            }).then((out) => {
              assert.eq(files.length, count);
              return assert.eq(out.items, count);
            });
          });
          return test("largeList", () =>
            getLargeFileList().then((files) =>
              S3Comprehensions.each({
                quiet: true,
                s3: mockS3(files),
              }).then((result) =>
                assert.selectedEq({ items: files.length }, result)
              )
            ));
        },
      });
    }
  );
});
