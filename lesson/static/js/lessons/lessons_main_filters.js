function lessonsFiltersMain(){
    if (isAdmin){
        lessonsFilterSetCommentListeners()
    }
    lessonsFilterResetListeners()
    lessonsFilterSearchListeners()
    lessonsFilterSetHWListeners()
    lessonsFilterSetHWStatusesListeners()
    usersAPIGetTeachers().then(request => {
        switch (request.status){
            case 200:
                lessonsFilterSetTeachers(request.response)
                break
            default:
                showErrorToast()
                break
        }
    })
    usersAPIGetListeners().then(request => {
        switch (request.status){
            case 200:
                lessonsFilterSetListeners(request.response)
                break
            default:
                showErrorToast()
                break
        }
    })
    lessonsFilterSetFieldsInputListeners()
}

function lessonsFilterSetHWStatusesListeners(){
    function statusListener(status, element){
        const index = lessonsTableFilterHWStatuses.indexOf(status)
        switch (index){
            case -1:
                lessonsTableFilterHWStatuses.push(status)
                element.classList.add("active")
                break
            default:
                lessonsTableFilterHWStatuses.splice(index, 1)
                element.classList.remove("active")
                break
        }
        lessonsGet()
    }

    function agreementListener(){
        if (lessonsTableFilterHWAgreementStatus){
            lessonsTableFilterHWAgreementStatus = false
            lessonsTableFilterHWAgreement.classList.remove("active")
        } else {
            lessonsTableFilterHWAgreementStatus = true
            lessonsTableFilterHWAgreement.classList.add("active")
        }
        lessonsGet()
    }

    lessonsTableFilterHWStatus1.addEventListener("click", function () {
        statusListener(1, lessonsTableFilterHWStatus1)
    })
    lessonsTableFilterHWStatus2.addEventListener("click", function () {
        statusListener(2, lessonsTableFilterHWStatus2)
    })
    lessonsTableFilterHWStatus3.addEventListener("click", function () {
        statusListener(3, lessonsTableFilterHWStatus3)
    })
    lessonsTableFilterHWStatus4.addEventListener("click", function () {
        statusListener(4, lessonsTableFilterHWStatus4)
    })
    lessonsTableFilterHWStatus5.addEventListener("click", function () {
        statusListener(5, lessonsTableFilterHWStatus5)
    })
    lessonsTableFilterHWStatus7.addEventListener("click", function () {
        statusListener(7, lessonsTableFilterHWStatus7)
    })
    lessonsTableFilterHWAgreement.addEventListener("click", function () {
        agreementListener()
    })
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
        lessonsGet()
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
        lessonsGet()
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

function lessonsFilterSetFieldsInputListeners(){
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
            lessonsGet()
        }
    }

    function endListener(){
        if (validate()){
            lessonsTableFilterDateEnd = lessonsTableFilterDateEndField.value
            lessonsGet()
        }
    }

    function nameListener(){
        lessonsTableFilterName = lessonsTableFilterNameField.value.trim() === "" ? null : lessonsTableFilterNameField.value.trim()
        lessonsGet()
    }

    lessonsTableFilterDateStartField.addEventListener("input", startListener)
    lessonsTableFilterDateEndField.addEventListener("input", endListener)
    lessonsTableFilterNameField.addEventListener("input", nameListener)
}

function lessonsFilterSetHWListeners(){
    lessonsTableFilterHWAll.addEventListener("change", function () {
        lessonsTableFilterHW = null
        lessonsGet()
    })
    lessonsTableFilterHWTrue.addEventListener("change", function () {
        lessonsTableFilterHW = "true"
        lessonsGet()
    })
    lessonsTableFilterHWFalse.addEventListener("change", function () {
        lessonsTableFilterHW = "false"
        lessonsGet()
    })
}

function lessonsFilterSetCommentListeners(){
    lessonsTableFilterCommentAll.addEventListener("change", function () {
        lessonsTableFilterComment = null
        lessonsGet()
    })
    lessonsTableFilterCommentTrue.addEventListener("change", function () {
        lessonsTableFilterComment = "true"
        lessonsGet()
    })
    lessonsTableFilterCommentFalse.addEventListener("change", function () {
        lessonsTableFilterComment = "false"
        lessonsGet()
    })
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

    function resetName(){
        lessonsTableFilterNameField.value = ""
        lessonsTableFilterName = null
    }

    function resetHW(){
        lessonsTableFilterHW = null
        lessonsTableFilterHWAll.checked = true
        lessonsTableFilterHWTrue.checked = false
        lessonsTableFilterHWFalse.checked = false
    }

    function resetComment(){
        lessonsTableFilterComment = null
        lessonsTableFilterCommentAll.checked = true
        lessonsTableFilterCommentTrue.checked = false
        lessonsTableFilterCommentFalse.checked = false
    }

    lessonsTableFilterTeacherSearchFieldErase.addEventListener("click", function () {
        resetTeacherSearch()
    })
    lessonsTableFilterListenerSearchFieldErase.addEventListener("click", function () {
        resetListenerSearch()
    })
    lessonsTableFilterDateStartFieldErase.addEventListener("click", function (){
        resetDateStart()
        lessonsGet()
    })
    lessonsTableFilterDateEndFieldErase.addEventListener("click", function (){
        resetDateEnd()
        lessonsGet()
    })
    lessonsTableFilterNameErase.addEventListener("click", function (){
        resetName()
        lessonsGet()
    })
    lessonsTableFilterResetAll.addEventListener("click", function (){
        resetTeacherSearch(true)
        resetListenerSearch(true)
        resetDateStart()
        resetDateEnd()
        resetName()
        resetHW()
        if (isAdmin){
            resetComment()
        }
        lessonsGet()
    })
}

let lessonsTableFilterCommentAll = isAdmin ? document.querySelector("#lessonsTableFilterCommentAll") : null
let lessonsTableFilterCommentTrue = isAdmin ? document.querySelector("#lessonsTableFilterCommentTrue") : null
let lessonsTableFilterCommentFalse = isAdmin ? document.querySelector("#lessonsTableFilterCommentFalse") : null

const lessonsTableFilterHWStatus1 = document.querySelector("#lessonsTableFilterHWStatus1")
const lessonsTableFilterHWStatus2 = document.querySelector("#lessonsTableFilterHWStatus2")
const lessonsTableFilterHWStatus3 = document.querySelector("#lessonsTableFilterHWStatus3")
const lessonsTableFilterHWStatus4 = document.querySelector("#lessonsTableFilterHWStatus4")
const lessonsTableFilterHWStatus5 = document.querySelector("#lessonsTableFilterHWStatus5")
const lessonsTableFilterHWStatus7 = document.querySelector("#lessonsTableFilterHWStatus7")
const lessonsTableFilterHWAgreement = document.querySelector("#lessonsTableFilterHWAgreement")

const lessonsTableFilterNameField = document.querySelector("#lessonsTableFilterNameField")
const lessonsTableFilterNameErase = document.querySelector("#lessonsTableFilterNameErase")
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
const lessonsTableFilterHWAll = document.querySelector("#lessonsTableFilterHWAll")
const lessonsTableFilterHWTrue = document.querySelector("#lessonsTableFilterHWTrue")
const lessonsTableFilterHWFalse = document.querySelector("#lessonsTableFilterHWFalse")
const lessonsTableFilterResetAll = document.querySelector("#lessonsTableFilterResetAll")

lessonsFiltersMain()