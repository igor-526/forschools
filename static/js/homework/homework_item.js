function homeworkItemMain(){
    homeworkAPIGetItem(hwID).then(request => {
        switch (request.status){
            case 200:
                console.log(request.response)
                homeworkItemSetMainInfo(request.response)
                if (request.response.materials.length > 0){
                    homeworkItemSetMaterials(request.response.materials)
                }
                break
            default:
                showErrorToast("Не удалось загрузить основную информацию")
                break
        }
    })
    homeworkAPIGetLogs(hwID).then(request => {
        switch (request.status){
            case 200:
                homeworkItemShowLogs(request.response)
                break
            default:
                showErrorToast("Не удалось загрузить историю ДЗ")
                break
        }
    })
    homeworkAPIGetInfo(hwID).then(request => {
        switch (request.status){
            case 200:
                hwCanAcceptLogs = request.response.can_answer_logs
                if (request.response.can_add_materials_tg){
                    hwItemAddMaterialsTG.classList.remove("d-none")
                    hwItemAddMaterialsTG.addEventListener("click", function () {
                        homeworkAPIEditTelegram(hwID).then(request => {
                            switch (request.status){
                                case 200:
                                    showSuccessToast("Сообщение отправлено Вам в Telegram")
                                    break
                                default:
                                    showErrorToast()
                                    break
                            }
                        })
                    })
                }
                homeworkItemSetMainInfo({hw_status: homeworkItemShowLogsStrStatus(request.response.status)})
                break
            default:
                showErrorToast()
                break
        }
    })
}

function homeworkItemSetMainInfo(hw){
    function getReplaceButton(){
        const btn = document.createElement("button")
        btn.type = "button"
        btn.innerHTML = '<i class="bi bi-person-gear"></i>'
        btn.classList.add("btn", "btn-primary", "btn-sm", "ms-2")
        btn.addEventListener("click", function () {
            usersReplaceTeacherSetModal("hw", hwID)
        })
        return btn
    }

    if (hw.description && hw.description !== "-"){
        hwItemMainInfoList.insertAdjacentElement("beforeend", getListElement(
            "Описание", hw.description
        ))
    }
    if (hw.teacher){
        const elem = getListElement("Проверяющий", getUsersString([hw.teacher]))
        if (hwItemCanSetReplace){
            elem.insertAdjacentElement("beforeend", getReplaceButton())
        }
        hwItemMainInfoList.insertAdjacentElement("beforeend", elem)
    }
    if (hw.listener){
        hwItemMainInfoList.insertAdjacentElement("beforeend", getListElement(
            "Ученик", getUsersString([hw.listener])
        ))
    }
    if (hw.deadline){
        hwItemMainInfoList.insertAdjacentElement("beforeend", getListElement(
            "Выполнить до", new Date(hw.deadline).toLocaleDateString())
        )
    }
    if (hw.for_curator === true || hw.for_curator === false){
        hwItemMainInfoList.insertAdjacentElement("beforeend", getListElement(
            "С ДЗ работает куратор", hw.for_curator === true ? "Да" : "Нет")
        )
    }
    if (hw.hw_status){
        hwItemMainInfoList.insertAdjacentElement("beforeend", getListElement(
            "Статус", hw.hw_status)
        )
    }
    if (hw.lesson_info){
        homeworkItemSetLessonInfo(hw.lesson_info)
    }
}

function homeworkItemSetLessonInfo(lesson_info){
    hwItemPlanInfo.classList.remove("d-none")
    if (lesson_info.id && lesson_info.name){
        hwItemPlanInfoList.insertAdjacentElement("beforeend", getListElement(
            "Занятие",
            `<a target="_blank" href="/lessons/${lesson_info.id}"><button class="btn btn-sm btn-primary">${lesson_info.name}</button></a>`)
        )
    }
    if (lesson_info.plan){
        hwItemPlanInfoHeader.innerHTML = `<a target="_blank" href="/learning_plans/${lesson_info.plan.id}"><button class="btn btn-sm btn-primary">План обучения</button></a>`

        if (lesson_info.plan.teacher) {
            hwItemPlanInfoList.insertAdjacentElement("beforeend", getListElement(
                "Преподаватель", getUsersString([lesson_info.plan.teacher])
            ))
        }

        lesson_info.plan.listeners.forEach(listener => {
            hwItemPlanInfoList.insertAdjacentElement("beforeend", getListElement(
                "Ученик", getUsersString([listener])
            ))
        })

        if (lesson_info.plan.methodist) {
            hwItemPlanInfoList.insertAdjacentElement("beforeend", getListElement(
                "Методист", getUsersString([lesson_info.plan.methodist])
            ))
        }

        lesson_info.plan.curators.forEach(curator => {
            hwItemPlanInfoList.insertAdjacentElement("beforeend", getListElement(
                "Куратор", getUsersString([curator])
            ))
        })
    }
}

function homeworkItemSetMaterials(materials){
    function getShowButton(matID){
        const btn = document.createElement("button")
        btn.type = "button"
        btn.innerHTML = '<i class="bi bi bi-eye"></i>'
        btn.classList.add("btn", "btn-primary", "btn-sm", "mx-1")
        btn.addEventListener("click", function () {
            materialsUtilsPreview(matID)
        })
        return btn
    }

    function getDeleteButton(matID){
        const btn = document.createElement("button")
        btn.type = "button"
        btn.innerHTML = '<i class="bi bi-trash3"></i>'
        btn.classList.add("btn", "btn-danger", "btn-sm", "mx-1")
        btn.addEventListener("click", function () {
            hwItemMaterialDeleteSetModal(matID, btn)
        })
        return btn
    }

    function getMatElement(mat){
        const li = document.createElement("li")
        const a = document.createElement("a")
        li.insertAdjacentElement("beforeend", getShowButton(mat.id))
        if (hwItemCanEdit){
            li.insertAdjacentElement("beforeend", getDeleteButton(mat.id))
        }
        li.classList.add("list-group-item")
        a.href = `/materials/${mat.id}`
        a.target = "_blank"
        a.innerHTML = mat.name
        li.insertAdjacentElement("beforeend", a)
        return li
    }

    materials.forEach(mat => {
        hwItemMaterialsList.insertAdjacentElement("beforeend", getMatElement(mat))
    })
}

function homeworkItemShowLogsStrStatus(status){
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

function homeworkItemShowLogs(logs=[], clear=true){
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
        statusAndDTStatus.innerHTML = homeworkItemShowLogsStrStatus(log.status)
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
            homeworkItemLogShowModal(log.id)
        })
        return a
    }

    if (clear){
        hwItemLogList.innerHTML = ''
    }
    const elementPosition = clear ? "beforeend" : "afterbegin"
    logs.forEach(log => {
        hwItemLogList.insertAdjacentElement(elementPosition, getElement(log))
    })
}

let hwCanAcceptLogs
const hwItemLogList = document.querySelector("#hwItemLogList")
const hwItemAddMaterialsTG = document.querySelector("#hwItemAddMaterialsTG")
const hwItemMaterialsList = document.querySelector("#hwItemMaterialsList")
const hwItemMainInfoList = document.querySelector("#hwItemMainInfoList")
const hwItemPlanInfo = document.querySelector("#hwItemPlanInfo")
const hwItemPlanInfoList = document.querySelector("#hwItemPlanInfoList")
const hwItemPlanInfoHeader = document.querySelector("#hwItemPlanInfoHeader")

homeworkItemMain()