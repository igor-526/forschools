function lessonsFiltersMain(){
    if (isAdmin){
        lessonsFilterSetCommentListeners()
        lessonsFilterInitMethodistFilter()
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
    collectionsAPIGetLessonPlaces().then(request => {
        switch (request.status){
            case 200:
                lessonsFilterSetPlaces(request.response)
                break
            default:
                showErrorToast("Не удалось загрузить места проведения занятий для фильтрации")
                break
        }
    })
}

function lessonsFilterInitMethodistFilter(){
    function clickListener(element, methodistID){
        const index = lessonsTableFilterMethodistsSelected.indexOf(methodistID)
        switch (index){
            case -1:
                element.classList.add("active")
                lessonsTableFilterMethodistsSelected.push(methodistID)
                break
            default:
                element.classList.remove("active")
                lessonsTableFilterMethodistsSelected.splice(index, 1)
                break
        }
        lessonsGet()
    }

    function getElement(methodist){
        const a = document.createElement("a")
        a.classList.add("dropdown-item")
        a.innerHTML = `${methodist.first_name} ${methodist.last_name}`
        a.href = "#"
        a.addEventListener("click", () => {
            clickListener(a, methodist.id)
        })
        return a
    }

    lessonsTableFilterMethodistList = document.querySelector("#lessonsTableFilterMethodistList")
    lessonsTableFilterMethodistSearchField = document.querySelector("#lessonsTableFilterMethodistSearchField")
    lessonsTableFilterMethodistSearchErase = document.querySelector("#lessonsTableFilterMethodistSearchErase")

    usersAPIGetAll(null, null, null, null, null,
        ["Metodist"], null, null, null,
        false).then(request => {
        switch (request.status){
            case 200:
                request.response.forEach(methodist => {
                    lessonsTableFilterMethodistList.insertAdjacentElement("beforeend", getElement(methodist))
                })
                break
            default:
                const toast = new toastEngine()
                toast.setError("Не удалось загрузить список методистов для фильтрации")
                toast.show()
                break
        }
    })

    lessonsTableFilterMethodistSearchField.addEventListener("input", () => {
        let query = lessonsTableFilterMethodistSearchField.value.trim().toLowerCase()
        if (query){
            query = new RegExp(query)
            lessonsTableFilterMethodistList.querySelectorAll("a").forEach(element => {
                query.test(element.innerHTML) ?
                    element.classList.remove("d-none") :
                    element.classList.add("d-none")
            })
        } else {
            lessonsTableFilterMethodistList.querySelectorAll("a").forEach(element => {
                element.classList.remove("d-none")
            })
        }
    })

    lessonsTableFilterMethodistSearchErase.addEventListener("click", () => {
        lessonsTableFilterMethodistList.querySelectorAll("a").forEach(element => {
            element.classList.remove("d-none")
        })
        lessonsTableFilterMethodistSearchField.value = ""
    })
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
    lessonsTableFilterPlaceField.addEventListener("input", function (){
        const places = lessonsTableFilterDatePlacesList.querySelectorAll("a")
        places.forEach(place => {
            queryTest(
                lessonsTableFilterPlaceField.value,
                place.innerHTML
            )?place.classList.remove("d-none"):place.classList.add("d-none")
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

function lessonsFilterSetPlaces(list = []){
    function clickListener(element, placeID){
        const index = lessonsTableFilterPlaces.indexOf(placeID)
        switch (index){
            case -1:
                element.classList.add("active")
                lessonsTableFilterPlaces.push(placeID)
                break
            default:
                element.classList.remove("active")
                lessonsTableFilterPlaces.splice(index, 1)
                break
        }
        lessonsGet()
    }

    function getElement(place){
        const a = document.createElement("a")
        a.classList.add("dropdown-item")
        a.innerHTML = place.name
        a.href = "#"
        a.addEventListener("click", function (){
            clickListener(a, place.id)
        })
        return a
    }

    list.forEach(place => {
        lessonsTableFilterDatePlacesList.insertAdjacentElement("beforeend", getElement(place))
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
            lessonsTableFilterTeachersSelected.length = 0
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
            lessonsTableFilterListenersSelected.length = 0
        }
    }

    function resetMethodists(){
        lessonsTableFilterMethodistSearchField.value = ""
        lessonsTableFilterMethodistList.querySelectorAll("a").forEach(element => {
            element.classList.remove("d-none")
            element.classList.remove("active")
        })
        lessonsTableFilterMethodistsSelected.length = 0
    }

    function resetPlaceSearch(resActive = false){
        lessonsTableFilterPlaceField.value = ""
        const places = lessonsTableFilterDatePlacesList.querySelectorAll("a")
        places.forEach(place => {
            place.classList.remove("d-none")
            if (resActive){
                place.classList.remove("active")
            }
        })
        if (resActive){
            lessonsTableFilterPlaces.length = 0
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
    lessonsTableFilterPlaceFieldReset.addEventListener("click", function () {
        resetPlaceSearch(true)
        lessonsGet()
    })
    lessonsTableFilterPlaceFieldErase.addEventListener("click", function () {
        resetPlaceSearch(false)
        lessonsGet()
    })
    lessonsTableFilterResetAll.addEventListener("click", function (){
        resetTeacherSearch(true)
        resetListenerSearch(true)
        resetDateStart()
        resetDateEnd()
        resetName()
        resetHW()
        resetPlaceSearch(true)
        if (isAdmin){
            resetComment()
            resetMethodists()
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
let lessonsTableFilterMethodistList
let lessonsTableFilterMethodistSearchField
let lessonsTableFilterMethodistSearchErase
const lessonsTableFilterDateStartField = document.querySelector("#lessonsTableFilterDateStartField")
const lessonsTableFilterDateStartFieldErase = document.querySelector("#lessonsTableFilterDateStartFieldErase")
const lessonsTableFilterDateEndField = document.querySelector("#lessonsTableFilterDateEndField")
const lessonsTableFilterDateEndFieldErase = document.querySelector("#lessonsTableFilterDateEndFieldErase")
const lessonsTableFilterDatePlacesList = document.querySelector("#lessonsTableFilterDatePlacesList")
const lessonsTableFilterPlaceFieldReset = document.querySelector("#lessonsTableFilterPlaceFieldReset")
const lessonsTableFilterPlaceField = document.querySelector("#lessonsTableFilterPlaceField")
const lessonsTableFilterPlaceFieldErase = document.querySelector("#lessonsTableFilterPlaceFieldErase")
const lessonsTableFilterHWAll = document.querySelector("#lessonsTableFilterHWAll")
const lessonsTableFilterHWTrue = document.querySelector("#lessonsTableFilterHWTrue")
const lessonsTableFilterHWFalse = document.querySelector("#lessonsTableFilterHWFalse")
const lessonsTableFilterResetAll = document.querySelector("#lessonsTableFilterResetAll")

lessonsFiltersMain()