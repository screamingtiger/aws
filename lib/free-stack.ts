import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import { aws_apigateway as apigw } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';


export class FreeStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new s3.Bucket(this, 'TrashCan2', {
      versioned: false
    });

    const trashGW : apigw.RestApi = new apigw.RestApi(this,"trashapi", {});
    const todos = trashGW.root.addResource('health-check');

    const healthCheckLambda = new lambda.Function(this, 'health-check-lambda', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'health-check.healthCheck',
      code: lambda.Code.fromAsset(path.join(__dirname, '/../lib/lambdas/')),
    });

    todos.addMethod(
      'GET',
      new apigw.LambdaIntegration(healthCheckLambda, {proxy: true}),
    );
    this.exportValue(trashGW.url,{name: "apiurl"});
    new cdk.CfnOutput(this, 'apiUrl2', {value: trashGW.url});
    


    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'AwsQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
