function tgJournalFilterMain(){
    tgJournalFilterEraseListeners()
    tgJournalFilterSearchListeners()
    tgJournalFilterEnterListeners()
    tgJournalFilterSetUsers()
}

function tgJournalFilterEraseListeners(){
    function eraseEvent(reset=false){
        if (reset){
            tgJournalFilterSelectedEvent = []
        }
        tgJournalFilterEventSearchField.value = ""
        tgJournalFilterEvent.querySelectorAll("a").forEach(element => {
            element.parentElement.classList.remove("d-none")
            if (reset){
                element.parentElement.classList.remove("active")
            }
        })
    }

    function eraseDateFrom(){
        tgJournalFilterDateFromField.value = ""
        tgJournalFilterDateToField.value = ""
        tgJournalFilterSelectedDateTo = null
        tgJournalFilterSelectedDateFrom = null
    }

    function eraseTime(){
        tgJournalFilterTimeFromField.value = ""
        tgJournalFilterTimeToField.value = ""
        tgJournalFilterSelectedTimeFrom = null
        tgJournalFilterSelectedTimeTo = null
    }

    function eraseInitiator(reset=false){
        if (reset){
            tgJournalFilterSelectedInitiator = []
        }
        tgJournalFilterInitiatorSearchField.value = ""
        tgJournalFilterInitiatorList.querySelectorAll("a").forEach(element => {
            element.parentElement.classList.remove("d-none")
            if (reset){
                element.parentElement.classList.remove("active")
            }
        })
    }

    function eraseRecipient(reset=false){
        if (reset){
            tgJournalFilterSelectedRecipient = []
        }
        tgJournalFilterRecipientSearchField.value = ""
        tgJournalFilterRecipientList.querySelectorAll("a").forEach(element => {
            element.parentElement.classList.remove("d-none")
            if (reset){
                element.parentElement.classList.remove("active")
            }
        })
    }


    tgJournalFilterEventSearchFieldErase.addEventListener("click", function () {
        eraseEvent(false)
    })
    tgJournalFilterDateFieldErase.addEventListener("click", function () {
        eraseDateFrom()
        tgJournalGet()
    })
    tgJournalFilterTimeFieldErase.addEventListener("click", function () {
        eraseTime()
        tgJournalGet()
    })
    tgJournalFilterInitiatorSearchFieldErase.addEventListener("click", function () {
        eraseInitiator(false)
    })
    tgJournalFilterRecipientSearchFieldErase.addEventListener("click", function () {
        eraseRecipient(false)
    })
    tgJournalFilterResetAll.addEventListener("click", function(){
        eraseEvent(true)
        eraseDateFrom()
        eraseTime()
        eraseInitiator(true)
        eraseRecipient(true)
        tgJournalGet()
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
        tgJournalGet()
    }

    function enterTimeListener(){
        if (validateTime()){
            if (tgJournalFilterTimeFromField.value !== ""){
                tgJournalFilterSelectedTimeFrom = tgJournalFilterTimeFromField.value
            }
            if (tgJournalFilterTimeToField.value !== ""){
                tgJournalFilterSelectedTimeTo = tgJournalFilterTimeToField.value
            }
            tgJournalGet()
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
        tgJournalGet()
    }

    function validateDate(){
        let validationStatus = true
        tgJournalFilterDateFromField.classList.remove("is-invalid")
        tgJournalFilterDateToField.classList.remove("is-invalid")
        let dateFrom = null
        let dateTo = null

        const todayDate = new Date().setHours(0, 0, 0, 0)
        if (tgJournalFilterDateFromField.value !== ""){
            dateFrom = new Date(tgJournalFilterDateFromField.value).setHours(0, 0, 0, 0)
            if (dateFrom > todayDate){
                tgJournalFilterDateFromField.classList.add("is-invalid")
                validationStatus = false
            }
        }
        if (tgJournalFilterDateToField.value !== ""){
            dateTo = new Date(tgJournalFilterDateToField.value).setHours(0, 0, 0, 0)
            if (dateTo > todayDate){
                tgJournalFilterDateToField.classList.add("is-invalid")
                validationStatus = false
            }
        }
        if (dateFrom && dateTo){
            if (dateFrom > dateTo){
                tgJournalFilterDateFromField.classList.add("is-invalid")
                tgJournalFilterDateToField.classList.add("is-invalid")
                validationStatus = false
            }
        }
        return validationStatus
    }

    function validateTime(){
        tgJournalFilterTimeFromField.classList.remove("is-invalid")
        tgJournalFilterTimeToField.classList.remove("is-invalid")
        if (tgJournalFilterTimeFromField.value !== "" && tgJournalFilterTimeToField.value !== ""){
            if (timeUtilsCompareTime(tgJournalFilterTimeFromField, tgJournalFilterTimeToField)){
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

    tgJournalFilterDateFromField.addEventListener("input", function () {
        if (validateDate()){
            tgJournalFilterSelectedDateFrom = tgJournalFilterDateFromField.value
            tgJournalFilterTimeFromField.value = ""
            tgJournalFilterTimeToField.value = ""
            tgJournalFilterSelectedTimeFrom = null
            tgJournalFilterSelectedTimeTo = null
            tgJournalGet()
        }
    })
    tgJournalFilterDateToField.addEventListener("input", function () {
        if (validateDate()){
            tgJournalFilterSelectedDateTo = tgJournalFilterDateToField.value
            tgJournalFilterTimeFromField.value = ""
            tgJournalFilterTimeToField.value = ""
            tgJournalFilterSelectedTimeFrom = null
            tgJournalFilterSelectedTimeTo = null
            tgJournalGet()
        }
    })
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
        tgJournalGet()
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
        tgJournalGet()
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

const tgJournalFilterEventSearchFieldErase = document.querySelector("#tgJournalFilterEventSearchFieldErase")
const tgJournalFilterDateFieldErase = document.querySelector("#tgJournalFilterDateFieldErase")
const tgJournalFilterTimeFieldErase = document.querySelector("#tgJournalFilterTimeFieldErase")
const tgJournalFilterInitiatorSearchFieldErase = document.querySelector("#tgJournalFilterInitiatorSearchFieldErase")
const tgJournalFilterRecipientSearchFieldErase = document.querySelector("#tgJournalFilterRecipientSearchFieldErase")
const tgJournalFilterEventSearchField = document.querySelector("#tgJournalFilterEventSearchField")
const tgJournalFilterInitiatorSearchField = document.querySelector("#tgJournalFilterInitiatorSearchField")
const tgJournalFilterRecipientSearchField = document.querySelector("#tgJournalFilterRecipientSearchField")
const tgJournalFilterDateFromField = document.querySelector("#tgJournalFilterDateFromField")
const tgJournalFilterDateToField = document.querySelector("#tgJournalFilterDateToField")
const tgJournalFilterTimeFromField = document.querySelector("#tgJournalFilterTimeFromField")
const tgJournalFilterTimeToField = document.querySelector("#tgJournalFilterTimeToField")
const tgJournalFilterEvent = document.querySelector("#tgJournalFilterEvent")
const tgJournalFilterStatus = document.querySelector("#tgJournalFilterStatus")
const tgJournalFilterInitiatorList = document.querySelector("#tgJournalFilterInitiatorList")
const tgJournalFilterRecipientList = document.querySelector("#tgJournalFilterRecipientList")

const tgJournalFilterResetAll = document.querySelector("#tgJournalFilterResetAll")


tgJournalFilterMain()
