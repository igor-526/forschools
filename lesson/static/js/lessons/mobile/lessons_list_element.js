function lessonListGetElement(lesson){
    function getMoreInfoText(){
        const stringsArray = []

        if (cookiesUtilsGet("lessonsMobFieldTeacher") === "1"){
            stringsArray.push(`
            <img src="/static/icons/teacher_grey.svg" alt="Преподаватель" style="height: 20px;" class="me-1">
            ${lesson.teacher.first_name} ${lesson.teacher.last_name}
            `)
        }
        if (cookiesUtilsGet("lessonsMobFieldListeners") === "1"){
            lesson.listeners.forEach(listener => {
                stringsArray.push(`
                <img src="/static/icons/student_grey.svg" alt="Ученик" style="height: 20px;" class="me-1">
                ${listener.first_name} ${listener.last_name}
                `)
            })
        }
        if (lessonsMobileParamsIsAdmin && cookiesUtilsGet("lessonsMobFieldAdminComment") === "1"){
            let adminComment = lesson.admin_comment ? lesson.admin_comment : "Без комментария"
            if (adminComment.length > 15){
                adminComment = adminComment.substring(0, 12) + "..."
            }
            stringsArray.push(`
            <img src="/static/icons/comment_grey.svg" alt="Комментарий" style="height: 20px;" class="me-1" onclick="lessonsMobileAdminCommentModalSet(${lesson.id})">
            <span class="fw-bold" style="color: #0d6dfb;" onclick="lessonsMobileAdminCommentModalSet(${lesson.id})">${adminComment}</span>
            `)
        }

        return stringsArray.join("<br>")
    }

    const li = document.createElement("li")
    li.classList.add("list-group-item")
    if (lesson.awaiting_action){
        li.classList.add("list-group-item-warning")
    }
    switch (lesson.status){
        case 1:
            li.classList.add("list-group-item-success")
            break
        case 2:
            li.classList.add("list-group-item-danger")
            break
    }

    const mainInfoDiv = document.createElement("div")
    mainInfoDiv.classList.add("d-flex", "justify-content-between", "mb-2")
    const mainInfoName = document.createElement("span")
    mainInfoName.classList.add("ms-2", "me-auto", "fw-bold")
    mainInfoName.innerHTML = lesson.name
    const mainInfoDateTime = document.createElement("div")
    mainInfoDateTime.style.color = "grey"
    mainInfoDateTime.innerHTML = getLessonDateTimeRangeString(lesson,
            cookiesUtilsGet("lessonsMobFieldDate") === "1",
            cookiesUtilsGet("lessonsMobFieldTime") === "1")
    li.insertAdjacentElement("beforeend", mainInfoDiv)
    mainInfoDiv.insertAdjacentElement("beforeend", mainInfoName)
    mainInfoDiv.insertAdjacentElement("beforeend", mainInfoDateTime)

    const moreInfoButtonsDiv = document.createElement("div")
    moreInfoButtonsDiv.classList.add("d-flex", "justify-content-between")
    const moreInfoButtonsInfo = document.createElement("div")
    moreInfoButtonsInfo.classList.add("ms-2")
    moreInfoButtonsInfo.style.color = "grey"
    moreInfoButtonsInfo.innerHTML = getMoreInfoText()
    const moreInfoButtonsButtons = document.createElement("div")
    moreInfoButtonsButtons.classList.add("d-flex", "align-items-end")

    if (cookiesUtilsGet("lessonsMobFieldHWButton") === "1"){
        const moreInfoButtonsHomeworksButton = document.createElement("button")
        moreInfoButtonsHomeworksButton.classList.add("btn", "btn-outline-primary", "mx-1")
        moreInfoButtonsHomeworksButton.type = "button"
        moreInfoButtonsHomeworksButton.style.height = "50px"
        moreInfoButtonsHomeworksButton.style.width = "50px"
        moreInfoButtonsHomeworksButton.innerHTML = '<img style="height: 90%; width: 90%" src="/static/icons/homework_mini_primary.svg" alt="ДЗ">'
        if (lesson.hw_data.count > 0){
            moreInfoButtonsHomeworksButton.addEventListener("click", function () {
                location.assign(`/homeworks/#lesson_id=${lesson.id}`)
            })
        } else {
            moreInfoButtonsHomeworksButton.disabled = true
        }
        moreInfoButtonsButtons.insertAdjacentElement("beforeend", moreInfoButtonsHomeworksButton)
        if (cookiesUtilsGet("lessonsMobFieldHWCount") === "1"){
            moreInfoButtonsHomeworksButton.classList.add("position-relative")
            moreInfoButtonsHomeworksButton.innerHTML += `
            <span class="position-absolute top-0 start-0 translate-middle badge rounded-pill bg-${lesson.hw_data.color}">
            ${lesson.hw_data.count}<span class="visually-hidden"></span></span>
            `
        }
    }



    const moreInfoButtonsMenuButton = document.createElement("button")
    moreInfoButtonsMenuButton.classList.add("btn", "btn-outline-primary", "mx-1")
    moreInfoButtonsMenuButton.type = "button"
    moreInfoButtonsMenuButton.style.height = "50px"
    moreInfoButtonsMenuButton.style.width = "50px"
    moreInfoButtonsMenuButton.innerHTML = '<i class="bi bi-list"></i>'
    moreInfoButtonsMenuButton.addEventListener("click", function () {
        lessonShowOffcanvas(lesson.id)
    })

    li.insertAdjacentElement("beforeend", moreInfoButtonsDiv)
    moreInfoButtonsDiv.insertAdjacentElement("beforeend", moreInfoButtonsInfo)
    moreInfoButtonsDiv.insertAdjacentElement("beforeend", moreInfoButtonsButtons)
    moreInfoButtonsButtons.insertAdjacentElement("beforeend", moreInfoButtonsMenuButton)

    return li
}