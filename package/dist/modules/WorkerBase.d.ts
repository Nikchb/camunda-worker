import DIContainerTemplate, { IDIContainer } from "ts-dependency-injection-container";
import Retry from "./Retry";
export default class WorkerBase {
    protected diContainerTemplate: DIContainerTemplate;
    protected customErrorHandler?: (error: any, params: any) => Promise<Retry | void>;
    constructor(workerBase?: WorkerBase);
    getDIContainerTemplate(): DIContainerTemplate;
    addSingelton<T>(key: string, create: (container: IDIContainer) => Promise<T>, dispose: (instance: T) => Promise<void>): void;
    addScoped<T>(key: string, create: (container: IDIContainer) => Promise<T>, dispose: (instance: T) => Promise<void>): void;
    addTransient<T>(key: string, create: (container: IDIContainer) => Promise<T>, dispose: (instance: T) => Promise<void>): void;
    setCustomErrorHandler(handler: (error: any, params: any) => Promise<Retry | void>): void;
    protected injectTaskParams(di: IDIContainer, paramNames: string[], defaultParams?: any): Promise<any>;
}
