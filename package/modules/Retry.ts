export default class Retry extends Error {
  public retries: number;

  constructor(retries: number, message?: string) {
    super(message ?? "Retry");
    this.retries = retries;
  }
}
