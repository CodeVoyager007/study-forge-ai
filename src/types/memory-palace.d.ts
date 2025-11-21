// src/types/memory-palace.d.ts
declare interface MemoryPalaceRoom {
  roomName: string;
  description: string;
  items: { concept: string; visualization: string }[];
}

declare interface MemoryPalace {
  title: string;
  overview: string;
  rooms: MemoryPalaceRoom[];
  tips?: string[];
}
