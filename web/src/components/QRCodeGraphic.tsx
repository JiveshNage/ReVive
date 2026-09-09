import React from 'react';

export function QRCodeGraphic({ text }: { text: string }) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  const size = 17;
  const cells: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  const drawFinder = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
          cells[startY + r][startX + c] = true;
        }
      }
    }
  };
  drawFinder(0, 0);
  drawFinder(size - 7, 0);
  drawFinder(0, size - 7);

  for (let i = 8; i < size - 8; i++) {
    cells[6][i] = i % 2 === 0;
    cells[i][6] = i % 2 === 0;
  }

  let seed = Math.abs(hash);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inF1 = r < 8 && c < 8;
      const inF2 = r < 8 && c >= size - 8;
      const inF3 = r >= size - 8 && c < 8;
      if (!inF1 && !inF2 && !inF3 && r !== 6 && c !== 6) {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        cells[r][c] = (seed % 3) === 0;
      }
    }
  }

  const cellSize = 100 / size;
  return (
    <svg className="qr-code-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#ffffff" rx="4" />
      {cells.flatMap((row, r) =>
        row.map((active, c) =>
          active ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#064e3b"
            />
          ) : null
        )
      )}
    </svg>
  );
}
