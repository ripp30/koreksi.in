import { randomInt } from "crypto";

const ROOM_CODE_PREFIX = "KRI-";
const ROOM_CODE_LENGTH = 6;

// Tidak menggunakan I, O, 0, dan 1 agar tidak membingungkan
const CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateRoomCode(): string {
  let code = "";

  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += CHARACTERS[randomInt(CHARACTERS.length)];
  }

  return `${ROOM_CODE_PREFIX}${code}`;
}
