import { routesType } from "@/types/route";
export interface breadcrumbItemsType {
  title: JSX.Element;
  href: string;
}

export interface locationType {
  pathname: string;
}

export interface setBreadcrumbItemsFnType {
  (
    array: routesType[],
    locationPath: locationType,
    newArray?: breadcrumbItemsType[],
    step?: number,
    routesChildren?: routesType[]
  ): breadcrumbItemsType[] | undefined;
}
