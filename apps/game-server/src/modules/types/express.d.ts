export type session = {
  userId: string;
  username: string;
};

declare global {
  namespace Express {
    interface Request {
      session?: session;
    }
  }
}