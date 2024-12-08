function homeworkItemMain(){
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
                console.log(request.response)
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
                hwItemStatus.innerHTML = homeworkItemShowLogsStrStatus(request.response.status)
                break
            default:
                showErrorToast()
                break
        }
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
const hwItemStatus = document.querySelector("#hwItemStatus")

homeworkItemMain()