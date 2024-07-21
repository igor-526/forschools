function lessonsMain(){
    lessonsSetUpcoming()
    lessonsTabUpcoming.addEventListener("click", lessonsSetUpcoming)
    lessonsTabPassed.addEventListener("click", lessonsSetPassed)
}

function lessonsSetUpcoming(){
    lessonsTabUpcoming.classList.add("active")
    lessonsTabPassed.classList.remove("active")
    lessonsAPIGetAll(0).then(request => {
        switch (request.status){
            case 200:
                lessonsShow(request.response)
                break
            default:
                showErrorToast()
                break
        }
    })
}

function lessonsSetPassed(){
    lessonsTabUpcoming.classList.remove("active")
    lessonsTabPassed.classList.add("active")
    lessonsAPIGetAll(1).then(request => {
        switch (request.status){
            case 200:
                lessonsShow(request.response)
                break
            default:
                showErrorToast()
                break
        }
    })
}

function lessonsShow(list){
    function getDateTime(lesson){
        let dt = ""
        if (lesson.start_time !== null){
            const st = new Date(Date.parse(`${lesson.date}T${lesson.start_time}`))
            const et = new Date(Date.parse(`${lesson.date}T${lesson.end_time}`))
            const dateDay = st.getDate().toString().padStart(2, "0")
            const dateMonth = (st.getMonth()+1).toString().padStart(2, "0")
            const stH = st.getHours().toString().padStart(2, "0")
            const stM = st.getMinutes().toString().padStart(2, "0")
            const etH = et.getHours().toString().padStart(2, "0")
            const etM = et.getMinutes().toString().padStart(2, "0")
            dt = `${dateDay}.${dateMonth} ${stH}:${stM}-${etH}:${etM}`
        } else if (lesson.date !== null){
            const date = new Date(lesson.date)
            const dateDay = date.getDate().toString().padStart(2, "0")
            const dateMonth = (date.getMonth()+1).toString().padStart(2, "0")
            dt = `${dateDay}.${dateMonth}`
        }
        return dt
    }

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
        const tdActions = document.createElement("td")
        const tdActionsGoA = document.createElement("a")
        const tdActionsGoButton = document.createElement("button")
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
        tr.insertAdjacentElement("beforeend", tdActions)
        tdActions.insertAdjacentElement("beforeend", tdActionsGoA)
        tdName.innerHTML = lesson.name
        tdDate.innerHTML = getDateTime(lesson)
        tdTeacher.innerHTML = `<a target="_blank" href="/profile/${lesson.teacher.id}">${lesson.teacher.first_name} ${lesson.teacher.last_name}</a>`
        tdListeners.innerHTML = getListeners(lesson.listeners)
        return tr
    }

    lessonsTableBody.innerHTML = ""
    list.forEach(lesson => {
        lessonsTableBody.insertAdjacentElement("beforeend", getLessonElement(lesson))
    })
}

//Tabs
const lessonsTabUpcoming = document.querySelector("#LessonsTabUpcoming")
const lessonsTabPassed = document.querySelector("#LessonsTabPassed")

//Table
const lessonsTableBody = document.querySelector("#LessonsTableBody")


lessonsMain()