export default class Retry extends Error {
  public retries?: number; // default 1
  public retryTimeout: number; // in milliseconds default 60 seconds

  constructor(retryTimeout: number = 60 * 1000, retries?: number, message?: string) {
    super(message ?? "Retry");
    this.retries = retries;
    this.retryTimeout = retryTimeout;
  }
}
