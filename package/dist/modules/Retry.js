export default class Retry extends Error {
    retries;
    constructor(retries, message) {
        super(message ?? "Retry");
        this.retries = retries;
    }
}
