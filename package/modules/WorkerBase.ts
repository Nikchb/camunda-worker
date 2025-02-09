import DIContainerTemplate, { IDIContainer } from "ts-dependency-injection-container";
import Retry from "./Retry";

export default class WorkerBase {
  protected diContainerTemplate: DIContainerTemplate;
  protected customErrorHandler?: (error: any, params: any) => Promise<Retry | void>;

  constructor(workerBase?: WorkerBase) {
    if (workerBase) {
      // use container template from another worker
      this.diContainerTemplate = workerBase.getDIContainerTemplate();
      this.customErrorHandler = workerBase.customErrorHandler;
    } else {
      // create new container template
      this.diContainerTemplate = new DIContainerTemplate();
    }
  }

  public getDIContainerTemplate(): DIContainerTemplate {
    return this.diContainerTemplate;
  }

  public addSingelton<T>(key: string, create: (container: IDIContainer) => Promise<T>, dispose: (instance: T) => Promise<void>) {
    this.diContainerTemplate.addSingelton<T>(key, create, dispose);
  }

  public addScoped<T>(key: string, create: (container: IDIContainer) => Promise<T>, dispose: (instance: T) => Promise<void>) {
    this.diContainerTemplate.addScoped<T>(key, create, dispose);
  }

  public addTransient<T>(key: string, create: (container: IDIContainer) => Promise<T>, dispose: (instance: T) => Promise<void>) {
    this.diContainerTemplate.addTransient<T>(key, create, dispose);
  }

  public setCustomErrorHandler(handler: (error: any, params: any) => Promise<Retry | void>) {
    this.customErrorHandler = handler;
  }

  protected async injectTaskParams(di: IDIContainer, paramNames: string[], defaultParams: any = {}) {
    const params = { ...defaultParams };
    for (const paramName of paramNames) {
      params[paramName] = await di.get(paramName);
    }
    return params;
  }
}
