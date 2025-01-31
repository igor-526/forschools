function telegramLogsMain(){
    telegramLogsGet()
    supportTelegramErrorsFilteringSetFields()
    supportTelegramErrorsTabsListeners()
    supportTelegramErrorsFilteringSetListeners()
    supportTelegramErrorsFilteringSetEraseListeners()
    supportTelegramErrorsTableSelect.addEventListener("click", supportTelegramErrorsSelectAllListener)
    if (supportTelegramErrorsCanChange){
        supportTelegramErrorsSelectedSetStatusProcessing.addEventListener("click", function () {
            supportTelegramErrorsSetStatus(1)
        })
        supportTelegramErrorsSelectedSetStatusReady.addEventListener("click", function () {
            supportTelegramErrorsSetStatus(2)
        })
    } else {
        supportTelegramErrorsSelectedSetStatusProcessing.classList.add("d-none")
        supportTelegramErrorsSelectedSetStatusReady.classList.add("d-none")
    }

}

function telegramLogsGet(){
    supportTelegramLogsAPIGet(supportTelegramCurrentOffset, supportTelegramFilteringHS,
        supportTelegramFilteringDateStart, supportTelegramFilteringDateEnd,
        supportTelegramFilteringAT, supportTelegramFilteringUsers).then(request => {
        switch (request.status){
            case 200:
                telegramLogsShow(request.response)
                break
            default:
                showErrorToast("Не удалось загрузить список ошибок")
        }
    })
}

function telegramLogsShow(logs, clear=true){
    function getSelectListener(logID, checked){
        const index = supportTelegramErrorsSelected.indexOf(logID)
        if (checked){
            if (index === -1){
                supportTelegramErrorsSelected.push(logID)
            }
        } else {
            if (index !== -1){
                supportTelegramErrorsSelected.splice(index, 1)
            }
        }
        const selectedLength = supportTelegramErrorsSelected.length
        switch (selectedLength){
            case 0:
                supportTelegramErrorsSelectedSetStatusProcessing.disabled = true
                supportTelegramErrorsSelectedSetStatusReady.disabled = true
                supportTelegramErrorsTableSelect.checked = false
                break
            default:
                supportTelegramErrorsSelectedSetStatusProcessing.disabled = false
                supportTelegramErrorsSelectedSetStatusReady.disabled = false
                supportTelegramErrorsTableSelect.checked = true
                break
        }
        supportTelegramErrorsTableSelectLabel.innerHTML = `(${selectedLength})`
    }

    function getElement(log){
        const tr = document.createElement("tr")
        switch (log.handling_status) {
            case 1:
                tr.classList.add("table-warning")
                break
            case 2:
                tr.classList.add("table-success")
                break
        }
        if (supportTelegramErrorsCanChange){
            const tdCheckbox = document.createElement("td")
            const tdSelectCheckbox = document.createElement("input")
            tdSelectCheckbox.classList.add("form-check-input")
            tdSelectCheckbox.type = "checkbox"
            tdSelectCheckbox.setAttribute("data-log-id", log.id)
            tdSelectCheckbox.addEventListener("click", function () {
                getSelectListener(log.id, tdSelectCheckbox.checked)
            })
            tdCheckbox.insertAdjacentElement("beforeend", tdSelectCheckbox)
            tr.insertAdjacentElement("beforeend", tdCheckbox)
        }
        const tdDateTime = document.createElement("td")
        tdDateTime.innerHTML = timeUtilsDateTimeToStr(new Date(log.dt))
        const tdActionType = document.createElement("td")
        switch (log.action_type){
            case 0:
                tdActionType.innerHTML = "Сообщение"
                break
            case 1:
                tdActionType.innerHTML = "Callback"
                break
            case 2:
                tdActionType.innerHTML = "Доб. материала"
                break
            default:
                tdActionType.innerHTML = "Не определено"
                break
        }
        const tdUser = document.createElement("td")
        if (log.user){
            tdUser.innerHTML = getUsersString([log.user])
        } else {
            tdUser.innerHTML = "Не авторизован"
        }
        const tdError = document.createElement("td")
        tdError.innerHTML = log.error
        const tdAction = document.createElement("td")
        const tdActionsButton = document.createElement("button")
        tdActionsButton.classList.add("btn", "btn-primary")
        tdActionsButton.type = "button"
        tdActionsButton.innerHTML = '<i class="bi bi-info-square"></i>'
        tdActionsButton.addEventListener("click", function (){
            supportTelegramErrorInfoModalSet(log.id)
        })
        tdAction.insertAdjacentElement("beforeend", tdActionsButton)
        tr.insertAdjacentElement("beforeend", tdDateTime)
        tr.insertAdjacentElement("beforeend", tdActionType)
        tr.insertAdjacentElement("beforeend", tdUser)
        tr.insertAdjacentElement("beforeend", tdError)
        tr.insertAdjacentElement("beforeend", tdAction)
        return tr
    }

    if (clear){
        supportTelegramErrorsTableBody.innerHTML = ""
    }
    logs.forEach(log => {
        supportTelegramErrorsTableBody.insertAdjacentElement("beforeend", getElement(log))
    })
}

function supportTelegramErrorsTabsListeners(){
    supportTelegramErrorsAll.addEventListener("click", function () {
        supportTelegramErrorsAll.classList.add("active")
        supportTelegramErrorsNew.classList.remove("active")
        supportTelegramErrorsProcessing.classList.remove("active")
        supportTelegramErrorsFixed.classList.remove("active")
        supportTelegramFilteringHS = null
        telegramLogsGet()
    })
    supportTelegramErrorsNew.addEventListener("click", function () {
        supportTelegramErrorsNew.classList.add("active")
        supportTelegramErrorsAll.classList.remove("active")
        supportTelegramErrorsProcessing.classList.remove("active")
        supportTelegramErrorsFixed.classList.remove("active")
        supportTelegramFilteringHS = "0"
        telegramLogsGet()
    })
    supportTelegramErrorsProcessing.addEventListener("click", function () {
        supportTelegramErrorsProcessing.classList.add("active")
        supportTelegramErrorsAll.classList.remove("active")
        supportTelegramErrorsNew.classList.remove("active")
        supportTelegramErrorsFixed.classList.remove("active")
        supportTelegramFilteringHS = "1"
        telegramLogsGet()
    })
    supportTelegramErrorsFixed.addEventListener("click", function () {
        supportTelegramErrorsFixed.classList.add("active")
        supportTelegramErrorsAll.classList.remove("active")
        supportTelegramErrorsNew.classList.remove("active")
        supportTelegramErrorsProcessing.classList.remove("active")
        supportTelegramFilteringHS = "2"
        telegramLogsGet()
    })
}

function supportTelegramErrorsSelectAllListener(){
    const elements = supportTelegramErrorsTableBody.querySelectorAll("input")
    elements.forEach(element => {
        element.checked = this.checked
        const logID = Number(element.attributes.getNamedItem("data-log-id").value)
        const index = supportTelegramErrorsSelected.indexOf(logID)
        if (this.checked){
            if (index === -1){
                supportTelegramErrorsSelected.push(logID)
            }
        } else {
            if (index !== -1){
                supportTelegramErrorsSelected.splice(index, 1)
            }
        }
    })
    const selectedLength = supportTelegramErrorsSelected.length
    switch (selectedLength){
        case 0:
            supportTelegramErrorsSelectedSetStatusProcessing.disabled = true
            supportTelegramErrorsSelectedSetStatusReady.disabled = true
            supportTelegramErrorsTableSelect.checked = false
            break
        default:
            supportTelegramErrorsSelectedSetStatusProcessing.disabled = false
            supportTelegramErrorsSelectedSetStatusReady.disabled = false
            supportTelegramErrorsTableSelect.checked = true
            break
    }
    supportTelegramErrorsTableSelectLabel.innerHTML = `(${selectedLength})`
}

function supportTelegramErrorsFilteringSetFields(){
    function setUserSearchListener(){
        supportTelegramErrorsFilteringUserSearch.addEventListener("input", function () {
            const query = supportTelegramErrorsFilteringUserSearch.value.trim().toLowerCase()
            const users = supportTelegramErrorsFilteringUserList.querySelectorAll("a")
            if (query === ""){
                users.forEach(user => {
                    user.classList.remove("d-none")
                })
            } else {
                users.forEach(user => {
                    new RegExp(query).test(user.innerHTML.toLowerCase()) ? user.classList.remove("d-none") : user.classList.add("d-none")
                })
            }
        })
    }

    function selectListener(element, list, val){
        const index = list.indexOf(val)
        switch (index){
            case -1:
                list.push(val)
                element.classList.add("active")
                break
            default:
                list.splice(index, 1)
                element.classList.remove("active")
                break
        }
        telegramLogsGet()
    }

    function getLI(name, list, value){
        const a = document.createElement("a")
        a.innerHTML = name
        a.classList.add("dropdown-item")
        a.addEventListener("click", function (){
            selectListener(a, list, value)
        })
        return a
    }

    usersAPIGetAll().then(request => {
        switch (request.status){
            case 200:
                request.response.forEach(user => {
                    supportTelegramErrorsFilteringUserList.insertAdjacentElement("beforeend", getLI(
                        `${user.first_name} ${user.last_name}`, supportTelegramFilteringUsers, user.id))
                })
                break
            default:
                showErrorToast("Не удалось загрузить список пользователей для фильтрации")
                break
        }
    })

    supportTelegramErrorsFilteringATList.insertAdjacentElement("beforeend", getLI(
        "Сообщение", supportTelegramFilteringAT, "0"
    ))
    supportTelegramErrorsFilteringATList.insertAdjacentElement("beforeend", getLI(
        "Callback", supportTelegramFilteringAT, "1"
    ))
    setUserSearchListener()
}

function supportTelegramErrorsFilteringSetListeners(){
    supportTelegramErrorsFilteringDateStart.addEventListener("input", function () {
        if (supportTelegramErrorsFilteringDateStart.value !== ""){
            supportTelegramFilteringDateStart = supportTelegramErrorsFilteringDateStart.value
        } else {
            supportTelegramFilteringDateStart = null
        }
        telegramLogsGet()
    })
    supportTelegramErrorsFilteringDateEnd.addEventListener("input", function () {
        if (supportTelegramErrorsFilteringDateEnd.value !== ""){
            supportTelegramFilteringDateEnd = supportTelegramErrorsFilteringDateEnd.value
        } else {
            supportTelegramFilteringDateEnd = null
        }
        telegramLogsGet()
    })
}

function supportTelegramErrorsFilteringSetEraseListeners(){
    function eraseDateStart(){
        supportTelegramErrorsFilteringDateStart.value = ""
        supportTelegramFilteringDateStart = null
    }

    function eraseDateEnd(){
        supportTelegramErrorsFilteringDateEnd.value = ""
        supportTelegramFilteringDateEnd = null
    }

    function eraseUsers(selected = false){
        supportTelegramErrorsFilteringUserSearch.value = ""
        supportTelegramErrorsFilteringUserList.querySelectorAll("a").forEach(user => {
            user.classList.remove("d-none")
            if (selected){
                user.classList.remove("active")
            }
        })
        if (selected){
            supportTelegramFilteringUsers.length = 0
        }
    }

    function eraseAT(){
        supportTelegramErrorsFilteringATList.querySelectorAll("a").forEach(elem => {
            elem.classList.remove("active")
        })
        supportTelegramFilteringAT.length = 0
    }

    supportTelegramErrorsFilteringDateStartErase.addEventListener("click", function () {
        eraseDateStart()
        telegramLogsGet()
    })
    supportTelegramErrorsFilteringDateEndErase.addEventListener("click", function () {
        eraseDateEnd()
        telegramLogsGet()
    })
    supportTelegramErrorsFilteringUserSearchErase.addEventListener("click", function () {
        eraseUsers(false)
    })
    supportTelegramErrorsTableFilterResetAll.addEventListener("click", function () {
        eraseDateStart()
        eraseDateEnd()
        eraseUsers(true)
        eraseAT()
        telegramLogsGet()
    })
}

function supportTelegramErrorsSetStatus(status){
    function getFD(){
        const fd = new FormData()
        supportTelegramErrorsSelected.forEach(logID => {
            fd.append("log_id", logID)
        })
        fd.set("handling_status", status)
        return fd
    }

    supportTelegramLogsAPIUpdate(getFD()).then(request => {
        switch (request.status){
            case 200:
                showSuccessToast("Статусы ошибок успешно обновлены")
                telegramLogsGet()
                supportTelegramErrorsSelected = []
                supportTelegramErrorsSelectedSetStatusProcessing.disabled = true
                supportTelegramErrorsSelectedSetStatusReady.disabled = true
                supportTelegramErrorsTableSelect.checked = false
                supportTelegramErrorsTableSelectLabel.innerHTML = "(0)"
                break
            default:
                showErrorToast("Не удалось обновить статусы")
                break
        }
    })
}

function supportTelegramErrorInfoModalSet(logID){
    supportTelegramLogsAPIGetItem(logID).then(request => {
        switch (request.status) {
            case 200:
                supportTelegramErrorsLogModalID.innerHTML = `<b>ID:</b> ${request.response.id}`
                supportTelegramErrorsLogModalDateTime.innerHTML = `<b>Дата и время: </b>${timeUtilsDateTimeToStr(request.response.dt)}`
                supportTelegramErrorsLogModalUser.innerHTML = `<b>Пользователь: </b>${request.response.user?getUsersString([request.response.user]):"Неавторизованный"}`
                switch (request.response.at) {
                    case 0:
                        supportTelegramErrorsLogModalAT.classList.remove("d-none")
                        supportTelegramErrorsLogModalAT.innerHTML = "<b>Тип события: </b>Сообщение"
                        break
                    case 1:
                        supportTelegramErrorsLogModalAT.classList.remove("d-none")
                        supportTelegramErrorsLogModalAT.innerHTML = "<b>Тип события: </b>Callback"
                        break
                    default:
                        supportTelegramErrorsLogModalAT.classList.add("d-none")
                        supportTelegramErrorsLogModalAT.innerHTML = ""
                        break
                }
                supportTelegramErrorsLogModalException.innerHTML = `<b>Ошибка: </b>${request.response.error}`
                supportTelegramErrorsLogModalTraceback.innerHTML = request.response.traceback_log.join("<br>")
                supportTelegramErrorsLogModalParametersList.innerHTML = ""
                if (request.response.params.message_id){
                    supportTelegramErrorsLogModalParametersList.innerHTML += `<b>ID сообщения: </b>${request.response.params.message_id}<br>`
                }
                if (request.response.params.message_text){
                    supportTelegramErrorsLogModalParametersList.innerHTML += `<b>Текст сообщения: </b>${request.response.params.message_text}<br>`
                }
                bsSupportTelegramErrorsLogModal.show()
                break
            default:
                showErrorToast()
                break
        }
    })
}

let supportTelegramErrorsSelected = []
let supportTelegramCurrentOffset = 0
let supportTelegramFilteringHS = null
let supportTelegramFilteringDateStart = null
let supportTelegramFilteringDateEnd = null
let supportTelegramFilteringAT = []
let supportTelegramFilteringUsers = []

const supportTelegramErrorsAll = document.querySelector("#supportTelegramErrorsAll")
const supportTelegramErrorsNew = document.querySelector("#supportTelegramErrorsNew")
const supportTelegramErrorsProcessing = document.querySelector("#supportTelegramErrorsProcessing")
const supportTelegramErrorsFixed = document.querySelector("#supportTelegramErrorsFixed")
const supportTelegramErrorsTableFilterResetAll = document.querySelector("#supportTelegramErrorsTableFilterResetAll")
const supportTelegramErrorsSelectedSetStatusProcessing = document.querySelector("#supportTelegramErrorsSelectedSetStatusProcessing")
const supportTelegramErrorsSelectedSetStatusReady = document.querySelector("#supportTelegramErrorsSelectedSetStatusReady")
const supportTelegramErrorsTableSelect = document.querySelector("#supportTelegramErrorsTableSelect")
const supportTelegramErrorsTableSelectLabel = document.querySelector("#supportTelegramErrorsTableSelectLabel")
const supportTelegramErrorsFilteringDateStart = document.querySelector("#supportTelegramErrorsFilteringDateStart")
const supportTelegramErrorsFilteringDateStartErase = document.querySelector("#supportTelegramErrorsFilteringDateStartErase")
const supportTelegramErrorsFilteringDateEnd = document.querySelector("#supportTelegramErrorsFilteringDateEnd")
const supportTelegramErrorsFilteringDateEndErase = document.querySelector("#supportTelegramErrorsFilteringDateEndErase")
const supportTelegramErrorsFilteringATList = document.querySelector("#supportTelegramErrorsFilteringATList")
const supportTelegramErrorsFilteringUserList = document.querySelector("#supportTelegramErrorsFilteringUserList")
const supportTelegramErrorsFilteringUserSearch = document.querySelector("#supportTelegramErrorsFilteringUserSearch")
const supportTelegramErrorsFilteringUserSearchErase = document.querySelector("#supportTelegramErrorsFilteringUserSearchErase")
const supportTelegramErrorsTableBody = document.querySelector("#supportTelegramErrorsTableBody")

const supportTelegramErrorsLogModal = document.querySelector("#supportTelegramErrorsLogModal")
const bsSupportTelegramErrorsLogModal = new bootstrap.Modal(supportTelegramErrorsLogModal)
const supportTelegramErrorsLogModalID = supportTelegramErrorsLogModal.querySelector("#supportTelegramErrorsLogModalID")
const supportTelegramErrorsLogModalAT = supportTelegramErrorsLogModal.querySelector("#supportTelegramErrorsLogModalAT")
const supportTelegramErrorsLogModalDateTime = supportTelegramErrorsLogModal.querySelector("#supportTelegramErrorsLogModalDateTime")
const supportTelegramErrorsLogModalUser = supportTelegramErrorsLogModal.querySelector("#supportTelegramErrorsLogModalUser")
const supportTelegramErrorsLogModalException = supportTelegramErrorsLogModal.querySelector("#supportTelegramErrorsLogModalException")
const supportTelegramErrorsLogModalParametersList = supportTelegramErrorsLogModal.querySelector("#supportTelegramErrorsLogModalParametersList")
const supportTelegramErrorsLogModalTraceback = supportTelegramErrorsLogModal.querySelector("#supportTelegramErrorsLogModalTraceback")

telegramLogsMain()