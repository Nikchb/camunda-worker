export default class Retry extends Error {
    constructor(retryTimeout = 60 * 1000, retries, message) {
        super(message !== null && message !== void 0 ? message : "Retry");
        this.retries = retries;
        this.retryTimeout = retryTimeout;
    }
}
