// Pixel art sprites defined as 2D arrays of hex colors (null = transparent)
// Player sprite: 14×24

const T = null // transparent

// Simple adventurer/wanderer sprite
export const PLAYER_SPRITE = [
  // Row 0-3: Hat
  [T,T,T,T,T,'#4a7c59',T,T,T,T,T,T,T,T],
  [T,T,T,T,'#4a7c59','#5a9c6a','#5a9c6a','#4a7c59',T,T,T,T,T,T],
  [T,T,T,'#4a7c59','#5a9c6a','#6ab87a','#6ab87a','#5a9c6a','#4a7c59',T,T,T,T,T],
  [T,T,'#3d6b4a','#4a7c59','#5a9c6a','#5a9c6a','#5a9c6a','#5a9c6a','#4a7c59','#3d6b4a',T,T,T,T],
  // Row 4-7: Head
  [T,T,T,T,'#e8c89e','#e8c89e','#e8c89e','#e8c89e',T,T,T,T,T,T],
  [T,T,T,'#e8c89e','#e8c89e','#e8c89e','#e8c89e','#e8c89e','#e8c89e',T,T,T,T,T],
  [T,T,T,'#e8c89e','#2d1b0e','#e8c89e','#e8c89e','#2d1b0e','#e8c89e',T,T,T,T,T],
  [T,T,T,T,'#e8c89e','#e8c89e','#c8785a','#e8c89e',T,T,T,T,T,T],
  // Row 8-11: Torso
  [T,T,T,T,T,'#5b7fb5','#5b7fb5',T,T,T,T,T,T,T],
  [T,T,T,T,'#5b7fb5','#5b7fb5','#5b7fb5','#5b7fb5',T,T,T,T,T,T],
  [T,T,T,'#5b7fb5','#5b7fb5','#7b9fd5','#7b9fd5','#5b7fb5','#5b7fb5',T,T,T,T,T],
  [T,T,T,'#5b7fb5','#5b7fb5','#7b9fd5','#7b9fd5','#5b7fb5','#5b7fb5',T,T,T,T,T],
  // Row 12-15: Belt + Lower torso
  [T,T,T,'#8b6914','#8b6914','#8b6914','#8b6914','#8b6914','#8b6914',T,T,T,T,T],
  [T,T,T,'#5b7fb5','#5b7fb5','#5b7fb5','#5b7fb5','#5b7fb5','#5b7fb5',T,T,T,T,T],
  [T,T,T,'#5b7fb5','#5b7fb5','#5b7fb5','#5b7fb5','#5b7fb5','#5b7fb5',T,T,T,T,T],
  [T,T,T,T,'#5b7fb5','#5b7fb5','#5b7fb5','#5b7fb5',T,T,T,T,T,T],
  // Row 16-19: Legs
  [T,T,T,T,'#6b4226','#6b4226','#6b4226','#6b4226',T,T,T,T,T,T],
  [T,T,T,T,'#6b4226','#6b4226','#6b4226','#6b4226',T,T,T,T,T,T],
  [T,T,T,'#6b4226','#6b4226',T,T,'#6b4226','#6b4226',T,T,T,T,T],
  [T,T,T,'#6b4226','#6b4226',T,T,'#6b4226','#6b4226',T,T,T,T,T],
  // Row 20-23: Boots
  [T,T,'#3d2517','#3d2517','#3d2517',T,T,'#3d2517','#3d2517','#3d2517',T,T,T,T],
  [T,T,'#3d2517','#3d2517','#3d2517',T,T,'#3d2517','#3d2517','#3d2517',T,T,T,T],
  [T,'#2d1b0e','#3d2517','#3d2517','#3d2517',T,T,'#3d2517','#3d2517','#3d2517','#2d1b0e',T,T,T],
  [T,'#2d1b0e','#2d1b0e','#2d1b0e','#2d1b0e',T,T,'#2d1b0e','#2d1b0e','#2d1b0e','#2d1b0e',T,T,T],
]

// NPC elder sprite: 14×24 (robed figure)
export const NPC_SPRITE = [
  // Row 0-3: Hood
  [T,T,T,T,T,'#8b5e3c',T,T,T,T,T,T,T,T],
  [T,T,T,T,'#8b5e3c','#a0714a','#a0714a','#8b5e3c',T,T,T,T,T,T],
  [T,T,T,'#8b5e3c','#a0714a','#b8864f','#b8864f','#a0714a','#8b5e3c',T,T,T,T,T],
  [T,T,'#7a4e2c','#8b5e3c','#a0714a','#a0714a','#a0714a','#a0714a','#8b5e3c','#7a4e2c',T,T,T,T],
  // Row 4-7: Face
  [T,T,T,T,'#d4a574','#d4a574','#d4a574','#d4a574',T,T,T,T,T,T],
  [T,T,T,'#d4a574','#d4a574','#d4a574','#d4a574','#d4a574','#d4a574',T,T,T,T,T],
  [T,T,T,'#d4a574','#4a3520','#d4a574','#d4a574','#4a3520','#d4a574',T,T,T,T,T],
  [T,T,T,T,'#d4a574','#c89070','#c89070','#d4a574',T,T,T,T,T,T],
  // Row 8-15: Robe
  [T,T,T,T,'#6b3fa0','#6b3fa0','#6b3fa0','#6b3fa0',T,T,T,T,T,T],
  [T,T,T,'#6b3fa0','#6b3fa0','#8b5fc0','#8b5fc0','#6b3fa0','#6b3fa0',T,T,T,T,T],
  [T,T,'#6b3fa0','#6b3fa0','#8b5fc0','#8b5fc0','#8b5fc0','#8b5fc0','#6b3fa0','#6b3fa0',T,T,T,T],
  [T,T,'#6b3fa0','#6b3fa0','#8b5fc0','#8b5fc0','#8b5fc0','#8b5fc0','#6b3fa0','#6b3fa0',T,T,T,T],
  [T,T,'#6b3fa0','#8b5fc0','#8b5fc0','#6b3fa0','#6b3fa0','#8b5fc0','#8b5fc0','#6b3fa0',T,T,T,T],
  [T,'#6b3fa0','#6b3fa0','#8b5fc0','#8b5fc0','#6b3fa0','#6b3fa0','#8b5fc0','#8b5fc0','#6b3fa0','#6b3fa0',T,T,T],
  [T,'#6b3fa0','#8b5fc0','#8b5fc0','#8b5fc0','#6b3fa0','#6b3fa0','#8b5fc0','#8b5fc0','#8b5fc0','#6b3fa0',T,T,T],
  [T,'#6b3fa0','#8b5fc0','#8b5fc0','#8b5fc0','#8b5fc0','#8b5fc0','#8b5fc0','#8b5fc0','#8b5fc0','#6b3fa0',T,T,T],
  // Row 16-19: Lower robe
  [T,'#5a2e8a','#6b3fa0','#6b3fa0','#6b3fa0','#6b3fa0','#6b3fa0','#6b3fa0','#6b3fa0','#6b3fa0','#5a2e8a',T,T,T],
  [T,T,'#5a2e8a','#6b3fa0','#6b3fa0','#6b3fa0','#6b3fa0','#6b3fa0','#6b3fa0','#5a2e8a',T,T,T,T],
  [T,T,'#5a2e8a','#5a2e8a','#6b3fa0','#6b3fa0','#6b3fa0','#6b3fa0','#5a2e8a','#5a2e8a',T,T,T,T],
  [T,T,T,'#5a2e8a','#5a2e8a','#6b3fa0','#6b3fa0','#5a2e8a','#5a2e8a',T,T,T,T,T],
  // Row 20-23: Feet
  [T,T,T,'#3d2517','#3d2517','#3d2517','#3d2517','#3d2517','#3d2517',T,T,T,T,T],
  [T,T,T,'#3d2517','#3d2517','#3d2517','#3d2517','#3d2517','#3d2517',T,T,T,T,T],
  [T,T,'#2d1b0e','#3d2517','#3d2517',T,T,'#3d2517','#3d2517','#2d1b0e',T,T,T,T],
  [T,T,'#2d1b0e','#2d1b0e','#2d1b0e',T,T,'#2d1b0e','#2d1b0e','#2d1b0e',T,T,T,T],
]

export function drawSprite(ctx, sprite, x, y, scale = 2) {
  for (let row = 0; row < sprite.length; row++) {
    for (let col = 0; col < sprite[row].length; col++) {
      const color = sprite[row][col]
      if (color) {
        ctx.fillStyle = color
        ctx.fillRect(x + col * scale, y + row * scale, scale, scale)
      }
    }
  }
}
