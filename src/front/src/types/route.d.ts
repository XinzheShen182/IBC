export interface metaType {
  title?: string;
}
export interface routesType {
  path: string;
  element?: JSX.Element;
  exact?: boolean;
  name?: string;
  meta?: metaType;
  children?: routesType[];
}
