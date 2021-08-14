import { defineTest } from "jscodeshift/src/testUtils";

describe("rewrite cdk package imports", () => {
  defineTest(__dirname, "./rewrite-cdk-package-imports", {}, "rewrite-cdk-package-imports/cdk-namespace-import", {
    parser: "ts",
  });
});
