import { ZeebeGrpcClient } from "@camunda8/sdk/dist/zeebe";
import ICamundaWorker from "./ICamundaWorker.js";
import WorkerBase from "./WorkerBase.js";
export default class Camunda8Worker extends WorkerBase implements ICamundaWorker {
    private zeebe;
    constructor(zeebe: ZeebeGrpcClient, workerBase?: WorkerBase);
    registerTask(taskType: string, handler: (variables: Record<string, any>, params: any) => Promise<Record<string, any>>, paramNames: string[]): void;
}
