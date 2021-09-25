import React, { useEffect, useState } from "react"
import io from "socket.io-client"
import Messages from "./Messages"

function Room() {
  const [socket, setSocket] = useState(null)
  const [socket_two, setSocket_two] = useState(null)

  useEffect(() => {
    const newSocket = io(``, {
      path: '/api/rooms',
      auth: { token: "1234" },
      forceNew: true
    }).connect()
    newSocket.on('connect', () => {
      newSocket.emit('requestJoin')
      setSocket(newSocket)
    })
    const other_socket = io(``, {
      path: '/api/rooms',
      auth: { token: "1234" },
      forceNew: true
    }).connect()
    other_socket.on('connect', () => {
      other_socket.emit('requestJoin')
      setSocket_two(other_socket)
    })
    return () => {
      newSocket.close()
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
