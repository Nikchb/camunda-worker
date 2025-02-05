var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Variables, } from "camunda-external-task-client-js";
import WorkerBase from "./WorkerBase.js";
import BPMNError from "./BPMNError.js";
import Retry from "./Retry.js";
export default class Camunda7Worker extends WorkerBase {
    constructor(client, workerBase) {
        super(workerBase);
        this.client = client;
    }
    mapProcessVariables(variables) {
        const processVariables = new Variables();
        for (const [key, value] of Object.entries(variables)) {
            processVariables.set(key, value);
        }
        return processVariables;
    }
    registerTask(taskType, handler, paramNames) {
        this.client.subscribe(taskType, (_a) => __awaiter(this, [_a], void 0, function* ({ task, taskService, }) {
            let di;
            const localVariables = new Variables();
            try {
                // create DI container
                di = this.diContainerTemplate.createContainer();
                // get objects to inject into handler
                const params = { task, taskService }; // task and taskService are always injected
                for (const paramName of paramNames) {
                    params[paramName] = yield di.get(paramName);
                }
                // call handler
                const variables = yield handler(task.variables.getAll(), params);
                // complete task
                return taskService.complete(task, this.mapProcessVariables(variables), localVariables);
            }
            catch (error) {
                // handle error
                if (error instanceof BPMNError) {
                    // handle bpmn error
                    return taskService.handleBpmnError(task, error.errorCode, error.message, this.mapProcessVariables(error.variables));
                }
                if (error instanceof Retry) {
                    // handle retry
                    return taskService.handleFailure(task, {
                        errorMessage: error.message,
                        errorDetails: JSON.stringify(error),
                        retries: error.retries,
                    });
                }
                // handle failure
                return taskService.handleFailure(task, {
                    errorMessage: error.message,
                    errorDetails: JSON.stringify(error),
                });
            }
            finally {
                // dispose DI container
                di === null || di === void 0 ? void 0 : di.dispose();
            }
        }));
    }
}
