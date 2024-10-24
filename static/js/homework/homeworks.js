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
}

function homeworksGet(status = homeworksFilterCurrentStatus,
                            teachers = homeworksFilterSelectedTeachers,
                            listeners = homeworksFilterSelectedListeners,
                            dateFrom = homeworksFilterDateFrom,
                            dateTo = homeworksFilterDateTo){
    homeworksFilterCurrentStatus = status
    homeworkAPIGet(homeworksFilterCurrentLesson, status, teachers,
        listeners, dateFrom, dateTo).then(request => {
        switch (request.status){
            case 200:
                homeworksShow(request.response)
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
            homeworksGet(null)
            break
        case "doing":
            homeworksTabAll.classList.remove("active")
            homeworksTabDoing.classList.add("active")
            homeworksTabChecking.classList.remove("active")
            homeworksTabClosed.classList.remove("active")
            homeworksGet(7)
            break
        case "checking":
            homeworksTabAll.classList.remove("active")
            homeworksTabDoing.classList.remove("active")
            homeworksTabChecking.classList.add("active")
            homeworksTabClosed.classList.remove("active")
            homeworksGet(3)
            break
        case "closed":
            homeworksTabAll.classList.remove("active")
            homeworksTabDoing.classList.remove("active")
            homeworksTabChecking.classList.remove("active")
            homeworksTabClosed.classList.add("active")
            homeworksGet(4)
            break
    }
}

function homeworksShow(homeworks){
    function getElement(hw){
        console.log(hw)
        const tr = document.createElement("tr")
        switch (hw.status){
            case 1:
                tr.classList.add("table-secondary")
                break
            case 2:
                tr.classList.add("table-warning")
                break
            case 3:
                tr.classList.add("table-warning")
                break
            case 5:
                tr.classList.add("table-warning")
                break
            case 4:
                tr.classList.add("table-success")
                break
            case 6:
                tr.classList.add("table-danger")
                break
            case 7:
                tr.classList.add("table-primary")
                break
        }
        const tdName = document.createElement("td")
        const tdTeacher = document.createElement("td")
        const tdListener = document.createElement("td")
        const tdAssigned = document.createElement("td")
        const tdDeadline = document.createElement("td")
        tr.insertAdjacentElement("beforeend", tdName)
        tr.insertAdjacentElement("beforeend", tdTeacher)
        tr.insertAdjacentElement("beforeend", tdListener)
        tr.insertAdjacentElement("beforeend", tdAssigned)
        tr.insertAdjacentElement("beforeend", tdDeadline)
        if (hw.lesson_info){
            const tdNameLessonButtonA = document.createElement("a")
            const tdNameLessonButtonButton = document.createElement("button")
            tdNameLessonButtonA.insertAdjacentElement("beforeend", tdNameLessonButtonButton)
            tdNameLessonButtonA.target = "_blank"
            tdNameLessonButtonA.href = `/lessons/${hw.lesson_info.id}`
            tdNameLessonButtonButton.classList.add("btn", "btn-sm", "btn-primary", "me-2")
            tdNameLessonButtonButton.innerHTML = '<i class="bi bi-file-earmark-text"></i>'
            tdName.setAttribute("data-bs-toggle", "tooltip")
            tdName.setAttribute("data-bs-placement", "top")
            tdName.setAttribute("title", `Занятие "${hw.lesson_info.name}" от ${new Date(hw.lesson_info.date).toLocaleDateString()}`)
            tdName.insertAdjacentElement("beforeend", tdNameLessonButtonA)
            new bootstrap.Tooltip(tdName)
        }
        tdName.innerHTML += `<a target="_blank" href="/homeworks/${hw.id}">${hw.name}</a>`
        tdTeacher.innerHTML = `<a target="_blank" href="/profile/${hw.teacher.id}">${hw.teacher.first_name} ${hw.teacher.last_name}</a>`
        tdListener.innerHTML = `<a target="_blank" href="/profile/${hw.listener.id}">${hw.listener.first_name} ${hw.listener.last_name}</a>`
        if (hw.assigned){
            tdAssigned.innerHTML = new Date(hw.assigned).toLocaleDateString()
            tdDeadline.innerHTML = new Date(hw.deadline).toLocaleDateString()
        }
        return tr
    }

    homeworksTableBody.innerHTML = ''
    homeworks.forEach(hw => {
        homeworksTableBody.insertAdjacentElement("beforeend", getElement(hw))
    })
}

//Filtering
let homeworksFilterCurrentLesson
let homeworksFilterCurrentStatus = null
let homeworksFilterSelectedTeachers = []
let homeworksFilterSelectedListeners = []
let homeworksFilterDateFrom = null
let homeworksFilterDateTo = null


//Tabs
const homeworksTabAll = document.querySelector("#homeworksTabAll")
const homeworksTabDoing = document.querySelector("#homeworksTabDoing")
const homeworksTabChecking = document.querySelector("#homeworksTabChecking")
const homeworksTabClosed = document.querySelector("#homeworksTabClosed")

//Table
const homeworksTableBody = document.querySelector("#homeworksTableBody")

homeworksMain()