import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./";

export const use_app_dispatch = () => useDispatch<AppDispatch>();
export const use_app_selector: TypedUseSelectorHook<RootState> = useSelector;
