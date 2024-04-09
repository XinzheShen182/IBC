import { HomeOutlined } from "@ant-design/icons";
import { setBreadcrumbItemsFnType } from "@/types/breadcrumbs";

/**
 * 递归生成面包屑导航需要的数据
 * @param array 路由菜单
 * @param locationPath 当前路由地址
 * @param newArray 递归第二次以后增加的面包屑导航需要的数据
 * @param step 递归了几次
 * @param routesChildren 递归第二次以后查询的路由菜单
 * @returns 面包屑导航需要的数组
 */
export const setBreadcrumbItems: setBreadcrumbItemsFnType = (
  array = [],
  locationPath,
  newArray = [],
  step = 0,
  routesChildren = []
) => {
  const arr = [
    {
      title: (
        <>
          <HomeOutlined />
          <span style={{ marginLeft: "10px" }}>Home</span>
        </>
      ),
      href: "/",
    },
  ];

  const locationPathLength = locationPath.pathname.split("/").length;

  // 判断是否是一级路由
  if (locationPathLength === 2) {
    const { path, meta } =
      array.find((item) => item.path === locationPath.pathname) || {};

    if (meta && meta.title) {
      arr.push({
        title: <span>{meta?.title}</span>,
        href: path!,
      });
    }
    // 如果是 直接抛出去
    return arr;
  } else if (locationPathLength > 2) {
    // 二级及二级以上路由处理
    // 根据路径信息第一个单词判断
    const { children, meta } =
      array.find((item) => {
        return item.path.split("/")[1] === locationPath.pathname.split("/")[1];
      }) || {};

    // 有子集菜单 children 就开始递归
    if (children && children.length > 0) {
      arr.push({
        title: <span>{meta?.title}</span>,
        href: "#",
      });
      return setBreadcrumbItems([], locationPath, arr, step + 1, children);
    }
    // 递归开始之后的逻辑
    if (step > 0) {
      // 目前只是处理到第三级，考虑到没必要第四级，所以还是有问题
      const { path, meta } =
        routesChildren?.find((item) => item.path === locationPath.pathname) ||
        {};
      newArray.push({
        title: <span>{meta?.title}</span>,
        href: path!,
      });
      return newArray;
    }
  }
};
