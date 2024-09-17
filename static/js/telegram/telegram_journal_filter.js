function tgJournalFilterMain(){
    tgJournalFilterEraseListeners()
    tgJournalFilterSearchListeners()
    tgJournalFilterEnterListeners()
    tgJournalFilterSetUsers()
}

function tgJournalFilterEraseListeners(){
    tgJournalFilterEventSearchFieldErase.addEventListener("click", function () {
        tgJournalFilterEventSearchField.value = ""
        tgJournalFilterEvent.querySelectorAll("a").forEach(element => {
            element.parentElement.classList.remove("d-none")
        })
    })
    tgJournalFilterDateFieldErase.addEventListener("click", function () {
        tgJournalFilterDateField.value = ""
        tgJournalFilterSelectedDate = ""
        tgJournalFilterShowResult()
    })
    tgJournalFilterTimeFromFieldErase.addEventListener("click", function () {
        tgJournalFilterTimeFromField.value = ""
        tgJournalFilterSelectedTimeFrom = ""
        tgJournalFilterShowResult()
    })
    tgJournalFilterTimeToFieldErase.addEventListener("click", function () {
        tgJournalFilterTimeToField.value = ""
        tgJournalFilterSelectedTimeTo = ""
        tgJournalFilterShowResult()
    })
    tgJournalFilterInitiatorSearchFieldErase.addEventListener("click", function () {
        tgJournalFilterInitiatorSearchField.value = ""
        tgJournalFilterInitiatorList.querySelectorAll("a").forEach(element => {
            element.parentElement.classList.remove("d-none")
        })
    })
    tgJournalFilterRecipientSearchFieldErase.addEventListener("click", function () {
        tgJournalFilterRecipientSearchField.value = ""
        tgJournalFilterRecipientList.querySelectorAll("a").forEach(element => {
            element.parentElement.classList.remove("d-none")
        })
    })

    tgJournalFilterResetAll.addEventListener("click", function(){
        tgJournalFilterEventSearchField.value = ""
        tgJournalFilterEvent.querySelectorAll("a").forEach(element => {
            element.parentElement.classList.remove("d-none")
            element.classList.remove("active")
        })
        tgJournalFilterDateField.value = ""
        tgJournalFilterTimeFromField.value = ""
        tgJournalFilterTimeToField.value = ""
        tgJournalFilterInitiatorSearchField.value = ""
        tgJournalFilterInitiatorList.querySelectorAll("a").forEach(element => {
            element.parentElement.classList.remove("d-none")
            element.classList.remove("active")
        })
        tgJournalFilterRecipientSearchField.value = ""
        tgJournalFilterRecipientList.querySelectorAll("a").forEach(element => {
            element.parentElement.classList.remove("d-none")
            element.classList.remove("active")
        })
        tgJournalFilterSelectedEvent = []
        tgJournalFilterSelectedDate = ""
        tgJournalFilterSelectedTimeFrom = ""
        tgJournalFilterSelectedTimeTo = ""
        tgJournalFilterSelectedInitiator = []
        tgJournalFilterSelectedRecipient = []
        tgJournalFilterSelectedStatus = []
        tgJournalFilterShowResult()
    })
}

function tgJournalFilterSearchListeners(){
    function matchCheck(query, forCheck){
        const q = new RegExp(query.trim().toLowerCase())
        return q.test(forCheck.trim().toLowerCase())
    }

    tgJournalFilterEventSearchField.addEventListener("input", function (){
        tgJournalFilterEvent.querySelectorAll("a").forEach(element => {
            const query = tgJournalFilterEventSearchField.value
            matchCheck(query, element.innerHTML)?element.parentElement.classList.remove("d-none"):element.parentElement.classList.add("d-none")
        })
    })

    tgJournalFilterInitiatorSearchField.addEventListener("input", function (){
        tgJournalFilterInitiatorList.querySelectorAll("a").forEach(element => {
            const query = tgJournalFilterInitiatorSearchField.value
            matchCheck(query, element.innerHTML)?element.parentElement.classList.remove("d-none"):element.parentElement.classList.add("d-none")
        })
    })

    tgJournalFilterRecipientSearchField.addEventListener("input", function (){
        tgJournalFilterRecipientList.querySelectorAll("a").forEach(element => {
            const query = tgJournalFilterRecipientSearchField.value
            matchCheck(query, element.innerHTML)?element.parentElement.classList.remove("d-none"):element.parentElement.classList.add("d-none")
        })
    })
}

function tgJournalFilterEnterListeners(){
    function enterEventListener(){
        const eventNum = Number(this.attributes.getNamedItem("data-event-number").value)
        const index = tgJournalFilterSelectedEvent.indexOf(eventNum)
        switch (index){
            case -1:
                tgJournalFilterSelectedEvent.push(eventNum)
                this.classList.add("active")
                break
            default:
                tgJournalFilterSelectedEvent.splice(index, 1)
                this.classList.remove("active")
                break
        }
        tgJournalFilterShowResult()
    }

    function enterDateListener(){
        if (validateDate(this)){
            tgJournalFilterSelectedDate = this.value
            tgJournalFilterShowResult()
        }
    }

    function enterTimeListener(){
        if (validateTime()){
            if (tgJournalFilterTimeFromField.value !== ""){
                tgJournalFilterSelectedTimeFrom = tgJournalFilterTimeFromField.value
            }
            if (tgJournalFilterTimeToField.value !== ""){
                tgJournalFilterSelectedTimeTo = tgJournalFilterTimeToField.value
            }
            tgJournalFilterShowResult()
        }
    }

    function enterStatusListener(){
        const status = this.attributes.getNamedItem("data-status").value
        const index = tgJournalFilterSelectedStatus.indexOf(status)
        switch (index){
            case -1:
                tgJournalFilterSelectedStatus.push(status)
                this.classList.add("active")
                break
            default:
                tgJournalFilterSelectedStatus.splice(index, 1)
                this.classList.remove("active")
                break
        }
        tgJournalFilterShowResult()
    }

    function validateDate(elem){
        tgJournalFilterDateField.classList.remove("is-invalid")
        const selectedDate = new Date(elem.value).setHours(0, 0, 0, 0)
        const todayDate = new Date().setHours(0, 0, 0, 0)
        if (selectedDate <= todayDate){
            return true
        } else {
            tgJournalFilterDateField.classList.add("is-invalid")
            return false
        }
    }

    function validateTime(){
        tgJournalFilterTimeFromField.classList.remove("is-invalid")
        tgJournalFilterTimeToField.classList.remove("is-invalid")
        if (tgJournalFilterTimeFromField.value !== "" && tgJournalFilterTimeToField.value !== ""){
            if (compareTime(tgJournalFilterTimeFromField, tgJournalFilterTimeToField)){
                tgJournalFilterTimeFromField.classList.add("is-invalid")
                tgJournalFilterTimeToField.classList.add("is-invalid")
                return false
            } else {
                return true
            }
        } else {
            return true
        }
    }

    tgJournalFilterEvent.querySelectorAll("a").forEach(element => {
        element.addEventListener("click", enterEventListener)
    })
    tgJournalFilterStatus.querySelectorAll("a").forEach(element => {
        element.addEventListener("click", enterStatusListener)
    })
    tgJournalFilterDateField.addEventListener("input", enterDateListener)
    tgJournalFilterTimeFromField.addEventListener("input", enterTimeListener)
    tgJournalFilterTimeToField.addEventListener("input", enterTimeListener)
}

function tgJournalFilterSetUsers(){
    function listenerInitiator(userID, element){
        const index = tgJournalFilterSelectedInitiator.indexOf(userID)
        switch (index){
            case -1:
                tgJournalFilterSelectedInitiator.push(userID)
                element.classList.add("active")
                break
            default:
                tgJournalFilterSelectedInitiator.splice(index, 1)
                element.classList.remove("active")
                break
        }
        tgJournalFilterShowResult()
    }

    function listenerRecipient(userID, element){
        const index = tgJournalFilterSelectedRecipient.indexOf(userID)
        switch (index){
            case -1:
                tgJournalFilterSelectedRecipient.push(userID)
                element.classList.add("active")
                break
            default:
                tgJournalFilterSelectedRecipient.splice(index, 1)
                element.classList.remove("active")
                break
        }
        tgJournalFilterShowResult()
    }

    function getElement(user, type="initiator"){
        const li = document.createElement("li")
        const a = document.createElement("a")
        li.insertAdjacentElement("beforeend", a)
        a.classList.add("dropdown-item")
        a.href = "#"
        a.innerHTML = `${user.first_name} ${user.last_name}`
        switch (type){
            case "initiator":
                a.addEventListener("click", function (){
                    listenerInitiator(user.id, a)
                })
                break
            case "recipient":
                a.addEventListener("click", function (){
                    listenerRecipient(user.id, a)
                })
                break
        }
        return li
    }

    usersAPIGetUsersForJournal().then(request => {
        switch (request.status){
            case 200:
                tgJournalFilterInitiatorList.insertAdjacentElement("beforeend", getElement({
                    first_name: "Система",
                    last_name: "",
                    id: 0
                }, "initiator"))
                request.response.forEach(user => {
                    tgJournalFilterInitiatorList.insertAdjacentElement("beforeend", getElement(user, "initiator"))
                    tgJournalFilterRecipientList.insertAdjacentElement("beforeend", getElement(user, "recipient"))
                })
                break
            default:
                showErrorToast()
                break
        }
    })
}

function tgJournalFilterShowResult(){
    tgJournalGet(
        tgJournalFilterSelectedEvent,
        tgJournalFilterSelectedDate,
        tgJournalFilterSelectedTimeFrom,
        tgJournalFilterSelectedTimeTo,
        tgJournalFilterSelectedInitiator,
        tgJournalFilterSelectedRecipient,
        tgJournalFilterSelectedStatus
    )
}

const tgJournalFilterEventSearchFieldErase = document.querySelector("#tgJournalFilterEventSearchFieldErase")
const tgJournalFilterDateFieldErase = document.querySelector("#tgJournalFilterDateFieldErase")
const tgJournalFilterTimeFromFieldErase = document.querySelector("#tgJournalFilterTimeFromFieldErase")
const tgJournalFilterTimeToFieldErase = document.querySelector("#tgJournalFilterTimeToFieldErase")
const tgJournalFilterInitiatorSearchFieldErase = document.querySelector("#tgJournalFilterInitiatorSearchFieldErase")
const tgJournalFilterRecipientSearchFieldErase = document.querySelector("#tgJournalFilterRecipientSearchFieldErase")
const tgJournalFilterEventSearchField = document.querySelector("#tgJournalFilterEventSearchField")
const tgJournalFilterInitiatorSearchField = document.querySelector("#tgJournalFilterInitiatorSearchField")
const tgJournalFilterRecipientSearchField = document.querySelector("#tgJournalFilterRecipientSearchField")
const tgJournalFilterDateField = document.querySelector("#tgJournalFilterDateField")
const tgJournalFilterTimeFromField = document.querySelector("#tgJournalFilterTimeFromField")
const tgJournalFilterTimeToField = document.querySelector("#tgJournalFilterTimeToField")
const tgJournalFilterEvent = document.querySelector("#tgJournalFilterEvent")
const tgJournalFilterStatus = document.querySelector("#tgJournalFilterStatus")
const tgJournalFilterInitiatorList = document.querySelector("#tgJournalFilterInitiatorList")
const tgJournalFilterRecipientList = document.querySelector("#tgJournalFilterRecipientList")

const tgJournalFilterResetAll = document.querySelector("#tgJournalFilterResetAll")

let tgJournalFilterSelectedEvent = []
let tgJournalFilterSelectedDate = ""
let tgJournalFilterSelectedTimeFrom = ""
let tgJournalFilterSelectedTimeTo = ""
let tgJournalFilterSelectedInitiator = []
let tgJournalFilterSelectedRecipient = []
let tgJournalFilterSelectedStatus = []


tgJournalFilterMain()
