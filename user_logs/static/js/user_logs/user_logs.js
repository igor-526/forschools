function userLogsMain(){
    userLogsSelectPlanButton.addEventListener("click", userLogsOffcanvasShow)
    userLogsSetDate()

    userLogsTabsMessages.addEventListener("click", function (){
        userLogsTabsActions.classList.remove("active")
        userLogsTabsMessages.classList.add("active")
        userLogsBodyMessages.classList.remove("d-none")
        userLogsBodyActions.classList.add("d-none")
        userLogsMessagesSet()
    })
    userLogsTabsActions.addEventListener("click", function (){
        userLogsTabsActions.classList.add("active")
        userLogsTabsMessages.classList.remove("active")
        userLogsBodyMessages.classList.add("d-none")
        userLogsBodyActions.classList.remove("d-none")
    })
    userLogsTabsMessagesSelectUsers.addEventListener("click", function () {
        userLogsTabsActions.classList.remove("active")
        userLogsTabsMessages.classList.add("active")
        userLogsBodyMessages.classList.remove("d-none")
        userLogsBodyActions.classList.add("d-none")
        userLogsMessagesSelectedFirstUser = null
        userLogsMessagesSelectedSecondUser = null
        userLogsMessagesDownloaded = false
        userLogsMessagesSet()
    })

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
        userLogsTabsMessages.classList.remove("disabled")
        userLogsGetActions(true)
    }
    userLogsBodyShowMoreButton.addEventListener("click", function () {
        userLogsCurrentOffset += 50
        userLogsGetActions(false, true)
    })
}

function userLogsSetDate(daysCount = 2){
    userLogsFilterDateTo = new Date()
    userLogsFilterDateFrom = new Date(userLogsFilterDateTo - (daysCount * 24 * 60 * 60 * 1000))
    userLogsPlanActionsFiltersDateFrom.value = userLogsFilterDateFrom.toISOString().split('T')[0]
    userLogsPlanActionsFiltersDateTo.value = userLogsFilterDateTo.toISOString().split('T')[0]
}

function userLogsGetActions(clear=true, more=false){
    userLogsBodySpinner.classList.remove("d-none")
    if (!more && userLogsCurrentOffset !== 0){
        userLogsCurrentOffset = 0
    }
    if (clear){
        userLogsListActions.innerHTML = ""
    }
    userLogsAPIGetActions(userLogsCurrentOffset, userLogsSelectedPlan, userLogsFilterDateFrom, userLogsFilterDateTo,
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

function userLogsGetFilesElement(files){
    const container = document.createElement("div")
    container.classList.add("logs-information-files")
    files.forEach(f => {
        const fileContainer = document.createElement("div")
        fileContainer.classList.add("logs-information-file")
        switch (f.type){
            case 'image_formats':
                fileContainer.innerHTML = '<i class="bi bi-file-earmark-image"></i>'
                break
            case 'video_formats':
                fileContainer.innerHTML = '<i class="bi bi-file-easel"></i>'
                break
            case 'animation_formats':
                fileContainer.innerHTML = '<i class="bi bi-filetype-gif"></i>'
                break
            case 'archive_formats':
                fileContainer.innerHTML = '<i class="bi bi-file-earmark-zip"></i>'
                break
            case 'pdf_formats':
                fileContainer.innerHTML = '<i class="bi bi-file-earmark-pdf"></i>'
                break
            case 'voice_formats':
                fileContainer.innerHTML = '<i class="bi bi-file-earmark-play"></i>'
                break
            case 'audio_formats':
                fileContainer.innerHTML = '<i class="bi bi-file-earmark-music"></i>'
                break
            case 'text_formats':
                fileContainer.innerHTML = '<i class="bi bi-file-earmark-text"></i>'
                break
            case 'presentation_formats':
                fileContainer.innerHTML = '<i class="bi bi-file-earmark-ppt"></i>'
                break
        }
        fileContainer.addEventListener("click", function () {
            materialsUtilsFilePreviewByHref(f.type, f.href)
        })
        container.insertAdjacentElement("beforeend", fileContainer)
    })
    return container
}

function userLogsShowActions(actions, clear=true){
    function getElement(action){
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
                btnA.href = button.href
                btn.classList.add("btn-primary", "btn", "btn-sm", "mx-1", "my-1")
                btn.innerHTML = button.inner
                btnA.insertAdjacentElement("beforeend", btn)
                buttons.insertAdjacentElement("beforeend", btnA)
            })
            content.insertAdjacentElement("beforeend", buttons)
        }

        if (action.files.length > 0){
            li.insertAdjacentElement("beforeend", userLogsGetFilesElement(action.files))
        }

        return li
    }

    actions.forEach(action => {
        userLogsListActions.insertAdjacentElement("beforeend", getElement(action))
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

function userLogsMessagesSet(){
    function getUserListener(element, userID, mode){
        switch (mode){
            case "first":
                userLogsBodyMessagesSelectUsersFirstList.querySelectorAll("a").forEach(element => {
                    element.classList.remove("active")
                })
                element.classList.add("active")
                userLogsMessagesSelectedFirstUser = userID
                break
            case "second":
                userLogsBodyMessagesSelectUsersSecondList.querySelectorAll("a").forEach(element => {
                    element.classList.remove("active")
                })
                element.classList.add("active")
                userLogsMessagesSelectedSecondUser = userID
                break
        }
        userLogsMessagesSet()
    }

    function getUserElement(user, mode){
        const a = document.createElement("a")
        a.href = "#"
        a.classList.add("list-group-item")
        a.innerHTML = `<b>${user.role}:</b> ${user.name}`
        a.addEventListener("click", function (){
            getUserListener(a, user.id, mode)
        })
        return a
    }

    function getMessageElement(message){
        const messageDiv = document.createElement("div")
        const messageBody = document.createElement("div")
        const messageBodyText = document.createElement("p")
        const messageBodyData = document.createElement("span")
        messageDiv.classList.add("d-flex")
        if (message.type === "sender"){
            messageDiv.classList.add("justify-content-end")
            messageBody.classList.add("chats-message-sender")
        } else {
            messageDiv.classList.add("justify-content-start")
            messageBody.classList.add("chats-message-receiver")
        }
        messageDiv.insertAdjacentElement("beforeend", messageBody)
        messageBodyText.innerHTML = message.text
        messageBodyData.classList.add("chats-message-data")
        messageBodyData.innerHTML = timeUtilsDateTimeToStr(new Date(message.date))
        const read_data = Object.keys(message.read_data)
        switch (read_data.length){
            case 0:
                break
            case 1:
                const rdtObj = (message.read_data[read_data[0]])
                const rdt = new Date()
                const rdtObjM = rdtObj.month === 1 ? 12 : rdtObj.month - 1
                rdt.setUTCFullYear(rdtObj.year, rdtObjM, rdtObj.day)
                rdt.setUTCHours(rdtObj.hour, rdtObj.minute, 0, 0)
                messageBodyData.innerHTML += ` | прочитано ${timeUtilsDateTimeToStr(rdt)}`
                break
            default:
                break
        }
        messageBody.insertAdjacentElement("beforeend", messageBodyText)
        if (message.files.length > 0){
            messageBody.insertAdjacentElement("beforeend", userLogsGetFilesElement(message.files))
        }
        messageBody.insertAdjacentElement("beforeend", messageBodyData)
        return messageDiv
    }

    if (userLogsMessagesSelectedFirstUser && userLogsMessagesSelectedSecondUser){
        userLogsBodyMessagesSelectUsers.classList.add("d-none")
        userLogsBodyMessagesChat.classList.remove("d-none")
        if (!userLogsMessagesDownloaded){
            userLogsAPIGetMessages(userLogsMessagesSelectedFirstUser,
                userLogsMessagesSelectedSecondUser).then(request => {
                switch (request.status){
                    case 200:
                        userLogsBodyMessagesChatMessages.innerHTML = ""
                        userLogsBodyMessagesChatNames.innerHTML = `
                        <span>${request.response.user_first}</span>
                        <span>${request.response.user_second}</span>
                        `
                        let last_message = null
                        request.response.messages.forEach(message => {
                            const element = getMessageElement(message)
                            if (!last_message){
                                last_message = element
                            }
                            userLogsBodyMessagesChatMessages.insertAdjacentElement("afterbegin", element)
                        })
                        if (last_message){
                            last_message.scrollIntoView({block: "end", behavior: "auto"})
                        }
                }
            })
            userLogsMessagesDownloaded = true
        }
    } else {
        userLogsBodyMessagesSelectUsers.classList.remove("d-none")
        userLogsBodyMessagesChat.classList.add("d-none")
        userLogsAPIGetMessagesUsers(userLogsSelectedPlan, userLogsMessagesSelectedFirstUser).then(request => {
            switch (request.status){
                case 200:
                    if (!userLogsMessagesSelectedFirstUser){
                        userLogsBodyMessagesSelectUsersFirst.classList.remove("d-none")
                        userLogsBodyMessagesSelectUsersSecond.classList.add("d-none")
                        userLogsBodyMessagesSelectUsersFirstList.innerHTML = ""
                        request.response.forEach(user => {
                            userLogsBodyMessagesSelectUsersFirstList.insertAdjacentElement("beforeend", getUserElement(user, "first"))
                        })
                    } else {
                        userLogsBodyMessagesSelectUsersSecond.classList.remove("d-none")
                        userLogsBodyMessagesSelectUsersSecondList.innerHTML = ""
                        request.response.forEach(user => {
                            userLogsBodyMessagesSelectUsersSecondList.insertAdjacentElement("beforeend", getUserElement(user, "second"))
                        })
                    }
            }
        })
    }
}

let userLogsSelectedPlan
let userLogsCurrentOffset = 0
let userLogsFilterDateFrom = null
let userLogsFilterDateTo = null
let userLogsFilterHW = true
let userLogsFilterTGJournal = false
let userLogsFilterMessages = true
let userLogsFilterLessons = true
let userLogsFilterPlans = true

let userLogsMessagesSelectedFirstUser = null
let userLogsMessagesSelectedSecondUser = null
let userLogsMessagesDownloaded = false


const userLogsSelectPlanButton = document.querySelector("#userLogsSelectPlanButton")
const userLogsPlanInformation = document.querySelector("#userLogsPlanInformation")
const userLogsPlanInformationHeaderBtn = document.querySelector("#userLogsPlanInformationHeaderBtn")
const userLogsTabsActions = document.querySelector("#userLogsTabsActions")
const userLogsListActions = document.querySelector("#userLogsListActions")
const userLogsBodyActions = document.querySelector("#userLogsBodyActions")
const userLogsBodySpinner = document.querySelector("#userLogsBodySpinner")

const userLogsTabsMessages = document.querySelector("#userLogsTabsMessages")
const userLogsBodyMessages = document.querySelector("#userLogsBodyMessages")
const userLogsBodyMessagesSelectUsers = document.querySelector("#userLogsBodyMessagesSelectUsers")
const userLogsBodyMessagesSelectUsersFirst = document.querySelector("#userLogsBodyMessagesSelectUsersFirst")
const userLogsBodyMessagesSelectUsersFirstList = document.querySelector("#userLogsBodyMessagesSelectUsersFirstList")
const userLogsBodyMessagesSelectUsersSecond = document.querySelector("#userLogsBodyMessagesSelectUsersSecond")
const userLogsBodyMessagesSelectUsersSecondList = document.querySelector("#userLogsBodyMessagesSelectUsersSecondList")
const userLogsBodyMessagesChat = document.querySelector("#userLogsBodyMessagesChat")
const userLogsBodyMessagesChatNames = document.querySelector("#userLogsBodyMessagesChatNames")
const userLogsBodyMessagesChatMessages = document.querySelector("#userLogsBodyMessagesChatMessages")
const userLogsTabsMessagesSelectUsers = document.querySelector("#userLogsTabsMessagesSelectUsers")

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

const userLogsBodyShowMoreButton = document.querySelector("#userLogsBodyShowMoreButton")

userLogsMain()