var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import WorkerBase from "./WorkerBase.js";
import BPMNError from "./BPMNError.js";
import Retry from "./Retry.js";
export default class Camunda8Worker extends WorkerBase {
    constructor(zeebe, workerBase) {
        super(workerBase);
        this.zeebe = zeebe;
    }
    registerTask(taskType, handler, paramNames) {
        this.zeebe.createWorker({
            taskType,
            taskHandler: (job) => __awaiter(this, void 0, void 0, function* () {
                let di;
                try {
                    // create DI container
                    di = this.diContainerTemplate.createContainer();
                    // get objects to inject into handler
                    const params = { job }; // job is always injected
                    for (const paramName of paramNames) {
                        params[paramName] = yield di.get(paramName);
                    }
                    // call handler
                    const variables = yield handler(job.variables, params);
                    // complete task
                    return job.complete(variables);
                }
                catch (error) {
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
                }
                finally {
                    // dispose DI container
                    di === null || di === void 0 ? void 0 : di.dispose();
                }
            }),
        });
    }
}
