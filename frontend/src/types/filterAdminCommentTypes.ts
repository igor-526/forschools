import type {FiltersBaseType} from "./filterBaseTypes.ts";
import type {ReactNode} from "react";
import type {DateRangeType} from "./filterDateRangeTypes.ts";

type FilterAdminCommentPropsType = {
    filters: FiltersBaseType,
    setFilters: (filters: FiltersBaseType) => void,
    searchKey: string,
    filterKey: string,
    dateRange: any,
    setDateRange: (dr: DateRangeType | null) => void,
    filterKeyFrom: string,
    filterKeyTo: string,
}

export type GetFilterAdminCommentElementType = (props: FilterAdminCommentPropsType) => ReactNode