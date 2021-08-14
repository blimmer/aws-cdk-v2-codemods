import * as cdk from "@aws-cdk/core";

export default class FooStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: cdk.StackProps) {
    super(scope, id, props);
  }
}
