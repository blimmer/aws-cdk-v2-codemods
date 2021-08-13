import { Stack, StackProps } from "@aws-cdk/core";
import { Construct } from "constructs";

export default class FooStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);
  }
}
