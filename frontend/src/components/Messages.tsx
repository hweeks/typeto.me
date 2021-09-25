import React, { useEffect, useState } from "react"
import { Socket } from "socket.io-client"
import { SOCKET_EVENTS } from "@typeto.me/backend"

function Messages({ socket }: { socket: Socket }) {
  const [messages, set_messages] = useState([""])

  useEffect(() => {
    const set_messages_internal = (single_message) => {
      set_messages((prev) => [single_message, ...prev])
    }
    socket.on(SOCKET_EVENTS.INPUT, set_messages_internal)
    return () => {
      socket.off(SOCKET_EVENTS.INPUT, set_messages_internal)
    }
  }, [socket])

  return (
    <div>
      {messages &&
        messages?.map((mes) => <pre>{JSON.stringify(mes, null, 2)}</pre>)}
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          socket.emit(SOCKET_EVENTS.INPUT, Date.now())
        }}
      >
        click me
      </button>
    </div>
  )
}

export default Messages
