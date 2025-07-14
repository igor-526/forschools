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
        homeworksFilterCurrentAgreement, homeworksFilterComment).then(request => {
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
        const hwUtils = new homeworkUtils(hw)
        return hwUtils.getDesktopTableElement()
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
let homeworksFilterComment = null

const homeworkTabs = document.querySelector("#homeworkTabs")

//Table
const homeworksTableBody = document.querySelector("#homeworksTableBody")
const homeworksTableShowMoreButton = document.querySelector("#homeworksTableShowMoreButton")

homeworksMain()