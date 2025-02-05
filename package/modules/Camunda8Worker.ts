import { ZeebeGrpcClient } from "@camunda8/sdk/dist/zeebe";
import { IDIContainer } from "ts-dependency-injection-container";
import ICamundaWorker from "./ICamundaWorker.js";
import WorkerBase from "./WorkerBase.js";
import BPMNError from "./BPMNError.js";
import Retry from "./Retry.js";

export default class Camunda8Worker
  extends WorkerBase
  implements ICamundaWorker
{
  private zeebe: ZeebeGrpcClient;

  constructor(zeebe: ZeebeGrpcClient, workerBase?: WorkerBase) {
    super(workerBase);
    this.zeebe = zeebe;
  }

  public registerTask(
    taskType: string,
    handler: (
      variables: Record<string, any>,
      params: any
    ) => Promise<Record<string, any>>,
    paramNames: string[]
  ) {
    this.zeebe.createWorker({
      taskType,
      taskHandler: async (job) => {
        let di: IDIContainer | undefined;
        try {
          // create DI container
          di = this.diContainerTemplate.createContainer();
          // get objects to inject into handler
          const params: any = { job }; // job is always injected
          for (const paramName of paramNames) {
            params[paramName] = await di.get(paramName);
          }
          // call handler
          const variables = await handler(job.variables, params);
          // complete task
          return job.complete(variables);
        } catch (error: any) {
          // handle error
          if (error instanceof BPMNError) {
            // handle bpmn error
            return job.error({
              errorCode: error.errorCode,
              errorMessage: error.message,
              variables: error.variables,
            });
          }
          if (error instanceof Retry) {
            // handle retry
            return job.fail(error.message, error.retries);
          }
          // handle failure
          return job.fail(error.message);
        } finally {
          // dispose DI container
          di?.dispose();
        }
      },
    });
  }
}
