import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import dotenv from 'dotenv'

if (process.env.DEV_CLIENT_SERVER) {
  dotenv.config({
    path: '../.env',
  })
}

function getListenPort(env_name: string, fallback: number) {
  const text = process.env[env_name]
  if (text != null) {
    const value = parseInt(text)
    if (String(value) != text) {
      throw new Error('Invalid port number: ' + JSON.stringify(text))
    }
    return value
  }
  return fallback
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: getListenPort('VITE_DEV_PORT', 9999),
  },
})
