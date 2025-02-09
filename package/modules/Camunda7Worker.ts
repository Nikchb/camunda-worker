import { Client, Variables, Task, TaskService } from "camunda-external-task-client-js";
import { IDIContainer } from "ts-dependency-injection-container";
import ICamundaWorker from "./ICamundaWorker.js";
import WorkerBase from "./WorkerBase.js";
import BPMNError from "./BPMNError.js";
import Retry from "./Retry.js";

export default class Camunda7Worker extends WorkerBase implements ICamundaWorker {
  private client: Client;

  constructor(client: Client, workerBase?: WorkerBase) {
    super(workerBase);
    this.client = client;
  }

  private mapProcessVariables(variables: Record<string, any>): Variables {
    const processVariables = new Variables();
    for (const [key, value] of Object.entries(variables)) {
      processVariables.set(key, value);
    }
    return processVariables;
  }

  public registerTask(taskType: string, handler: (variables: Record<string, any>, params: any) => Promise<Record<string, any>>, paramNames: string[]) {
    this.client.subscribe(taskType, async ({ task, taskService }: { task: Task; taskService: TaskService }) => {
      let di: IDIContainer | undefined;
      const localVariables = new Variables();
      try {
        // create DI container
        di = this.diContainerTemplate.createContainer();
        // get objects to inject into handler
        const params: any = this.injectTaskParams(di, paramNames, { task, taskService });
        // call handler
        const variables = await handler(task.variables.getAll(), params);
        // complete task
        return taskService.complete(task, this.mapProcessVariables(variables), localVariables);
      } catch (error: any) {
        // handle error
        if (error instanceof BPMNError) {
          // handle bpmn error
          return taskService.handleBpmnError(task, error.errorCode, error.message, this.mapProcessVariables(error.variables));
        }
        if (error instanceof Retry) {
          // handle retry
          return taskService.handleFailure(task, {
            errorMessage: error.message,
            retries: error.retries,
            retryTimeout: error.retryTimeout,
          });
        }
        // check if custom error handler is set
        if (this.customErrorHandler && di) {
          const params = this.injectTaskParams(di, paramNames);
          const retry = await this.customErrorHandler(error, params);
          // handle retry
          if (retry) {
            return taskService.handleFailure(task, {
              errorMessage: error.message,
              retries: retry.retries,
              retryTimeout: retry.retryTimeout,
            });
          }
        }
        // handle failure
        return taskService.handleFailure(task, {
          errorMessage: error.message,
          errorDetails: JSON.stringify(error),
        });
      } finally {
        // dispose DI container
        di?.dispose();
      }
    });
  }
}
