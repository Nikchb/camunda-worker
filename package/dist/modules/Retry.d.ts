export default class Retry extends Error {
    retries?: number;
    retryTimeout: number;
    errorDetails?: string;
    constructor(retryTimeout?: number, retries?: number, message?: string, errorDetails?: string);
}
