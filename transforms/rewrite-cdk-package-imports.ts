import { API, Collection, FileInfo, ImportDeclaration, ImportSpecifier, JSCodeshift } from "jscodeshift";
import { snakeCase } from "lodash";

const SERVICE_MATCHER = /^@aws-cdk\/(?<subpackage>aws-.*)$/;

export default function transformer(file: FileInfo, api: API): string {
  const j = api.jscodeshift;
  const root = j(file.source);

  rewriteNamespacePackageImports(j, root);
  rewriteNamespaceImportStatements(j, root);

  return root.toSource({
    // https://github.com/benjamn/recast/issues/371#issuecomment-565786863
    reuseWhitespace: false,
  });
}

function getServiceImports(j: JSCodeshift, root: Collection<unknown>) {
  return root.find(j.ImportDeclaration).filter((i) => {
    const pkgName: string = i.get("source").get("value").value;
    return SERVICE_MATCHER.test(pkgName);
  });
}

function rewriteNamespaceImportStatements(j: JSCodeshift, root: Collection<unknown>) {
  const cdkCoreImport = root.find(j.ImportDeclaration, { source: { value: "@aws-cdk/core" } });
  const namespaceImport = cdkCoreImport.find(j.ImportNamespaceSpecifier);

  if (namespaceImport.length) {
    j(cdkCoreImport.get("source")).replaceWith(j.stringLiteral("aws-cdk-lib"));
  }
}

interface NamespacePackageImport {
  namespaceIdentifier: string;
  cdkLibImportName: string;
}

function rewriteNamespacePackageImports(j: JSCodeshift, root: Collection<unknown>) {
  const serviceImports = getServiceImports(j, root);
  const namespacedServiceImports = serviceImports.filter((si) => {
    return j(si).find(j.ImportNamespaceSpecifier).length > 0;
  });

  if (!namespacedServiceImports.length) {
    return;
  }

  const subpackages: NamespacePackageImport[] = namespacedServiceImports.nodes().map((iNode) => {
    const i = j(iNode);
    const pkgName: string = i.get("source").get("value").value;

    return {
      namespaceIdentifier: i.find(j.Identifier).get("name").value,
      cdkLibImportName: snakeCase(SERVICE_MATCHER.exec(pkgName)!.groups!["subpackage"]),
    };
  });

  const importStatements = root.find(j.ImportDeclaration);
  const lastImportStatement = importStatements.at(importStatements.size() - 1);
  lastImportStatement.insertAfter(
    j.importDeclaration(namedImportsFromSubpackages(j, subpackages), j.stringLiteral("aws-cdk-lib"))
  );

  namespacedServiceImports.remove();
}

function namedImportsFromSubpackages(
  j: JSCodeshift,
  namespacePackageImports: NamespacePackageImport[]
): ImportSpecifier[] {
  return namespacePackageImports.map((s) => {
    return j.importSpecifier(j.identifier(s.cdkLibImportName), j.identifier(s.namespaceIdentifier));
  });
}
