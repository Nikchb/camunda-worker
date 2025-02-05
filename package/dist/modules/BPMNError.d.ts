export default class BPMNError extends Error {
    errorCode: string;
    variables: Record<string, any>;
    constructor(errorCode: string, errorMessage: string, variables: Record<string, any>);
}
