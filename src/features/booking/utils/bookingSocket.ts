import { io, type Socket } from "socket.io-client";

export interface BookingSocketAck<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

let bookingSocket: Socket | null = null;
let activeToken: string | null = null;

const getSocketOrigin = () => {
  const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  return rawApiUrl.startsWith("http")
    ? new URL(rawApiUrl).origin
    : window.location.origin;
};

export const getBookingSocket = () => {
  const token = localStorage.getItem("accessToken");

  if (!bookingSocket) {
    activeToken = token;
    bookingSocket = io(`${getSocketOrigin()}/bookings`, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      autoConnect: false,
    });
  } else if (activeToken !== token) {
    activeToken = token;
    bookingSocket.auth = { token };
    bookingSocket.disconnect().connect();
  }

  return bookingSocket;
};

export const connectBookingSocket = async () => {
  const socket = getBookingSocket();
  if (socket.connected) return socket;

  socket.connect();
  await new Promise<void>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error("Kết nối chat realtime quá thời gian chờ"));
    }, 10000);

    const handleConnect = () => {
      cleanup();
      resolve();
    };
    const handleError = (error: Error) => {
      cleanup();
      reject(error);
    };
    const cleanup = () => {
      window.clearTimeout(timeoutId);
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleError);
    };

    socket.once("connect", handleConnect);
    socket.once("connect_error", handleError);
  });

  return socket;
};

export const emitBookingSocketEvent = async <T>(
  event: string,
  payload: unknown,
): Promise<T> => {
  const socket = await connectBookingSocket();

  return new Promise<T>((resolve, reject) => {
    socket
      .timeout(10000)
      .emit(
        event,
        payload,
        (timeoutError: Error | null, ack?: BookingSocketAck<T>) => {
          if (timeoutError) {
            reject(new Error("Server chat realtime không phản hồi"));
            return;
          }
          if (!ack?.success) {
            reject(new Error(ack?.error || "Không thể xử lý chat realtime"));
            return;
          }
          resolve(ack.data as T);
        },
      );
  });
};
