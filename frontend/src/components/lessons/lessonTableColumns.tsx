import {Tooltip, Tag, Popover} from "antd";
import {FilterOutlined, SearchOutlined} from "@ant-design/icons";
import type {LessonFiltersType, LessonListResponseItemType, LessonTableFilterData} from "../../types/lessonsTypes.ts";
import type {TableColumnType} from "../../types/tableTypes.ts";
import DateRangeFilter from "../filters/dateRangeFilter.tsx";
import getLessonStatusByCode from "../../utils/LessonUtils/getStatusByCode.ts";
import ListFilter from "../filters/listFilter.tsx";
import StringFilter from "../filters/stringFilter.tsx";
import type {DateRangeType} from "../../types/filterDateRangeTypes.ts";
import renderLessonPlacePopoverContent from "../../utils/LessonUtils/renderLessonPlacePopoverContent.tsx";
import AdminCommentFilter from "../filters/adminCommentFilter.tsx";
import LessonHomeworksFilter from "../filters/lessonHomeworksFilter.tsx";


type GetLessonTableColumnsType = (filters: LessonFiltersType,
                                  setFilters: (filtersData: LessonFiltersType) => void,
                                  filtersData: LessonTableFilterData,
                                  dateRange: DateRangeType | null,
                                  setDateRange: (dateRange: DateRangeType | null) => void,
                                  adminCommentDateRange: DateRangeType | null,
                                  setAdminCommentDateRange: (dateRange: DateRangeType | null) => void) => TableColumnType<LessonListResponseItemType>[]

export const getLessonTableColumns: GetLessonTableColumnsType = (filters,
                                                                 setFilters,
                                                                 filtersData,
                                                                 dateRange,
                                                                 setDateRange,
                                                                 adminCommentDateRange,
                                                                 setAdminCommentDateRange) => {
    return [
        {
            title: 'Наименование',
            render: (record: LessonListResponseItemType) => {
                let tooltipTitle = getLessonStatusByCode(record.status)
                let icon = ""
                let tagColor = ""

                switch (record.status){
                    case 0:
                        tagColor = "#ececec"
                        icon = "access_time"
                        break
                    case 1:
                        tagColor = "#4adf00"
                        icon = "check"
                        break
                    case 2:
                        tagColor = "#ff0000"
                        icon = "close"
                        break
                    case 3:
                        tagColor = "#ffd400"
                        icon = "checklist"
                        break
                }
                return (
                    <>
                        <Tooltip placement="right" title={tooltipTitle} arrow={true}>
                            <Tag color={tagColor}><span className="material-icons" style={{ fontSize: 12 }}>{icon}</span></Tag>
                        </Tooltip>
                        <span>{record.name}</span>
                    </>
                )
            },
            key: 'name',
            fixed: 'left',
            filterIcon: <SearchOutlined style={{ color: filters.name ? '#1677ff' : undefined }} />,
            filterDropdown: <StringFilter
                filters={filters}
                setFilters={setFilters}
                filterKey="name"/>,
        },
        {
            title: 'Время',
            dataIndex: 'dt',
            key: 'dt',
            filterIcon: <SearchOutlined style={{ color: filters.date_start ? '#1677ff' : undefined }} />,
            filterDropdown:
                <DateRangeFilter
                    setFilters={setFilters}
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    filterKeyFrom="date_start"
                    filterKeyTo="date_end"
                />
        },
        {
            title: 'Преподаватель',
            key: 'teacher',
            render: (record: LessonListResponseItemType) => {
                return `${record.teacher.first_name} ${record.teacher.last_name}`
            },
            filterIcon: <FilterOutlined style={{ color: filters.teacher?.length ? '#1677ff' : undefined }}/>,
            filterDropdown:
                <ListFilter
                    filters={filters}
                    setFilters={setFilters}
                    filterKey="teacher"
                    filterData={filtersData.teachers}
                    placeHolder="Выберите преподавателей"
                />
        },
        {
            title: 'Ученик',
            key: 'listener',
            render: (record: LessonListResponseItemType) => {
                return record.listeners.map(listener => {return `${listener.first_name} ${listener.last_name}`}).join('<br>')
            },
            filterIcon: <FilterOutlined style={{ color: filters.listener?.length ? '#1677ff' : undefined }}/>,
            filterDropdown:
                <ListFilter
                    filters={filters}
                    setFilters={setFilters}
                    filterKey="listener"
                    filterData={filtersData.listeners}
                    placeHolder="Выберите учеников"
                />
        },
        {
            title: 'Место',
            key: 'place',
            render: (record: LessonListResponseItemType) => {
                return (
                    record.place !== null && <Popover
                        content={renderLessonPlacePopoverContent(record.place)}
                        trigger="hover"
                        placement="right"
                    >
                        {record.place?.name}
                    </Popover>
                )
            },
            filterIcon: <FilterOutlined style={{ color: filters.place?.length ? '#1677ff' : undefined }}/>,
            filterDropdown:
                <ListFilter
                    filters={filters}
                    setFilters={setFilters}
                    filterKey="place"
                    filterData={filtersData.places}
                    placeHolder="Выберите места"
                />
        },
        // Table.EXPAND_COLUMN,
        {
            title: 'ДЗ',
            key: 'hw',
            render: (record) => {
                return record.hw.count.toString()
            },
            filterIcon: <FilterOutlined style={{ color: filters.has_hw ? '#1677ff' : undefined }}/>,
            filterDropdown: <LessonHomeworksFilter
                filters={filters}
                setFilters={setFilters}
                filterHasHWKey="has_hw"/>
        },
        {
            title: 'Комментарий',
            dataIndex: 'admin_comment',
            key: 'admin_comment',
            filterIcon: <SearchOutlined style={{ color: filters.has_admin_comment || filters.admin_comment ? '#1677ff' : undefined }}/>,
            filterDropdown:
                <AdminCommentFilter
                    filters={filters}
                    setFilters={setFilters}
                    searchKey="admin_comment"
                    filterKey="has_admin_comment"
                    dateRange={adminCommentDateRange}
                    setDateRange={setAdminCommentDateRange}
                    filterKeyFrom="admin_comment_date_from"
                    filterKeyTo="admin_comment_date_to"
                />
        },
    ]
}