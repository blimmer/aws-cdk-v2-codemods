import { API, Collection, FileInfo, ImportDeclaration, JSCodeshift } from "jscodeshift";
import { snakeCase } from "lodash";

export default function transformer(file: FileInfo, api: API): string {
  const j = api.jscodeshift;
  const root = j(file.source);

  rewriteNamespaceImportStatements(j, root);
  rewriteNamespacePackageImports(j, root);

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

function rewriteNamespacePackageImports(j: JSCodeshift, root: Collection<unknown>) {
  const matcher = /^@aws-cdk\/(?<subpackage>aws-.*)$/;
  const cdkSubpackageImports = root.find(j.ImportDeclaration).filter((i) => {
    const pkgName: string = i.get("source").get("value").value;
    return matcher.test(pkgName);
  });

  if (cdkSubpackageImports.length) {
    const subpackages = cdkSubpackageImports.nodes().map((iNode) => {
      const i = j(iNode);
      const pkgName: string = i.get("source").get("value").value;

      return {
        namespaceIdentifier: i.find(j.Identifier).get("name").value,
        cdkLibImportName: snakeCase(matcher.exec(pkgName)!.groups!["subpackage"]),
      };
    });

    const cdkLibImport = getOrCreateCdkLibImport(j, root);
  }
}

function getOrCreateCdkLibImport(j: JSCodeshift, root: Collection<unknown>): Collection<ImportDeclaration> {
  // TODO: exclude namespace imports
  const cdkLibImport = root.find(j.ImportDeclaration, { source: { value: "aws-cdk-lib" } });
  if (cdkLibImport.length) {
    return cdkLibImport;
  } else {
    const importStatements = root.find(j.ImportDeclaration);
    const lastImportStatement = importStatements.at(importStatements.size() - 1);
    lastImportStatement.insertAfter(j.importDeclaration([], j.stringLiteral("aws-cdk-lib")));

    return root.find(j.ImportDeclaration, { source: { value: "aws-cdk-lib" } });
  }
}
