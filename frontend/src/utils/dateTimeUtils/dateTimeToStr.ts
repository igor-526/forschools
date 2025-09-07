const dateTimeToStr: (dt: string, time?: boolean) => string = (dt: string, time: boolean = true) => {
    const date: Date = new Date(dt)
    const month: number = date.getMonth() === 12 ? 1 : date.getMonth() + 1
    let dateString: string = ""
    const dayDifference: number = (new Date().setHours(0,0,0,0) -
        new Date(dt).setHours(0,0,0,0)) /
        (1000 * 60 * 60 * 24)
    switch (dayDifference){
        case 0:
            dateString = time ? "сегодня в " : "сегодня"
            break
        case 1:
            dateString = time ? "вчера в " : "вчера"
            break
        default:
            dateString = `${date.getDate().toString()}.${month.toString()}`
            break
    }
    if (time){
        dateString += ` ${date.getHours().toString()}:${date.getMinutes().toString()}`
    }
    return dateString
}

export default dateTimeToStr