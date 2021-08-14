import { API, Collection, FileInfo, JSCodeshift } from "jscodeshift";

export default function transformer(file: FileInfo, api: API): string {
  const j = api.jscodeshift;
  const root = j(file.source);

  rewriteNamespaceImportStatements(j, root);

  return root.toSource({
    // https://github.com/benjamn/recast/issues/371#issuecomment-565786863
    reuseWhitespace: false,
  });
}

function rewriteNamespaceImportStatements(j: JSCodeshift, root: Collection<unknown>) {
  const cdkCoreImport = root.find(j.ImportDeclaration, { source: { value: "@aws-cdk/core" } });
  const namespaceImport = cdkCoreImport.find(j.ImportNamespaceSpecifier);

  if (namespaceImport.length) {
    j(cdkCoreImport.get("source")).replaceWith(j.stringLiteral("aws-cdk-lib"));
  }
}
