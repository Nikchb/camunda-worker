export default class Retry extends Error {
    retries: number;
    constructor(retries: number, message?: string);
}
