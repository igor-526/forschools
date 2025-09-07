import {useEffect, useState} from 'react';
import {Button, Tooltip, Radio} from "antd";
import {useDispatch} from "react-redux";
import {setNewTitle} from "../store/layoutSlice.js";
import type {LessonFiltersType, LessonTableDataItemType, LessonTableFilterData} from "../types/lessonsTypes.ts";
import {getLessonPlacesList, getLessonsList} from "../axios/lessonsApi.ts";
import {getUserNameOnlyList} from "../axios/usersApi.ts";
import {getLessonTableColumns} from "../components/lessons/lessonTableColumns.tsx";
import TableWithFilters from "../components/tableWithFilters.tsx";
import type {DateRangeType} from "../types/filterDateRangeTypes.ts";
import ListFilter from "../components/filters/listFilter.tsx";
import TablePagination from "../components/pagination.tsx";

const LessonsPage = () => {
    const dispatch = useDispatch();
    const [filters, setFilters] = useState<LessonFiltersType>({
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
        admin_comment_date_from: null,
        admin_comment_date_to: null,
        page: 1
    });
    const [filtersData, setFiltersData] = useState<LessonTableFilterData>({
        teachers: [],
        listeners: [],
        methodists: [],
        places: []
    });
    const [dateRange, setDateRange] = useState<DateRangeType | null>(null);
    const [adminCommentDateRange, setAdminCommentDateRange] = useState<DateRangeType | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [lessonsData, setLessonsData] = useState<LessonTableDataItemType[]>([]);
    const [lessonsDataCount, setLessonsDataCount] = useState<number>(0);
    // const [selectedLessonId, setSelectedLessonId] = useState(null);
    // const [selectedHomeworkId, setSelectedHomeworkId] = useState(null);
    // const [expandedHomeworks, setExpandedHomeworks] = useState({});

    const lessonTableColumns = getLessonTableColumns(
        filters, setFilters, filtersData, dateRange, setDateRange, adminCommentDateRange, setAdminCommentDateRange
    )

    const headerElements = <>
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
            <Tooltip placement="bottom" title="Сбросить все фильтры" arrow={true}>
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
                            admin_comment_date_from: null,
                            admin_comment_date_to: null,
                            page: 1
                        })
                    }}
                >
                    <span className="material-icons-outlined" style={{fontSize: 18}}>filter_alt_off</span>Сброс
                </Button>
            </Tooltip>
        </div>
        <div>
            <TablePagination
                setFilters={setFilters}
                total={lessonsDataCount}
            />
        </div>
    </>;

    // const onRowListener = (record) => {
    //     return {
    //         onClick: () => {
    //             setSelectedLessonId(record.id)
    //         }
    //     };
    // };
    //
    // const onHomeworkRowListener = (record) => {
    //     return {
    //         onClick: () => {
    //             setSelectedHomeworkId(record.id)
    //         }
    //     };
    // };
    //
    // const onExpandedLesson = (lessonId) => {
    //     if (!expandedHomeworks.hasOwnProperty(lessonId)){
    //         setExpandedHomeworks((prevState) => ({
    //             ...prevState,
    //             [lessonId]: {loading: true, data: []}
    //         }))
    //         getHomeworksList({lesson: [lessonId]}).then(res => {
    //             setExpandedHomeworks((prevState) => ({
    //                 ...prevState,
    //                 [lessonId]: {loading: false, data: res.data}
    //             }))
    //         })
    //     }
    //     return (
    //         expandedHomeworks.hasOwnProperty(lessonId) ?
    //             <Table
    //                 columns={homeworkColumns}
    //                 dataSource={expandedHomeworks[lessonId].data}
    //                 loading={expandedHomeworks[lessonId].loading}
    //                 pagination={false}
    //                 size="small"
    //                 onRow={onHomeworkRowListener}
    //             /> :
    //             null
    //     )
    // }

    useEffect(() => {
        setLoading(true);
        getLessonsList(filters).then(data => {
            setLessonsDataCount(data.count)
            setLessonsData(data.items.map<LessonTableDataItemType>(item => {return {...item, key: item.id.toString()}}));
            setLoading(false)
        })
    }, [filters]);
    useEffect(() => {
        dispatch(setNewTitle("Занятия"));
        getUserNameOnlyList({
            roles: ["t", "l", "m"],
            show_roles: "true",
            exclude_me: "true"
        }).then(data => {
            setFiltersData((prevState )=> ({
                ...prevState,
                teachers: data.filter((user) => {return user.roles?.includes("Teacher")}).map(user => {return {label: `${user.first_name} ${user.last_name}`, value: user.id, key: `t_${user.id}`}}),
                listeners: data.filter((user) => {return user.roles?.includes("Listener")}).map(user => {return {label: `${user.first_name} ${user.last_name}`, value: user.id, key: `l_${user.id}`}}),
                methodists: data.filter((user) => {return user.roles?.includes("Metodist")}).map(user => {return {label: `${user.first_name} ${user.last_name}`, value: user.id, key: `m_${user.id}`}})
            }))
        })
        getLessonPlacesList({name_only: "true"}).then(data => {
            setFiltersData((prevState )=> ({
                ...prevState,
                places: data.map(place => {return {label: place.name, value: place.id, key: `p_${place.id}`}}),
            }))
        })
    }, []);

    return (
        <>
            <TableWithFilters
                tableColumns={lessonTableColumns}
                tableData={lessonsData}
                tableLoading={loading}
                filtersElements={headerElements}
                // onRowListener={onRowListener}
                // expandable={{
                //     expandedRowRender: record => onExpandedLesson(record.id),
                // }}
            />
            {/*selectedLessonId && <LessonDrawer lessonId={selectedLessonId}/>*/}
            {/*selectedHomeworkId && <HomeworkDrawer hwID={selectedHomeworkId}/>*/}
        </>
    );
}

export default LessonsPage;