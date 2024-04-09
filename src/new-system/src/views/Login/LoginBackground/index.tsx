import styles from "./index.module.scss";
import loginTs from "./canvasBackground.ts";
import _lodash from "lodash";
import { useEffect } from "react";

// 节流操作 函数存放一个变量
const openBackground = _lodash.throttle(loginTs, 500);
const CanvasBackground = () => {
  useEffect(() => {
    openBackground();
    // 监听页面防抖执行背景图
    window.addEventListener("resize", openBackground);
    // 当页面改变的时候，利用 useEffect 清除 window 事件，防止其他页面触发
    return () => {
      window.removeEventListener("resize", openBackground);
    };
  }, []);
  return <canvas className={styles.canvasBackground} id="canvas"></canvas>;
};

export default CanvasBackground;
