import React, {useEffect, useState} from 'react';
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import {Popover} from "antd";
import dateTimeUtilsToDateFormat from "../Components/Utils/DateTimeUtils/toDateFormat.js";
import usersToString from "../Components/Utils/UsersUtils/usersToString.js";
import {useDispatch} from "react-redux";
import {setNewTitle} from "../store/layoutSlice.js";
import { getLessonsList } from "../axios/lessonsApi.js"
import LessonDrawer from "../Components/LessonDrawer.jsx";

const DashboardCalendar = () => {
    const dispatch = useDispatch();
    dispatch(setNewTitle("Дэшборд"));

    const [lessons, setLessons] = useState([])
    const [events, setEvents] = useState([])
    const [eventsMode, setEventsMode] = useState("listeners")
    const [popoverInfo, setPopoverInfo] = useState({
        show: false,
        x: 0,
        y: 0
    });
    const [currentEvent, setCurrentEvent] = useState(null);
    const [selectedLesson, setSelectedLesson] = useState(null);

    const [currentDates, setCurrentDates] = useState({
        date_start: null,
        date_end: null
    });

    const handleEventMouseEnter = (info) => {
        setCurrentEvent(info.event);
        const rect = info.el.getBoundingClientRect();
        setPopoverInfo({
            show: true,
            x: rect.left + rect.width / 2,
            y: rect.top,
        })
    };
    const handleEventMouseLeave = () => {
        setPopoverInfo({
            show: false,
            x: 0,
            y: 0,
        })
    };
    const renderPopoverContent = (event) => {
        if (!event) return null;
        const lesson = lessons.find(lesson => lesson.id.toString() === event.id);
        if (!lesson) return null;
        return (
            <div style={{ maxWidth: 300 }}>
                <p><strong>Наименование: </strong>{lesson.name}</p>
                <p><strong>Время: </strong>{lesson.dt}</p>
                <p><strong>Преподаватель: </strong>{usersToString([lesson.teacher])}</p>
                <p><strong>Ученики: </strong>{usersToString(lesson.listeners)}</p>
                {lesson.place !== null && (
                    <p><strong>Место: </strong> {lesson.place.name}</p>
                )}
            </div>
        );
    };

    useEffect(() => {
        getLessonsList(currentDates).then(response => {
            setLessons(response.data.items)
        })
    }, [currentDates])
    useEffect(() => {
        const getTitle = (lesson) => {
            switch (eventsMode){
                case "listeners":
                    return usersToString(lesson.listeners);
                case "teachers":
                    return usersToString([lesson.teacher]);
                case "places":
                    return lesson.place ? lesson.place.name : "Неизвестно";
                default:
                    return lesson.name;
            }
        }

        const getColor = (lesson) => {
            switch (lesson.status) {
                case 1:
                    return "green";
                case 2:
                    return "red";
                case 3:
                    return "orange";
                default:
                    return null;
            }
        }

        const allLessons = eventsMode === "places" ? lessons.filter(lesson => {return lesson.place !== null}) : lessons;
        setEvents(allLessons.map(lesson => {
            return {
                id: lesson.id,
                key: lesson.id,
                start: lesson.start_dt,
                end: lesson.end_dt,
                title: getTitle(lesson),
                color: getColor(lesson)
            }
        }))
    }, [lessons, eventsMode])

    return (
        <>
            <div style={{ position: 'relative', height: '100%' }}>
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin]}
                    height={"100%"}
                    initialView={'timeGridWeek'}
                    locale={'ru'}
                    allDaySlot={false}
                    firstDay={1}
                    slotMinTime={"06:00:00"}
                    headerToolbar={{
                        start: 'timeGridWeek,timeGridDay',
                        center: 'title',
                        end: 'listeners,teachers,places today prev,next'
                    }}
                    buttonText={{
                        today: 'Сегодня',
                        week: 'Неделя',
                        day: 'День',
                    }}
                    events={events}
                    customButtons={{
                        listeners: {
                            text: 'Ученики',
                            click: function () {
                                setEventsMode("listeners")
                            }
                        },
                        teachers: {
                            text: 'Преподаватели',
                            click: function () {
                                setEventsMode("teachers")
                            }
                        },
                        places: {
                            text: 'Ссылки',
                            click: function () {
                                setEventsMode("places")
                            }
                        }
                    }}
                    eventDidMount={(info) => {
                        info.el.addEventListener('mouseenter', () => handleEventMouseEnter(info));
                        info.el.addEventListener('mouseleave', () => handleEventMouseLeave(info));
                        info.el.addEventListener('click', () => {
                            setSelectedLesson(info.event.id);
                        });

                        info.el.style.cursor = 'pointer';
                    }}
                    datesSet={(dateInfo) => {
                        setCurrentDates({
                            date_start: dateTimeUtilsToDateFormat(dateInfo.start),
                            date_end: dateTimeUtilsToDateFormat(dateInfo.end),
                        })
                    }}
                />
                <Popover
                    content={renderPopoverContent(currentEvent)}
                    open={popoverInfo.show}
                    trigger="hover"
                    placement="top"
                >
                    <div style={{
                        position: 'fixed',
                        left: popoverInfo.x,
                        top: popoverInfo.y,
                        width: 1,
                        height: 1,
                        pointerEvents: 'none'
                    }} />
                </Popover>
            </div>
            {selectedLesson && <LessonDrawer lessonId={selectedLesson} />}
        </>
    )
}

export default DashboardCalendar;