/**
 * typeCheck 类型检查
 * @param { any } data 检查的数据
 * @returns { String } 返回是字符串
 */
export const typeCheck = <Input, Output>(data: Input): string | Output => {
  if (data === null) {
    return "Null";
  }
  if (data === undefined) {
    return "Undefined";
  }
  const match = Object.prototype.toString
    .call(data)
    .match(/^\[object\s(.*)\]$/);
  return match ? match[1] : "";
};

/**
 * isArray 检查是否是数组
 * @param data 检查的数据
 * @returns { Boolean } 返回是布尔值
 */
export const isArray = <Input>(data: Input): boolean =>
  typeCheck(data) === "Array";

/**
 * isObject 检查是否是对象
 * @param data 检查的数据
 * @returns { Boolean } 返回是布尔值
 */
export const isObject = <Input>(data: Input): boolean =>
  typeCheck(data) === "Object";

/**
 * isNull 检查是否是空数据或者未定义数据
 * @param data 检查的数据
 * @returns { Boolean } 返回是布尔值
 */
export const isNull = <Input>(data: Input): boolean =>
  typeCheck(data) === "Null" || typeCheck(data) === "Undefined";

/**
 * isFunction 检查是否是函数类型
 * @param data 检查的数据
 * @returns { Boolean } 返回是布尔值
 */
export const isFunction = <Input>(data: Input): boolean =>
  typeCheck(data) === "Function";

/**
 * isBoolean 检查是否是布尔型
 * @param data 检查的数据
 * @returns { Boolean } 返回是布尔值
 */
export const isBoolean = <Input>(data: Input): boolean =>
  typeCheck(data) === "Boolean";

/**
 * isNumber 检查是否是数值类型
 * @param data 检查的数据
 * @returns { Boolean } 返回是布尔值
 */
export const isNumber = <Input>(data: Input): boolean =>
  typeCheck(data) === "Number";

/**
 * isString 检查是否是字符串类型
 * @param data 检查的数据
 * @returns { Boolean } 返回是布尔值
 */
export const isString = <Input>(data: Input): boolean =>
  typeCheck(data) === "String";
