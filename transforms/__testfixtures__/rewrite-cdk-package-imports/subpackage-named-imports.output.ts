import * as cdk from "aws-cdk-lib";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Topic } from "aws-cdk-lib/aws-sns";
import { EmailSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import path from "path";

export class MyLambdaStack extends cdk.Stack {
  readonly function: NodejsFunction;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const snsTopic = new Topic(this, "topic");
    snsTopic.addSubscription(new EmailSubscription("myemail@example.com"));

    this.function = new NodejsFunction(this, "function", {
      entry: path.join(__dirname, "index.ts"),
      handler: "email",
      environment: {
        SNS_TOPIC_ARN: snsTopic.topicArn,
      },
    });

    this.function.addPermission;
    this.function.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["sns:Publish"],
        resources: [snsTopic.topicArn],
      })
    );
  }
}
