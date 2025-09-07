import {Pagination} from "antd";
import type {GetTablePaginationElementType} from "../types/paginationTypes.ts";
import type {FiltersBaseType} from "../types/filterBaseTypes.ts";

const TablePagination: GetTablePaginationElementType = ({ setFilters, total }) => {
    return (
        <Pagination
            defaultCurrent={1}
            total={total}
            pageSize={50}
            showSizeChanger={false}
            hideOnSinglePage={true}
            onChange = {(e) => {
                setFilters((prevState: FiltersBaseType) => ({
                    ...prevState,
                    page: e
                }))
            }}
        />
    )
}

export default TablePagination