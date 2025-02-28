export default class Retry extends Error {
  public retries?: number; // default 1
  public retryTimeout: number; // in milliseconds default 60 seconds
  public errorDetails?: string;

  constructor(retryTimeout: number = 60 * 1000, retries?: number, message?: string, errorDetails?: string) {
    super(message ?? "Retry");
    this.retries = retries;
    this.retryTimeout = retryTimeout;
    this.errorDetails = errorDetails;
  }
}
