export default class BPMNError extends Error {
  public errorCode: string;
  public variables: Record<string, any>;

  constructor(errorCode: string, variables: Record<string, any> = {}, errorMessage?: string) {
    super(errorMessage ?? "");
    this.errorCode = errorCode;
    this.variables = variables;
  }
}
