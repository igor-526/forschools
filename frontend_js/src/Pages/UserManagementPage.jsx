import React, {useEffect, useState} from 'react';
import {Button, Pagination, Radio, Tooltip} from "antd";
import {useDispatch} from "react-redux";
import {setNewTitle} from "../store/layoutSlice.js";
import TableWithFilters from "../Components/TableWithFilters.jsx";
import {getUserList} from "../axios/usersApi.ts";
import usersRoleDecode from "../Utils/Users/userRolesDecoding.ts";
import userActivityTypeDecode from "../Utils/Users/activityTypeDecoding.jsx";
import dateTimeToStr from "../Utils/DateTimeUtils/dateTimeToStr.ts";

const UserManagementPage = () => {
    const dispatch = useDispatch();


    const [filters, setFilters] = useState({
        id: null,
        username: null,
        role: [],
        la_date_start: null,
        la_date_end: null,
        la_type: null,
        is_active: "true",
        exclude_me: "true",
        page: 1
    });
    const [loading, setLoading] = useState(false);
    const [usersData, setUsersData] = useState([])
    const [usersDataCount, setUsersDataCount] = useState(0)

    const columns = [
        {
            title: 'Роль',
            key: 'roles',
            fixed: 'left',
            render: (user) => {
                return usersRoleDecode(user.roles)
            }
        },
        {
            title: 'ФИО',
            key: 'fullname',
            fixed: 'left',
            render: (user) => {
                let fullName = user.first_name;
                if (user.patronymic){
                    fullName += " " + user.patronymic
                }
                fullName += " " + user.last_name;
                return fullName;
            }
        },
        {
            title: 'Связь',
            key: 'connection',
            render: (user) => {
                return ""
            }
        },
        {
            title: 'Активность',
            key: 'activity',
            render: (user) => {
                const activity = userActivityTypeDecode(user.activity.activity_type)
                return <>
                    <Tooltip placement="right" title={activity.comment} arrow={true}>
                        {activity.icon}
                    </Tooltip>
                    <span className="ms-2">{dateTimeToStr(user.activity.last_activity)}</span>
                </>
            }
        },
        {
            title: 'ID | Username',
            key: 'username',
            render: (user) => {
                return <><span>{user.username}</span> <span className="font-bold">({user.id})</span></>;
            }
        }
    ];
    const filtersElements = <>
        <div className="flex gap-2 flex-wrap">
            <Radio.Group
                options={[
                    { label: 'Активные', value: 'true' },
                    { label: 'Все', value: undefined },
                    { label: 'Деактивированные', value: 'false' },
                ]}
                onChange={(e) => {
                    setFilters((prevState) => ({
                        ...prevState,
                        is_active: e.target.value
                    }))
                }}
                value={filters.status}
                optionType="button" />

            <Tooltip placement="bottom" title="Сбросить все фильтры" arrow={true}>
                <Button
                    size="middle"
                    color="danger"
                    variant="outlined"
                    onClick={() => {
                        setFilters({
                            id: null,
                            username: null,
                            role: [],
                            la_date_start: null,
                            la_date_end: null,
                            la_type: null,
                            is_active: "true",
                            exclude_me: "true",
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
                total={usersDataCount}
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
            <Tooltip placement="bottom" title="Регистрация пользователя">
                <Button
                    size="middle"
                    color="primary"
                    variant="outlined"
                    onClick={() => {

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
            }
        };
    }

    useEffect(() => {
        setLoading(true);
        getUserList(filters).then(res => {
            console.log(res.data)
            setUsersDataCount(res.data.count)
            setUsersData(res.data.items)
            setLoading(false)
        })
    }, [filters])
    useEffect(() => {
        dispatch(setNewTitle("Управление пользователями"));
    }, [])

    return (
        <>
            <TableWithFilters
                tableColumns={columns}
                tableData={usersData}
                tableLoading={loading}
                filtersElements={filtersElements}
                onRowListener={onRowListener}
            />
        </>
    )
}

export default UserManagementPage;