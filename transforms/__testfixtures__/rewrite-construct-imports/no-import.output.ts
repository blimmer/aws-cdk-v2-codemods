import { App, Stack, StackProps } from "@aws-cdk/core";

export default class FooStack extends Stack {
  constructor(scope: App, id: string, props: StackProps) {
    super(scope, id, props);
  }
}
