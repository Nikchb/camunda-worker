var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Camunda8Worker, BPMNError, Retry } from "camunda-worker";
const worker = new Camunda8Worker({
    ZEEBE_ADDRESS: "localhost:26500",
    ZEEBE_CLIENT_ID: "zeebe",
    ZEEBE_CLIENT_SECRET: "zecret",
    CAMUNDA_OAUTH_URL: "http://localhost:18080/auth/realms/camunda-platform/protocol/openid-connect/token",
    CAMUNDA_TASKLIST_BASE_URL: "http://localhost:8082",
    CAMUNDA_OPERATE_BASE_URL: "http://localhost:8081",
    CAMUNDA_OPTIMIZE_BASE_URL: "http://localhost:8083",
    CAMUNDA_MODELER_BASE_URL: "http://localhost:8070/api",
    CAMUNDA_SECURE_CONNECTION: false,
});
class A {
    constructor() {
        console.log("A.constructor");
    }
    doSomething() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("A.doSomething");
        });
    }
    dispose() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("A.dispose");
        });
    }
}
class B {
    constructor(a) {
        this.a = a;
        console.log("B.constructor");
    }
    doSomething() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("B.doSomething");
        });
    }
    dispose() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("B.dispose");
        });
    }
}
worker.addScoped("classA", (container) => __awaiter(void 0, void 0, void 0, function* () {
    return new A();
}), (a) => __awaiter(void 0, void 0, void 0, function* () {
    yield a.dispose();
}));
worker.addScoped("classB", (container) => __awaiter(void 0, void 0, void 0, function* () {
    return new B(yield container.get("classA"));
}), (b) => __awaiter(void 0, void 0, void 0, function* () {
    yield b.dispose();
}));
worker.registerTask("CamundaWorkerTest_simpleTask", (variables) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("CamundaWorkerTest_simpleTask");
    return {};
}), []);
worker.registerTask("CamundaWorkerTest_BPMNError", (variables) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("CamundaWorkerTest_BPMNError");
    throw new BPMNError("SomeBPMNError");
}), []);
worker.registerTask("CamundaWorkerTest_Inject", (variables, params) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("CamundaWorkerTest_Inject");
    yield params.classB.doSomething();
    return {};
}), ["classB"]);
worker.registerTask("CamundaWorkerTest_Retry", (variables_1, _a) => __awaiter(void 0, [variables_1, _a], void 0, function* (variables, { job }) {
    console.log("CamundaWorkerTest_Retry");
    if (job.retries > 1) {
        throw new Retry(10000);
    }
    return {};
}));
worker.registerTask("CamundaWorkerTest_CustomErrorHandler", (variables_1, _a) => __awaiter(void 0, [variables_1, _a], void 0, function* (variables, { job }) {
    console.log("CamundaWorkerTest_CustomErrorHandler");
    if (job.retries > 1) {
        throw new Error("SomeError");
    }
    return {};
}));
worker.setCustomErrorHandler((error, params) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("CustomErrorHandler is used");
    console.log(error);
    return new Retry(10000);
}));
