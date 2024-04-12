import React from "react";

export interface menuClick {
  (e: { key: string; keyPath: string[]; domEvent: React.SyntheticEvent }): void;
}

export type MenuItem = Required<MenuProps>["items"][number];

export interface getItemType {
  (
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
    type?: "submenu" | "group" | "button" | undefined
  ): MenuItem[];
}
