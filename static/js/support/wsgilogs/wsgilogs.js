function supportWSGIErrorsMain(){
    supportWSGIErrorsGet()
    supportWSGIErrorsLogModalSetHandlingStatusButton.addEventListener("click", supportWSGIErrorInfoModalNewStatus)
}

function supportWSGIErrorsGet(){
    supportWSGILogsAPIGet(supportWSGIErrorsFilteringHandlingStatus,
        supportWSGIErrorsFilteringDTStart,
        supportWSGIErrorsFilteringDTEnd,
        supportWSGIErrorsFilteringUsers,
        supportWSGIErrorsFilteringMethods,
        supportWSGIErrorsFilteringURL,
        supportWSGIErrorsFilteringStatusCode,
    ).then(request => {
        switch (request.status) {
            case 200:
                supportWSGIErrorsShow(request.response)
                break
            default:
                showErrorToast()
                break
        }
    })
}

function supportWSGIErrorsShow(logs = []){
    function getElement(log){
        const tr = document.createElement("tr")
        const tdDateTime = document.createElement("td")
        const tdUser = document.createElement("td")
        const tdMethod = document.createElement("td")
        const tdStatusCode = document.createElement("td")
        const tdURL = document.createElement("td")
        const tdActions = document.createElement("td")
        const tdActionsButton = document.createElement("button")
        switch (log.handling_status) {
            case 1:
                tr.classList.add("table-warning")
                break
            case 2:
                tr.classList.add("table-success")
                break
        }
        tdDateTime.innerHTML = timeUtilsDateTimeToStr(log.dt)
        tdUser.innerHTML = log.user?getUsersString([log.user]):"Неавторизованный"
        tdMethod.innerHTML = log.method
        tdStatusCode.innerHTML = log.status_code
        tdURL.innerHTML = log.path_info
        tdActionsButton.classList.add("btn", "btn-primary")
        tdActionsButton.type = "button"
        tdActionsButton.innerHTML = '<i class="bi bi-info-square"></i>'
        tdActionsButton.addEventListener("click", function (){
            supportWSGIErrorInfoModalSet(log.id)
        })
        tr.insertAdjacentElement("beforeend", tdDateTime)
        tr.insertAdjacentElement("beforeend", tdUser)
        tr.insertAdjacentElement("beforeend", tdMethod)
        tr.insertAdjacentElement("beforeend", tdStatusCode)
        tr.insertAdjacentElement("beforeend", tdURL)
        tr.insertAdjacentElement("beforeend", tdActions)
        tdActions.insertAdjacentElement("beforeend", tdActionsButton)
        return tr
    }

    supportWSGIErrorsTableBody.innerHTML = ""
    logs.forEach(log => {
        supportWSGIErrorsTableBody.insertAdjacentElement("beforeend", getElement(log))
    })
}

function supportWSGIErrorInfoModalSet(logID){
    supportWSGILogsAPIGetItem(logID).then(request => {
        switch (request.status) {
            case 200:
                supportWSGIErrorsLogModalSelectedID = logID
                supportWSGIErrorsLogModalID.innerHTML = `<b>ID:</b> ${request.response.id}`
                supportWSGIErrorsLogModalDateTime.innerHTML = `<b>Дата и время: </b>${timeUtilsDateTimeToStr(request.response.dt)}`
                supportWSGIErrorsLogModalUser.innerHTML = `<b>Пользователь: </b>${request.response.user?getUsersString([request.response.user]):"Неавторизованный"}`
                supportWSGIErrorsLogModalException.innerHTML = `<b>Ошибка: </b>${request.response.exception}`
                supportWSGIErrorsLogModalURL.innerHTML = `<b>URL: </b>${request.response.path_info}`
                supportWSGIErrorsLogModalMethod.innerHTML = `<b>Метод: </b>${request.response.method}`
                supportWSGIErrorsLogModalStatusCode.innerHTML = `<b>Код возврата: </b>${request.response.status_code}`
                supportWSGIErrorsLogModalParametersTraceback.innerHTML = request.response.traceback_log.join("<br>")
                switch (request.response.handling_status){
                    case 0:
                        supportWSGIErrorsLogModalSetHandlingStatusButton.innerHTML = "Взять в работу"
                        supportWSGIErrorsLogModalSetHandlingStatusButton.classList.remove("d-none")
                        supportWSGIErrorsLogModalSetNewStatus = 1
                        break
                    case 1:
                        supportWSGIErrorsLogModalSetHandlingStatusButton.innerHTML = "Завершить"
                        supportWSGIErrorsLogModalSetHandlingStatusButton.classList.remove("d-none")
                        supportWSGIErrorsLogModalSetNewStatus = 2
                        break
                    case 2:
                        supportWSGIErrorsLogModalSetHandlingStatusButton.classList.add("d-none")
                        break
                }
                supportWSGIErrorsLogModalParametersList.innerHTML = ""
                for (let key in request.response.params) {
                    supportWSGIErrorsLogModalParametersList.innerHTML += `${key} : ${request.response.params[key]}<br>`
                }
                bsSupportWSGIErrorsLogModal.show()
                break
            default:
                showErrorToast()
                break
        }
    })
}

function supportWSGIErrorInfoModalNewStatus(){
    supportWSGILogsAPIUpdate(supportWSGIErrorsLogModalSelectedID,
        supportWSGIErrorsLogModalSetNewStatus).then(request => {
        bsSupportWSGIErrorsLogModal.hide()
        switch (request.status){
            case 200:
                showSuccessToast("Статус ошибки успешно изменён")
                supportWSGIErrorsGet()
                break
            default:
                showErrorToast()
                break
        }
    })
}



const supportWSGIErrorsNew = document.querySelector("#supportWSGIErrorsNew")
const supportWSGIErrorsProcessing = document.querySelector("#supportWSGIErrorsProcessing")
const supportWSGIErrorsFixed = document.querySelector("#supportWSGIErrorsFixed")
const supportWSGIErrorsTableFilterResetAll = document.querySelector("#supportWSGIErrorsTableFilterResetAll")
const supportWSGIErrorsTableBody = document.querySelector("#supportWSGIErrorsTableBody")

//Filtering
let supportWSGIErrorsFilteringHandlingStatus = null
let supportWSGIErrorsFilteringDTStart = null
let supportWSGIErrorsFilteringDTEnd = null
const supportWSGIErrorsFilteringUsers = []
const supportWSGIErrorsFilteringMethods = []
let supportWSGIErrorsFilteringStatusCode = null
let supportWSGIErrorsFilteringURL = null

//Modal
let supportWSGIErrorsLogModalSelectedID = null
let supportWSGIErrorsLogModalSetNewStatus = null
const supportWSGIErrorsLogModal = document.querySelector("#supportWSGIErrorsLogModal")
const bsSupportWSGIErrorsLogModal = new bootstrap.Modal(supportWSGIErrorsLogModal)
const supportWSGIErrorsLogModalID = supportWSGIErrorsLogModal.querySelector("#supportWSGIErrorsLogModalID")
const supportWSGIErrorsLogModalDateTime = supportWSGIErrorsLogModal.querySelector("#supportWSGIErrorsLogModalDateTime")
const supportWSGIErrorsLogModalUser = supportWSGIErrorsLogModal.querySelector("#supportWSGIErrorsLogModalUser")
const supportWSGIErrorsLogModalException = supportWSGIErrorsLogModal.querySelector("#supportWSGIErrorsLogModalException")
const supportWSGIErrorsLogModalURL = supportWSGIErrorsLogModal.querySelector("#supportWSGIErrorsLogModalURL")
const supportWSGIErrorsLogModalMethod = supportWSGIErrorsLogModal.querySelector("#supportWSGIErrorsLogModalMethod")
const supportWSGIErrorsLogModalStatusCode = supportWSGIErrorsLogModal.querySelector("#supportWSGIErrorsLogModalStatusCode")
const supportWSGIErrorsLogModalParametersList = supportWSGIErrorsLogModal.querySelector("#supportWSGIErrorsLogModalParametersList")
const supportWSGIErrorsLogModalParametersTraceback = supportWSGIErrorsLogModal.querySelector("#supportWSGIErrorsLogModalParametersTraceback")
const supportWSGIErrorsLogModalSetHandlingStatusButton = supportWSGIErrorsLogModal.querySelector("#supportWSGIErrorsLogModalSetHandlingStatusButton")

supportWSGIErrorsMain()