function maHomeworkItemMain(){
    maHomeworkItemSetMainInfo()
    maHomeworkItemSetLogs()
    maHomeworkItemSetLastAnswer()
}

function maHomeworkItemSetMainInfo(){
    function getListItem(name, value){
        const li = document.createElement("li")
        li.classList.add("list-group-item")
        li.innerHTML = `<b>${name}: </b>${value}`
        return li
    }

    function getLessonButton(lesson_info){
        const li = document.createElement("li")
        li.classList.add("list-group-item")
        li.innerHTML = '<b>Занятие: </b>'
        const a = document.createElement("a")
        const btn = document.createElement("button")
        a.insertAdjacentElement("beforeend", btn)
        a.href = `/ma/lessons/${lesson_info.id}/`
        btn.innerHTML = lesson_info.name
        btn.classList.add("btn", "btn-outline-primary", "btn-sm")
        li.insertAdjacentElement("beforeend", a)
        return li
    }

    homeworkAPIGetItem(hwID).then(request => {
        switch (request.status){
            case 200:
                if (hwInfo){
                    maHWItemMain.classList.remove("d-none")
                    if (request.response.lesson_info){
                        maHWItemMainList.insertAdjacentElement("beforeend",
                            getLessonButton(request.response.lesson_info))
                    }
                    if (request.response.description){
                        maHWItemMainList.insertAdjacentElement("beforeend", getListItem(
                            "Описание",
                            request.response.description
                        ))
                    }
                    if (request.response.deadline){
                        maHWItemMainList.insertAdjacentElement("beforeend", getListItem(
                            "Выполнить до",
                            new Date(request.response.deadline).toLocaleDateString()
                        ))
                    }
                    if (request.response.teacher){
                        maHWItemMainList.insertAdjacentElement("beforeend", getListItem(
                            "Преподаватель",
                            `${request.response.teacher.first_name} ${request.response.teacher.last_name}`
                        ))
                    }
                    if (request.response.listener){
                        maHWItemMainList.insertAdjacentElement("beforeend", getListItem(
                            "Ученик",
                            `${request.response.listener.first_name} ${request.response.listener.last_name}`
                        ))
                    }
                    maHWItemMainList.insertAdjacentElement("beforeend", getListItem(
                        "C ДЗ работает куратор",
                        request.response.for_curator ? "да" : "нет"
                    ))
                }
                maHomeworkItemSetMaterials(request.response.materials)
                break
            default:
                break
        }
    })
}

function maHomeworkItemSetMaterials(materials = []){
    if (materials.length > 0){
        maHWItemMaterials.classList.remove("d-none")
    }
    materials.forEach(mat => {
        maHWItemMaterialsBody.insertAdjacentElement("beforeend", materialToHTMLMobile(
            mat.file,
            mat.type
        ))
    })
}

function maHomeworkItemShowLogsStrStatus(status){
    switch (status){
        case 1:
            return  "Создано"
        case 2:
            return  "Открыто"
        case 3:
            return  "На проверке"
        case 4:
            return  "Принято"
        case 5:
            return  "На доработке"
        case 6:
            return  "Отменено"
        case 7:
            return  "Задано"
        default:
            return ""
    }
}

function maHomeworkItemSetLogs(){
    function getElement(log){
        const a = document.createElement("a")
        a.href = "#"
        a.classList.add("list-group-item", "list-group-item-action")
        if (log.agreement.hasOwnProperty("accepted")){
            a.classList.add(log.agreement.accepted?"list-group-item-success":"list-group-item-warning")
        }
        const statusAndDTBlock = document.createElement("div")
        statusAndDTBlock.classList.add("d-flex", "w-100", "justify-content-between")
        const statusAndDTStatus = document.createElement("h5")
        statusAndDTStatus.classList.add("mb-1")
        statusAndDTStatus.innerHTML = maHomeworkItemShowLogsStrStatus(log.status)
        const statusAndDTDateTime = document.createElement("small")
        statusAndDTDateTime.classList.add("text-muted")
        statusAndDTDateTime.innerHTML = new Date(log.dt).toLocaleString()
        const comment = document.createElement("p")
        comment.classList.add("mb-1")
        comment.innerHTML = log.comment
        const logUser = document.createElement("small")
        logUser.classList.add("text-muted")
        logUser.innerHTML = `${log.user.first_name} ${log.user.last_name}`
        a.insertAdjacentElement("beforeend", statusAndDTBlock)
        a.insertAdjacentElement("beforeend", comment)
        a.insertAdjacentElement("beforeend", logUser)
        statusAndDTBlock.insertAdjacentElement("beforeend", statusAndDTStatus)
        statusAndDTBlock.insertAdjacentElement("beforeend", statusAndDTDateTime)
        a.addEventListener("click", function () {
            maHomeworkItemLogSetModal(log.id)
        })
        return a
    }

    homeworkAPIGetLogs(hwID, false).then(request => {
        switch (request.status){
            case 200:
                request.response.forEach(log => {
                    maHWItemLogsList.insertAdjacentElement("beforeend", getElement(log))
                })
                break
            default:
                break
        }
    })
}

function maHomeworkItemSetLastAnswer(){
    function getCard(log) {
        const card = document.createElement("div")
        const cardBody = document.createElement("div")
        card.classList.add("card", "mb-3", "mx-1")
        cardBody.classList.add("card-body")
        card.insertAdjacentElement("beforeend", cardBody)
        if (log.comment){
            const comment = document.createElement("p")
            comment.innerHTML = log.comment
            cardBody.insertAdjacentElement("beforeend", comment)
        }
        log.files.forEach(file => {
            cardBody.insertAdjacentElement("beforeend", materialToHTMLMobile(file.path, file.type))
        })
        return card
    }

    homeworkAPIGetLogs(hwID, true).then(request => {
        switch (request.status){
            case 200:
                if (request.response.length > 0){
                    maHWItemLastAnswer.classList.remove("d-none")
                }
                request.response.forEach(log => {
                    maHWItemLastAnswerBody.insertAdjacentElement("beforeend", getCard(log))
                })
                break
            default:
                break
        }
    })
}

const maHWItemMain = document.querySelector("#maHomeworkItemMain")
const maHWItemMainList = document.querySelector("#maHomeworkItemMainList")
const maHWItemLastAnswer = document.querySelector("#maHomeworkItemLastAnswer")
const maHWItemLastAnswerBody = document.querySelector("#maHomeworkItemLastAnswerBody")
const maHWItemMaterialsBody = document.querySelector("#maHomeworkItemMaterialsBody")
const maHWItemLogsList = document.querySelector("#maHomeworkItemLogsList")
const maHWItemMaterials = document.querySelector("#maHomeworkItemMaterials")


maHomeworkItemMain()