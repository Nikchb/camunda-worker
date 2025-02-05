export default class BPMNError extends Error {
    errorCode;
    variables;
    constructor(errorCode, errorMessage, variables) {
        super(errorMessage);
        this.errorCode = errorCode;
        this.variables = variables;
    }
}
