import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,      // ඔයාට හැමතිස්සෙම app එක run වෙන්න ඕනේ 5173 port එකේ නම්
    strictPort: true // 5173 port එක කාර්යබහුල නම් වෙන එකකට මාරු වෙන්නේ නැතුව error එකක් දීලා නවතිනවා
  }
})