import { Server } from "socket.io"
import { getRoom, roomRoute } from "./room"

export const setup_io = async (io: Server) => {
  io.sockets.on("connection", function (socket) {
    const token = socket.handshake.auth.token
    if (!token) return
    const room_inner = getRoom(token)
    socket.on("requestJoin", function () {
      if (!room_inner.top_user) {
        room_inner.set_user('top', socket)
      } else if (!room_inner.bottom_user) {
        room_inner.set_user('bottom', socket)
      } else {
        socket.emit("denyJoin", token)
      }
      return
    })
    socket.on("newline", function (data) {
      return roomRoute("newline", data, socket.id, token)
    })
    socket.on("diff", function (data) {
      if (!data?.diff) {
        return
      }
      return roomRoute("diff", data, socket.id, token)
    })
    socket.on("resetBuffer", function (data) {
      if (!data?.currentBuffer) {
        return
      }
      return roomRoute("resetBuffer", data, socket.id, token)
    })
    socket.on("disconnect", function () {
      room_inner.drop_user(socket.id)
    })
  })
}
