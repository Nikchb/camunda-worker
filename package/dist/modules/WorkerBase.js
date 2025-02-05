import DIContainerTemplate from "ts-dependency-injection-container";
export default class WorkerBase {
    diContainerTemplate;
    constructor(workerBase) {
        if (workerBase) {
            // use container template from another worker
            this.diContainerTemplate = workerBase.getDIContainerTemplate();
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
}
