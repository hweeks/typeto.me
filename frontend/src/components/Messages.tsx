import React, { useEffect, useState } from "react"
import { Socket } from "socket.io-client"

function Messages({ socket }: { socket: Socket }) {
  const [messages, set_messages] = useState([""])

  useEffect(() => {
    const set_messages_internal = (single_message) => {
      set_messages((prev) => [single_message, ...prev])
    }
    socket.on("newline", set_messages_internal)
    return () => {
      socket.off("newline", set_messages_internal)
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
          socket.emit("newline", Date.now())
        }}
      >
        click me
      </button>
    </div>
  )
}

export default Messages
