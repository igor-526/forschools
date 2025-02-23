function homeworkListMAMain(){
    homeworkListMAInitTabs()
}

function homeworkListMAInitTabs(){
    function tabListener(tab){
        homeworkListMAFiltersStatus = tab.statuses
        homeworkListMAFiltersAgreement = tab.agreement
        homeworkListMAGet()
    }

    function getTabElement(tab){
        const li = document.createElement("li")
        li.classList.add("nav-item")
        li.role = "presentation"
        const btn = document.createElement("button")
        btn.classList.add("nav-link")
        btn.setAttribute("data-bs-toggle", "pill")
        btn.type = "button"
        btn.role = "tab"
        btn.innerHTML = tab.name
        btn.addEventListener("click", function (){
            tabListener(tab)
        })
        if (tab === homeworkListMATabsInfo[homeworkListMATabsInfo.length - 1]){
            btn.classList.add("active")
            tabListener(tab)
        }
        li.insertAdjacentElement("beforeend", btn)
        return li
    }

    homeworkListMATabsInfo.reverse().forEach(tab => {
        homeworkListMATabs.insertAdjacentElement("afterbegin", getTabElement(tab))
    })
}

function homeworkListMAGet(){
    homeworkAPIGet(null, null, homeworkListMAFiltersStatus,
        homeworkListMAFiltersTeachers, homeworkListMAFiltersListeners,
        homeworkListMAFiltersAssignedFrom, homeworkListMAFiltersAssignedTo,
        homeworkListMAFiltersChangedFrom, homeworkListMAFiltersChangedTo,
        homeworkListMAFiltersName, homeworkListMAFiltersAgreement).then(request => {
        switch (request.status){
            case 200:
                homeworkListMAShow(request.response)
                break
            default:
                alert("Не удалось загрузить ДЗ")
                break
        }
    })
}

function homeworkListMAShow(homeworks, clear=true){
    function telegramButtonListener(hwID){
        homeworkAPISendTelegram(hwID, tgUserdata.user.id).then(request => {
            switch (request.status){
                case 200:
                    tgAPI.close()
                    break
                default:
                    alert("Не удалось отправить ДЗ")
                    break
            }
        })
    }

    function getHomeworkElement(hw){
        const card = document.createElement("div")
        card.classList.add("card", "mb-1")
        if (hw.color){
            card.classList.add(`border-${hw.color}`)
        }
        const cardBody = document.createElement("div")
        cardBody.classList.add("card-body")
        const mainTitle = document.createElement("h5")
        const secondaryTitle = document.createElement("h6")
        const bodyText = document.createElement("p")
        const buttonsBlock = document.createElement("div")
        const buttonsBlockLeft = document.createElement("div")
        const buttonsBlockRight = document.createElement("div")
        mainTitle.classList.add("card-title")
        secondaryTitle.classList.add("card-subtitle", "mb-2", "text-muted")
        bodyText.classList.add("card-text")
        buttonsBlock.classList.add("d-flex", "justify-content-between")

        mainTitle.innerHTML = hw.name
        secondaryTitle.innerHTML = `${homeworkItemShowLogsStrStatus(hw.status.status)} (${timeUtilsDateTimeToStr(hw.status.dt)})`
        if (hw.assigned){
            bodyText.innerHTML = `<b>Задано: </b>${timeUtilsDateTimeToStr(hw.assigned)}`
        }
        if (homeworkListMASettingTeacher){
            bodyText.innerHTML += `<br><b>Преподаватель: </b>${hw.teacher.first_name} ${hw.teacher.last_name}`
        }
        if (homeworkListMASettingListener){
            bodyText.innerHTML += `<br><b>Ученик: </b>${hw.listener.first_name} ${hw.listener.last_name}`
        }

        const hwButton = document.createElement("a")
        hwButton.classList.add("btn", "btn-outline-primary", "btn-sm")
        hwButton.href = `/ma/homeworks/${hw.id}/`
        hwButton.innerHTML = 'История <i class="bi bi-globe"></i>'
        buttonsBlockLeft.insertAdjacentElement("beforeend", hwButton)

        if (hw.lesson_info){
            bodyText.innerHTML += `<br><b>Занятие: </b>${hw.lesson_info.name} от ${new Date(hw.lesson_info.date).toLocaleDateString()}`
        }

        const tgButton = document.createElement("button")
        tgButton.classList.add("btn", "btn-outline-primary", "btn-sm")
        tgButton.innerHTML = 'Открыть <i class="bi bi-telegram"></i>'
        buttonsBlockRight.insertAdjacentElement("beforeend", tgButton)
        tgButton.addEventListener("click", function (){
            telegramButtonListener(hw.id)
        })

        card.insertAdjacentElement("beforeend", cardBody)
        cardBody.insertAdjacentElement("beforeend", mainTitle)
        cardBody.insertAdjacentElement("beforeend", secondaryTitle)
        cardBody.insertAdjacentElement("beforeend", bodyText)
        cardBody.insertAdjacentElement("beforeend", buttonsBlock)
        buttonsBlock.insertAdjacentElement("beforeend", buttonsBlockLeft)
        buttonsBlock.insertAdjacentElement("beforeend", buttonsBlockRight)
        return card
    }

    if (clear){
        homeworkListMAList.innerHTML = ""
    }
    homeworks.forEach(hw => {
        homeworkListMAList.insertAdjacentElement("beforeend", getHomeworkElement(hw))
    })
}

const homeworkListMATabs = document.querySelector("#homeworkListMATabs")
const homeworkListMAList = document.querySelector("#homeworkListMAList")

let homeworkListMAFiltersStatus = []
let homeworkListMAFiltersAgreement = []
let homeworkListMAFiltersName = null

let homeworkListMAFiltersAssignedFrom = null
let homeworkListMAFiltersAssignedTo = null
let homeworkListMAFiltersChangedFrom = null
let homeworkListMAFiltersChangedTo = null
let homeworkListMAFiltersListeners = []
let homeworkListMAFiltersTeachers = []

homeworkListMAMain()