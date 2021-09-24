import React, { ChangeEvent, SyntheticEvent, useState } from "react";
import { connect_to_socket_room } from "../state/actions";
import { use_app_dispatch, use_app_selector } from "../state/hooks";

export const ConnectToRoom = () => {
  const [name, set_name] = useState("");
  const [room, set_room] = useState("");
  const socket_state = use_app_selector(({ socket }) => socket);
  const dispatch = use_app_dispatch();
  if (socket_state.loading) return <>loading</>;
  if (socket_state.has_error) return <div>An error has occurred.</div>;
  return (
    <div>
      <input
        type="text"
        value={name}
        placeholder="your chosen name"
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          set_name(e.currentTarget.value)
        }
      />
      <input
        type="text"
        value={room}
        placeholder="your chosen room"
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          set_room(e.currentTarget.value)
        }
      />
      <button
        onClick={(e: SyntheticEvent<HTMLButtonElement>) => {
          e.preventDefault();
          e.stopPropagation();
          if (name && room) {
            dispatch(connect_to_socket_room(name, room));
          }
        }}
      >
        let's get typing
      </button>
    </div>
  );
};
