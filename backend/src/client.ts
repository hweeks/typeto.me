import { Server } from "socket.io"
import { getRoom, roomRoute } from "./room"
import { SOCKET_EVENTS } from "./types"

export const setup_io = async (io: Server) => {
  io.sockets.on("connection", function (socket) {
    const token = socket.handshake.auth.token
    if (!token) return
    const room_inner = getRoom(token)
    socket.on(SOCKET_EVENTS.JOIN, function () {
      if (!room_inner.top_user) {
        room_inner.set_user('top', socket)
      } else if (!room_inner.bottom_user) {
        room_inner.set_user('bottom', socket)
      } else {
        socket.emit(SOCKET_EVENTS.DENY, token)
      }
      return
    })
    socket.on(SOCKET_EVENTS.INPUT, function (data) {
      return roomRoute(SOCKET_EVENTS.INPUT, data, socket.id, token)
    })
    socket.on(SOCKET_EVENTS.DIFF, function (data) {
      if (!data?.diff) {
        return
      }
      return roomRoute(SOCKET_EVENTS.DIFF, data, socket.id, token)
    })
    socket.on(SOCKET_EVENTS.RESET, function (data) {
      if (!data?.currentBuffer) {
        return
      }
      return roomRoute(SOCKET_EVENTS.RESET, data, socket.id, token)
    })
    socket.on("disconnect", function () {
      room_inner.drop_user(socket.id)
    })
  })
}
