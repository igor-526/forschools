function homeworksMain(){
    homeworksFilterCurrentLesson = Number(getHashValue("lesson"))
    homeworksFilterSelectedListeners = getHashValue("listener")?[Number(getHashValue("listener"))]:[]
    homeworksFilterSelectedTeachers = getHashValue("teacher")?[Number(getHashValue("teacher"))]:[]
    homeworksInitTabs()
    homeworksTableShowMoreButton.addEventListener("click", function () {
        homeworksCurrentOffset += 50
        homeworksGet(true)
    })
}

function homeworksInitTabs(){
    function tabListener(tab){
        homeworksFilterCurrentStatus = tab.statuses
        homeworksFilterCurrentAgreement = tab.agreement
        homeworksGet()
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
        if (tab === homeworkTabsInfo[homeworkTabsInfo.length - 1]){
            btn.classList.add("active")
            tabListener(tab)
        }
        li.insertAdjacentElement("beforeend", btn)
        return li
    }

    homeworkTabsInfo.reverse().forEach(tab => {
        homeworkTabs.insertAdjacentElement("afterbegin", getTabElement(tab))
    })
}

function homeworksGet(more=false){
    if (!more && homeworksCurrentOffset !== 0){
        homeworksCurrentOffset = 0
    }
    homeworkAPIGet(homeworksCurrentOffset, homeworksFilterCurrentLesson,
        homeworksFilterCurrentStatus, homeworksFilterSelectedTeachers,
        homeworksFilterSelectedListeners, homeworksFilterSelectedMethodists, homeworksFilterDateFrom,
        homeworksFilterDateTo, homeworksFilterDateChangedFrom,
        homeworksFilterDateChangedTo, homeworksFilterName,
        homeworksFilterCurrentAgreement).then(request => {
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
            tdName.setAttribute("data-bs-toggle", "tooltip")
            tdName.setAttribute("data-bs-placement", "top")
            tdName.setAttribute("title", `Занятие "${hw.lesson_info.name}" от ${new Date(hw.lesson_info.date).toLocaleDateString()}`)
            new bootstrap.Tooltip(tdName)
        }
        tdName.innerHTML += hw.name
        tdTeacher.innerHTML = getUsersString([hw.teacher])
        tdListener.innerHTML = getUsersString([hw.listener])
        if (hw.assigned){
            tdAssigned.innerHTML = timeUtilsDateTimeToStr(hw.assigned)
        }
        tdLastChanged.innerHTML = `${homeworkItemShowLogsStrStatus(hw.status.status)} (${new Date(hw.status.dt).toLocaleDateString()})`
        tr.addEventListener("click", (e) => {
            const hwUtils = new homeworkUtils(hw)
            hwUtils.showOffcanvas(true)
        })
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
let homeworksFilterName = null
let homeworksFilterCurrentStatus = []
let homeworksFilterCurrentAgreement = []
let homeworksFilterSelectedMethodists = []
let homeworksFilterSelectedTeachers = []
let homeworksFilterSelectedListeners = []
let homeworksFilterDateFrom = null
let homeworksFilterDateTo = null
let homeworksFilterDateChangedFrom = null
let homeworksFilterDateChangedTo = null

const homeworkTabs = document.querySelector("#homeworkTabs")

//Table
const homeworksTableBody = document.querySelector("#homeworksTableBody")
const homeworksTableShowMoreButton = document.querySelector("#homeworksTableShowMoreButton")

homeworksMain()