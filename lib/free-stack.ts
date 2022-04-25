import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import { aws_apigateway as apigw } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import { ApiKey } from 'aws-cdk-lib/aws-apigateway';
import { PlacementConstraint } from 'aws-cdk-lib/aws-ecs';


export class FreeStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    /*
        new s3.Bucket(this, 'TrashCan2', {
          versioned: false
        });
    */
    const api: apigw.RestApi = new apigw.RestApi(this, "trashapi", {});
    // const mainAPI = trashGW.root.addResource('health-check',{});
    const v1 = api.root.addResource('health-check');
    //const healthCheck = v1.addResource('health-check');

    const healthCheckLambda = new lambda.Function(this, 'health-check-lambda', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'health-check.healthCheck',
      code: lambda.Code.fromAsset(path.join(__dirname, '/../lib/lambdas/')),
    });


    const key = api.addApiKey("trashKey", { apiKeyName: "trashKey", value: "joeythompsonisnumberone" });

    const usagePlan = api.
      addUsagePlan('trashUsage', {
        name: 'trashUP',
        throttle: {
          rateLimit: 10,
          burstLimit: 2
        }
      });

    usagePlan.addApiStage({
      stage: api.deploymentStage
    })

    v1.addMethod(
      'GET',
      new apigw.LambdaIntegration(healthCheckLambda, { proxy: true }),
      { apiKeyRequired: true }
    );

    usagePlan.addApiKey(key);


    this.exportValue(api.url, { name: "apiurl" });
    new cdk.CfnOutput(this, 'apiUrl2', { value: api.url });
    this.exportValue(key.keyId, { name: "trashKey" });

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'AwsQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
