function lessonsMain(){
    const teacher = getHashValue("teacher")
    const listener = getHashValue("listener")
    lessonsTableFilterTeachersSelected = teacher ? [teacher] : []
    lessonsTableFilterListenersSelected = listener ? [listener] : []
    lessonsSetUpcoming()
    lessonsOpenHomeworksButtonListeners()
    lessonsTabUpcoming.addEventListener("click", lessonsSetUpcoming)
    lessonsTabPassed.addEventListener("click", lessonsSetPassed)
    lessonsTableShowMoreButton.addEventListener("click", function (){
        lessonsCurrentOffset += 50
        lessonsGet(true)
    })
}

function lessonsOpenHomeworksButtonListeners(){
    lessonsTableOpenHomeworksButton.addEventListener("click", function () {
        const collapses = lessonsTableBody.querySelectorAll(".collapse")
        switch (lessonsTableOpenHomeworksButton.attributes.getNamedItem("data-opened").value){
            case "false":
                lessonsTableOpenHomeworksButton.classList.remove("btn-outline-primary")
                lessonsTableOpenHomeworksButton.classList.add("btn-primary")
                lessonsTableOpenHomeworksButton.innerHTML = '<i class="bi bi-eye-slash"></i> ДЗ'
                lessonsTableOpenHomeworksButton.attributes.getNamedItem("data-opened").value = "true"
                lessonsShowHomeworkCollapse(collapses, "show")
                break
            case "true":
                lessonsTableOpenHomeworksButton.classList.add("btn-outline-primary")
                lessonsTableOpenHomeworksButton.classList.remove("btn-primary")
                lessonsTableOpenHomeworksButton.innerHTML = '<i class="bi bi-eye"></i> ДЗ'
                lessonsTableOpenHomeworksButton.attributes.getNamedItem("data-opened").value = "false"
                lessonsShowHomeworkCollapse(collapses, "hide")
                break
        }
    })
}

function lessonsSetUpcoming(){
    lessonsTabUpcoming.classList.add("active")
    lessonsTabPassed.classList.remove("active")
    lessonsCurrentStatus = 0
    lessonsGet()
}

function lessonsSetPassed(){
    lessonsTabUpcoming.classList.remove("active")
    lessonsTabPassed.classList.add("active")
    lessonsCurrentStatus = 1
    lessonsGet()
}

function lessonsGet(more=false){
    if (!more && lessonsCurrentOffset !== 0){
        lessonsCurrentOffset = 0
    }
    lessonsAPIGetAll(lessonsCurrentOffset, lessonsCurrentStatus, lessonsTableFilterTeachersSelected,
        lessonsTableFilterListenersSelected, lessonsTableFilterDateStart, lessonsTableFilterDateEnd,
        lessonsTableFilterHW).then(request => {
        switch (request.status){
            case 200:
                lessonsShow(request.response, !more)
                request.response.length === 50 ? lessonsTableShowMoreButton.classList.remove("d-none") :
                    lessonsTableShowMoreButton.classList.add("d-none")
                break
            default:
                showErrorToast()
                break
        }
    })
}

function lessonsShow(lessons, clear=true, replace_element=null){
    function getCollapseElement(lessonID){
        const tr = document.createElement("tr")
        const td = document.createElement("td")
        td.colSpan = 6
        td.classList.add("p-0")
        const mainElement = document.createElement("div")
        mainElement.setAttribute("data-collapse-lesson-id", lessonID)
        mainElement.setAttribute("data-collapse-downloaded", "false")
        mainElement.classList.add("collapse")
        mainElement.style = "width: 100%;"
        const collapseBody = document.createElement("div")
        collapseBody.classList.add("card", "card-body", "mb-3")
        mainElement.insertAdjacentElement("beforeend", collapseBody)
        const spinnerBorder = document.createElement("div")
        const spinner = document.createElement("span")
        spinnerBorder.classList.add("spinner-border", "text-primary")
        spinnerBorder.role = "status"
        spinner.classList.add("visually-hidden")
        spinner.innerHTML = "Загрузка"
        spinnerBorder.insertAdjacentElement("beforeend", spinner)
        collapseBody.insertAdjacentElement("beforeend", spinnerBorder)
        tr.insertAdjacentElement("beforeend", td)
        td.insertAdjacentElement("beforeend", mainElement)
        return {
            tr: tr,
            collapse: mainElement
        }
    }

    function getLessonElement(lesson, collapse){
        const tr = document.createElement("tr")
        switch (lesson.status){
            case 0:
                if (lesson.awaiting_action){
                    tr.classList.add("table-warning")
                }
                break
            case 1:
                tr.classList.add("table-success")
                break
            case 2:
                tr.classList.add("table-danger")
                break
        }

        const tdName = document.createElement("td")
        tdName.innerHTML = `<a href="/lessons/${lesson.id}">${lesson.name}</a>`
        tr.insertAdjacentElement("beforeend", tdName)

        const tdDate = document.createElement("td")
        tdDate.innerHTML = getLessonDateTimeRangeString(lesson)
        tr.insertAdjacentElement("beforeend", tdDate)

        const tdTeacher = document.createElement("td")
        tdTeacher.innerHTML = getUsersString([lesson.teacher])
        tr.insertAdjacentElement("beforeend", tdTeacher)

        const tdListeners = document.createElement("td")
        tdListeners.innerHTML = getUsersString(lesson.listeners)
        tr.insertAdjacentElement("beforeend", tdListeners)

        const tdHomeworks = document.createElement("td")
        const tdHomeworksButton = document.createElement("button")
        tdHomeworksButton.classList.add("btn", `btn-${lesson.hw_data.color}`)
        tdHomeworksButton.innerHTML = lesson.hw_data.count
        tdHomeworksButton.addEventListener("click", function (){
            lessonsShowHomeworkCollapse([collapse])
        })
        tdHomeworks.insertAdjacentElement("beforeend", tdHomeworksButton)
        tr.insertAdjacentElement("beforeend", tdHomeworks)

        if (isAdmin){
            const tdActions = document.createElement("td")
            const tdActionsComment = document.createElement("button")
            tdActionsComment.classList.add("btn", lesson.admin_comment ? "btn-outline-primary" : "btn-primary")
            let actionsCommentInnerText
            if (lesson.admin_comment){
                actionsCommentInnerText = lesson.admin_comment.length > 20 ? lesson.admin_comment.substring(0, 18) + "..." : lesson.admin_comment
                tdActionsComment.setAttribute("data-bs-toggle", "tooltip")
                tdActionsComment.setAttribute("data-bs-placement", "bottom")
                tdActionsComment.setAttribute("title", lesson.admin_comment)
                new bootstrap.Tooltip(tdActionsComment)
            } else {
                actionsCommentInnerText = '<i class="bi bi-chat-left-text-fill"></i>'
            }
            tdActionsComment.innerHTML = actionsCommentInnerText
            tdActionsComment.addEventListener("click", function (){
                lessonsAdminCommentSetModal(lesson.id, tr, lesson.admin_comment)
            })
            tdActions.insertAdjacentElement("beforeend", tdActionsComment)
            tr.insertAdjacentElement("beforeend", tdActions)
        }
        return tr
    }

    if (clear){
        lessonsTableBody.innerHTML = ""
    }
    if (replace_element){
        const collapse = lessonsTableBody.querySelector(`[data-lesson-id="${lessons.id}"]`)
        replace_element.replaceWith(getLessonElement(lessons, collapse))
    } else {
        lessons.forEach(lesson => {
        const collapse = getCollapseElement(lesson.id)
        lessonsTableBody.insertAdjacentElement("beforeend", getLessonElement(lesson, collapse.collapse))
        lessonsTableBody.insertAdjacentElement("beforeend", collapse.tr)
    })
    }
}

function lessonsShowHomeworkCollapse(collapses, action="toggle"){
    function getTableElement(hw){
        const tr = document.createElement("tr")
        if (hw.color){
            tr.classList.add(`table-${hw.color}`)
        }
        const tdName = document.createElement("td")
        const tdTeacher = document.createElement("td")
        const tdListener = document.createElement("td")
        const tdAssigned = document.createElement("td")
        const tdLastChanged = document.createElement("td")
        tr.insertAdjacentElement("beforeend", tdName)
        tr.insertAdjacentElement("beforeend", tdTeacher)
        tr.insertAdjacentElement("beforeend", tdListener)
        tr.insertAdjacentElement("beforeend", tdAssigned)
        tr.insertAdjacentElement("beforeend", tdLastChanged)
        tdName.innerHTML += `<a href="/homeworks/${hw.id}">${hw.name}</a>`
        tdTeacher.innerHTML = getUsersString([hw.teacher])
        tdListener.innerHTML = getUsersString([hw.listener])
        if (hw.assigned){
            tdAssigned.innerHTML = new Date(hw.assigned).toLocaleDateString()
        }
        tdLastChanged.innerHTML = `${homeworkItemShowLogsStrStatus(hw.status.status)} (${new Date(hw.status.dt).toLocaleDateString()})`
        return tr
    }

    function getTable(){
        const table = document.createElement("table")
        table.classList.add("table", "table-hover")
        const tHead = document.createElement("thead")
        const tr = document.createElement("tr")
        const tBody = document.createElement("tbody")
        table.insertAdjacentElement("beforeend", tHead)
        tHead.insertAdjacentElement("beforeend", tr)
        table.insertAdjacentElement("beforeend", tBody)
        const thName = document.createElement("th")
        thName.scope = "col"
        thName.innerHTML = "Наименование"
        const thTeacher = document.createElement("th")
        thTeacher.scope = "col"
        thTeacher.innerHTML = "Преподаватель"
        const thListener = document.createElement("th")
        thListener.scope = "col"
        thListener.innerHTML = "Ученик"
        const thAssigned = document.createElement("th")
        thAssigned.scope = "col"
        thAssigned.innerHTML = "Задано"
        const thLastChange = document.createElement("th")
        thLastChange.scope = "col"
        thLastChange.innerHTML = "Последнее изменение"
        tr.insertAdjacentElement("beforeend", thName)
        tr.insertAdjacentElement("beforeend", thTeacher)
        tr.insertAdjacentElement("beforeend", thListener)
        tr.insertAdjacentElement("beforeend", thAssigned)
        tr.insertAdjacentElement("beforeend", thLastChange)
        return {
            table: table,
            tbody: tBody
        }
    }

    function setHomeworks(body, homeworks){
        body.innerHTML = ""
        const table = getTable()
        body.insertAdjacentElement("beforeend", table.table)
        homeworks.forEach(hw => {
            table.tbody.insertAdjacentElement("beforeend", getTableElement(hw))
        })
    }

    function setAlert(body, text, color="primary"){
        body.innerHTML = `<div class="alert alert-${color}" role="alert">${text}</div>`
    }

    function setData(collapse){
        const lessonID = collapse.attributes.getNamedItem("data-collapse-lesson-id").value
        homeworkAPIGet(0, lessonID).then(request => {
            body.innerHTML = ""
            switch (request.status){
                case 200:
                    if (request.response.length > 0){
                        setHomeworks(body, request.response)
                    } else {
                        setAlert(body, "Нет домашних заданий", "primary")
                    }
                    break
                default:
                    setAlert(body, "Не удалось загрузить домашние задания к занятию", "danger")
                    break
            }
            collapse.attributes.getNamedItem("data-collapse-downloaded").value = "true"
        })

        const body = collapse.querySelector(".card-body")

        body.insertAdjacentElement("beforeend", getTable().table)
    }

    collapses.forEach(collapse => {
        const bsCollapse = new bootstrap.Collapse(collapse, {
            toggle: action === "toggle"
        })
        switch (action){
            case "toggle":
                bsCollapse.show()
                break
            case "show":
                bsCollapse.show()
                break
            case "hide":
                bsCollapse.hide()
                break
        }
        const downloaded = collapse.attributes.getNamedItem("data-collapse-downloaded").value
        if (downloaded === "false"){
            setData(collapse)
        }
    })
}

//Tabs
const lessonsTabUpcoming = document.querySelector("#LessonsTabUpcoming")
const lessonsTabPassed = document.querySelector("#LessonsTabPassed")

//Table
const lessonsTableBody = document.querySelector("#LessonsTableBody")
const lessonsTableShowMoreButton = document.querySelector("#lessonsTableShowMoreButton")
const lessonsTableOpenHomeworksButton = document.querySelector("#lessonsTableOpenHomeworksButton")

//Filters
let lessonsTableFilterTeachersSelected
let lessonsTableFilterListenersSelected
let lessonsTableFilterDateStart = null
let lessonsTableFilterDateEnd = null
let lessonsTableFilterHW = null
let lessonsCurrentStatus = 0
let lessonsCurrentOffset = 0


lessonsMain()