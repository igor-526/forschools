const getLessonStatusByCode = (code) => {
    switch (code) {
        case 0:
            return "Занятие не проведено"
        case 1:
            return "Занятие проведено"
        case 2:
            return "Занятие отменено"
        case 3:
            return "Ожидает проведения"
        default:
            return "Неизвестно"
    }
};

export default getLessonStatusByCode;