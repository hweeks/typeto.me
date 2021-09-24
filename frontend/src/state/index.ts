import { combineReducers } from "redux";
import { configureStore } from "@reduxjs/toolkit";
import thunkMiddleware from "redux-thunk";
import { socket_app_state, socket_reducer } from "./reducers";

export type core_state = {
  socket: socket_app_state;
};

const all_reducers = combineReducers({ socket:socket_reducer });

export const store = configureStore({
  reducer: all_reducers,
  middleware: (getDefMiddle) =>
    getDefMiddle().concat(thunkMiddleware.withExtraArgument()),
});

// eslint-disable-next-line no-undef
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export type Thunkction = (
  dispatch: AppDispatch,
  getState: () => RootState,
) => void;
