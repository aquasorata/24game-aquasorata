export type AppErrorStatus =
  | 'bad_request'
  | 'unauthorized'
  | 'conflict'
  | 'not_found'
  | 'internal';

export class AppError extends Error {
  constructor(
    public code: string,
    public messageSafe: string,
    public status: AppErrorStatus = 'bad_request',
    public meta?: Record<string, string>,
  ) {
    super(code);
  }
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}
