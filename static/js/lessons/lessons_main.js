function lessonsMain(){
    const teacher = getHashValue("teacher")
    const listener = getHashValue("listener")
    lessonsTableFilterTeachersSelected = teacher ? [teacher] : []
    lessonsTableFilterListenersSelected = listener ? [listener] : []
    lessonsSetUpcoming()

    lessonsTabUpcoming.addEventListener("click", lessonsSetUpcoming)
    lessonsTabPassed.addEventListener("click", lessonsSetPassed)
    lessonsTableShowMoreButton.addEventListener("click", function (){
        lessonsCurrentOffset += 50
        lessonsGet(true)
    })
}

function lessonsSetUpcoming(){
    lessonsTabUpcoming.classList.add("active")
    lessonsTabPassed.classList.remove("active")
    lessonsCurrentStatus = 0
    lessonsGet()
}

function lessonsSetPassed(){
    lessonsTabUpcoming.classList.remove("active")
    lessonsTabPassed.classList.add("active")
    lessonsCurrentStatus = 1
    lessonsGet()
}

function lessonsGet(more=false){
    if (!more && lessonsCurrentOffset !== 0){
        lessonsCurrentOffset = 0
    }
    lessonsAPIGetAll(lessonsCurrentOffset, lessonsCurrentStatus, lessonsTableFilterTeachersSelected,
        lessonsTableFilterListenersSelected, lessonsTableFilterDateStart, lessonsTableFilterDateEnd,
        lessonsTableFilterHW).then(request => {
        switch (request.status){
            case 200:
                lessonsShow(request.response, !more)
                request.response.length === 50 ? lessonsTableShowMoreButton.classList.remove("d-none") :
                    lessonsTableShowMoreButton.classList.add("d-none")
                break
            default:
                showErrorToast()
                break
        }
    })
}

function lessonsShow(list, clear=true){
    function getListeners(listeners){
        const listenersArray = listeners.map(listener => {
            return `<a target="_blank" href="/profile/${listener.id}">${listener.first_name} ${listener.last_name}</a>`
        })
        return listenersArray.join("<br>")
    }

    function getLessonElement(lesson){
        const tr = document.createElement("tr")
        const tdName = document.createElement("td")
        const tdDate = document.createElement("td")
        const tdTeacher = document.createElement("td")
        const tdListeners = document.createElement("td")
        const tdHomeworks = document.createElement("td")
        const tdHomeworksA = document.createElement("a")
        const tdActions = document.createElement("td")
        const tdActionsGoA = document.createElement("a")
        const tdActionsGoButton = document.createElement("button")

        switch (lesson.status){
            case 0:
                if (lesson.awaiting_action){
                    tr.classList.add("table-warning")
                }
                break
            case 1:
                tr.classList.add("table-success")
                break
            case 2:
                tr.classList.add("table-danger")
                break
        }
        tdHomeworksA.classList.add("btn", `btn-${lesson.hw_data.color}`)
        tdHomeworksA.innerHTML = lesson.hw_data.count
        tdHomeworks.insertAdjacentElement("beforeend", tdHomeworksA)
        switch (lesson.hw_data.count){
            case 0:
                tdHomeworksA.href = "#"
                // tdHomeworksButton.disabled = true
                break
            default:
                tdHomeworksA.target = "_blank"
                tdHomeworksA.href = `/homeworks/#lesson=${lesson.id}`
                break
        }
        tdActionsGoA.target = "_blank"
        tdActionsGoA.href = `/lessons/${lesson.id}`
        tdActionsGoButton.type = "button"
        tdActionsGoButton.classList.add("btn", "btn-primary")
        tdActionsGoButton.innerHTML = '<i class="bi bi-chevron-right"></i>'
        tdActionsGoA.insertAdjacentElement("beforeend", tdActionsGoButton)
        tr.insertAdjacentElement("beforeend", tdName)
        tr.insertAdjacentElement("beforeend", tdDate)
        tr.insertAdjacentElement("beforeend", tdTeacher)
        tr.insertAdjacentElement("beforeend", tdListeners)
        tr.insertAdjacentElement("beforeend", tdHomeworks)
        tr.insertAdjacentElement("beforeend", tdActions)
        tdActions.insertAdjacentElement("beforeend", tdActionsGoA)
        tdName.innerHTML = lesson.name
        tdDate.innerHTML = getLessonDateTimeRangeString(lesson)
        tdTeacher.innerHTML = `<a target="_blank" href="/profile/${lesson.teacher.id}">${lesson.teacher.first_name} ${lesson.teacher.last_name}</a>`
        tdListeners.innerHTML = getListeners(lesson.listeners)
        return tr
    }

    if (clear){
        lessonsTableBody.innerHTML = ""
    }
    list.forEach(lesson => {
        lessonsTableBody.insertAdjacentElement("beforeend", getLessonElement(lesson))
    })
}

//Tabs
const lessonsTabUpcoming = document.querySelector("#LessonsTabUpcoming")
const lessonsTabPassed = document.querySelector("#LessonsTabPassed")

//Table
const lessonsTableBody = document.querySelector("#LessonsTableBody")
const lessonsTableShowMoreButton = document.querySelector("#lessonsTableShowMoreButton")

//Filters
let lessonsTableFilterTeachersSelected
let lessonsTableFilterListenersSelected
let lessonsTableFilterDateStart = null
let lessonsTableFilterDateEnd = null
let lessonsTableFilterHW = null
let lessonsCurrentStatus = 0
let lessonsCurrentOffset = 0


lessonsMain()