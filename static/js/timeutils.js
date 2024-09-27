function compareTime(start, end){
    const tsH = start.value.split(":")[0]
    const tsM = start.value.split(":")[1]
    const teH = end.value.split(":")[0]
    const teM = end.value.split(":")[1]
    const ts = new Date().setHours(tsH, tsM)
    const te = new Date().setHours(teH, teM)
    return te <= ts
}

function timeUtilsDateTimeToStr(dt){
    const date = new Date(dt)
    const month = date.getMonth() === 12 ? 1 : date.getMonth()+1
    let datestring
    const difference = (new Date()
        .setHours(0,0,0,0) - new Date(dt)
        .setHours(0,0,0,0)) / (1000 * 60 * 60 * 24)
    switch (difference){
        case 0:
            datestring = "сегодня в "
            break
        case 1:
            datestring = "вчера в "
            break
        default:
            datestring = `${date.getDate().toString().padStart(2, "0")}.${month.toString().padStart(2, "0")}`
            break
    }
    datestring += ` ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
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