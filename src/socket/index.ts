import { Server } from 'http'
import { Server as SocketIOServer } from 'socket.io'

export default function setUpSocket(server: Server) {
  const io = new SocketIOServer(server, {
    // /api/socket.io so it doesn't get confused with the Vite dev server websocket.
    path: '/api/socket.io',
  })
  
  io.on('connection', (socket) => {
    console.log('Got socket.io connection!')
  })  
}
