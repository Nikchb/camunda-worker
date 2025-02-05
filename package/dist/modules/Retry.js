export default class Retry extends Error {
    constructor(retries, message) {
        super(message !== null && message !== void 0 ? message : "Retry");
        this.retries = retries;
    }
}
