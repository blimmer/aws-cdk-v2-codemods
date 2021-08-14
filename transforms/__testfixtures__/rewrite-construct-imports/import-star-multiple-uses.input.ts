import * as cdk from "@aws-cdk/core";

export default class FooStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);
  }

  private someMethod(scope: cdk.Construct) {}
}
