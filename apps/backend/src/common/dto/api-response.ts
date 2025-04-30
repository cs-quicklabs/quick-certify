export class ApiResponse {
  public readonly success: boolean;

  constructor(
    public readonly statusCode: number,
    public readonly message: string,
    public readonly data?: unknown | unknown[]
  ) {
    this.success = statusCode < 400;
  }
}
