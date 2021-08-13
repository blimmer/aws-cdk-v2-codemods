import { API, FileInfo, JSCodeshift } from "jscodeshift";
import { Collection } from "jscodeshift/src/Collection";

export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);

  handleNamedImport(j, root);
  appendConstructsImport(j, root);

  return root.toSource({
    // https://github.com/benjamn/recast/issues/371#issuecomment-565786863
    reuseWhitespace: false,
  });
}

function handleNamedImport(j: JSCodeshift, root: Collection<any>): boolean {
  const cdkCoreImport = root.find(j.ImportDeclaration, { source: { value: "@aws-cdk/core" } });
  const namedImport = cdkCoreImport.find(j.ImportSpecifier, { imported: { name: "Construct" } });
  if (namedImport.length) {
    namedImport.remove();
  }

  return !!namedImport.length;
}

function appendConstructsImport(j: JSCodeshift, root: Collection<any>) {
  const importStatements = root.find(j.ImportDeclaration);
  const lastImportStatement = importStatements.at(importStatements.size() - 1);

  lastImportStatement.insertAfter(
    j.importDeclaration([j.importSpecifier(j.identifier("Construct"))], j.literal("constructs"))
  );
}
