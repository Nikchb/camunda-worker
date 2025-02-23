export default class Retry extends Error {
    retries?: number;
    retryTimeout: number;
    constructor(retryTimeout?: number, retries?: number, message?: string);
}
