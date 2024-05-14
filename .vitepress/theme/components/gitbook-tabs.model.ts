import type { InjectionKey } from "vue";

export interface TabProps {
  title: string;
  setActivated: (value: boolean) => void;
}

export const tabContextKey = Symbol("tabContext") as InjectionKey<{
  registerTab: (tab: TabProps) => void;
}>;
