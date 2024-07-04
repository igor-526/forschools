function compareTime(start, end){
    const tsH = start.value.split(":")[0]
    const tsM = start.value.split(":")[1]
    const teH = end.value.split(":")[0]
    const teM = end.value.split(":")[1]
    const ts = new Date().setHours(tsH, tsM)
    const te = new Date().setHours(teH, teM)
    return te <= ts
}