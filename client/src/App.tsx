import { useEffect } from 'react'
import { io } from 'socket.io-client'

export default function App() {
  useEffect(() => {
    // /api/socket.io so it doesn't get confused with the Vite dev server websocket.
    const socket = io('/', {
      path: '/api/socket.io',
      transports: ['websocket']
    })
    console.log('connecting')
    socket.on('connect', () => {
      console.log('connected!')
    })
    socket.on('disconnect', (reason) => {
      console.log('disconnected!', reason)
    })
    return () => {
      socket.close()
    }
  })

  useEffect(() => {
    fetch('/api/test/ping', { method: 'GET' }).then(async (req) => {
      const data = await req.json()
      console.log('response from /api/test/ping:', data)
    })
    fetch('/api/test/pg', { method: 'GET' }).then(async (req) => {
      const data = await req.json()
      console.log('response from /api/test/pg:', data)
    })
  }, [])

  return <div>Welcome to the app!</div>
}
