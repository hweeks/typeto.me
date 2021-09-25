import React, { useEffect, useState } from "react"
import io from "socket.io-client"
import { SOCKET_EVENTS } from "@typeto.me/backend"
import Messages from "./Messages"

function Room() {
  const lmao_token = Date.now()
  const [socket, setSocket] = useState(null)
  const [socket_two, setSocket_two] = useState(null)

  useEffect(() => {
    const newSocket = io(``, {
      path: '/api/rooms',
      auth: { token: lmao_token },
      forceNew: true
    }).connect()
    newSocket.on('connect', () => {
      newSocket.emit(SOCKET_EVENTS.JOIN)
      setSocket(newSocket)
    })
    const other_socket = io(``, {
      path: '/api/rooms',
      auth: { token: lmao_token },
      forceNew: true
    }).connect()
    other_socket.on('connect', () => {
      other_socket.emit(SOCKET_EVENTS.JOIN)
      setSocket_two(other_socket)
    })
    return () => {
      newSocket.emit(SOCKET_EVENTS.LEAVE)
      newSocket.close()
      other_socket.emit(SOCKET_EVENTS.LEAVE)
      other_socket.close()
    }
  }, [setSocket, setSocket_two])
  if (!socket || !socket_two) return <div>connecting</div>
  return (
    <div>
      <Messages socket={socket} />
      <Messages socket={socket_two} />
    </div>
  )
}

export default Room
