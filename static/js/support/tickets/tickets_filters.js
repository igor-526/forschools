function supportTicketsFilteringMain(){
    supportTicketsFilteringSetStatuses()
    if (supportTicketsAdminMode){
        supportTicketsFilteringSetUsers()
    }
    supportTicketsFilteringEraseListeners()
    supportTicketsFilteringUserSearch()
    supportTicketsFilteringListeners()
}

function supportTicketsFilteringSetUsers(){
    function getUserElement(user){
        const a = document.createElement("a")
        a.innerHTML = `${user.first_name} ${user.last_name}`
        a.href = "#"
        a.classList.add("dropdown-item")
        a.addEventListener("click", function (){
            getUserListener(user.id, a)
        })
        return a
    }

    function getUserListener(userID, element){
        const index = supportTicketsFilteringSelectedUsers.indexOf(userID)
        switch (index){
            case -1:
                supportTicketsFilteringSelectedUsers.push(userID)
                element.classList.add("active")
                break
            default:
                supportTicketsFilteringSelectedUsers.splice(index, 1)
                element.classList.remove("active")
                break
        }
        supportTicketsGet()

    }

    supportTicketsFilteringUsersList.insertAdjacentElement("beforeend", getUserElement({
        first_name: "Без",
        last_name: "пользователя",
        id: "null",
    }))
    usersAPIGetAll().then(request => {
        switch (request.status){
            case 200:
                request.response.forEach(user => {
                    supportTicketsFilteringUsersList.insertAdjacentElement("beforeend", getUserElement(user))
                })
                break
            default:
                showErrorToast("Не удалось загрузить список пользователей")
                break
        }
    })
}

function supportTicketsFilteringSetStatuses(){
    function getStatusElement(status){
        const a = document.createElement("a")
        a.innerHTML = `${status.name}`
        a.href = "#"
        a.classList.add("dropdown-item")
        a.addEventListener("click", function (){
            getStatusListener(status.status, a)
        })
        return a
    }

    function getStatusListener(status, element){
        const index = supportTicketsFilteringSelectedStatus.indexOf(status)
        switch (index){
            case -1:
                supportTicketsFilteringSelectedStatus.push(status)
                element.classList.add("active")
                break
            default:
                supportTicketsFilteringSelectedStatus.splice(index, 1)
                element.classList.remove("active")
                break
        }
        supportTicketsGet()

    }

    supportTicketsFilteringStatusList.insertAdjacentElement("beforeend", getStatusElement({
        name: "Новое обращение",
        status: "null"
    }))
    supportTicketsFilteringStatusList.insertAdjacentElement("beforeend", getStatusElement({
        name: "Взято в работу",
        status: 0
    }))
    supportTicketsFilteringStatusList.insertAdjacentElement("beforeend", getStatusElement({
        name: "Проблема решена",
        status: 1
    }))
    supportTicketsFilteringStatusList.insertAdjacentElement("beforeend", getStatusElement({
        name: "Проблема не решена",
        status: 2
    }))
}

function supportTicketsFilteringEraseListeners(){
    function eraseUsersSearch(reset_active=false){
        supportTicketsFilteringUsersField.value = ""
        supportTicketsFilteringUsersList.querySelectorAll("a").forEach(elem => {
            elem.classList.remove("d-none")
            if (reset_active){
                elem.classList.remove("active")
            }
        })
        if (reset_active) {
            supportTicketsFilteringSelectedUsers = []
        }
    }

    function eraseDateStart(){
        supportTicketsFilteringDateStartField.value = ""
        supportTicketsFilteringSelectedDateStart = null
    }

    function eraseDateEnd(){
        supportTicketsFilteringDateEndField.value = ""
        supportTicketsFilteringSelectedDateEnd = null
    }

    function eraseDescription(){
        supportTicketsFilteringDescriptionField.value = ""
        supportTicketsFilteringSelectedDescription = null
    }

    supportTicketsFilteringUsersErase.addEventListener("click", function () {
        eraseUsersSearch(false)
    })
    supportTicketsFilteringUsersCancel.addEventListener("click", function () {
        eraseUsersSearch(true)
        supportTicketsGet()
    })
    supportTicketsFilteringDateStartErase.addEventListener("click", function () {
        eraseDateStart()
        supportTicketsGet()
    })
    supportTicketsFilteringDateEndErase.addEventListener("click", function () {
        eraseDateEnd()
        supportTicketsGet()
    })
    supportTicketsFilteringDescriptionErase.addEventListener("click", function () {
        eraseDescription()
        supportTicketsGet()
    })
    supportTicketsFilteringEraseAll.addEventListener("click", function () {
        eraseUsersSearch(true)
        eraseDateStart()
        eraseDateEnd()
        eraseDescription()
        supportTicketsGet()
    })
}

function supportTicketsFilteringUserSearch(){
    supportTicketsFilteringUsersField.addEventListener("input", function () {
        const query = new RegExp(supportTicketsFilteringUsersField.value.trim().toLowerCase())
        supportTicketsFilteringUsersList.querySelectorAll("a").forEach(element => {
            query.test(element.innerHTML.toLowerCase())?element.classList.remove("d-none"):element.classList.add("d-none")
        })
    })
}

function supportTicketsFilteringListeners(){
    function validateDates(){
        supportTicketsFilteringDateStartField.classList.remove("is-invalid")
        supportTicketsFilteringDateEndField.classList.remove("is-invalid")
        let validationStatus = true
        if (supportTicketsFilteringDateStartField.value !== "" && supportTicketsFilteringDateEndField.value !== ""){
            const sd = new Date(supportTicketsFilteringDateStartField.value)
            const ed = new Date(supportTicketsFilteringDateEndField.value)
            if (sd > ed){
                supportTicketsFilteringDateStartField.classList.add("is-invalid")
                supportTicketsFilteringDateEndField.classList.add("is-invalid")
                validationStatus = false
            }
        }
        if (supportTicketsFilteringDateStartField.value !== ""){
            const date = new Date(supportTicketsFilteringDateStartField.value).setHours(0, 0, 0, 0)
            const today = new Date().setHours(0, 0, 0, 0)
            if (date > today){
                supportTicketsFilteringDateStartField.classList.add("is-invalid")
                validationStatus = false
            }
        }
        if (supportTicketsFilteringDateEndField.value !== ""){
            const date = new Date(supportTicketsFilteringDateEndField.value).setHours(0, 0, 0, 0)
            const today = new Date().setHours(0, 0, 0, 0)
            if (date > today){
                supportTicketsFilteringDateEndField.classList.add("is-invalid")
                validationStatus = false
            }
        }
        return validationStatus
    }

    supportTicketsFilteringDateStartField.addEventListener("input", function () {
        if (validateDates()){
            supportTicketsFilteringSelectedDateStart = supportTicketsFilteringDateStartField.value
            supportTicketsFilteringDateEndField.value = supportTicketsFilteringDateStartField.value
            supportTicketsGet()
        }

    })
    supportTicketsFilteringDateEndField.addEventListener("input", function () {
        if (validateDates()){
            supportTicketsFilteringSelectedDateEnd = supportTicketsFilteringDateEndField.value
            supportTicketsGet()
        }

    })
    supportTicketsFilteringDescriptionField.addEventListener("input", function () {
        supportTicketsFilteringSelectedDescription = supportTicketsFilteringDescriptionField.value
        supportTicketsGet()

    })
}

const supportTicketsFilteringEraseAll = document.querySelector("#supportTicketsFilteringEraseAll")
const supportTicketsFilteringUsersList = document.querySelector("#supportTicketsFilteringUsersList")
const supportTicketsFilteringUsersField = document.querySelector("#supportTicketsFilteringUsersField")
const supportTicketsFilteringUsersErase = document.querySelector("#supportTicketsFilteringUsersErase")
const supportTicketsFilteringUsersCancel = document.querySelector("#supportTicketsFilteringUsersCancel")
const supportTicketsFilteringDateStartField = document.querySelector("#supportTicketsFilteringDateStartField")
const supportTicketsFilteringDateStartErase = document.querySelector("#supportTicketsFilteringDateStartErase")
const supportTicketsFilteringDateEndField = document.querySelector("#supportTicketsFilteringDateEndField")
const supportTicketsFilteringDateEndErase = document.querySelector("#supportTicketsFilteringDateEndErase")
const supportTicketsFilteringDescriptionField = document.querySelector("#supportTicketsFilteringDescriptionField")
const supportTicketsFilteringDescriptionErase = document.querySelector("#supportTicketsFilteringDescriptionErase")
const supportTicketsFilteringStatusList = document.querySelector("#supportTicketsFilteringStatusList")

supportTicketsFilteringMain()