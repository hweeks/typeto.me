import EventEmitter from "events"
import { Socket } from "socket.io"

class Room extends EventEmitter {
  token: string
  top_user?: Socket
  bottom_user?: Socket
  constructor(token: string) {
    super()
    this.token = token
  }
  set_user(type_of: 'top' | 'bottom', the_socket: Socket) {
    if (type_of === 'top') {
      this.top_user = the_socket
      if (this.bottom_user) this.top_user.emit("partnerJoin", "")
    } else {
      this.bottom_user = the_socket
      if (this.top_user) this.bottom_user.emit("partnerJoin", "")
    }
  }
  drop_user(the_socket_id: string) {
    if (this.top_user.id === the_socket_id) {
      if (this.bottom_user) this.bottom_user.emit('userDisconnect')
      else this.emit('dead')
    } else if (this.bottom_user.id === the_socket_id) {
      if (this.top_user) this.top_user.emit('userDisconnect')
      else this.emit('dead')
    }
  }
}

export type RoomType = Room

export let rooms: RoomType[] = []

export const getRoom = function (token: string, create_if_not_found = true): RoomType | null {
  const found_room = rooms.find((room) => room.token === token)
  if (!found_room && create_if_not_found) {
    const built_room = new Room(token)
    rooms.push(built_room)
    built_room.on('dead', () => {
      const dead_room = rooms.findIndex(room => room.token === token)
      if (dead_room !== -1) {
        rooms.splice(dead_room, 1)
      }
    })
    return built_room
  }
  return found_room
}

export const get_room_by_user_id = (user_id: string) => {
  return rooms.find(room => (room.top_user?.id === user_id || room.bottom_user?.id === user_id))
}

export const roomRoute = function (event: string, data: unknown & {token: string}, user: string, token: string) {
  const room = getRoom(token, false)
  debugger
  if (!room) {
    return
  }
  if (room.top_user.id !== user && room.bottom_user.id !== user) {
    console.log("Incorrect user")
    return
  }
  if (room.top_user.id === user && room.bottom_user.id != null) {
    return room.bottom_user.emit(event, data)
  } else if (room.top_user != null && room.top_user.emit != null) {
    return room.top_user.emit(event, data)
  }
}
