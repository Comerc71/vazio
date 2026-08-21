import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      pwaAssets: {
        preset: 'minimal-2023',
        image: 'public/icon.svg',
      },
      manifest: {
        id: '/',
        name: 'Yassena Campo',
        short_name: 'Yassena',
        description: 'Monitoramento e controle remoto de sensores agrícolas via RF/LoRa',
        theme_color: '#0B2A11',
        background_color: '#F6F3EA',
        display: 'standalone',
        start_url: '/',
        scope: '/',
      },
    }),
  ],
})
