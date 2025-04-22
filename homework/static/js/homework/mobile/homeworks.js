function homeworkMobileMain(){
    homeworksMobileInitFieldsSettings()
    homeworksMobileInitTabsAndButtons()
}

function homeworksMobileInitFieldsSettings(){
    switch (homeworksMobileFieldsSettingsLastStatusDate) {
        case "0":
            homeworksMobileFieldsSettingsLastStatusDate = false
            break
        case "1":
            homeworksMobileFieldsSettingsLastStatusDate = true
            break
        case null:
            cookiesUtilsSet("hwMobFieldLastStatusDate", "1")
            homeworksMobileFieldsSettingsLastStatusDate = true
            break
    }
    switch (homeworksMobileFieldsSettingsLessonName) {
        case "0":
            homeworksMobileFieldsSettingsLessonName = false
            break
        case "1":
            homeworksMobileFieldsSettingsLessonName = true
            break
        case null:
            cookiesUtilsSet("hwMobFieldLessonName", "1")
            homeworksMobileFieldsSettingsLessonName = true
            break
    }
    switch (homeworksMobileFieldsSettingsLessonDate) {
        case "0":
            homeworksMobileFieldsSettingsLessonDate = false
            break
        case "1":
            homeworksMobileFieldsSettingsLessonDate = true
            break
        case null:
            cookiesUtilsSet("hwMobFieldLessonDate", "1")
            homeworksMobileFieldsSettingsLessonDate = true
            break
    }
    switch (homeworksMobileFieldsSettingsListener) {
        case "0":
            homeworksMobileFieldsSettingsListener = false
            break
        case "1":
            homeworksMobileFieldsSettingsListener = true
            break
        case null:
            cookiesUtilsSet("hwMobFieldListener", "1")
            homeworksMobileFieldsSettingsListener = true
            break
    }
    switch (homeworksMobileFieldsSettingsTeacher) {
        case "0":
            homeworksMobileFieldsSettingsTeacher = false
            break
        case "1":
            homeworksMobileFieldsSettingsTeacher = true
            break
        case null:
            cookiesUtilsSet("hwMobFieldTeacher", "1")
            homeworksMobileFieldsSettingsTeacher = true
            break
    }
    switch (homeworksMobileFieldsSettingsAssignedDate) {
        case "0":
            homeworksMobileFieldsSettingsAssignedDate = false
            break
        case "1":
            homeworksMobileFieldsSettingsAssignedDate = true
            break
        case null:
            cookiesUtilsSet("hwMobFieldAssignedDate", "1")
            homeworksMobileFieldsSettingsAssignedDate = true
            break
    }
    switch (homeworksMobileFieldsSettingsTGButton) {
        case "0":
            homeworksMobileFieldsSettingsTGButton = false
            break
        case "1":
            homeworksMobileFieldsSettingsTGButton = true
            break
        case null:
            cookiesUtilsSet("hwMobFieldTGButton", "1")
            homeworksMobileFieldsSettingsTGButton = true
            break
    }
}

function homeworksMobileInitTabsAndButtons(){
    function tabListener(tab, elem){
        homeworksMobileFilterCurrentStatus = tab.statuses
        homeworksMobileFilterCurrentAgreement = tab.agreement
        homeworkMobileGet()
        homeworkMobileTabs.querySelectorAll("button").forEach(btn => {
            btn.classList.remove("active")
        })
        elem.classList.add("active")
    }

    function getTabElement(tab){
        const btn = document.createElement("button")
        btn.classList.add("btn-sm", "btn", "btn-outline-primary", "mx-1")
        btn.type = "button"
        btn.innerHTML = tab.name
        btn.addEventListener("click", function (){
            tabListener(tab, btn)
        })
        if (tab === homeworkMobileTabsInfo[homeworkMobileTabsInfo.length - 1]){
            btn.classList.add("active")
            tabListener(tab, btn)
        }
        return btn
    }

    function getSetFieldsButton(){
        const btn = document.createElement("button")
        btn.classList.add("btn-sm", "btn", "btn-outline-primary", "mx-1")
        btn.type = "button"
        btn.innerHTML = '<i class="bi bi-gear"></i>'
        btn.addEventListener("click", function (){
            homeworksMobileSetFieldsSetModal()
        })
        return btn
    }

    function getSetFiltersButton(){
        const btn = document.createElement("button")
        btn.classList.add("btn-sm", "btn", "btn-outline-primary", "mx-1")
        btn.type = "button"
        btn.innerHTML = '<i class="bi bi-funnel"></i>'
        btn.addEventListener("click", function (){

        })
        return btn
    }

    homeworkMobileTabsInfo.reverse().forEach(tab => {
        homeworkMobileTabs.insertAdjacentElement("afterbegin", getTabElement(tab))
    })
    homeworkMobileTabs.insertAdjacentElement("afterbegin", getSetFiltersButton())
    homeworkMobileTabs.insertAdjacentElement("afterbegin", getSetFieldsButton())
}

function homeworkMobileGet(more=false){
    if (!more && homeworksMobileCurrentOffset !== 0){
        homeworksMobileCurrentOffset = 0
    }
    homeworkAPIGet(homeworksMobileCurrentOffset, homeworksMobileFilterCurrentLesson,
        homeworksMobileFilterCurrentStatus, homeworksMobileFilterSelectedTeachers,
        homeworksMobileFilterSelectedListeners, homeworksMobileFilterDateFrom,
        homeworksMobileFilterDateTo, homeworksMobileFilterDateChangedFrom,
        homeworksMobileFilterDateChangedTo, homeworksMobileFilterName,
        homeworksMobileFilterCurrentAgreement).then(request => {
        switch (request.status){
            case 200:
                homeworksMobileShow(request.response, !more)
                // request.response.length === 50 ? homeworksTableShowMoreButton.classList.remove("d-none") :
                //     homeworksTableShowMoreButton.classList.add("d-none")
                break
            default:
                showErrorToast()
                break
        }
    })
}

function homeworksMobileShow(homeworks=[], clear=true){
    function tgSendListener(hwID){

    }

    function menuListener(hwID){

    }

    function setMoreInfoText(hw, elem){
        const inner = []
        if (hw.lesson_info && (homeworksMobileFieldsSettingsLessonName || homeworksMobileFieldsSettingsLessonDate)){
            inner.push(`
            <img src="/static/icons/lesson_grey.svg" alt="Занятие" style="height: 20px;" class="me-1">
            `)
            if (homeworksMobileFieldsSettingsLessonName){
                inner[inner.length-1] += `<span class="fw-bold">${hw.lesson_info.name}</span>`
            }
            if (homeworksMobileFieldsSettingsLessonDate){
                inner[inner.length-1] += ` от ${timeUtilsDateTimeToStr(hw.lesson_info.date, false)}`
            }
        }
        if (homeworksMobileFieldsSettingsTeacher){
            inner.push(`
            <img src="/static/icons/teacher_grey.svg" alt="Преподаватель" style="height: 20px;" class="me-1">
            ${hw.teacher.first_name} ${hw.teacher.first_name}            
            `)
        }
        if (homeworksMobileFieldsSettingsListener){
            inner.push(`
            <img src="/static/icons/student_grey.svg" alt="Ученик" style="height: 20px;" class="me-1">
            ${hw.listener.first_name} ${hw.listener.first_name}
            `)
        }
        elem.innerHTML = inner.join("<br>")
    }

    function getElement(hw){
        console.log(hw)
        const li = document.createElement("li")
        li.classList.add("list-group-item")

        const mainInfoDiv = document.createElement("div")
        mainInfoDiv.classList.add("d-flex", "justify-content-between", "mb-2")
        const mainInfoName = document.createElement("span")
        mainInfoName.classList.add("ms-2", "me-auto", "fw-bold")
        mainInfoName.innerHTML = hw.name

        if (homeworksMobileFieldsSettingsAssignedDate && hw.assigned){
            mainInfoName.innerHTML += ` (${timeUtilsDateTimeToStr(hw.assigned)})`
        }

        const mainInfoStatus = document.createElement("div")
        mainInfoStatus.style.color = "grey"
        mainInfoStatus.innerHTML = homeworkItemShowLogsStrStatus(hw.status.status)

        if (homeworksMobileFieldsSettingsLastStatusDate){
            mainInfoStatus.innerHTML += ` (${timeUtilsDateTimeToStr(hw.status.dt)})`
        }

        li.insertAdjacentElement("beforeend", mainInfoDiv)
        mainInfoDiv.insertAdjacentElement("beforeend", mainInfoName)
        mainInfoDiv.insertAdjacentElement("beforeend", mainInfoStatus)

        const moreInfoButtons = document.createElement("div")
        moreInfoButtons.classList.add("d-flex", "justify-content-between")
        const moreInfoButtonsInfo = document.createElement("div")
        moreInfoButtonsInfo.classList.add("ms-2")
        moreInfoButtonsInfo.style.color = "grey"
        setMoreInfoText(hw, moreInfoButtonsInfo)
        const moreInfoButtonsButtons = document.createElement("div")
        moreInfoButtonsButtons.classList.add("d-flex")
        moreInfoButtonsButtons.style.alignItems = "end"
        li.insertAdjacentElement("beforeend", moreInfoButtons)
        moreInfoButtons.insertAdjacentElement("beforeend", moreInfoButtonsInfo)
        moreInfoButtons.insertAdjacentElement("beforeend", moreInfoButtonsButtons)

        if (homeworksMobileFieldsSettingsTGButton){
            const moreInfoButtonsSendTG = document.createElement("button")
            moreInfoButtonsSendTG.classList.add("btn", "btn-outline-primary", "mx-1")
            moreInfoButtonsSendTG.type = "button"
            moreInfoButtonsSendTG.style.height = "50px"
            moreInfoButtonsSendTG.style.width = "50px"
            moreInfoButtonsSendTG.innerHTML = '<i class="bi bi-telegram"></i>'
            moreInfoButtonsSendTG.addEventListener("click", function () {
                tgSendListener(hw.id)
            })
            moreInfoButtonsButtons.insertAdjacentElement("beforeend", moreInfoButtonsSendTG)
        }

        const moreInfoButtonsMenu = document.createElement("button")
        moreInfoButtonsMenu.classList.add("btn", "btn-outline-primary", "mx-1")
        moreInfoButtonsMenu.type = "button"
        moreInfoButtonsMenu.style.height = "50px"
        moreInfoButtonsMenu.style.width = "50px"
        moreInfoButtonsMenu.innerHTML = '<i class="bi bi-list"></i>'
        moreInfoButtonsMenu.addEventListener("click", function () {
            menuListener(hw.id)
        })
        moreInfoButtonsButtons.insertAdjacentElement("beforeend", moreInfoButtonsMenu)




        return li
    }

    if (clear){
        homeworksMobileList.innerHTML = ""
    }

    homeworks.forEach(hw => {
        homeworksMobileList.insertAdjacentElement("beforeend", getElement(hw))
    })
}

const homeworksMobileList = document.querySelector("#homeworksMobileList")
const homeworkMobileTabs = document.querySelector("#homeworkMobileTabs")

//Filtering
let homeworksMobileCurrentOffset = 0
let homeworksMobileFilterCurrentLesson
let homeworksMobileFilterName = null
let homeworksMobileFilterCurrentStatus = []
let homeworksMobileFilterCurrentAgreement = []
let homeworksMobileFilterSelectedTeachers = []
let homeworksMobileFilterSelectedListeners = []
let homeworksMobileFilterDateFrom = null
let homeworksMobileFilterDateTo = null
let homeworksMobileFilterDateChangedFrom = null
let homeworksMobileFilterDateChangedTo = null

//FieldsSettings
let homeworksMobileFieldsSettingsLastStatusDate = cookiesUtilsGet("hwMobFieldLastStatusDate")
let homeworksMobileFieldsSettingsLessonName = cookiesUtilsGet("hwMobFieldLessonName")
let homeworksMobileFieldsSettingsLessonDate = cookiesUtilsGet("hwMobFieldLessonDate")
let homeworksMobileFieldsSettingsListener = cookiesUtilsGet("hwMobFieldListener")
let homeworksMobileFieldsSettingsTeacher = cookiesUtilsGet("hwMobFieldTeacher")
let homeworksMobileFieldsSettingsAssignedDate = cookiesUtilsGet("hwMobFieldAssignedDate")
let homeworksMobileFieldsSettingsTGButton = cookiesUtilsGet("hwMobFieldTGButton")

homeworkMobileMain()