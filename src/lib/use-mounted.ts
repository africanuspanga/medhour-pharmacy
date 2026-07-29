"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** True on the client after hydration, false during SSR — hydration-safe. */
export function useMounted() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
