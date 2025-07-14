function profileEventsMain(){
    profileEventsGet()
    profileEventsFiltersSetLists()
    profileEventsFiltersSetDateListeners()
    profileEventsFiltersSetResetListeners()
    profileEventsFiltersSetUsersSearchListeners()
    profileEventJournalTableShowMoreButton.addEventListener("click", function () {
        profileEventsGet(true)
    })
}

function profileEventsGet(more=false){
    more ? profileEventJournalFilterCurrentOffset += 50 : profileEventJournalFilterCurrentOffset = 0
    eventsJournalAPIGetAll(profileEventJournalFilterCurrentOffset, profileEventJournalFilterCurrentEvent,
        profileEventJournalFilterCurrentUser, profileEventJournalFilterCurrentInitiator,
        profileEventJournalFilterCurrentDateStart, profileEventJournalFilterCurrentDateEnd).then(request => {
        switch (request.status){
            case 200:
                request.response.length === 50 ?
                    profileEventJournalTableShowMoreButton.classList.remove("d-none") :
                    profileEventJournalTableShowMoreButton.classList.add("d-none")
                profileEventsShow(request.response, !more)
                break
            default:
                showErrorToast()
                break
        }
    })
}

function profileEventsShow(list=[], clear=true){
    function getEventStrByCode(code){
        if (profileEventsAll.hasOwnProperty(code)){
            return profileEventsAll[code]
        } else {
            return "Неизвестно"
        }
    }

    function getElement(event){
        const tr = document.createElement("tr")
        const tdEvent = document.createElement("td")
        tdEvent.innerHTML = getEventStrByCode(event.event)
        tr.insertAdjacentElement("beforeend", tdEvent)

        const tdUser = document.createElement("td")
        tdUser.innerHTML = getUsersString([event.user])
        tr.insertAdjacentElement("beforeend", tdUser)

        const tdInitiator = document.createElement("td")
        tdInitiator.innerHTML = getUsersString([event.initiator])
        tr.insertAdjacentElement("beforeend", tdInitiator)

        const tdDateTime = document.createElement("td")
        tdDateTime.innerHTML = timeUtilsDateTimeToStr(event.dt)
        tr.insertAdjacentElement("beforeend", tdDateTime)

        return tr
    }

    if (clear){
        profileEventJournalTableBody.innerHTML = ""
    }
    list.forEach(event => {
        profileEventJournalTableBody.insertAdjacentElement("beforeend", getElement(event))
    })
}

function profileEventsFiltersSetLists(){
    function getClickListener(array, objectID, element){
        const index = array.indexOf(objectID)
        switch (index){
            case -1:
                array.push(objectID)
                element.classList.add("active")
                break
            default:
                array.splice(index, 1)
                element.classList.remove("active")
                break
        }
        profileEventsGet()
    }

    function getElement(array, object){
        const a = document.createElement("a")
        a.innerHTML = object.inner
        a.classList.add("dropdown-item")
        a.href = "#"
        a.addEventListener("click", function () {
            getClickListener(array, object.id, a)
        })
        return a
    }

    Object.keys(profileEventsAll).forEach(eventID => {
        profileEventJournalFilterEventList.insertAdjacentElement("beforeend", getElement(
            profileEventJournalFilterCurrentEvent,
            {id: eventID, inner: profileEventsAll[eventID]}
        ))
    })
    usersAPIGetAll().then(request => {
        switch (request.status){
            case 200:
                request.response.forEach(user => {
                    profileEventJournalFilterUserList.insertAdjacentElement("beforeend", getElement(
                        profileEventJournalFilterCurrentUser,
                        {id: user.id, inner: `${user.first_name} ${user.last_name}`}
                    ))
                    profileEventJournalFilterInitiatorList.insertAdjacentElement("beforeend", getElement(
                        profileEventJournalFilterCurrentInitiator,
                        {id: user.id, inner: `${user.first_name} ${user.last_name}`}
                    ))
                })
                break
            default:
                showErrorToast("Не удалось загрузить список пользователей для фильтрации")
                break
        }
    })
}

function profileEventsFiltersSetDateListeners(){
    function validate(){
        profileEventJournalFilterDateStart.classList.remove("is-invalid")
        profileEventJournalFilterDateEnd.classList.remove("is-invalid")
        const today = new Date().setHours(0, 0, 0, 0)
        let start = null
        let end = null
        let validationStatus = true
        if (profileEventJournalFilterDateStart.value !== ""){
            start = new Date(profileEventJournalFilterDateStart.value).setHours(0, 0, 0, 0)
        }
        if (profileEventJournalFilterDateEnd.value !== ""){
            end = new Date(profileEventJournalFilterDateEnd.value).setHours(0, 0, 0, 0)
        }
        if (start && start > today){
            profileEventJournalFilterDateStart.classList.add("is-invalid")
            validationStatus = false
        }
        if (end && end > today){
            profileEventJournalFilterDateEnd.classList.add("is-invalid")
            validationStatus = false
        }
        if (start && end && start > end){
            profileEventJournalFilterDateStart.classList.add("is-invalid")
            profileEventJournalFilterDateEnd.classList.add("is-invalid")
            validationStatus = false
        }
        return validationStatus
    }

    function setDates(){
        if (validate()){
            profileEventJournalFilterCurrentDateStart = profileEventJournalFilterDateStart.value !== "" ?
                profileEventJournalFilterDateStart.value : null
            profileEventJournalFilterCurrentDateEnd = profileEventJournalFilterDateEnd.value !== "" ?
                profileEventJournalFilterDateEnd.value : null
            profileEventsGet()
        }
    }

    profileEventJournalFilterDateStart.addEventListener("input", function (){
        if (profileEventJournalFilterDateEnd.value == ""){
            profileEventJournalFilterDateEnd.value = profileEventJournalFilterDateStart.value
        }
        setDates()
    })
    profileEventJournalFilterDateEnd.addEventListener("input", function (){
        if (profileEventJournalFilterDateStart.value == ""){
            profileEventJournalFilterDateStart.value = profileEventJournalFilterDateEnd.value
        }
        setDates()
    })
}

function profileEventsFiltersSetUsersSearchListeners(){
    function setDNone(fieldValue, list){
        const query = fieldValue.trim().toLowerCase()
        list.querySelectorAll("a").forEach(element => {
            if (query === ""){
                element.classList.remove("d-none")
            } else {
                new RegExp(query).test(element.innerHTML.trim().toLowerCase()) ?
                    element.classList.remove("d-none") : element.classList.add("d-none")
            }
        })
    }

    profileEventJournalFilterUserSearchField.addEventListener("input", function (){
        setDNone(profileEventJournalFilterUserSearchField.value, profileEventJournalFilterUserList)
    })
    profileEventJournalFilterInitiatorSearchField.addEventListener("input", function (){
        setDNone(profileEventJournalFilterInitiatorSearchField.value, profileEventJournalFilterInitiatorList)
    })
}

function profileEventsFiltersSetResetListeners(){
    function resetEvents(){
        profileEventJournalFilterEventList.querySelectorAll("a").forEach(event => {
            event.classList.remove("active")
        })
        profileEventJournalFilterCurrentEvent.length = 0
    }

    function eraseUsers(reset=false){
        profileEventJournalFilterUserSearchField.value = ""
        profileEventJournalFilterUserList.querySelectorAll("a").forEach(user => {
            user.classList.remove("d-none")
            if (reset){
                user.classList.remove("active")
            }
        })
        if (reset){
            profileEventJournalFilterCurrentUser.length = 0
        }
    }

    function eraseInitiators(reset=false){
        profileEventJournalFilterInitiatorSearchField.value = ""
        profileEventJournalFilterInitiatorList.querySelectorAll("a").forEach(user => {
            user.classList.remove("d-none")
            if (reset){
                user.classList.remove("active")
            }
        })
        if (reset){
            profileEventJournalFilterCurrentInitiator.length = 0
        }
    }

    function resetDateStart(){
        profileEventJournalFilterDateStart.value = ""
        profileEventJournalFilterCurrentDateStart = null
    }

    function resetDateEnd(){
        profileEventJournalFilterDateEnd.value = ""
        profileEventJournalFilterCurrentDateEnd = null
    }

    profileEventJournalFilterUserSearchErase.addEventListener("click", function () {
        eraseUsers()
    })
    profileEventJournalFilterInitiatorSearchErase.addEventListener("click", function () {
        eraseInitiators()
    })
    profileEventJournalFilterDateStartErase.addEventListener("click", function () {
        resetDateStart()
        profileEventsGet()
    })
    profileEventJournalFilterDateEndErase.addEventListener("click", function () {
        resetDateEnd()
        profileEventsGet()
    })
    profileEventJournalFilterResetAll.addEventListener("click", function () {
        resetEvents()
        eraseUsers(true)
        eraseInitiators(true)
        resetDateStart()
        resetDateEnd()
        profileEventsGet()
    })
}

const profileEventsAll = {
    0: "Привязка основного Telegram",
    1: "Привязка родительского Telegram",
    2: "Отвязка основного Telegram",
    3: "Отвязка родительского Telegram"
}

//Table
const profileEventJournalTableBody = document.querySelector("#profileEventJournalTableBody")
const profileEventJournalTableShowMoreButton = document.querySelector("#profileEventJournalTableShowMoreButton")

//Filtering
const profileEventJournalFilterEventList = document.querySelector("#profileEventJournalFilterEventList")
const profileEventJournalFilterUserList = document.querySelector("#profileEventJournalFilterUserList")
const profileEventJournalFilterInitiatorList = document.querySelector("#profileEventJournalFilterInitiatorList")
const profileEventJournalFilterUserSearchField = document.querySelector("#profileEventJournalFilterUserSearchField")
const profileEventJournalFilterInitiatorSearchField = document.querySelector("#profileEventJournalFilterInitiatorSearchField")
const profileEventJournalFilterDateStart = document.querySelector("#profileEventJournalFilterDateStart")
const profileEventJournalFilterDateEnd = document.querySelector("#profileEventJournalFilterDateEnd")
const profileEventJournalFilterUserSearchErase = document.querySelector("#profileEventJournalFilterUserSearchErase")
const profileEventJournalFilterInitiatorSearchErase = document.querySelector("#profileEventJournalFilterInitiatorSearchErase")
const profileEventJournalFilterDateStartErase = document.querySelector("#profileEventJournalFilterDateStartErase")
const profileEventJournalFilterDateEndErase = document.querySelector("#profileEventJournalFilterDateEndErase")
const profileEventJournalFilterResetAll = document.querySelector("#profileEventJournalFilterResetAll")

let profileEventJournalFilterCurrentOffset = 0
let profileEventJournalFilterCurrentEvent = []
let profileEventJournalFilterCurrentUser = []
let profileEventJournalFilterCurrentInitiator = []
let profileEventJournalFilterCurrentDateStart = null
let profileEventJournalFilterCurrentDateEnd = null

profileEventsMain()