/* eslint-disable default-case */
import produce from "immer";
import { AnyAction } from "redux";
import { FAILED_SOCKET, FETCHED_SOCKET, FETCHING_SOCKET } from "./actions";

export type socket_app_state = {
  loading?: boolean;
  has_error?: boolean;
  is_in_room?: boolean;
};

const initial_state: socket_app_state = {
  loading: null,
  has_error: null,
  is_in_room: null,
};

export const socket_reducer = produce(
  (draft: socket_app_state, { type }: AnyAction) => {
    switch (type) {
      case FETCHING_SOCKET:
        draft.loading = true;
        draft.is_in_room = false;
        draft.has_error = false;
        break;
      case FETCHED_SOCKET:
        draft.is_in_room = true;
        draft.loading = false;
        draft.has_error = false;
        break;
      case FAILED_SOCKET:
        draft.loading = false;
        draft.has_error = true;
        draft.is_in_room = false;
        break;
    }
  },
  initial_state
);
