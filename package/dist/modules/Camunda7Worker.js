var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Client, Variables } from "camunda-external-task-client-js";
import WorkerBase from "./WorkerBase.js";
import BPMNError from "./BPMNError.js";
import Retry from "./Retry.js";
export default class Camunda7Worker extends WorkerBase {
    constructor(config, workerBase) {
        super(workerBase);
        this.client = new Client(config);
    }
    mapProcessVariables(variables) {
        const processVariables = new Variables();
        for (const [key, value] of Object.entries(variables)) {
            processVariables.set(key, value);
        }
        return processVariables;
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            this.client.stop();
        });
    }
    registerTask(taskType, handler, paramNames = []) {
        this.client.subscribe(taskType, (_a) => __awaiter(this, [_a], void 0, function* ({ task, taskService }) {
            let di;
            const localVariables = new Variables();
            const defaultParams = { task, taskService };
            try {
                // create DI container
                di = this.diContainerTemplate.createContainer();
                // execute middlewares
                yield this.executeMiddlewares(di, defaultParams);
                // get objects to inject into handler
                const params = yield this.injectTaskParams(di, paramNames, defaultParams);
                // call handler
                const variables = yield handler(task.variables.getAll(), params);
                // complete task
                return taskService.complete(task, this.mapProcessVariables(variables), localVariables);
            }
            catch (error) {
                try {
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
                            errorDetails: error.errorDetails,
                        });
                    }
                    // check if custom error handler is set
                    if (this.customErrorHandler && di) {
                        const params = yield this.injectTaskParams(di, paramNames, defaultParams);
                        const retry = yield this.customErrorHandler(error, params);
                        // handle retry
                        if (retry) {
                            return taskService.handleFailure(task, {
                                errorMessage: error.message,
                                retries: retry.retries,
                                retryTimeout: retry.retryTimeout,
                                errorDetails: retry.errorDetails,
                            });
                        }
                    }
                }
                catch (e) {
                    // handle failure
                    return taskService.handleFailure(task, {
                        errorMessage: e.message,
                        errorDetails: JSON.stringify(e),
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
