export interface Framer {
  frame(now: DOMHighResTimeStamp): void;
}

export interface Looper {
  loop(deltaTime: number): void;
}

export interface Daemon {
  name: string;
  start(): void;
  stop(): void;
}
