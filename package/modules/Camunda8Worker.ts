import { ZeebeGrpcClient } from "@camunda8/sdk/dist/zeebe";
import { Camunda8 } from "@camunda8/sdk";
import { IDIContainer } from "ts-dependency-injection-container";
import ICamundaWorker from "./ICamundaWorker.js";
import WorkerBase from "./WorkerBase.js";
import BPMNError from "./BPMNError.js";
import Retry from "./Retry.js";

export default class Camunda8Worker extends WorkerBase implements ICamundaWorker {
  private camunda8: Camunda8;
  private zeebe: ZeebeGrpcClient;

  constructor(config: any, workerBase?: WorkerBase) {
    super(workerBase);

    this.camunda8 = new Camunda8(config);
    this.zeebe = this.camunda8.getZeebeGrpcApiClient();
  }

  public async stop() {
    await this.zeebe.close();
  }

  public registerTask(taskType: string, handler: (variables: Record<string, any>, params: any) => Promise<Record<string, any>>, paramNames: string[] = []) {
    this.zeebe.createWorker({
      taskType,
      taskHandler: async (job) => {
        let di: IDIContainer | undefined;
        const defaultParams = { job };
        try {
          // create DI container
          di = this.diContainerTemplate.createContainer();

          // execute middlewares
          await this.executeMiddlewares(di, defaultParams);

          // get objects to inject into handler
          const params: any = await this.injectTaskParams(di, paramNames, defaultParams);

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
            return job.fail({ retries: error.retries ?? job.retries - 1, retryBackOff: error.retryTimeout, errorMessage: error.message });
          }
          if (this.customErrorHandler && di) {
            const params = await this.injectTaskParams(di, paramNames, defaultParams);
            const retry = await this.customErrorHandler(error, params);
            // handle retry
            if (retry) {
              return job.fail({ retries: retry.retries ?? job.retries - 1, retryBackOff: retry.retryTimeout, errorMessage: error.message });
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
