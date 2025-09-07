import React, {useEffect, useState} from 'react';
import {Button, Input, Radio, Select, Space, Table} from "antd";
import api from "../axios/baseApi.js";
import {FilterOutlined, SearchOutlined} from "@ant-design/icons";
import HomeworkDrawer from "../Components/HomeworkDrawer.jsx";
import {useDispatch} from "react-redux";
import {setNewTitle} from "../store/layoutSlice.js";
import TableWithFilters from "../Components/TableWithFilters.jsx";
import LessonDrawer from "../Components/LessonDrawer.jsx";
import NameFilter from "../Components/Filters/NameFilter.jsx";
import ListFilter from "../Components/Filters/ListFilter.jsx";
import DateRangeFilter from "../Components/Filters/DateRangeFilter.jsx";
import AdminCommentFilter from "../Components/Filters/AdminCommentFilter.jsx";

const HomeworksPage = () => {
    const dispatch = useDispatch();
    dispatch(setNewTitle("Домашние задания"));

    const [filters, setFilters] = useState({
        name: null,
        teacher: [],
        listener: [],
        methodist: [],
        assigned_date_start: null,
        assigned_date_end: null,
        last_status: [],
        last_status_date_start: null,
        last_status_date_end: null,
        has_admin_comment: null,
        admin_comment: null,
        page: 1
    });
    const [filtersData, setFiltersData] = useState({
        teachers: [],
        listeners: [],
        methodists: [],
    });
    const [filterLastStatusDateRange, setFilterLastStatusDateRange] = useState(null)
    const [filterAssignedStatusDateRange, setFilterAssignedStatusDateRange] = useState(null)
    const [loading, setLoading] = useState(false);
    const [homeworkData, setHomeworkData] = useState([])
    const [homeworksDataCount, setHomeworksDataCount] = useState(0)
    const [selectedHomeworkId, setSelectedHomeworkId] = useState(null);

    const columns = [
        {
            title: 'Наименование',
            dataIndex: 'name',
            key: 'name',
            fixed: 'left',
            filterIcon: <SearchOutlined style={{ color: filters.name ? '#1677ff' : undefined }} />,
            filterDropdown:
                <NameFilter
                    filters={filters}
                    setFilters={setFilters}
                    filterKey="name"
                />
        },
        {
            title: 'Преподаватель',
            key: 'teacher',
            render: (hw) => {
                return `${hw.teacher.first_name} ${hw.teacher.last_name}`;
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
            render: (hw) => {
                return `${hw.listener.first_name} ${hw.listener.last_name}`;
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
            title: 'Задано',
            key: 'assigned',
            render: (hw) => {
                return new Date(hw.assigned_status.dt).toLocaleDateString();
            },
            filterIcon: <SearchOutlined style={{ color: filters.assigned_date_start ? '#1677ff' : undefined }} />,
            filterDropdown:
                <DateRangeFilter
                    setFilters={setFilters}
                    dateRange={filterAssignedStatusDateRange}
                    setDateRange={setFilterAssignedStatusDateRange}
                    filterKeyFrom="assigned_date_start"
                    filterKeyTo="assigned_date_end"
                />
        },
        {
            title: 'Статус',
            key: 'status',
            render: (hw) => {
                return new Date(hw.last_status.dt).toLocaleDateString();
            },
            filterIcon: <FilterOutlined style={{ color: filters.last_status_date_start || filters.last_status.length ? '#1677ff' : undefined }} />,
            filterDropdown:
                <DateRangeFilter
                    setFilters={setFilters}
                    dateRange={filterLastStatusDateRange}
                    setDateRange={setFilterLastStatusDateRange}
                    filterKeyFrom="last_status_date_start"
                    filterKeyTo="last_status_date_end"
                />
        },
        {
            title: 'Комментарий',
            key: 'admin_comment',
            render: (hw) => {
                return hw.admin_comment;
            },
            filterIcon: <SearchOutlined style={{ color: filters.has_admin_comment || filters.admin_comment ? '#1677ff' : undefined }}/>,
            filterDropdown:
                <AdminCommentFilter
                filters={filters}
                setFilters={setFilters}
                searchKey="admin_comment"
                filterKey="has_admin_comment"
                />
        }
    ];
    const filtersElements = <></>

    const onRowListener = (record, rowIndex) => {
        return {
            onClick: (event) => {
                setSelectedHomeworkId(record.id)
            }
        };
    }

    useEffect(() => {
        setLoading(true);
        api.get("/homeworks", {params: filters}).then(res => {
            console.log(res.data)
            setHomeworkData(res.data);
            setLoading(false)
        })
    }, [filters])
    useEffect(() => {
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
    }, [])

    return (
        <>
            <TableWithFilters
                tableColumns={columns}
                tableData={homeworkData}
                tableLoading={loading}
                filtersElements={filtersElements}
                onRowListener={onRowListener}
            />
            <HomeworkDrawer hwID={selectedHomeworkId}/>
        </>
    )
}

export default HomeworksPage;