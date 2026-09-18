import { ImageResponse } from 'next/og';

export const size = { width: 96, height: 96 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 64 64">
      <path fill="#7139b5" d="M32 2C17.6 2 6 13.6 6 28c0 18 26 34 26 34s26-16 26-34C58 13.6 46.4 2 32 2Z" />
      <path fill="#ffd166" d="M39 13a16 16 0 1 0 9 24A14 14 0 0 1 39 13Z" />
    </svg>,
    size
  );
}
