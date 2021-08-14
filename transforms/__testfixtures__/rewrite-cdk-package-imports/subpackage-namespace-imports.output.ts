import * as cdk from "aws-cdk-lib";
import {
  aws_cloudwatch as cw,
  aws_cloudwatch_actions as cw_actions,
  aws_sns as sns,
  aws_sns_subscriptions as sns_subs,
} from "aws-cdk-lib";

interface BillingAlarmsStackProps extends cdk.StackProps {
  alarmAmount: number;
}

export class BillingAlarmsStack extends cdk.Stack {
  constructor(scope: cdk.App, props: BillingAlarmsStackProps) {
    super(scope, "BillingAlarms", props);
    const { alarmAmount } = props;

    const billingTopic = this.createBillingTopic();

    const billingMetric = new cw.Metric({
      metricName: "EstimatedCharges",
      namespace: "AWS/Billing",
      statistic: "Maximum",
      dimensionsMap: {
        Currency: "USD",
      },
    }).with({
      // https://forums.aws.amazon.com/thread.jspa?threadID=135955
      period: cdk.Duration.hours(9),
    });

    const alarm = new cw.Alarm(this, "EstimatedChargesAlarm", {
      alarmName: "estimated-charges-alarm",
      metric: billingMetric,
      comparisonOperator: cw.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      evaluationPeriods: 1,
      threshold: alarmAmount,
    });

    alarm.addAlarmAction(new cw_actions.SnsAction(billingTopic));
  }

  private createBillingTopic() {
    const billingTopic = new sns.Topic(this, "NotificationTopic", {
      topicName: "BillingAlarmNotificationTopic",
    });

    billingTopic.addSubscription(new sns_subs.EmailSubscription("foo@example.com", { json: true }));

    return billingTopic;
  }
}
