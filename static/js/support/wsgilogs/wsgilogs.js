function supportWSGIErrorsMain(){
    supportWSGIErrorsGet()
    supportWSGIErrorsTableSelect.addEventListener("change", supportWSGIErrorsSelectAllListener)
    supportWSGIErrorsSetTabs()
    supportWSGIErrorsFilteringSetFields()
    supportWSGIErrorsFilteringSetListeners()
    supportWSGIErrorsFilteringSetEraseListeners()
    if (supportWSGIErrorsCanChange){
        supportWSGIErrorsSelectedSetStatusProcessing.addEventListener("click", function () {
            supportWSGIErrorsSetStatus(1)
        })
        supportWSGIErrorsSelectedSetStatusReady.addEventListener("click", function () {
            supportWSGIErrorsSetStatus(2)
        })
    } else {
        supportWSGIErrorsSelectedSetStatusProcessing.classList.add("d-none")
        supportWSGIErrorsSelectedSetStatusReady.classList.add("d-none")
    }
}

function supportWSGIErrorsSetTabs(){
    supportWSGIErrorsAll.addEventListener("click", function () {
        supportWSGIErrorsAll.classList.add("active")
        supportWSGIErrorsNew.classList.remove("active")
        supportWSGIErrorsProcessing.classList.remove("active")
        supportWSGIErrorsFixed.classList.remove("active")
        supportWSGIErrorsFilteringHandlingStatus = null
        supportWSGIErrorsGet()
    })
    supportWSGIErrorsNew.addEventListener("click", function () {
        supportWSGIErrorsNew.classList.add("active")
        supportWSGIErrorsAll.classList.remove("active")
        supportWSGIErrorsProcessing.classList.remove("active")
        supportWSGIErrorsFixed.classList.remove("active")
        supportWSGIErrorsFilteringHandlingStatus = "0"
        supportWSGIErrorsGet()
    })
    supportWSGIErrorsProcessing.addEventListener("click", function () {
        supportWSGIErrorsProcessing.classList.add("active")
        supportWSGIErrorsAll.classList.remove("active")
        supportWSGIErrorsNew.classList.remove("active")
        supportWSGIErrorsFixed.classList.remove("active")
        supportWSGIErrorsFilteringHandlingStatus = "1"
        supportWSGIErrorsGet()
    })
    supportWSGIErrorsFixed.addEventListener("click", function () {
        supportWSGIErrorsFixed.classList.add("active")
        supportWSGIErrorsAll.classList.remove("active")
        supportWSGIErrorsNew.classList.remove("active")
        supportWSGIErrorsProcessing.classList.remove("active")
        supportWSGIErrorsFilteringHandlingStatus = "2"
        supportWSGIErrorsGet()
    })
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
    function getSelectListener(logID, checked){
        const index = supportWSGIErrorsSelected.indexOf(logID)
        if (checked){
            if (index === -1){
                supportWSGIErrorsSelected.push(logID)
            }
        } else {
            if (index !== -1){
                supportWSGIErrorsSelected.splice(index, 1)
            }
        }
        const selectedLength = supportWSGIErrorsSelected.length
        switch (selectedLength){
            case 0:
                supportWSGIErrorsSelectedSetStatusProcessing.disabled = true
                supportWSGIErrorsSelectedSetStatusReady.disabled = true
                supportWSGIErrorsTableSelect.checked = false
                break
            default:
                supportWSGIErrorsSelectedSetStatusProcessing.disabled = false
                supportWSGIErrorsSelectedSetStatusReady.disabled = false
                supportWSGIErrorsTableSelect.checked = true
                break
        }
        supportWSGIErrorsTableSelectLabel.innerHTML = `(${selectedLength})`
    }

    function getElement(log){
        const tr = document.createElement("tr")
        const tdSelect = document.createElement("td")
        const tdSelectCheckbox = document.createElement("input")
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

        if (supportWSGIErrorsCanChange){
            tdSelectCheckbox.classList.add("form-check-input")
            tdSelectCheckbox.type = "checkbox"
            tdSelectCheckbox.setAttribute("data-log-id", log.id)
            tdSelectCheckbox.addEventListener("click", function () {
                getSelectListener(log.id, tdSelectCheckbox.checked)
            })
            tr.insertAdjacentElement("beforeend", tdSelect)
            tdSelect.insertAdjacentElement("beforeend", tdSelectCheckbox)
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
                supportWSGIErrorsLogModalParametersList.innerHTML = ""
                for (let key in request.response.params) {
                    supportWSGIErrorsLogModalParametersList.innerHTML += `${key} : ${request.response.params[key]}<br>`
                }
                supportWSGIErrorsLogModalServerResponse.innerHTML = request.response.response ? request.response.response : ""
                bsSupportWSGIErrorsLogModal.show()
                break
            default:
                showErrorToast()
                break
        }
    })
}

function supportWSGIErrorsSelectAllListener(){
    const elements = supportWSGIErrorsTableBody.querySelectorAll("input")
    elements.forEach(element => {
        element.checked = this.checked
        const logID = Number(element.attributes.getNamedItem("data-log-id").value)
        const index = supportWSGIErrorsSelected.indexOf(logID)
        if (this.checked){
            if (index === -1){
                supportWSGIErrorsSelected.push(logID)
            }
        } else {
            if (index !== -1){
                supportWSGIErrorsSelected.splice(index, 1)
            }
        }
    })
    const selectedLength = supportWSGIErrorsSelected.length
    switch (selectedLength){
        case 0:
            supportWSGIErrorsSelectedSetStatusProcessing.disabled = true
            supportWSGIErrorsSelectedSetStatusReady.disabled = true
            supportWSGIErrorsTableSelect.checked = false
            break
        default:
            supportWSGIErrorsSelectedSetStatusProcessing.disabled = false
            supportWSGIErrorsSelectedSetStatusReady.disabled = false
            supportWSGIErrorsTableSelect.checked = true
            break
    }
    supportWSGIErrorsTableSelectLabel.innerHTML = `(${selectedLength})`
}

function supportWSGIErrorsFilteringSetFields(){
    function setUserSearchListener(){
        supportWSGIErrorsFilteringUserSearch.addEventListener("input", function () {
            const query = supportWSGIErrorsFilteringUserSearch.value.trim().toLowerCase()
            const users = supportWSGIErrorsFilteringUserList.querySelectorAll("a")
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
        supportWSGIErrorsGet()
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
                    supportWSGIErrorsFilteringUserList.insertAdjacentElement("beforeend", getLI(
                        `${user.first_name} ${user.last_name}`, supportWSGIErrorsFilteringUsers, user.id))
                })
                break
            default:
                showErrorToast("Не удалось загрузить список пользователей для фильтрации")
                break
        }
    })
    supportWSGIErrorsFilteringMethodList.insertAdjacentElement("beforeend", getLI(
        "GET", supportWSGIErrorsFilteringMethods, "GET"
    ))
    supportWSGIErrorsFilteringMethodList.insertAdjacentElement("beforeend", getLI(
        "POST", supportWSGIErrorsFilteringMethods, "POST"
    ))
    supportWSGIErrorsFilteringMethodList.insertAdjacentElement("beforeend", getLI(
        "PATCH", supportWSGIErrorsFilteringMethods, "PATCH"
    ))
    supportWSGIErrorsFilteringMethodList.insertAdjacentElement("beforeend", getLI(
        "PUT", supportWSGIErrorsFilteringMethods, "PUT"
    ))
    supportWSGIErrorsFilteringMethodList.insertAdjacentElement("beforeend", getLI(
        "DELETE", supportWSGIErrorsFilteringMethods, "DELETE"
    ))
    supportWSGIErrorsFilteringCodeList.insertAdjacentElement("beforeend", getLI(
        500, supportWSGIErrorsFilteringStatusCode, 500
    ))
    supportWSGIErrorsFilteringCodeList.insertAdjacentElement("beforeend", getLI(
        400, supportWSGIErrorsFilteringStatusCode, 400
    ))
    supportWSGIErrorsFilteringCodeList.insertAdjacentElement("beforeend", getLI(
        404, supportWSGIErrorsFilteringStatusCode, 404
    ))
    supportWSGIErrorsFilteringCodeList.insertAdjacentElement("beforeend", getLI(
        403, supportWSGIErrorsFilteringStatusCode, 403
    ))
    setUserSearchListener()
}

function supportWSGIErrorsFilteringSetListeners(){
    supportWSGIErrorsFilteringDateStart.addEventListener("input", function () {
        if (supportWSGIErrorsFilteringDateStart.value !== ""){
            supportWSGIErrorsFilteringDTStart = supportWSGIErrorsFilteringDateStart.value
        } else {
            supportWSGIErrorsFilteringDTStart = null
        }
        supportWSGIErrorsGet()
    })
    supportWSGIErrorsFilteringDateEnd.addEventListener("input", function () {
        if (supportWSGIErrorsFilteringDateEnd.value !== ""){
            supportWSGIErrorsFilteringDTEnd = supportWSGIErrorsFilteringDateEnd.value
        } else {
            supportWSGIErrorsFilteringDTEnd = null
        }
        supportWSGIErrorsGet()
    })
    supportWSGIErrorsFilteringURLField.addEventListener("input", function () {
        if (supportWSGIErrorsFilteringURLField.value.trim() !== ""){
            supportWSGIErrorsFilteringURL = supportWSGIErrorsFilteringURLField.value.trim()
        } else {
            supportWSGIErrorsFilteringURL = null
        }
        supportWSGIErrorsGet()
    })
}

function supportWSGIErrorsFilteringSetEraseListeners(){
    function eraseDateStart(){
        supportWSGIErrorsFilteringDateStart.value = ""
        supportWSGIErrorsFilteringDTStart = null
    }

    function eraseDateEnd(){
        supportWSGIErrorsFilteringDateEnd.value = ""
        supportWSGIErrorsFilteringDTEnd = null
    }

    function eraseURL(){
        supportWSGIErrorsFilteringURLField.value = ""
        supportWSGIErrorsFilteringURL = null
    }

    function eraseUsers(selected = false){
        supportWSGIErrorsFilteringUserSearch.value = ""
        supportWSGIErrorsFilteringUserList.querySelectorAll("a").forEach(user => {
            user.classList.remove("d-none")
            if (selected){
                user.classList.remove("active")
            }
        })
        if (selected){
            supportWSGIErrorsFilteringUsers.length = 0
        }
    }

    function eraseMethod(){
        supportWSGIErrorsFilteringMethodList.querySelectorAll("a").forEach(elem => {
            elem.classList.remove("active")
        })
        supportWSGIErrorsFilteringMethods.length = 0
    }

    function eraseCode(){
        supportWSGIErrorsFilteringCodeList.querySelectorAll("a").forEach(elem => {
            elem.classList.remove("active")
        })
        supportWSGIErrorsFilteringStatusCode.length = 0
    }

    supportWSGIErrorsFilteringDateStartErase.addEventListener("click", function () {
        eraseDateStart()
        supportWSGIErrorsGet()
    })
    supportWSGIErrorsFilteringDateEndErase.addEventListener("click", function () {
        eraseDateEnd()
        supportWSGIErrorsGet()
    })
    supportWSGIErrorsFilteringUserSearchErase.addEventListener("click", function () {
        eraseUsers(false)
    })
    supportWSGIErrorsFilteringURLFieldErase.addEventListener("click", function () {
        eraseURL()
        supportWSGIErrorsGet()
    })
    supportWSGIErrorsTableFilterResetAll.addEventListener("click", function () {
        eraseDateStart()
        eraseDateEnd()
        eraseURL()
        eraseUsers(true)
        eraseMethod()
        eraseCode()
        supportWSGIErrorsGet()
    })
}

function supportWSGIErrorsSetStatus(status){
    function getFD(){
        const fd = new FormData()
        supportWSGIErrorsSelected.forEach(logID => {
            fd.append("log_id", logID)
        })
        fd.set("handling_status", status)
        return fd
    }

    supportWSGILogsAPIUpdateMany(getFD()).then(request => {
        switch (request.status){
            case 200:
                showSuccessToast("Статусы ошибок успешно обновлены")
                supportWSGIErrorsGet()
                supportWSGIErrorsSelected = []
                supportWSGIErrorsSelectedSetStatusProcessing.disabled = true
                supportWSGIErrorsSelectedSetStatusReady.disabled = true
                supportWSGIErrorsTableSelect.checked = false
                supportWSGIErrorsTableSelectLabel.innerHTML = "(0)"
                break
            default:
                showErrorToast("Не удалось обновить статусы")
                break
        }
    })
}


const supportWSGIErrorsAll = document.querySelector("#supportWSGIErrorsAll")
const supportWSGIErrorsNew = document.querySelector("#supportWSGIErrorsNew")
const supportWSGIErrorsProcessing = document.querySelector("#supportWSGIErrorsProcessing")
const supportWSGIErrorsFixed = document.querySelector("#supportWSGIErrorsFixed")
const supportWSGIErrorsSelectedSetStatusProcessing = document.querySelector("#supportWSGIErrorsSelectedSetStatusProcessing")
const supportWSGIErrorsSelectedSetStatusReady = document.querySelector("#supportWSGIErrorsSelectedSetStatusReady")
const supportWSGIErrorsTableBody = document.querySelector("#supportWSGIErrorsTableBody")
const supportWSGIErrorsTableSelect = document.querySelector("#supportWSGIErrorsTableSelect")
const supportWSGIErrorsTableSelectLabel = document.querySelector("#supportWSGIErrorsTableSelectLabel")
let supportWSGIErrorsSelected = []

//Filtering
let supportWSGIErrorsFilteringHandlingStatus = null
let supportWSGIErrorsFilteringDTStart = null
let supportWSGIErrorsFilteringDTEnd = null
let supportWSGIErrorsFilteringUsers = []
let supportWSGIErrorsFilteringMethods = []
let supportWSGIErrorsFilteringStatusCode = []
let supportWSGIErrorsFilteringURL = null

const supportWSGIErrorsFilteringDateStart = document.querySelector("#supportWSGIErrorsFilteringDateStart")
const supportWSGIErrorsFilteringDateEnd = document.querySelector("#supportWSGIErrorsFilteringDateEnd")
const supportWSGIErrorsFilteringUserList = document.querySelector("#supportWSGIErrorsFilteringUserList")
const supportWSGIErrorsFilteringUserSearch = document.querySelector("#supportWSGIErrorsFilteringUserSearch")
const supportWSGIErrorsFilteringMethodList = document.querySelector("#supportWSGIErrorsFilteringMethodList")
const supportWSGIErrorsFilteringCodeList = document.querySelector("#supportWSGIErrorsFilteringCodeList")
const supportWSGIErrorsFilteringURLField = document.querySelector("#supportWSGIErrorsFilteringURLField")
const supportWSGIErrorsFilteringDateStartErase = document.querySelector("#supportWSGIErrorsFilteringDateStartErase")
const supportWSGIErrorsFilteringDateEndErase = document.querySelector("#supportWSGIErrorsFilteringDateEndErase")
const supportWSGIErrorsFilteringUserSearchErase = document.querySelector("#supportWSGIErrorsFilteringUserSearchErase")
const supportWSGIErrorsFilteringURLFieldErase = document.querySelector("#supportWSGIErrorsFilteringURLFieldErase")
const supportWSGIErrorsTableFilterResetAll = document.querySelector("#supportWSGIErrorsTableFilterResetAll")


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
const supportWSGIErrorsLogModalServerResponse = supportWSGIErrorsLogModal.querySelector("#supportWSGIErrorsLogModalServerResponse")
const supportWSGIErrorsLogModalParametersTraceback = supportWSGIErrorsLogModal.querySelector("#supportWSGIErrorsLogModalParametersTraceback")

supportWSGIErrorsMain()