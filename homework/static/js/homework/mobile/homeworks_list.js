function homeworkMobileMain(){
    homeworksMobileFilterCurrentLesson = getHashValue("lesson_id")
    homeworksMobileInitTabsAndButtons()
    window.addEventListener("scroll", () => {
        if (homeworkMobileAutoRequest && (document.body.scrollHeight-window.innerHeight-window.scrollY < 0)){
            homeworkMobileAutoRequest = false
            homeworksMobileCurrentOffset += 50
            homeworkMobileGet(true)
        }
    })
    const hwToOpen = getHashValue("open")
    if (hwToOpen){
        homeworkItemShowOffcanvas(hwToOpen)
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
        btn.addEventListener("click", homeworksMobileFiltersSetModal)
        return btn
    }

    homeworkMobileTabsInfo.reverse().forEach(tab => {
        homeworkMobileTabs.insertAdjacentElement("afterbegin", getTabElement(tab))
    })
    homeworkMobileTabs.insertAdjacentElement("afterbegin", getSetFiltersButton())
    homeworkMobileTabs.insertAdjacentElement("afterbegin", getSetFieldsButton())
}

function homeworkMobileGet(more=false){
    homeworkMobileListLoadingSpinner.classList.remove("d-none")
    if (!more && homeworksMobileCurrentOffset !== 0){
        homeworksMobileCurrentOffset = 0
    }
    if (!more){
        homeworksMobileList.innerHTML = ""
    }
    homeworkAPIGet(homeworksMobileCurrentOffset, homeworksMobileFilterCurrentLesson,
        homeworksMobileFilterCurrentStatus, homeworksMobileFilterSelectedTeachers,
        homeworksMobileFilterSelectedListeners, homeworksMobileFilterDateFrom,
        homeworksMobileFilterDateTo, homeworksMobileFilterDateChangedFrom,
        homeworksMobileFilterDateChangedTo, homeworksMobileFilterName,
        homeworksMobileFilterCurrentAgreement).then(request => {
        homeworkMobileListLoadingSpinner.classList.add("d-none")
        switch (request.status){
            case 200:
                homeworkMobileAutoRequest = request.response.length === 50
                homeworksMobileShow(request.response)
                break
            default:
                showErrorToast()
                break
        }
    })
}

function homeworksMobileShow(homeworks=[]){
    function setMoreInfoText(hw, elem){
        if (hw.lesson_info && (cookiesUtilsGet("hwMobFieldLessonName") === "1" || cookiesUtilsGet("hwMobFieldLessonDate") === "1")){
            const lessonP = document.createElement("p")
            const lessonIcon = iconUtilsGetIcon(
                "lesson_grey.svg", "Занятие"
            )
            lessonIcon.classList.add("me-1")
            lessonP.classList.add("mb-0")
            lessonP.insertAdjacentElement("beforeend", lessonIcon)

            if (cookiesUtilsGet("hwMobFieldLessonName") === "1"){
                const lessonNameSpan = document.createElement("span")
                lessonNameSpan.classList.add("fw-bold")
                lessonNameSpan.innerHTML = hw.lesson_info.name
                lessonP.insertAdjacentElement("beforeend", lessonNameSpan)
            }
            if (cookiesUtilsGet("hwMobFieldLessonDate") === "1"){
                const lessonDTSpan = document.createElement("span")
                lessonDTSpan.innerHTML = ` от ${timeUtilsDateTimeToStr(hw.lesson_info.date, false)}`
                lessonP.insertAdjacentElement("beforeend", lessonDTSpan)
            }
            elem.insertAdjacentElement("beforeend", lessonP)
        }
        if (cookiesUtilsGet("hwMobFieldTeacher") === "1"){

            const teacherP = document.createElement("p")
            teacherP.classList.add("mb-0")
            const teacherIcon = iconUtilsGetIcon(
                "teacher_grey.svg", "Преподавтаель"
            )
            teacherIcon.classList.add("me-1")
            teacherP.insertAdjacentElement("beforeend", teacherIcon)
            teacherP.innerHTML += `${hw.teacher.first_name} ${hw.teacher.last_name}`
            elem.insertAdjacentElement("beforeend", teacherP)
        }
        if (cookiesUtilsGet("hwMobFieldListener") === "1"){
            const listenerIcon = iconUtilsGetIcon(
                "student_grey.svg", "Ученик"
            )
            listenerIcon.classList.add("me-1")
            const listenerP = document.createElement("span")
            listenerP.classList.add("mb-0")
            listenerP.insertAdjacentElement("beforeend", listenerIcon)
            listenerP.innerHTML += `${hw.listener.first_name} ${hw.listener.last_name}`
            elem.insertAdjacentElement("beforeend", listenerP)
        }
    }

    function getElement(hw){
        const li = document.createElement("li")
        li.classList.add("list-group-item")
        if (hw.color){
            li.classList.add(`list-group-item-${hw.color}`)
        }

        const mainInfoDiv = document.createElement("div")
        mainInfoDiv.classList.add("d-flex", "justify-content-between", "mb-2")
        const mainInfoName = document.createElement("span")
        mainInfoName.classList.add("ms-2", "me-auto", "fw-bold")
        mainInfoName.innerHTML = hw.name

        if (cookiesUtilsGet("hwMobFieldAssignedDate") === "1" && hw.assigned){
            mainInfoName.innerHTML += ` (${timeUtilsDateTimeToStr(hw.assigned)})`
        }

        const mainInfoStatus = document.createElement("div")
        mainInfoStatus.style.color = "grey"
        mainInfoStatus.innerHTML = homeworkItemShowLogsStrStatus(hw.status.status)

        if (cookiesUtilsGet("hwMobFieldLastStatusDate") === "1"){
            mainInfoStatus.innerHTML += ` (${timeUtilsDateTimeToStr(hw.status.dt)})`
        }

        li.insertAdjacentElement("beforeend", mainInfoDiv)
        mainInfoDiv.insertAdjacentElement("beforeend", mainInfoName)
        mainInfoDiv.insertAdjacentElement("beforeend", mainInfoStatus)

        const moreInfoButtonsInfo = document.createElement("div")
        moreInfoButtonsInfo.classList.add("ms-2")
        moreInfoButtonsInfo.style.color = "grey"
        setMoreInfoText(hw, moreInfoButtonsInfo)
        li.insertAdjacentElement("beforeend", moreInfoButtonsInfo)

        li.addEventListener("click", function () {
            homeworkItemShowOffcanvas(hw.id)
        })
        return li
    }

    homeworks.forEach(hw => {
        homeworksMobileList.insertAdjacentElement("beforeend", getElement(hw))
    })
}

let homeworkMobileAutoRequest = false
const homeworksMobileList = document.querySelector("#homeworksMobileList")
const homeworkMobileTabs = document.querySelector("#homeworkMobileTabs")
const homeworkMobileListLoadingSpinner = document.querySelector("#homeworkMobileListLoadingSpinner")

//Filtering
let homeworksMobileCurrentOffset = 0
let homeworksMobileFilterCurrentLesson = null
let homeworksMobileFilterName = null
let homeworksMobileFilterCurrentStatus = []
let homeworksMobileFilterCurrentAgreement = []
let homeworksMobileFilterSelectedTeachers = []
let homeworksMobileFilterSelectedListeners = []
let homeworksMobileFilterDateFrom = null
let homeworksMobileFilterDateTo = null
let homeworksMobileFilterDateChangedFrom = null
let homeworksMobileFilterDateChangedTo = null

homeworkMobileMain()