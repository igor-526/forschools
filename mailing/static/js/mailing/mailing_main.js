function mailingMain(){
    mailingMainGet()
    mailingFilteringSetInitiators()
    mailingFilteringSetFieldsListeners()
    mailingFilteringSetResultListeners()
    mailingFilteringSetSearchListeners()
    mailingFilteringSetResetListeners()
    mailingTableShowMoreButton.addEventListener("click", function () {
        mailingMainGet(true)
    })
}

function mailingMainGet(more=false){
    more ? mailingFilterCurrentOffset += 50 : mailingFilterCurrentOffset = 0
    mailingAPIGetAll(mailingFilterCurrentOffset, mailingFilterCurrentName,
        mailingFilterCurrentDateStart, mailingFilterCurrentDateEnd,
        mailingFilterCurrentInitiators, mailingFilterCurrentResult).then(request => {
        switch (request.status){
            case 200:
                request.response.length === 50 ?
                    mailingTableShowMoreButton.classList.remove("d-none") :
                    mailingTableShowMoreButton.classList.add("d-none")
                mailingMainShow(request.response, !more)
                break
            default:
                showErrorToast()
                break
        }
    })
}

function mailingMainShow(mailings=[], clear=true){
    function getElement(mailing){
        const tr = document.createElement("tr")
        const tdName = document.createElement("td")
        tdName.innerHTML = mailing.name
        tr.insertAdjacentElement("beforeend", tdName)

        const tdDate = document.createElement("td")
        tdDate.innerHTML = timeUtilsDateTimeToStr(mailing.dt)
        tr.insertAdjacentElement("beforeend", tdDate)

        const tdInitiator = document.createElement("td")
        tdInitiator.innerHTML = getUsersString([mailing.initiator])
        tr.insertAdjacentElement("beforeend", tdInitiator)

        const tdResult = document.createElement("td")
        const tdResultButton = document.createElement("button")
        tdResultButton.type = "button"
        tdResultButton.innerHTML = mailing.result.all
        tdResultButton.classList.add("btn")
        switch (mailing.result.info){
            case 1:
                tdResultButton.classList.add("btn-warning")
                break
            case 2:
                tdResultButton.classList.add("btn-success")
                break
        }
        tdResultButton.addEventListener("click", function () {
            mailingReportModalSet(mailing.id)
        })
        tdResult.insertAdjacentElement("beforeend", tdResultButton)
        tr.insertAdjacentElement("beforeend", tdResult)
        return tr
    }

    if (clear){
        mailingTableBody.innerHTML = ""
    }
    mailings.forEach(mailing => {
        mailingTableBody.insertAdjacentElement("beforeend", getElement(mailing))
    })
}

function mailingFilteringSetInitiators(){
    function getListener(element, userID){
        const index = mailingFilterCurrentInitiators.indexOf(userID)
        switch (index){
            case -1:
                element.classList.add("active")
                mailingFilterCurrentInitiators.push(userID)
                break
            default:
                mailingFilterCurrentInitiators.splice(index, 1)
                element.classList.remove("active")
                break
        }
        mailingMainGet()
    }

    function getElement(user){
        const a = document.createElement("a")
        a.classList.add("dropdown-item")
        a.innerHTML = `${user.first_name} ${user.last_name}`
        a.addEventListener("click", function () {
            getListener(a, user.id)
        })
        return a
    }

    mailingAPIGetInitiators().then(request => {
        switch (request.status){
            case 200:
                request.response.forEach(user => {
                    mailingTableFilterInitiatorList.insertAdjacentElement("beforeend", getElement(user))
                })
                break
            default:
                showErrorToast("Не удалось загрузить список инициаторов для фильтрации")
                break
        }
    })
}

function mailingFilteringSetFieldsListeners(){
    function validateDates(){
        mailingTableFilterDateStartField.classList.remove("is-invalid")
        mailingTableFilterDateEndField.classList.remove("is-invalid")
        const todayDate = new Date().setHours(0, 0, 0, 0)
        let startDate = null
        let endDate = null
        let validationStatus = true
        if (mailingTableFilterDateStartField.value !== ""){
            startDate = new Date(mailingTableFilterDateStartField.value).setHours(0, 0, 0, 0)
        }
        if (mailingTableFilterDateEndField.value !== ""){
            endDate = new Date(mailingTableFilterDateEndField.value).setHours(0, 0, 0, 0)
        }
        if (startDate && startDate > todayDate){
            mailingTableFilterDateStartField.classList.add("is-invalid")
            validationStatus = false
        }
        if (endDate && endDate > todayDate){
            mailingTableFilterDateEndField.classList.add("is-invalid")
            validationStatus = false
        }
        if (startDate && endDate && startDate > endDate){
            mailingTableFilterDateStartField.classList.add("is-invalid")
            mailingTableFilterDateEndField.classList.add("is-invalid")
            validationStatus = false
        }
        return validationStatus
    }

    mailingTableFilterNameField.addEventListener("input", function () {
        const query = mailingTableFilterNameField.value.trim()
        if (query === ""){
            mailingFilterCurrentName = null
        } else {
            mailingFilterCurrentName = query
        }
        mailingMainGet()
    })
    mailingTableFilterDateStartField.addEventListener("input", function () {
        if (validateDates()){
            mailingFilterCurrentDateStart = mailingTableFilterDateStartField.value
            if (mailingTableFilterDateEndField.value === ""){
                mailingTableFilterDateEndField.value = mailingTableFilterDateStartField.value
                mailingFilterCurrentDateEnd = mailingTableFilterDateEndField.value
            }
            mailingMainGet()
        }
    })
    mailingTableFilterDateEndField.addEventListener("input", function () {
        if (validateDates()){
            mailingFilterCurrentDateEnd = mailingTableFilterDateEndField.value
            mailingMainGet()
        }
    })
}

function mailingFilteringSetResultListeners(){
    mailingTableFilterResAll.addEventListener("click", function () {
        mailingFilterCurrentResult = null
        mailingMainGet()
    })
    mailingTableFilterResPart.addEventListener("click", function () {
        mailingFilterCurrentResult = "part"
        mailingMainGet()
    })
    mailingTableFilterResSuccess.addEventListener("click", function () {
        mailingFilterCurrentResult = "success"
        mailingMainGet()
    })
    mailingTableFilterResFail.addEventListener("click", function () {
        mailingFilterCurrentResult = "processing"
        mailingMainGet()
    })
}

function mailingFilteringSetSearchListeners(){
    mailingTableFilterInitiatorSearchField.addEventListener("input", function () {
        const query = new RegExp(mailingTableFilterInitiatorSearchField.value.trim().toLowerCase())
        mailingTableFilterInitiatorList.querySelectorAll("a").forEach(elem => {
            query.test(elem.innerHTML.trim().toLowerCase()) ?
                elem.classList.remove("d-none") : elem.classList.add("d-none")
        })

    })
}

function mailingFilteringSetResetListeners(){
    function resetName(){
        mailingTableFilterNameField.value = ""
        mailingFilterCurrentName = null
    }

    function resetDateStart(){
        mailingTableFilterDateStartField.value = ""
        mailingFilterCurrentDateStart = null
        mailingTableFilterDateStartField.classList.remove("is-invalid")
    }

    function resetDateEnd(){
        mailingTableFilterDateEndField.value = ""
        mailingFilterCurrentDateEnd = null
        mailingTableFilterDateEndField.classList.remove("is-invalid")
    }

    function resetInitiator(eraseSearchOnly=true){
        mailingTableFilterInitiatorSearchField.value = ""
        mailingTableFilterInitiatorList.querySelectorAll("a").forEach(elem => {
            elem.classList.remove("d-none")
            if (!eraseSearchOnly){
                elem.classList.remove("acive")
            }
        })
        if (!eraseSearchOnly){
            mailingFilterCurrentInitiators.length = 0
        }
    }

    function resetResult(){
        mailingFilterCurrentResult = null
        mailingTableFilterResAll.checked = true
        mailingTableFilterResPart.checked = false
        mailingTableFilterResSuccess.checked = false
        mailingTableFilterResFail.checked = false
    }

    mailingTableFilterNameFieldErase.addEventListener("click", function () {
        resetName()
    })
    mailingTableFilterDateStartFieldErase.addEventListener("click", function () {
        resetDateStart()
    })
    mailingTableFilterDateEndFieldErase.addEventListener("click", function () {
        resetDateEnd()
    })
    mailingTableFilterInitiatorSearchFieldErase.addEventListener("click", function () {
        resetInitiator()
    })
    mailingTableFilterResetAll.addEventListener("click", function () {
        resetName()
        resetDateStart()
        resetDateEnd()
        resetInitiator(false)
        resetResult()
    })
}

let mailingFilterCurrentOffset = 0
let mailingFilterCurrentName = null
let mailingFilterCurrentDateStart = null
let mailingFilterCurrentDateEnd = null
const mailingFilterCurrentInitiators = []
let mailingFilterCurrentResult = null

const mailingTableFilterNameField = document.querySelector("#mailingTableFilterNameField")
const mailingTableFilterNameFieldErase = document.querySelector("#mailingTableFilterNameFieldErase")
const mailingTableFilterDateStartField = document.querySelector("#mailingTableFilterDateStartField")
const mailingTableFilterDateStartFieldErase = document.querySelector("#mailingTableFilterDateStartFieldErase")
const mailingTableFilterDateEndField = document.querySelector("#mailingTableFilterDateEndField")
const mailingTableFilterDateEndFieldErase = document.querySelector("#mailingTableFilterDateEndFieldErase")
const mailingTableFilterInitiatorList = document.querySelector("#mailingTableFilterInitiatorList")
const mailingTableFilterInitiatorSearchField = document.querySelector("#mailingTableFilterInitiatorSearchField")
const mailingTableFilterInitiatorSearchFieldErase = document.querySelector("#mailingTableFilterInitiatorSearchFieldErase")
const mailingTableFilterResAll = document.querySelector("#mailingTableFilterResAll")
const mailingTableFilterResPart = document.querySelector("#mailingTableFilterResPart")
const mailingTableFilterResSuccess = document.querySelector("#mailingTableFilterResSuccess")
const mailingTableFilterResFail = document.querySelector("#mailingTableFilterResFail")
const mailingTableFilterResetAll = document.querySelector("#mailingTableFilterResetAll")
const mailingTableBody = document.querySelector("#mailingTableBody")
const mailingTableShowMoreButton = document.querySelector("#mailingTableShowMoreButton")

mailingMain()