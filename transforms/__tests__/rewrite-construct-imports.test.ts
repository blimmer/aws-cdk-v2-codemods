import { defineTest } from "jscodeshift/src/testUtils";

describe("rewrite construct imports", () => {
  defineTest(__dirname, "./rewrite-construct-imports", {}, "rewrite-construct-imports/import-construct", {
    parser: "ts",
  });
  defineTest(__dirname, "./rewrite-construct-imports", {}, "rewrite-construct-imports/import-star", {
    parser: "ts",
  });
  defineTest(__dirname, "./rewrite-construct-imports", {}, "rewrite-construct-imports/import-star-multiple-uses", {
    parser: "ts",
  });
  defineTest(__dirname, "./rewrite-construct-imports", {}, "rewrite-construct-imports/no-import", {
    parser: "ts",
  });
});
