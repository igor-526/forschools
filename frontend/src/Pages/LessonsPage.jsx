import React, {useEffect, useState} from 'react';
import {Button, Tooltip, Radio, Pagination, Tag, Table, Popover} from "antd";
import api from "../axios/baseApi.js";
import {FilterOutlined, SearchOutlined} from "@ant-design/icons";
import TableWithFilters from "../Components/TableWithFilters.jsx";
import {useDispatch} from "react-redux";
import {setNewTitle} from "../store/layoutSlice.js";
import LessonDrawer from "../Components/LessonDrawer.jsx";
import NameFilter from "../Components/Filters/NameFilter.jsx";
import ListFilter from "../Components/Filters/ListFilter.jsx";
import DateRangeFilter from "../Components/Filters/DateRangeFilter.jsx";
import AdminCommentFilter from "../Components/Filters/AdminCommentFilter.jsx";
import {getHomeworksList} from "../axios/homeworksApi.js";
import HomeworkDrawer from "../Components/HomeworkDrawer.jsx";
import getHomeworkStatusByCode from "../Components/Utils/HomeworkUtils/getStatusByCode.js";
import getLessonStatusByCode from "../Components/Utils/LessonUtils/getStatusByCode.js";
import LessonPlacePopoverContent from "../Components/LessonPlacePopoverContent.jsx";

const LessonsPage = () => {
    const dispatch = useDispatch();
    const [filters, setFilters] = useState({
        name: null,
        date_start: null,
        date_end: null,
        teacher: [],
        listener: [],
        methodist: [],
        has_hw: undefined,
        place: [],
        status: undefined,
        has_admin_comment: undefined,
        admin_comment: null,
        page: 1
    });
    const [filtersData, setFiltersData] = useState({
        teachers: [],
        listeners: [],
        methodists: [],
        places: []
    });
    const [dateRange, setDateRange] = useState(null);
    const [loading, setLoading] = useState(false);
    const [lessonsData, setLessonsData] = useState([]);
    const [lessonsDataCount, setLessonsDataCount] = useState(0);
    const [selectedLessonId, setSelectedLessonId] = useState(null);
    const [selectedHomeworkId, setSelectedHomeworkId] = useState(null);
    const [expandedHomeworks, setExpandedHomeworks] = useState({});

    const columns = [
        {
            title: 'Наименование',
            render: (record) => {
                let tooltipTitle = ""
                let icon = ""
                let tagColor = ""

                switch (record.status){
                    case 0:
                        tooltipTitle = getLessonStatusByCode(0)
                        tagColor = "#ececec"
                        icon = "access_time"
                        break
                    case 1:
                        tooltipTitle = getLessonStatusByCode(1)
                        tagColor = "#4adf00"
                        icon = "check"
                        break
                    case 2:
                        tooltipTitle = getLessonStatusByCode(2)
                        tagColor = "#ff0000"
                        icon = "close"
                        break
                    case 3:
                        tooltipTitle = getLessonStatusByCode(3)
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
            filterDropdown: <NameFilter filters={filters} setFilters={setFilters} filterKey="name"/>,
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
            render: (record) => {
                return `${record.teacher.first_name} ${record.teacher.last_name}`
            },
            filterIcon: <FilterOutlined style={{ color: filters.teacher.length ? '#1677ff' : undefined }}/>,
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
            render: (record) => {
                return record.listeners.map(listener => {return `${listener.first_name} ${listener.last_name}`}).join('<br>')
            },
            filterIcon: <FilterOutlined style={{ color: filters.listener.length ? '#1677ff' : undefined }}/>,
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
            render: (record) => {
                return (
                    record.place !== null && <Popover
                        content={<LessonPlacePopoverContent placeData={record.place} />}
                        trigger="hover"
                        placement="right"
                        label="KMKM"
                        title="RIJRIRI"
                    >
                        {record.place?.name}
                    </Popover>
                )
            },
            filterIcon: <FilterOutlined style={{ color: filters.place.length ? '#1677ff' : undefined }}/>,
            filterDropdown:
                <ListFilter
                    filters={filters}
                    setFilters={setFilters}
                    filterKey="place"
                    filterData={filtersData.places}
                    placeHolder="Выберите места"
                />
        },
        Table.EXPAND_COLUMN,
        {
            title: 'ДЗ',
            key: 'hw',
            render: (record) => {
                return record.hw.count.toString()
            },
            filterIcon: <FilterOutlined style={{ color: filters.has_hw ? '#1677ff' : undefined }}/>,
            filterDropdown:
                <div style={{ padding: 8 }}>
                    <Radio.Group
                        options={[
                            { label: 'Все', value: undefined },
                            { label: 'С ДЗ', value: 'true' },
                            { label: 'Без ДЗ', value: 'false' },
                        ]}
                        onChange={(e) => {
                            setFilters((prevState) => ({
                                ...prevState,
                                has_hw: e.target.value
                            }))
                        }}
                        value={filters.has_hw}
                        optionType="button" />
                </div>
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
                />
        },
    ];
    const homeworkColumns = [
        {
            title: 'Наименование',
            dataIndex: 'name',
            key: 'name',
            fixed: 'left',
        },
        {
            title: 'Задано',
            key: 'assigned',
            render: (hw) => {
                return new Date(hw.assigned_status.dt).toLocaleDateString();
            },
        },
        {
            title: 'Статус',
            key: 'status',
            render: (hw) => {
                return <span>{getHomeworkStatusByCode(hw.last_status.status)} ({new Date(hw.last_status.dt).toLocaleDateString()})</span>;
            },
        },
        {
            title: 'Комментарий',
            key: 'admin_comment',
            render: (hw) => {
                return hw.admin_comment;
            },
        }
    ];
    const filtersElements = <>
        <div className="flex gap-2 flex-wrap">
            <Radio.Group
                options={[
                    { label: 'Все', value: undefined },
                    { label: 'Не проведено', value: '0' },
                    { label: 'Проведено', value: '1' },
                    { label: 'Отменено', value: '2' }
                ]}
                onChange={(e) => {
                    setFilters((prevState) => ({
                        ...prevState,
                        status: e.target.value
                    }))
                }}
                value={filters.status}
                optionType="button" />


            <ListFilter
                filters={filters}
                setFilters={setFilters}
                filterKey="methodist"
                filterData={filtersData.methodists}
                placeHolder="Методисты"
                style={{ minWidth: 150, maxWidth: 300 }}
            />
            <Tooltip placement="top" title="Сбросить все фильтры" arrow={true}>
                <Button
                    size="middle"
                    color="danger"
                    variant="outlined"
                    onClick={() => {
                        setDateRange(null)
                        setFilters({
                            name: null,
                            date_start: null,
                            date_end: null,
                            teacher: [],
                            listener: [],
                            has_hw: undefined,
                            place: [],
                            has_admin_comment: undefined,
                            admin_comment: null,
                            page: 1
                        })
                    }}
                >
                    <span className="material-icons-outlined" style={{fontSize: 18}}>filter_alt_off</span>Сброс
                </Button>
            </Tooltip>
        </div>
        <div>
            <Pagination
                defaultCurrent={1}
                total={lessonsDataCount}
                pageSize={50}
                showSizeChanger={false}
                hideOnSinglePage={true}
                onChange = {(e) => {
                    setFilters((prevState) => ({
                        ...prevState,
                        page: e
                    }))
                }}
            />
        </div>
    </>;

    const onRowListener = (record) => {
        return {
            onClick: () => {
                setSelectedLessonId(record.id)
            }
        };
    };

    const onHomeworkRowListener = (record) => {
        return {
            onClick: () => {
                setSelectedHomeworkId(record.id)
            }
        };
    };

    const onExpandedLesson = (lessonId) => {
        if (!expandedHomeworks.hasOwnProperty(lessonId)){
            setExpandedHomeworks((prevState) => ({
                ...prevState,
                [lessonId]: {loading: true, data: []}
            }))
            getHomeworksList({lesson: [lessonId]}).then(res => {
                setExpandedHomeworks((prevState) => ({
                    ...prevState,
                    [lessonId]: {loading: false, data: res.data}
                }))
            })
        }
        return (
            expandedHomeworks.hasOwnProperty(lessonId) ?
                <Table
                columns={homeworkColumns}
                dataSource={expandedHomeworks[lessonId].data}
                loading={expandedHomeworks[lessonId].loading}
                pagination={false}
                size="small"
                onRow={onHomeworkRowListener}
            /> :
                null
        )
    }

    useEffect(() => {
        setLoading(true);
        api.get("/lessons", {params: filters}).then(res => {
            setLessonsDataCount(res.data.count)
            setLessonsData(res.data.items.map(item => {return {...item, key: item.id.toString()}}));
            setLoading(false)
        })
    }, [filters]);
    useEffect(() => {
        dispatch(setNewTitle("Занятия"));
        api.get(`/users/nameonly/`, {params: {
                roles: ["t", "l", "m"],
                show_roles: "true",
                exclude_me: "true"
            }}).then(res => {
            setFiltersData((prevState )=> ({
                ...prevState,
                teachers: res.data.filter((user) => {return user.roles.includes("Teacher")}).map(user => {return {label: `${user.first_name} ${user.last_name}`, value: user.id, key: `t_${user.id}`}}),
                listeners: res.data.filter((user) => {return user.roles.includes("Listener")}).map(user => {return {label: `${user.first_name} ${user.last_name}`, value: user.id, key: `l_${user.id}`}}),
                methodists: res.data.filter((user) => {return user.roles.includes("Metodist")}).map(user => {return {label: `${user.first_name} ${user.last_name}`, value: user.id, key: `m_${user.id}`}})
            }))

        })
        api.get(`/lessons/places/`, {params: {
                name_only: "true",
            }}).then(res => {
            setFiltersData((prevState )=> ({
                ...prevState,
                places: res.data.map(place => {return {label: place.name, value: place.id, key: `p_${place.id}`}}),
            }))

        })
    }, []);

    return (
        <>
            <TableWithFilters
                tableColumns={columns}
                tableData={lessonsData}
                tableLoading={loading}
                filtersElements={filtersElements}
                onRowListener={onRowListener}
                expandable={{
                    expandedRowRender: record => onExpandedLesson(record.id),
                }}
            />
            selectedLessonId && <LessonDrawer lessonId={selectedLessonId}/>
            selectedHomeworkId && <HomeworkDrawer hwID={selectedHomeworkId}/>
        </>
    );
}

export default LessonsPage;