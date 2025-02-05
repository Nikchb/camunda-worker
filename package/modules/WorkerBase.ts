import DIContainerTemplate, {
  IDIContainer,
} from "ts-dependency-injection-container";

export default class WorkerBase {
  protected diContainerTemplate: DIContainerTemplate;
  constructor(workerBase?: WorkerBase) {
    if (workerBase) {
      // use container template from another worker
      this.diContainerTemplate = workerBase.getDIContainerTemplate();
    } else {
      // create new container template
      this.diContainerTemplate = new DIContainerTemplate();
    }
  }

  public getDIContainerTemplate(): DIContainerTemplate {
    return this.diContainerTemplate;
  }

  public addSingelton<T>(
    key: string,
    create: (container: IDIContainer) => Promise<T>,
    dispose: (instance: T) => Promise<void>
  ) {
    this.diContainerTemplate.addSingelton<T>(key, create, dispose);
  }

  public addScoped<T>(
    key: string,
    create: (container: IDIContainer) => Promise<T>,
    dispose: (instance: T) => Promise<void>
  ) {
    this.diContainerTemplate.addScoped<T>(key, create, dispose);
  }

  public addTransient<T>(
    key: string,
    create: (container: IDIContainer) => Promise<T>,
    dispose: (instance: T) => Promise<void>
  ) {
    this.diContainerTemplate.addTransient<T>(key, create, dispose);
  }
}
