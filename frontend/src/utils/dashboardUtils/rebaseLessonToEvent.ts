import type {dashboardEvent, dashboardEventColorType, dashboardEventsMode} from "../../types/dashboardTypes.ts";
import type {LessonListResponseItemType, LessonStatusType} from "../../types/lessonsTypes.ts";
import usersToString from "../usersUtils/usersToString.ts";

const dashboardRebaseLessonToEvent: (lesson: LessonListResponseItemType, eventsMode: dashboardEventsMode) => dashboardEvent =
    (lesson, eventsMode) => {
    const getTitle: (lesson: LessonListResponseItemType) => string = (lesson) => {
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

    const getColor: (lessonStatus: LessonStatusType) => dashboardEventColorType = (lessonStatus) => {
        switch (lessonStatus) {
            case 1:
                return "green";
            case 2:
                return "red";
            case 3:
                return "orange";
            default:
                return undefined;
        }
    }

    return {
        id: lesson.id.toString(),
        key: lesson.id,
        start: lesson.start_dt,
        end: lesson.end_dt,
        title: getTitle(lesson),
        color: getColor(lesson.status)
    }
}

export default dashboardRebaseLessonToEvent