export class ValidationError extends Error {
  status: number;
  errors: any[];

  constructor(message: string, errors: any[] = []) {
    super(message);

    this.errors = errors;
    this.status = 400;
  }
}
