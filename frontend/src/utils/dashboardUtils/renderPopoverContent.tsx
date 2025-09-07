import usersToString from "../usersUtils/usersToString.ts";
import type {DashboardPopoverContentRendererType} from "../../types/dashboardTypes.ts";

const renderPopoverContent: DashboardPopoverContentRendererType = (lessons, event) => {
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

export default renderPopoverContent;