export default class BPMNError extends Error {
    constructor(errorCode, errorMessage, variables) {
        super(errorMessage);
        this.errorCode = errorCode;
        this.variables = variables;
    }
}
