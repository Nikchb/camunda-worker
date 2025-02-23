var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import DIContainerTemplate from "ts-dependency-injection-container";
export default class WorkerBase {
    constructor(workerBase) {
        if (workerBase) {
            // use container template from another worker
            this.diContainerTemplate = workerBase.getDIContainerTemplate();
            this.customErrorHandler = workerBase.customErrorHandler;
        }
        else {
            // create new container template
            this.diContainerTemplate = new DIContainerTemplate();
        }
    }
    getDIContainerTemplate() {
        return this.diContainerTemplate;
    }
    addSingelton(key, create, dispose) {
        this.diContainerTemplate.addSingelton(key, create, dispose);
    }
    addScoped(key, create, dispose) {
        this.diContainerTemplate.addScoped(key, create, dispose);
    }
    addTransient(key, create, dispose) {
        this.diContainerTemplate.addTransient(key, create, dispose);
    }
    setCustomErrorHandler(handler) {
        this.customErrorHandler = handler;
    }
    injectTaskParams(di_1, paramNames_1) {
        return __awaiter(this, arguments, void 0, function* (di, paramNames, defaultParams = {}) {
            const params = Object.assign({}, defaultParams);
            for (const paramName of paramNames) {
                params[paramName] = yield di.get(paramName);
            }
            return params;
        });
    }
}
