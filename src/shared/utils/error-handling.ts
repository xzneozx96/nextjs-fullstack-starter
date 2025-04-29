// This class is used to throw error messages that are safe to expose to the client.
export class SafeError extends Error {
  constructor(
    public safeMessage?: string,
    public statusCode?: number,
  ) {
    super(safeMessage);
    this.name = 'SafeError';
  }
}
