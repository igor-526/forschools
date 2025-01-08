function userLogsMain(){
    userLogsSelectPlanButton.addEventListener("click", userLogsOffcanvasShow)
    userLogsSetDate()
    userLogsPlanActionsFiltersDateSetWeek.addEventListener("click", function () {
        userLogsSetDate(6)
        if (userLogsSelectedPlan){
            userLogsGetActions(true)
        }
    })
    userLogsPlanActionsFiltersDateSet3Days.addEventListener("click", function () {
        userLogsSetDate(2)
        if (userLogsSelectedPlan){
            userLogsGetActions(true)
        }
    })
    userLogsPlanActionsFiltersDateSetToday.addEventListener("click", function () {
        userLogsSetDate(0)
        if (userLogsSelectedPlan){
            userLogsGetActions(true)
        }
    })
    userLogsFiltersListeners()
    userLogsSelectedPlan = getHashValue("plan_id")
    if (userLogsSelectedPlan){
        userLogsGetActions(true)
    }
}

function userLogsSetDate(daysCount = 2){
    userLogsFilterDateTo = new Date()
    userLogsFilterDateFrom = new Date(userLogsFilterDateTo - (daysCount * 24 * 60 * 60 * 1000))
    userLogsPlanActionsFiltersDateFrom.value = userLogsFilterDateFrom.toISOString().split('T')[0]
    userLogsPlanActionsFiltersDateTo.value = userLogsFilterDateTo.toISOString().split('T')[0]
}

function userLogsGetActions(clear=true){
    userLogsTabsActions.classList.add("active")
    userLogsTabsMessages.classList.remove("active")
    userLogsBodyMessages.classList.add("active")
    userLogsBodySpinner.classList.remove("d-none")
    if (clear){
        userLogsBodyActions.innerHTML = ""
    }
    userLogsAPIGetActions(userLogsSelectedPlan, userLogsFilterDateFrom, userLogsFilterDateTo,
        userLogsFilterHW, userLogsFilterTGJournal, userLogsFilterMessages,
        userLogsFilterLessons, userLogsFilterPlans).then(request => {
        switch (request.status){
            case 200:
                userLogsShowPlanInfo(request.response.plan_info)
                userLogsShowActions(request.response.logs)
                userLogsBodySpinner.classList.add("d-none")
                break
            default:
                showErrorToast()
        }
    })
}

function userLogsShowPlanInfo(info){
    function getLPButton(plan_id){
        const a = document.createElement("a")
        a.href = `/learning_plans/${plan_id}`
        a.innerHTML = "План обучения"
        a.classList.add("btn", "btn-outline-primary", "btn-sm", "ms-2")
        a.target = "_blank"
        return a
    }

    userLogsPlanInformation.innerHTML = ""
    userLogsPlanInformationHeaderBtn.innerHTML = ""
    if (info.id){
        userLogsPlanInformationHeaderBtn.insertAdjacentElement("beforeend", getLPButton(info.id))
    }
    if (info.name){
        userLogsPlanInformation.insertAdjacentElement("beforeend",
            getListElement("Наименование", info.name))
    }
    if (info.teacher){
        userLogsPlanInformation.insertAdjacentElement("beforeend",
            getListElement("Преподаватель", getUsersString([info.teacher])))
    }
    if (info.default_hw_teacher){
        userLogsPlanInformation.insertAdjacentElement("beforeend",
            getListElement("Проверяющий ДЗ по умолчанию", getUsersString([info.default_hw_teacher])))
    }
    if (info.methodist){
        userLogsPlanInformation.insertAdjacentElement("beforeend",
            getListElement("Методист", getUsersString([info.methodist])))
    }
    info.curators?.forEach(user => {
        userLogsPlanInformation.insertAdjacentElement("beforeend",
            getListElement("Куратор", getUsersString([user])))
    })
    info.listeners?.forEach(user => {
        userLogsPlanInformation.insertAdjacentElement("beforeend",
            getListElement("Ученик", getUsersString([user])))
    })
}

function userLogsShowActions(actions=[]){
    function getElement(action){
        console.log(action)
        const li = document.createElement("li")
        li.classList.add("list-group-item", "mb-1")
        li.style = "border-width: 2px;"
        if (action.color){
            li.classList.add(`list-group-item-${action.color}`)
        }
        const header = document.createElement("div")
        header.classList.add("d-flex", "w-100", "justify-content-between")
        const headerText = document.createElement("h5")
        headerText.classList.add("mb-1")
        headerText.innerHTML = action.title
        const headerDT = document.createElement("small")
        headerDT.innerHTML = timeUtilsDateTimeToStr(new Date(action.date))
        header.insertAdjacentElement("beforeend", headerText)
        header.insertAdjacentElement("beforeend", headerDT)
        li.insertAdjacentElement("beforeend", header)

        const content = document.createElement("div")
        content.classList.add("mb-3")
        action.content.text.forEach(text => {
            const p = document.createElement("p")
            p.innerHTML = text
            content.insertAdjacentElement("beforeend", p)
        })
        if (action.content.list.length > 0){
            const contentList = document.createElement("ul")
            contentList.classList.add("list-group")
            action.content.list.forEach(listItem => {
                contentList.insertAdjacentElement("beforeend", getListElement(listItem.name, listItem.val))
            })
            content.insertAdjacentElement("beforeend", contentList)
        }
        li.insertAdjacentElement("beforeend", content)

        const user = document.createElement("a")
        user.target = "_blank"
        user.innerHTML = `${action.user.first_name} ${action.user.last_name}`
        user.style = "color: grey; font-size: 12px;"
        user.href = `/profile/${action.user.id}/`
        li.insertAdjacentElement("beforeend", user)


        if (action.buttons.length > 0){
            const buttons = document.createElement("div")
            buttons.classList.add("mt-2")
            action.buttons.forEach(button => {
                const btn = document.createElement("btn")
                const btnA = document.createElement("a")
                btnA.target = "_blank"
                btnA.href = button.href
                btn.classList.add("btn-primary", "btn", "btn-sm", "mx-1")
                btn.innerHTML = button.inner
                btnA.insertAdjacentElement("beforeend", btn)
                buttons.insertAdjacentElement("beforeend", btnA)
            })
            content.insertAdjacentElement("beforeend", buttons)
        }

        return li
    }

    actions.forEach(action => {
        userLogsBodyActions.insertAdjacentElement("beforeend", getElement(action))
    })
}

function userLogsFiltersListeners(){
    userLogsPlanActionsFiltersHW.addEventListener("change", function () {
        userLogsFilterHW = userLogsPlanActionsFiltersHW.checked
        if (userLogsSelectedPlan){
            userLogsGetActions(true)
        }
    })
    userLogsPlanActionsFiltersTGJournal.addEventListener("change", function () {
        userLogsFilterTGJournal = userLogsPlanActionsFiltersTGJournal.checked
        if (userLogsSelectedPlan){
            userLogsGetActions(true)
        }
    })
    userLogsPlanActionsFiltersMessages.addEventListener("change", function () {
        userLogsFilterMessages = userLogsPlanActionsFiltersMessages.checked
        if (userLogsSelectedPlan){
            userLogsGetActions(true)
        }
    })
    userLogsPlanActionsFiltersLessons.addEventListener("change", function () {
        userLogsFilterLessons = userLogsPlanActionsFiltersLessons.checked
        if (userLogsSelectedPlan){
            userLogsGetActions(true)
        }
    })
    userLogsPlanActionsFiltersPlans.addEventListener("change", function () {
        userLogsFilterPlans = userLogsPlanActionsFiltersPlans.checked
        if (userLogsSelectedPlan){
            userLogsGetActions(true)
        }
    })
    userLogsPlanActionsFiltersDateFrom.addEventListener("change", function () {
        userLogsFilterDateFrom = new Date(userLogsPlanActionsFiltersDateFrom.value)
        if (userLogsSelectedPlan){
            userLogsGetActions(true)
        }
    })
    userLogsPlanActionsFiltersDateTo.addEventListener("change", function () {
        userLogsFilterDateTo = new Date(userLogsPlanActionsFiltersDateTo.value)
        if (userLogsSelectedPlan){
            userLogsGetActions(true)
        }
    })
}

let userLogsSelectedPlan
let userLogsFilterDateFrom = null
let userLogsFilterDateTo = null
let userLogsFilterHW = true
let userLogsFilterTGJournal = false
let userLogsFilterMessages = true
let userLogsFilterLessons = true
let userLogsFilterPlans = true


const userLogsSelectPlanButton = document.querySelector("#userLogsSelectPlanButton")
const userLogsPlanInformation = document.querySelector("#userLogsPlanInformation")
const userLogsPlanInformationHeaderBtn = document.querySelector("#userLogsPlanInformationHeaderBtn")
const userLogsTabsActions = document.querySelector("#userLogsTabsActions")
const userLogsBodyActions = document.querySelector("#userLogsBodyActions")
const userLogsTabsMessages = document.querySelector("#userLogsTabsMessages")
const userLogsBodyMessages = document.querySelector("#userLogsBodyMessages")
const userLogsBodySpinner = document.querySelector("#userLogsBodySpinner")

const userLogsPlanActionsFilters = document.querySelector("#userLogsPlanActionsFilters")
const userLogsPlanActionsFiltersDateFrom = userLogsPlanActionsFilters.querySelector("#userLogsPlanActionsFiltersDateFrom")
const userLogsPlanActionsFiltersDateTo = userLogsPlanActionsFilters.querySelector("#userLogsPlanActionsFiltersDateTo")
const userLogsPlanActionsFiltersDateSetWeek = userLogsPlanActionsFilters.querySelector("#userLogsPlanActionsFiltersDateSetWeek")
const userLogsPlanActionsFiltersDateSet3Days = userLogsPlanActionsFilters.querySelector("#userLogsPlanActionsFiltersDateSet3Days")
const userLogsPlanActionsFiltersDateSetToday = userLogsPlanActionsFilters.querySelector("#userLogsPlanActionsFiltersDateSetToday")
const userLogsPlanActionsFiltersHW = userLogsPlanActionsFilters.querySelector("#userLogsPlanActionsFiltersHW")
const userLogsPlanActionsFiltersTGJournal = userLogsPlanActionsFilters.querySelector("#userLogsPlanActionsFiltersTGJournal")
const userLogsPlanActionsFiltersMessages = userLogsPlanActionsFilters.querySelector("#userLogsPlanActionsFiltersMessages")
const userLogsPlanActionsFiltersLessons = userLogsPlanActionsFilters.querySelector("#userLogsPlanActionsFiltersLessons")
const userLogsPlanActionsFiltersPlans = userLogsPlanActionsFilters.querySelector("#userLogsPlanActionsFiltersPlans")

userLogsMain()