function homeworkItemShowOffcanvas(homeworkID){
    homeworkItemShowOffcanvasSelectedHWID = homeworkID
    homeworkAPIGetItem(homeworkID).then(request => {
        switch (request.status){
            case 200:
                const homeworkOffcanvas = mobileInfoOffcanvasSet(request.response.name)
                mobileInfoOffcanvasAddData("Основные данные", homeworkOffcanvas,
                    homeworkItemShowOffcanvasGetMainInfoContent(request.response, isAdmin))
                const materialsInfo = mobileInfoMaterialsGetBlock(request.response.materials)
                const addMaterialsButton = document.createElement("button")
                addMaterialsButton.classList.add("btn", "btn-primary", "mt-2", "mx-1", "w-100")
                addMaterialsButton.type = "button"
                addMaterialsButton.innerHTML = "Добавить материалы"
                addMaterialsButton.disabled = true
                mobileInfoOffcanvasAddData("Материалы", homeworkOffcanvas, [materialsInfo, addMaterialsButton])
                homeworkAPIGetLogs(homeworkID).then(request => {
                    switch (request.status){
                        case 200:
                            const logsInfo = homeworkItemShowOffcanvasGetLogsInfo(request.response, true)
                            const allHistoryButton = document.createElement("button")
                            allHistoryButton.type = "button"
                            allHistoryButton.innerHTML = "Вся история"
                            allHistoryButton.classList.add("btn", "btn-primary", "w-100")
                            allHistoryButton.addEventListener("click", function () {
                                homeworkItemLogsShowOffcanvas(homeworkID)
                            })
                            mobileInfoOffcanvasAddData("Последний ответ", homeworkOffcanvas, [logsInfo, allHistoryButton])
                            break
                        default:
                            showErrorToast()
                            break
                    }
                })
                break
            default:
                showErrorToast()
                break
        }
    })
}

function homeworkItemShowOffcanvasGetMainInfoContent(hw, isAdmin){
    const elements = []

    const teacherP = document.createElement("p")
    teacherP.classList.add("mb-1")
    teacherP.insertAdjacentElement("beforeend", iconUtilsGetIcon(
        "teacher_grey.svg", "Преподаватель"
    ))
    teacherP.innerHTML += `<span class="fw-bold">Преподаватель: </span> ${hw.teacher.first_name} ${hw.teacher.last_name}`
    elements.push(teacherP)

    const listenerP = document.createElement("p")
    listenerP.classList.add("mb-1")
    listenerP.insertAdjacentElement("beforeend", iconUtilsGetIcon(
        "student_grey.svg", "Ученик"
    ))
    listenerP.innerHTML += `<span class="fw-bold">Ученик: </span> ${hw.listener.first_name} ${hw.listener.last_name}`
    elements.push(listenerP)

    if (hw.lesson_info){
        const lessonP = document.createElement("p")
        lessonP.classList.add("mb-1")
        lessonP.insertAdjacentElement("beforeend", iconUtilsGetIcon(
            "lesson_grey.svg", "Занятие"
        ))
        lessonP.innerHTML += `<span class="fw-bold">Занятие: </span> ${hw.lesson_info.name}`
        lessonP.style.color = "#0d6efd"
        lessonP.addEventListener("click", function () {
            lessonShowOffcanvas(hw.lesson_info.id)
        })
        elements.push(lessonP)
    }

    return elements
}

function homeworkItemShowOffcanvasGetLogsInfo(logs=[], last=true){
    const logsToShow = []
    for (let i = 0; i < logs.length; i++) {
        if (last){
            if (logs[0].status === 1 || logs[0].status === 7){
                break
            }
            if (logsToShow.length === 0){
                logsToShow.push(logs[i])
                continue
            }
            if (logsToShow.length > 0 && logsToShow[logsToShow.length - 1].status === logs[i].status){
                logsToShow.push(logs[i])
            } else {
                break
            }
        } else {
            logsToShow.push(logs[i])
        }
    }
    const mainDiv = document.createElement("div")

    if (logsToShow.length === 0){
        mainDiv.innerHTML = "<p>Ответов пока нет...</p>"
        return mainDiv
    }

    const ul = document.createElement("ul")
    ul.classList.add("list-group")

    logsToShow.forEach(log => {
        const li = document.createElement("li")
        li.classList.add("list-group-item")
        const statusInfo = document.createElement("div")
        statusInfo.classList.add("d-flex", "justify-content-between", "mb-2")
        const statusInfoStatus = document.createElement("span")
        statusInfoStatus.classList.add("ms-2", "me-auto", "fw-bold")
        statusInfoStatus.innerHTML = homeworkItemShowLogsStrStatus(log.status)
        const statusInfoDT = document.createElement("div")
        statusInfoDT.style.color = "grey"
        statusInfoDT.innerHTML = timeUtilsDateTimeToStr(log.dt)
        li.insertAdjacentElement("beforeend", statusInfo)
        statusInfo.insertAdjacentElement("beforeend", statusInfoStatus)
        statusInfo.insertAdjacentElement("beforeend", statusInfoDT)
        const dataDiv = document.createElement("div")
        const dataDivComment = document.createElement("p")
        dataDivComment.innerHTML = log.comment
        dataDiv.insertAdjacentElement("beforeend", dataDivComment)
        dataDiv.insertAdjacentElement("beforeend", mobileInfoMaterialsGetBlock(log.files.map(file => {
            return {
                file: file.path,
                type: file.type
            }
        })))
        const userDiv = document.createElement("div")
        userDiv.classList.add("d-flex", "justify-content-end")
        const userDivSpan = document.createElement("small")
        userDivSpan.style.color = "grey"
        userDivSpan.innerHTML = `${log.user.first_name} ${log.user.last_name}`
        userDiv.insertAdjacentElement("beforeend", userDivSpan)
        li.insertAdjacentElement("beforeend", dataDiv)
        li.insertAdjacentElement("beforeend", userDiv)
        ul.insertAdjacentElement("beforeend", li)
    })

    mainDiv.insertAdjacentElement("beforeend", ul)
    return mainDiv

}

function homeworkItemLogsShowOffcanvas(homeworkID){
    homeworkAPIGetLogs(homeworkID).then(request => {
        switch (request.status){
            case 200:
                const logsInfo = homeworkItemShowOffcanvasGetLogsInfo(request.response, false)
                const homeworkLogsOffcanvas = mobileInfoOffcanvasSet("История ДЗ")
                mobileInfoOffcanvasAddData("", homeworkLogsOffcanvas, [logsInfo])
                break
            default:
                showErrorToast()
                break
        }
    })
}


let homeworkItemShowOffcanvasSelectedHWID = null