import { Construct, Stack, StackProps } from "@aws-cdk/core";

export default class FooStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);
  }
}
