import * as cdk from "@aws-cdk/core";
import { Construct } from "constructs";

export default class FooStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);
  }
}
