import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket() {
  if (socket) return socket;

  const url = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!url) throw new Error("Missing Gameserver");

  socket = io(url, {
    transports: ["websocket"],
    autoConnect: true,
  });

  return socket;
}