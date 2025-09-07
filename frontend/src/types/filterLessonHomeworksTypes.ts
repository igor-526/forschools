import type {FiltersBaseType} from "./filterBaseTypes.ts";
import type {ReactNode} from "react";

type FilterLessonHomeworksPropsType = {
    filters: FiltersBaseType
    setFilters: (filters: FiltersBaseType) => void,
    filterHasHWKey: string,
}

export type GetFilterLessonHomeworksElementType = (props: FilterLessonHomeworksPropsType) => ReactNode