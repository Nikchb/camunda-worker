export default class BPMNError extends Error {
    constructor(errorCode, variables = {}, errorMessage) {
        super(errorMessage !== null && errorMessage !== void 0 ? errorMessage : "");
        this.errorCode = errorCode;
        this.variables = variables;
    }
}
