import { defineTest } from "jscodeshift/src/testUtils";
import globby from "globby";
import path from "path";

export function createTestsForTransform(transform: string): void {
  globby.sync(path.join(__dirname, "..", "__testfixtures__", `${transform}/*.input.ts`)).forEach((t) => {
    defineTest(__dirname, `./${transform}`, {}, `${transform}/${path.basename(t).replace(".input.ts", "")}`, {
      parser: "ts",
    });
  });
}
