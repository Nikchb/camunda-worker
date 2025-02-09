import { ZeebeGrpcClient } from "@camunda8/sdk/dist/zeebe";
import { IDIContainer } from "ts-dependency-injection-container";
import ICamundaWorker from "./ICamundaWorker.js";
import WorkerBase from "./WorkerBase.js";
import BPMNError from "./BPMNError.js";
import Retry from "./Retry.js";

export default class Camunda8Worker extends WorkerBase implements ICamundaWorker {
  private zeebe: ZeebeGrpcClient;

  constructor(zeebe: ZeebeGrpcClient, workerBase?: WorkerBase) {
    super(workerBase);
    this.zeebe = zeebe;
  }

  public registerTask(taskType: string, handler: (variables: Record<string, any>, params: any) => Promise<Record<string, any>>, paramNames: string[]) {
    this.zeebe.createWorker({
      taskType,
      taskHandler: async (job) => {
        let di: IDIContainer | undefined;
        try {
          // create DI container
          di = this.diContainerTemplate.createContainer();
          // get objects to inject into handler
          const params: any = this.injectTaskParams(di, paramNames, { job });
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
            return job.fail({ retries: error.retries, retryBackOff: error.retryTimeout, errorMessage: error.message });
          }
          if (this.customErrorHandler && di) {
            const params = this.injectTaskParams(di, paramNames, { job });
            const retry = await this.customErrorHandler(error, params);
            // handle retry
            if (retry) {
              return job.fail({ retries: retry.retries, retryBackOff: retry.retryTimeout, errorMessage: error.message });
            }
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
