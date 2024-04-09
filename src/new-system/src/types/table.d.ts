import type { ColumnsType } from "antd/es/table";
interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}

export { DataType, ColumnsType };
