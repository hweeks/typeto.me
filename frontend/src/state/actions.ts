import type { Thunkction } from "./index";

export const FETCHING_SOCKET = "FETCHING_SOCKET";
export const FETCHED_SOCKET = "FETCHED_SOCKET";
export const FAILED_SOCKET = "FAILED_SOCKET";
export const POST_SOCKET = "POST_SOCKET";

const fetching_socket_act = () => ({ type: FETCHING_SOCKET });
const fetched_socket_act = (payload) => ({ type: FETCHED_SOCKET, payload });
const failed_socket_act = (payload) => ({ type: FAILED_SOCKET, payload });

export const connect_to_socket_room = (
  user: string,
  room: string
): Thunkction => async (dispatch) => {
  let data;
  dispatch(fetching_socket_act());
  try {
    data = await fetch(`/api/socket.io`, {
      method: "POST",
      body: JSON.stringify({
        user: {
          user,
          room,
        },
      }),
    });
  } catch (err) {
    dispatch(failed_socket_act(err));
  }
  dispatch(fetched_socket_act(data));
};
