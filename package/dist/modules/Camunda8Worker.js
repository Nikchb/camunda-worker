var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Camunda8 } from "@camunda8/sdk";
import WorkerBase from "./WorkerBase.js";
import BPMNError from "./BPMNError.js";
import Retry from "./Retry.js";
export default class Camunda8Worker extends WorkerBase {
    constructor(config, workerBase) {
        super(workerBase);
        this.camunda8 = new Camunda8(config);
        this.zeebe = this.camunda8.getZeebeGrpcApiClient();
    }
    registerTask(taskType, handler, paramNames = []) {
        this.zeebe.createWorker({
            taskType,
            taskHandler: (job) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                let di;
                try {
                    // create DI container
                    di = this.diContainerTemplate.createContainer();
                    // get objects to inject into handler
                    const params = yield this.injectTaskParams(di, paramNames, { job });
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
                        return job.fail({ retries: (_a = error.retries) !== null && _a !== void 0 ? _a : job.retries - 1, retryBackOff: error.retryTimeout, errorMessage: error.message });
                    }
                    if (this.customErrorHandler && di) {
                        const params = yield this.injectTaskParams(di, paramNames, { job });
                        const retry = yield this.customErrorHandler(error, params);
                        // handle retry
                        if (retry) {
                            return job.fail({ retries: (_b = retry.retries) !== null && _b !== void 0 ? _b : job.retries - 1, retryBackOff: retry.retryTimeout, errorMessage: error.message });
                        }
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
