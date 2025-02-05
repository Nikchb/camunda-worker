export default class BPMNError extends Error {
  public errorCode: string;
  public variables: Record<string, any>;

  constructor(
    errorCode: string,
    errorMessage: string,
    variables: Record<string, any>
  ) {
    super(errorMessage);
    this.errorCode = errorCode;
    this.variables = variables;
  }
}
