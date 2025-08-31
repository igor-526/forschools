import React, {useEffect, useState} from 'react';
import { Drawer } from 'antd';
import api from "../axios/baseApi.js";
import { ProDescriptions } from '@ant-design/pro-components';

const LessonDrawer = ({lessonId}) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const onClose = () => {
        setOpen(false);
    };
    const [lessonData, setLessonData] = useState({
        name: "Занятие",
        dt: "",
        hw: [],
        teacher: {},
        listeners: [],
        place: null,
        status: 0
    });

    useEffect(() => {
        if (!lessonId){
            return;
        }
        setOpen(true);
        setLoading(true)
        api.get(`/lessons/${lessonId}/`).then(res => {
            setLessonData(res.data)
        })


    }, [lessonId]);
    useEffect(() => {
        console.log(lessonData)
        setLoading(false)
    }, [lessonData])

    return (
        <>
            <Drawer
                title={lessonData.name}
                closable={{ 'aria-label': 'Close Button' }}
                onClose={onClose}
                open={open}
                loading={loading}
            >
                <ProDescriptions
                    column={1}
                    title="Основные данные"
                >
                    <ProDescriptions.Item
                        valueType="text"
                        label="Наименование"
                    >
                        {lessonData.name}
                    </ProDescriptions.Item>
                    <ProDescriptions.Item
                        label="Статус"
                        valueEnum={{
                            0: { text: 'Занятие не проведено', status: 'Default' },
                            1: {
                                text: 'Занятие проведено',
                                status: 'Success',
                            },
                            2: {
                                text: 'Занятие отменено',
                                status: 'Error',
                            },
                            3: {
                                text: 'Ожидает ревью занятия',
                                status: 'Warning',
                            },
                        }}
                    >
                        {lessonData.status}
                    </ProDescriptions.Item>
                    <ProDescriptions.Item
                        valueType="text"
                        label="Преподаватель"
                    >
                        {/*{lessonData.teacher.first_name} {lessonData.teacher.last_name}*/}
                    </ProDescriptions.Item>
                    <ProDescriptions.Item
                        valueType="text"
                        label="Ученики"
                    >
                        {/*{lessonData.listeners.map(listener => (`${listener.first_name} ${listener.last_name}`)).join(", ")}*/}
                    </ProDescriptions.Item>
                </ProDescriptions>
            </Drawer>
        </>
    );
};

export default LessonDrawer;