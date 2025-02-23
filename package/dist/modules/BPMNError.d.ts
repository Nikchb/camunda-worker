export default class BPMNError extends Error {
    errorCode: string;
    variables: Record<string, any>;
    constructor(errorCode: string, variables?: Record<string, any>, errorMessage?: string);
}
