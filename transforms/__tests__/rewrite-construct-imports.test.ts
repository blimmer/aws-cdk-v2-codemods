import { defineTest } from "jscodeshift/src/testUtils";

describe("rewrite construct imports", () => {
  defineTest(__dirname, "./rewrite-construct-imports", {}, "rewrite-construct-imports/import-construct", {
    parser: "ts",
  });
});
