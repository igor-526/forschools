function timeUtilsCompareTime(start, end){
    const tsH = start.value.split(":")[0]
    const tsM = start.value.split(":")[1]
    const teH = end.value.split(":")[0]
    const teM = end.value.split(":")[1]
    const ts = new Date().setHours(tsH, tsM)
    const te = new Date().setHours(teH, teM)
    return te <= ts
}

function timeUtilsValidateTime(start, end){
    const tsH = start.value.split(":")[0]
    const tsM = start.value.split(":")[1]
    const teH = end.value.split(":")[0]
    const teM = end.value.split(":")[1]
    const ts = new Date().setHours(tsH, tsM)
    const te = new Date().setHours(teH, teM)
    return ts <= te
}

function timeUtilsDateTimeToStr(dt, time=true){
    const date = new Date(dt)
    const month = date.getMonth() === 12 ? 1 : date.getMonth()+1
    let datestring
    const difference = (new Date()
        .setHours(0,0,0,0) - new Date(dt)
        .setHours(0,0,0,0)) / (1000 * 60 * 60 * 24)
    switch (difference){
        case 0:
            datestring = time ? "сегодня в " : "сегодня"
            break
        case 1:
            datestring = time ? "вчера в " : "вчера"
            break
        default:
            datestring = `${date.getDate().toString().padStart(2, "0")}.${month.toString().padStart(2, "0")}`
            break
    }
    if (time){
        datestring += ` ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
    }
    return datestring
}


function getPlus1HourTime(element){
    const hours = Number(element.value.split(":")[0])
    const minutes = Number(element.value.split(":")[1])
    let newHours
    switch (hours){
        case 23:
            newHours = 0
            break
        default:
            newHours = hours + 1
            break
    }
    return `${newHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
}


function lessonTimeRangeToStr(timeStart, timeEnd){
    const tsH = timeStart.split(":")[0]
    const tsM = timeStart.split(":")[1]
    const teH = timeEnd.split(":")[0]
    const teM = timeEnd.split(":")[1]
    return `${tsH.padStart(2, "0")}:${tsM.padStart(2, "0")} - ${teH.padStart(2, "0")}:${teM.padStart(2, "0")}`
}


function getLessonDateTimeRangeString(lesson, date=true, time=true){
    let dateString = ""
    let timeString = ""
    const st = new Date(Date.parse(`${lesson.date}T${lesson.start_time}`))
    const et = new Date(Date.parse(`${lesson.date}T${lesson.end_time}`))
    if (date){
        const date = new Date(lesson.date)
        const dateDay = date.getDate().toString().padStart(2, "0")
        const dateMonth = (date.getMonth()+1).toString().padStart(2, "0")
        dateString = `${dateDay}.${dateMonth}`
    }

    if (time && lesson.start_time !== null) {
        const stH = st.getHours().toString().padStart(2, "0")
        const stM = st.getMinutes().toString().padStart(2, "0")
        const etH = et.getHours().toString().padStart(2, "0")
        const etM = et.getMinutes().toString().padStart(2, "0")
        timeString = `${stH}:${stM}-${etH}:${etM}`
    }
    return `${dateString} ${timeString}`
}


function timeUtilsValidateTimeInScheduleModals(check, ts, te){
    if (check.checked){
        if (ts.value !== "" && te.value !== ""){
            if (timeUtilsCompareTime(ts, te)){
                return {
                    status: "error",
                    error: "Окончание занятия должно быть позже начала",
                    elements: [ts, te]
                }
            }
        } else {
            if (ts.value === ""){
                return {
                    status: "error",
                    error: "Начало занятия не может быть пустым",
                    elements: [ts]
                }
            }
            if (te.value === ""){
                return {
                    status: "error",
                    error: "Окончание занятия не может быть пустым",
                    elements: [te]
                }
            }
        }
    }
    return {status: "success"}
}