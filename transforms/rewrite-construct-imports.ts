import { API, FileInfo, JSCodeshift } from "jscodeshift";
import { Collection } from "jscodeshift/src/Collection";

export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);

  const didRewrite = [handleNamedImport(j, root), handleNamespaceImport(j, root)].find((r) => r === true);
  if (didRewrite) {
    appendConstructsImport(j, root);
  }

  return root.toSource({
    // https://github.com/benjamn/recast/issues/371#issuecomment-565786863
    reuseWhitespace: false,
  });
}

/**
 * This handles named imports, e.g.,
 *
 * ```
 * import { Construct } from '@aws-cdk/core';
 * ```
 */
function handleNamedImport(j: JSCodeshift, root: Collection<any>): boolean {
  const cdkCoreImport = root.find(j.ImportDeclaration, { source: { value: "@aws-cdk/core" } });
  const namedImport = cdkCoreImport.find(j.ImportSpecifier, { imported: { name: "Construct" } });
  if (namedImport.length) {
    namedImport.remove();
  }

  return namedImport.length > 0;
}

/**
 * This handles namespace imports, e.g.,
 *
 * ```
 * import * as cdk from '@aws-cdk/core';
 * ```
 */
function handleNamespaceImport(j: JSCodeshift, root: Collection<any>): boolean {
  const cdkCoreImport = root.find(j.ImportDeclaration, { source: { value: "@aws-cdk/core" } });
  const namespaceImport = cdkCoreImport.find(j.ImportNamespaceSpecifier);

  if (namespaceImport.length) {
    const namespaceIdentifier = namespaceImport.find(j.Identifier).get("name").value;
    const cdkConstructUsages = root.find(j.TSTypeReference).filter((r) => {
      return (
        r.get("typeName").get("left").get("name").value === namespaceIdentifier &&
        r.get("typeName").get("right").get("name").value === "Construct"
      );
    });

    cdkConstructUsages.forEach((r) => {
      j(r).replaceWith(j.tsTypeReference(j.identifier("Construct")));
    });

    return cdkConstructUsages.length > 0;
  } else {
    return false;
  }
}

function appendConstructsImport(j: JSCodeshift, root: Collection<any>) {
  const importStatements = root.find(j.ImportDeclaration);
  const lastImportStatement = importStatements.at(importStatements.size() - 1);

  lastImportStatement.insertAfter(
    j.importDeclaration([j.importSpecifier(j.identifier("Construct"))], j.literal("constructs"))
  );
}
