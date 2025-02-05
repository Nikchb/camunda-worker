import { Client } from "camunda-external-task-client-js";
import ICamundaWorker from "./ICamundaWorker.js";
import WorkerBase from "./WorkerBase.js";
export declare class Camunda7Worker extends WorkerBase implements ICamundaWorker {
    private client;
    constructor(client: Client, workerBase?: WorkerBase);
    private mapProcessVariables;
    registerTask(taskType: string, handler: (variables: Record<string, any>, params: any) => Promise<Record<string, any>>, paramNames: string[]): void;
}
