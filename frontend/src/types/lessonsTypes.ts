import type {ApiListPaginatableResponseType, BooleanFilterType} from "./apiTypes.ts";
import type {UserListNameOnlyResponseType} from "./usersTypes.ts";
import type {FilterListDataType} from "./filterListTypes.ts";
import type {ReactNode} from "react";


export type GetLessonStatusByCodeType = (code: LessonStatusType) => LessonStatusStringType
export type RenderLessonPlacePopoverContentType = (placeData: LessonPlaceResponseType) => ReactNode

export type LessonStatusType = 0 | 1 | 2 | 3;
export type LessonStatusStringType = "Занятие не проведено" | "Занятие проведено" | "Занятие отменено" | "Ожидает проведения" | "Неизвестно"

export type LessonListResponseHomeworkType = {
    count: number
}

export type LessonListResponseItemType = {
    admin_comment?: string | null
    date: string
    dt: string
    end_dt: string
    id: number
    hw: LessonListResponseHomeworkType
    name: string
    place: LessonPlaceResponseType | null
    listeners: UserListNameOnlyResponseType[]
    teacher: UserListNameOnlyResponseType
    start_dt: string
    status: LessonStatusType
}

export type TableDataItemType = {
    key: string
}

export type LessonTableFilterData = {
    teachers: FilterListDataType[],
    listeners: FilterListDataType[],
    methodists: FilterListDataType[],
    places: FilterListDataType[]
}

export type LessonTableDataItemType = LessonListResponseItemType & TableDataItemType

export type LessonFiltersType = {
    name?: string | null,
    date_start?: string | null,
    date_end?: string | null,
    teacher?: (number | string)[],
    listener?: number[],
    methodist?: number[],
    has_hw?: BooleanFilterType,
    place?: number[],
    status?: LessonStatusType,
    has_admin_comment?: undefined,
    admin_comment?: null,
    admin_comment_date_from?: string | null,
    admin_comment_date_to?: string | null,
    page?: 1
}

export type LessonPlaceResponseType = {
    id: number
    name: string,
    url?: string,
    conf_id?: string | null
    access_code?: string | null
}

export type LessonListResponseType = ApiListPaginatableResponseType<LessonListResponseItemType>

export type LessonPlacesFiltersType = {
    name_only?: BooleanFilterType
}