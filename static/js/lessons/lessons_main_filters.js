function lessonsFiltersMain(){
    lessonsFilterResetListeners()
    lessonsFilterSearchListeners()
    usersAPIGetTeachersListeners("teacher").then(request => {
        switch (request.status){
            case 200:
                lessonsFilterSetTeachers(request.response)
                break
            default:
                showErrorToast()
                break
        }
    })
    usersAPIGetTeachersListeners("listener").then(request => {
        switch (request.status){
            case 200:
                lessonsFilterSetListeners(request.response)
                break
            default:
                showErrorToast()
                break
        }
    })
    lessonsFilterSetDateListeners()
}

function lessonsFilterSearchListeners(){
    function queryTest(query, name){
        const q = new RegExp(query.trim().toLowerCase())
        return q.test(name.trim().toLowerCase())
    }
    lessonsTableFilterTeacherSearchField.addEventListener("input", function (){
        const teachers = lessonsTableFilterTeacherList.querySelectorAll("[data-teacher-list-id]")
        teachers.forEach(teacher => {
            queryTest(
                lessonsTableFilterTeacherSearchField.value,
                teacher.innerHTML
            )?teacher.classList.remove("d-none"):teacher.classList.add("d-none")
        })
    })
    lessonsTableFilterListenerSearchField.addEventListener("input", function (){
        const listeners = lessonsTableFilterListenerList.querySelectorAll("[data-listener-list-id]")
        listeners.forEach(listener => {
            queryTest(
                lessonsTableFilterListenerSearchField.value,
                listener.innerHTML
            )?listener.classList.remove("d-none"):listener.classList.add("d-none")
        })
    })
}

function lessonsFilterSetTeachers(list = []){
    function clickListener(){
        const teacherID = Number(this.attributes.getNamedItem("data-teacher-list-id").value)
        const index = lessonsTableFilterTeachersSelected.indexOf(teacherID)
        switch (index){
            case -1:
                this.classList.add("active")
                lessonsTableFilterTeachersSelected.push(teacherID)
                break
            default:
                this.classList.remove("active")
                lessonsTableFilterTeachersSelected.splice(index, 1)
                break
        }
        lessonsGet(currentStatus, lessonsTableFilterTeachersSelected, lessonsTableFilterListenersSelected,
            lessonsTableFilterDateStart, lessonsTableFilterDateEnd)
    }

    function getElement(teacher){
        const a = document.createElement("a")
        a.classList.add("dropdown-item")
        a.innerHTML = `${teacher.first_name} ${teacher.last_name}`
        a.href = "#"
        a.setAttribute("data-teacher-list-id", teacher.id)
        a.addEventListener("click", clickListener)
        return a
    }

    list.forEach(teacher => {
        lessonsTableFilterTeacherList.insertAdjacentElement("beforeend", getElement(teacher))
    })
}

function lessonsFilterSetListeners(list = []){
    function clickListener(){
        const listenerID = Number(this.attributes.getNamedItem("data-listener-list-id").value)
        const index = lessonsTableFilterListenersSelected.indexOf(listenerID)
        switch (index){
            case -1:
                this.classList.add("active")
                lessonsTableFilterListenersSelected.push(listenerID)
                break
            default:
                this.classList.remove("active")
                lessonsTableFilterListenersSelected.splice(index, 1)
                break
        }
        lessonsGet(currentStatus, lessonsTableFilterTeachersSelected, lessonsTableFilterListenersSelected,
            lessonsTableFilterDateStart, lessonsTableFilterDateEnd)
    }

    function getElement(listener){
        const a = document.createElement("a")
        a.classList.add("dropdown-item")
        a.innerHTML = `${listener.first_name} ${listener.last_name}`
        a.href = "#"
        a.setAttribute("data-listener-list-id", listener.id)
        a.addEventListener("click", clickListener)
        return a
    }

    list.forEach(listener => {
        lessonsTableFilterListenerList.insertAdjacentElement("beforeend", getElement(listener))
    })
}

function lessonsFilterSetDateListeners(){
    function validate(){
        if (lessonsTableFilterDateStartField.value !== "" || lessonsTableFilterDateEndField.value !== ""){
            const ds = new Date(lessonsTableFilterDateStartField.value)
            const de = new Date(lessonsTableFilterDateEndField.value)
            if (ds > de){
                lessonsTableFilterDateStartField.classList.add("is-invalid")
                lessonsTableFilterDateEndField.classList.add("is-invalid")
                return false
            } else {
                return true
            }
        } else {
            return true
        }
    }

    function startListener(){
        if (validate()){
            lessonsTableFilterDateStartField.classList.remove("is-invalid")
            lessonsTableFilterDateEndField.classList.remove("is-invalid")
            lessonsTableFilterDateStart = lessonsTableFilterDateStartField.value
            lessonsGet(currentStatus, lessonsTableFilterTeachersSelected, lessonsTableFilterListenersSelected,
                lessonsTableFilterDateStart, lessonsTableFilterDateEnd)
        }
    }

    function endListener(){
        if (validate()){
            lessonsTableFilterDateEnd = lessonsTableFilterDateEndField.value
            lessonsGet(currentStatus, lessonsTableFilterTeachersSelected, lessonsTableFilterListenersSelected,
                lessonsTableFilterDateStart, lessonsTableFilterDateEnd)
        }
    }

    lessonsTableFilterDateStartField.addEventListener("input", startListener)
    lessonsTableFilterDateEndField.addEventListener("input", endListener)
}

function lessonsFilterResetListeners(){
    function resetTeacherSearch(resActive = false){
        lessonsTableFilterTeacherSearchField.value = ""
        const teachers = lessonsTableFilterTeacherList.querySelectorAll("[data-teacher-list-id]")
        teachers.forEach(teacher => {
            teacher.classList.remove("d-none")
            if (resActive){
                teacher.classList.remove("active")
            }
        })
        if (resActive){
            lessonsTableFilterTeachersSelected = []
        }
    }

    function resetListenerSearch(resActive = false){
        lessonsTableFilterListenerSearchField.value = ""
        const listeners = lessonsTableFilterListenerList.querySelectorAll("[data-listener-list-id]")
        listeners.forEach(listener => {
            listener.classList.remove("d-none")
            if (resActive){
                listener.classList.remove("active")
            }
        })
        if (resActive){
            lessonsTableFilterListenersSelected = []
        }
    }

    function resetDateStart(){
        lessonsTableFilterDateStartField.classList.remove("is-invalid")
        lessonsTableFilterDateEndField.classList.remove("is-invalid")
        lessonsTableFilterDateStartField.value = ""
        lessonsTableFilterDateStart = null
    }

    function resetDateEnd(){
        lessonsTableFilterDateStartField.classList.remove("is-invalid")
        lessonsTableFilterDateEndField.classList.remove("is-invalid")
        lessonsTableFilterDateEndField.value = ""
        lessonsTableFilterDateEnd = null
    }

    lessonsTableFilterTeacherSearchFieldErase.addEventListener("click", function () {
        resetTeacherSearch()
    })
    lessonsTableFilterListenerSearchFieldErase.addEventListener("click", function () {
        resetListenerSearch()
    })
    lessonsTableFilterDateStartFieldErase.addEventListener("click", function (){
        resetDateStart()
        lessonsGet(currentStatus, lessonsTableFilterTeachersSelected, lessonsTableFilterListenersSelected,
            lessonsTableFilterDateStart, lessonsTableFilterDateEnd)
    })
    lessonsTableFilterDateEndFieldErase.addEventListener("click", function (){
        resetDateEnd()
        lessonsGet(currentStatus, lessonsTableFilterTeachersSelected, lessonsTableFilterListenersSelected,
            lessonsTableFilterDateStart, lessonsTableFilterDateEnd)
    })
    lessonsTableFilterResetAll.addEventListener("click", function (){
        resetTeacherSearch(true)
        resetListenerSearch(true)
        resetDateStart()
        resetDateEnd()
        lessonsGet(currentStatus, lessonsTableFilterTeachersSelected, lessonsTableFilterListenersSelected,
            lessonsTableFilterDateStart, lessonsTableFilterDateEnd)
    })
}

const lessonsTableFilterTeacherList = document.querySelector("#lessonsTableFilterTeacherList")
const lessonsTableFilterTeacherSearchField = document.querySelector("#lessonsTableFilterTeacherSearchField")
const lessonsTableFilterTeacherSearchFieldErase = document.querySelector("#lessonsTableFilterTeacherSearchFieldErase")
const lessonsTableFilterListenerList = document.querySelector("#lessonsTableFilterListenerList")
const lessonsTableFilterListenerSearchField = document.querySelector("#lessonsTableFilterListenerSearchField")
const lessonsTableFilterListenerSearchFieldErase = document.querySelector("#lessonsTableFilterListenerSearchFieldErase")
const lessonsTableFilterDateStartField = document.querySelector("#lessonsTableFilterDateStartField")
const lessonsTableFilterDateStartFieldErase = document.querySelector("#lessonsTableFilterDateStartFieldErase")
const lessonsTableFilterDateEndField = document.querySelector("#lessonsTableFilterDateEndField")
const lessonsTableFilterDateEndFieldErase = document.querySelector("#lessonsTableFilterDateEndFieldErase")
const lessonsTableFilterResetAll = document.querySelector("#lessonsTableFilterResetAll")
let lessonsTableFilterTeachersSelected = []
let lessonsTableFilterListenersSelected = []
let lessonsTableFilterDateStart = null
let lessonsTableFilterDateEnd = null

lessonsFiltersMain()