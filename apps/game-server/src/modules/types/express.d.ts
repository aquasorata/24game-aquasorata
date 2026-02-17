export type session = {
  userId: string;
  username: string;
  elo: number
};

declare global {
  namespace Express {
    interface Request {
      session?: session;
    }
  }
}