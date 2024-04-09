import { Table } from "antd";
import type {
  // ColumnsType,
  TableProps,
} from "antd/es/table";

// interface CustomTableProps<T> extends TableProps<T> {
//   columns: ColumnsType<T>;
// }

type CustomTableProps<T> = TableProps<T>;

const CustomTable = <T extends object = any>({
  ...restProps
}: CustomTableProps<T>) => <Table<T> {...restProps} />;

export default CustomTable;
