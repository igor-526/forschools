import type {ReactNode} from "react";
import type {LessonListResponseItemType} from "./lessonsTypes.ts";

export type dashboardEventsMode = "listeners" | "teachers" | "places"
export type dashboardEventColorType = "green" | "red" | "orange" | undefined

export type DashboardPopoverContentRendererType = (lessons: LessonListResponseItemType[], event: dashboardMouseEventsInfo["event"] | null) => ReactNode | null
export type DashboardMouseLeaveHandlerType = () => void
export type DashboardMouseEnterHandlerType = (info: dashboardMouseEventsInfo) => void

export type dashboardEvent = {
    id: string
    title: string
    start: Date | string
    end?: Date | string
    allDay?: boolean
    color?: dashboardEventColorType
}

export type dashboardSelectedDatesType = {
    date_start?: string
    date_end?: string
}

export type dashboardPopoverProps = {
    show: boolean,
    x: number,
    y: number
}

export type dashboardMouseEventsInfo = {
    event: {
        id: string
    },
    el: {
        getBoundingClientRect: () => {
            left: number,
            top: number,
            width: number}
    },
}