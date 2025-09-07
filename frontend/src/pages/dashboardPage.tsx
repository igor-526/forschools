import {useDispatch} from "react-redux";
import {setNewTitle} from "../store/layoutSlice.js";
import {useEffect, useState} from "react";
import {getLessonsList} from "../axios/lessonsApi.ts";
import dateTimeUtilsToDateFormat from "../utils/dateTimeUtils/toDateFormat.ts";
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import {Popover} from "antd";
import type {LessonListResponseItemType} from "../types/lessonsTypes.ts";
import type {
    dashboardEvent,
    dashboardEventsMode, DashboardMouseEnterHandlerType, dashboardMouseEventsInfo, DashboardMouseLeaveHandlerType,
    dashboardPopoverProps,
    dashboardSelectedDatesType
} from "../types/dashboardTypes.ts";
import dashboardRebaseLessonToEvent from "../utils/dashboardUtils/rebaseLessonToEvent.ts";
import renderPopoverContent from "../utils/dashboardUtils/renderPopoverContent.tsx";

const DashboardCalendar = () => {
    const dispatch = useDispatch();
    const [lessons, setLessons] = useState<LessonListResponseItemType[]>([])
    const [events, setEvents] = useState<dashboardEvent[]>([])
    const [eventsMode, setEventsMode] = useState<dashboardEventsMode>("listeners")
    const [popoverInfo, setPopoverInfo] = useState<dashboardPopoverProps>({
        show: false,
        x: 0,
        y: 0
    });
    const [currentEvent, setCurrentEvent] = useState<dashboardMouseEventsInfo["event"] | null>(null);
    // const [selectedLesson, setSelectedLesson] = useState(null);
    const [currentDates, setCurrentDates] = useState<dashboardSelectedDatesType>({});

    const handleEventMouseEnter: DashboardMouseEnterHandlerType  = (info) => {
        setCurrentEvent(info.event);
        const rect = info.el.getBoundingClientRect();
        setPopoverInfo({
            show: true,
            x: rect.left + rect.width / 2,
            y: rect.top,
        })
    };
    const handleEventMouseLeave: DashboardMouseLeaveHandlerType = () => {
        setPopoverInfo({
            show: false,
            x: 0,
            y: 0,
        })
    };

    useEffect(() => {
        dispatch(setNewTitle("Дэшборд"));
    }, []);
    useEffect(() => {
        getLessonsList(currentDates).then(lessons => {
            setLessons(lessons.items)
        })
    }, [currentDates])
    useEffect(() => {
        const allLessons: LessonListResponseItemType[] = eventsMode === "places" ?
            lessons.filter((lesson: LessonListResponseItemType)  =>
            {return lesson.place !== null}) :
            lessons;
        setEvents(allLessons.map((lesson: LessonListResponseItemType)  => {
            return dashboardRebaseLessonToEvent(lesson, eventsMode)
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
                        info.el.addEventListener('mouseleave', () => handleEventMouseLeave());
                        // info.el.addEventListener('click', () => {
                        //     setSelectedLesson(info.event.id);
                        // });
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
                    content={renderPopoverContent(lessons, currentEvent)}
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
            {/*{selectedLesson && <LessonDrawer lessonId={selectedLesson} />}*/}
        </>
    )
}

export default DashboardCalendar;