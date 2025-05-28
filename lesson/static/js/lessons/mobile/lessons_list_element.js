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
        if (isAdmin && cookiesUtilsGet("lessonsMobFieldAdminComment") === "1"){
            let adminComment = lesson.admin_comment ? lesson.admin_comment : "Без комментария"
            if (adminComment.length > 15){
                adminComment = adminComment.substring(0, 12) + "..."
            }
            stringsArray.push(`
            <img src="/static/icons/comment_grey.svg" alt="Комментарий" style="height: 20px;" class="me-1" onclick="lessonsMobileAdminCommentModalSet(${lesson.id})">
            <span>${adminComment}</span>
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

    li.addEventListener("click", function () {
        lessonsAPIGetItem(lesson.id).then(request => {
            switch (request.status){
                case 200:
                    const lsnUtils = new lessonUtils(request.response)
                    lsnUtils.showOffcanvas()
                    break
                default:
                    const toast = new toastEngine()
                    toast.setError("Занятие не найдено")
                    toast.show()
                    break
            }
        })
    })

    li.insertAdjacentElement("beforeend", moreInfoButtonsDiv)
    moreInfoButtonsDiv.insertAdjacentElement("beforeend", moreInfoButtonsInfo)

    return li
}