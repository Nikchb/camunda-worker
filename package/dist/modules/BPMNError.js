export default class BPMNError extends Error {
    constructor(errorCode, variables = {}, errorMessage) {
        super(errorMessage !== null && errorMessage !== void 0 ? errorMessage : "BPMN Error");
        this.errorCode = errorCode;
        this.variables = variables;
    }
}
