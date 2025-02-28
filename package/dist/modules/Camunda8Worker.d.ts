import ICamundaWorker from "./ICamundaWorker.js";
import WorkerBase from "./WorkerBase.js";
export default class Camunda8Worker extends WorkerBase implements ICamundaWorker {
    private camunda8;
    private zeebe;
    constructor(config: any, workerBase?: WorkerBase);
    stop(): Promise<void>;
    registerTask(taskType: string, handler: (variables: Record<string, any>, params: any) => Promise<Record<string, any>>, paramNames?: string[]): void;
}
