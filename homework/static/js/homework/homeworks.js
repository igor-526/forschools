function homeworksMain(){
    homeworksFilterCurrentLesson = Number(getHashValue("lesson"))
    homeworksFilterSelectedListeners = getHashValue("listener")?[Number(getHashValue("listener"))]:[]
    homeworksFilterSelectedTeachers = getHashValue("teacher")?[Number(getHashValue("teacher"))]:[]

    if (isAdminOrMetodist){
        homeworksSetTab("all")
    } else {
        if (isTeacher){
            homeworksSetTab("checking")
        } else {
            homeworksSetTab("doing")
        }
    }
    homeworksTabAll.addEventListener("click", function () {
        homeworksSetTab("all")
    })
    homeworksTabDoing.addEventListener("click", function () {
        homeworksSetTab("doing")
    })
    homeworksTabChecking.addEventListener("click", function () {
        homeworksSetTab("checking")
    })
    homeworksTabClosed.addEventListener("click", function () {
        homeworksSetTab("closed")
    })
    homeworksTableShowMoreButton.addEventListener("click", function () {
        homeworksCurrentOffset += 50
        homeworksGet(true)
    })
}

function homeworksGet(more=false){
    if (!more && homeworksCurrentOffset !== 0){
        userLogsCurrentOffset = 0
    }
    homeworkAPIGet(homeworksCurrentOffset, homeworksFilterCurrentLesson, homeworksFilterCurrentStatus,
        homeworksFilterSelectedTeachers, homeworksFilterSelectedListeners, homeworksFilterDateFrom,
        homeworksFilterDateTo, homeworksFilterDateChangedFrom, homeworksFilterDateChangedTo).then(request => {
        switch (request.status){
            case 200:
                homeworksShow(request.response, !more)
                request.response.length === 50 ? homeworksTableShowMoreButton.classList.remove("d-none") :
                    homeworksTableShowMoreButton.classList.add("d-none")
                break
            default:
                showErrorToast()
                break
        }
    })
}

function homeworksSetTab(tab = "all"){
    switch (tab) {
        case "all":
            homeworksTabAll.classList.add("active")
            homeworksTabDoing.classList.remove("active")
            homeworksTabChecking.classList.remove("active")
            homeworksTabClosed.classList.remove("active")
            homeworksFilterCurrentStatus = null
            homeworksGet()
            break
        case "doing":
            homeworksTabAll.classList.remove("active")
            homeworksTabDoing.classList.add("active")
            homeworksTabChecking.classList.remove("active")
            homeworksTabClosed.classList.remove("active")
            homeworksFilterCurrentStatus = 7
            homeworksGet()
            break
        case "checking":
            homeworksTabAll.classList.remove("active")
            homeworksTabDoing.classList.remove("active")
            homeworksTabChecking.classList.add("active")
            homeworksTabClosed.classList.remove("active")
            homeworksFilterCurrentStatus = 3
            homeworksGet()
            break
        case "closed":
            homeworksTabAll.classList.remove("active")
            homeworksTabDoing.classList.remove("active")
            homeworksTabChecking.classList.remove("active")
            homeworksTabClosed.classList.add("active")
            homeworksFilterCurrentStatus = 4
            homeworksGet()
            break
    }
}

function homeworksShow(homeworks, clear=true){
    function getElement(hw){
        const tr = document.createElement("tr")
        if (hw.color){
            tr.classList.add(`table-${hw.color}`)
        }
        const tdName = document.createElement("td")
        const tdTeacher = document.createElement("td")
        const tdListener = document.createElement("td")
        const tdAssigned = document.createElement("td")
        const tdLastChanged = document.createElement("td")
        tr.insertAdjacentElement("beforeend", tdName)
        tr.insertAdjacentElement("beforeend", tdTeacher)
        tr.insertAdjacentElement("beforeend", tdListener)
        tr.insertAdjacentElement("beforeend", tdAssigned)
        tr.insertAdjacentElement("beforeend", tdLastChanged)
        if (hw.lesson_info){
            const tdNameLessonButtonA = document.createElement("a")
            const tdNameLessonButtonButton = document.createElement("button")
            tdNameLessonButtonA.insertAdjacentElement("beforeend", tdNameLessonButtonButton)
            tdNameLessonButtonA.href = `/lessons/${hw.lesson_info.id}`
            tdNameLessonButtonButton.classList.add("btn", "btn-sm", "btn-primary", "me-2")
            tdNameLessonButtonButton.innerHTML = '<i class="bi bi-file-earmark-text"></i>'
            tdName.setAttribute("data-bs-toggle", "tooltip")
            tdName.setAttribute("data-bs-placement", "top")
            tdName.setAttribute("title", `Занятие "${hw.lesson_info.name}" от ${new Date(hw.lesson_info.date).toLocaleDateString()}`)
            tdName.insertAdjacentElement("beforeend", tdNameLessonButtonA)
            new bootstrap.Tooltip(tdName)
        }
        tdName.innerHTML += `<a href="/homeworks/${hw.id}">${hw.name}</a>`
        tdTeacher.innerHTML = getUsersString([hw.teacher])
        tdListener.innerHTML = getUsersString([hw.listener])
        if (hw.assigned){
            tdAssigned.innerHTML = new Date(hw.assigned).toLocaleDateString()
        }
        tdLastChanged.innerHTML = `${homeworkItemShowLogsStrStatus(hw.status.status)} (${new Date(hw.status.dt).toLocaleDateString()})`
        return tr
    }

    if (clear){
        homeworksTableBody.innerHTML = ''
    }
    homeworks.forEach(hw => {
        homeworksTableBody.insertAdjacentElement("beforeend", getElement(hw))
    })
}

//Filtering
let homeworksCurrentOffset = 0
let homeworksFilterCurrentLesson
let homeworksFilterCurrentStatus = null
let homeworksFilterSelectedTeachers = []
let homeworksFilterSelectedListeners = []
let homeworksFilterDateFrom = null
let homeworksFilterDateTo = null
let homeworksFilterDateChangedFrom = null
let homeworksFilterDateChangedTo = null


//Tabs
const homeworksTabAll = document.querySelector("#homeworksTabAll")
const homeworksTabDoing = document.querySelector("#homeworksTabDoing")
const homeworksTabChecking = document.querySelector("#homeworksTabChecking")
const homeworksTabClosed = document.querySelector("#homeworksTabClosed")

//Table
const homeworksTableBody = document.querySelector("#homeworksTableBody")
const homeworksTableShowMoreButton = document.querySelector("#homeworksTableShowMoreButton")

homeworksMain()