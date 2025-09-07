import React, {useEffect, useState} from 'react';
import {Button, Input, Pagination, Radio, Select, Space, Table, Tooltip} from "antd";
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
import {getLearningPlanList} from "../axios/learning_plansApi.js";
import usersToString from "../Components/Utils/UsersUtils/usersToString.js";
import LearningPlanNewDrawer from "../Components/LearningPlans/Drawers/LearningPlanNewDrawer.jsx";
import LearningPlanDrawer from "../Components/LearningPlans/Drawers/LearningPlanDrawer.jsx";

const LearningPlansPage = () => {
    const dispatch = useDispatch();


    const [filters, setFilters] = useState({
        status: "processing",
        name: null,
        teacher: [],
        listener: [],
        methodist: [],
        has_admin_comment: null,
        has_methodist: null,
        admin_comment: null,
        page: 1
    });
    const [filtersData, setFiltersData] = useState({
        teachers: [],
        listeners: [],
        methodists: [],
    });
    const [loading, setLoading] = useState(false);
    const [learningPlansData, setLearningPlansData] = useState([])
    const [learningPlansDataCount, setLearningPlansDataCount] = useState(0)
    const [selectedLPlan, setSelectedLPlan] = useState(null);
    const [showNewPlanDrawer, setShowNewPlanDrawer] = useState(false);

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
            title: 'Методист',
            key: 'methodist',
            render: (plan) => {
                return plan.metodist ? usersToString([plan.metodist]) : "Отсутствует";
            },
            filterIcon: <FilterOutlined style={{ color: filters.methodist.length ? '#1677ff' : undefined }}/>,
            filterDropdown:
                <ListFilter
                    filters={filters}
                    setFilters={setFilters}
                    filterKey="methodist"
                    filterData={filtersData.methodists}
                    placeHolder="Выберите методистов"
                />
        },
        {
            title: 'Преподаватель',
            key: 'teacher',
            render: (plan) => {
                return usersToString([plan.teacher]);
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
            title: 'Ученики',
            key: 'listener',
            render: (plan) => {
                return usersToString(plan.listeners);
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
            title: 'Осталось',
            key: 'awaiting_lessons_count',
            render: (plan) => {
                return `${plan.awaiting_lessons_count} занятий`;
            },
        },
        {
            title: 'Комментарий',
            key: 'admin_comment',
            render: (plan) => {
                return plan.hasOwnProperty("admin_comment") ? plan.admin_comment : plan.admin_comment;
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
    const filtersElements = <>
        <div className="flex gap-2 flex-wrap">
            <Radio.Group
                options={[
                    { label: 'В процессе', value: 'processing' },
                    { label: 'Все', value: undefined },
                    { label: 'Обучение завершено', value: 'completed' },
                ]}
                onChange={(e) => {
                    setFilters((prevState) => ({
                        ...prevState,
                        status: e.target.value
                    }))
                }}
                value={filters.status}
                optionType="button" />

            <Tooltip placement="top" title="Сбросить все фильтры" arrow={true}>
                <Button
                    size="middle"
                    color="danger"
                    variant="outlined"
                    onClick={() => {
                        setFilters({
                            status: "processing",
                            name: null,
                            teacher: [],
                            listener: [],
                            methodist: [],
                            has_admin_comment: null,
                            admin_comment: null,
                            page: 1
                        })
                    }}
                >
                    <span className="material-icons-outlined" style={{fontSize: 18}}>filter_alt_off</span>Сброс
                </Button>
            </Tooltip>
        </div>
        <div className="flex gap-2 flex-wrap">
            <Pagination
                defaultCurrent={1}
                total={learningPlansDataCount}
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
            <Tooltip placement="bottom" title="Новый план обучения">
                <Button
                    size="middle"
                    color="primary"
                    variant="outlined"
                    onClick={() => {
                        setShowNewPlanDrawer(true)
                    }}
                >
                    <span className="material-icons-outlined" style={{fontSize: 18}}>add</span>
                </Button>
            </Tooltip>
        </div>
    </>

    const onRowListener = (record, rowIndex) => {
        return {
            onClick: (event) => {
                setSelectedLPlan(record);
            }
        };
    }

    useEffect(() => {
        setLoading(true);
        getLearningPlanList(filters).then(res => {
            setLearningPlansDataCount(res.data.count)
            setLearningPlansData(res.data.items)
            setLoading(false)
        })
    }, [filters])
    useEffect(() => {
        dispatch(setNewTitle("План обучения"));

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
                tableData={learningPlansData}
                tableLoading={loading}
                filtersElements={filtersElements}
                onRowListener={onRowListener}
            />
            <LearningPlanNewDrawer open={showNewPlanDrawer} setOpen={setShowNewPlanDrawer} />
            {selectedLPlan && <LearningPlanDrawer selectedPlan={selectedLPlan} setSelectedPlan={setSelectedLPlan}/>}
        </>
    )
}

export default LearningPlansPage;