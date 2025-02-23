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

  public async doSomething() {
    console.log("A.doSomething");
  }

  public async dispose() {
    console.log("A.dispose");
  }
}

class B {
  public a: A;

  constructor(a: A) {
    this.a = a;
    console.log("B.constructor");
  }

  public async doSomething() {
    console.log("B.doSomething");
  }

  public async dispose() {
    console.log("B.dispose");
  }
}

worker.addScoped(
  "classA",
  async (container) => {
    return new A();
  },
  async (a) => {
    await a.dispose();
  }
);

worker.addScoped(
  "classB",
  async (container) => {
    return new B(await container.get<A>("classA"));
  },
  async (b) => {
    await b.dispose();
  }
);

worker.registerTask(
  "CamundaWorkerTest_simpleTask",
  async (variables) => {
    console.log("CamundaWorkerTest_simpleTask");
    return {};
  },
  []
);

worker.registerTask(
  "CamundaWorkerTest_BPMNError",
  async (variables) => {
    console.log("CamundaWorkerTest_BPMNError");
    throw new BPMNError("SomeBPMNError");
  },
  []
);

worker.registerTask(
  "CamundaWorkerTest_Inject",
  async (variables, params: { classB: B }) => {
    console.log("CamundaWorkerTest_Inject");
    await params.classB.doSomething();
    return {};
  },
  ["classB"]
);

worker.registerTask("CamundaWorkerTest_Retry", async (variables, { job }) => {
  console.log("CamundaWorkerTest_Retry");
  if (job.retries > 1) {
    throw new Retry(10000);
  }
  return {};
});

worker.registerTask("CamundaWorkerTest_CustomErrorHandler", async (variables, { job }) => {
  console.log("CamundaWorkerTest_CustomErrorHandler");
  if (job.retries > 1) {
    throw new Error("SomeError");
  }
  return {};
});

worker.setCustomErrorHandler(async (error, params) => {
  console.log("CustomErrorHandler is used");
  console.log(error);
  return new Retry(10000);
});
