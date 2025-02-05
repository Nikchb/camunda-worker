import DIContainerTemplate, { IDIContainer } from "ts-dependency-injection-container";
export default class WorkerBase {
    protected diContainerTemplate: DIContainerTemplate;
    constructor(workerBase?: WorkerBase);
    getDIContainerTemplate(): DIContainerTemplate;
    addSingelton<T>(key: string, create: (container: IDIContainer) => Promise<T>, dispose: (instance: T) => Promise<void>): void;
    addScoped<T>(key: string, create: (container: IDIContainer) => Promise<T>, dispose: (instance: T) => Promise<void>): void;
    addTransient<T>(key: string, create: (container: IDIContainer) => Promise<T>, dispose: (instance: T) => Promise<void>): void;
}
