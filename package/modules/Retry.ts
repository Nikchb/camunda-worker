export default class Retry extends Error {
  public retries: number; // default 1
  public retryTimeout: number; // in milliseconds default 60 seconds

  constructor(retries: number = 1, retryTimeout: number = 60 * 1000, message?: string) {
    super(message ?? "Retry");
    this.retries = retries;
    this.retryTimeout = retryTimeout;
  }
}
