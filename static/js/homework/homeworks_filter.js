function homeworksFilterMain(){
    homeworksFilterSetTeachersListeners()
    homeworksFilterEraseListeners()
    homeworksFilterListeners()
    homeworksFilterSearchListeners()
}

function homeworksFilterSetTeachersListeners(){
    function getEventListener(element, userID, list){
        const index = list.indexOf(userID)
        switch (index){
            case -1:
                list.push(userID)
                element.classList.add("active")
                break
            default:
                list.splice(index, 1)
                element.classList.remove("active")
                break
        }
        homeworksGet()
    }

    function getElement(user, role){
        const a = document.createElement("a")
        a.classList.add("dropdown-item")
        a.href = "#"
        a.innerHTML = `${user.first_name} ${user.last_name}`
        switch (role){
            case "teacher":
                a.setAttribute("data-teacher-list-id", user.id)
                a.addEventListener("click", function () {
                    getEventListener(a, Number(user.id), homeworksFilterSelectedTeachers)
                })
                break
            case "listener":
                a.setAttribute("data-listener-list-id", user.id)
                a.addEventListener("click", function () {
                    getEventListener(a, Number(user.id), homeworksFilterSelectedListeners)
                })
                break
            default:
                break
        }
        return a
    }

    usersAPIGetTeachers().then(request => {
        switch (request.status){
            case 200:
                request.response.forEach(teacher => {
                    homeworksTableFilterTeacherList.insertAdjacentElement("beforeend", getElement(teacher, 'teacher'))
                })
                break
            default:
                showErrorToast()
                break
        }
    })
    usersAPIGetListeners().then(request => {
        switch (request.status){
            case 200:
                request.response.forEach(listener => {
                    homeworksTableFilterListenerList.insertAdjacentElement("beforeend", getElement(listener, 'listener'))
                })
                break
            default:
                showErrorToast()
                break
        }
    })
}

function homeworksFilterEraseListeners(){
    function eraseTeachersSearchField(remActive = false){
        homeworksTableFilterTeacherSearchField.value = ""
        homeworksTableFilterTeacherList.querySelectorAll("a").forEach(elem => {
            elem.classList.remove("d-none")
            if (remActive){
                elem.classList.remove("active")
            }
        })
    }

    function eraseListenersSearchField(remActive = false){
        homeworksTableFilterListenerSearchField.value = ""
        homeworksTableFilterListenerList.querySelectorAll("a").forEach(elem => {
            elem.classList.remove("d-none")
            if (remActive){
                elem.classList.remove("active")
            }
        })
    }

    function eraseDateStartField(){
        homeworksTableFilterDateStartField.value = ""
        homeworksFilterDateFrom = null
        homeworksTableFilterDateStartField.classList.remove("is-invalid")
        homeworksTableFilterDateEndField.classList.remove("is-invalid")
    }

    function eraseDateEndField(){
        homeworksTableFilterDateEndField.value = ""
        homeworksFilterDateTo = null
        homeworksTableFilterDateStartField.classList.remove("is-invalid")
        homeworksTableFilterDateEndField.classList.remove("is-invalid")
    }

    function cancelTeachersSearchField(){
        eraseTeachersSearchField(true)
        homeworksFilterSelectedTeachers = []
    }

    function cancelListenersSearchField(){
        eraseListenersSearchField(true)
        homeworksFilterSelectedListeners = []
    }

    homeworksTableFilterResetAll.addEventListener("click", function () {
        eraseDateStartField()
        eraseDateEndField()
        cancelTeachersSearchField()
        cancelListenersSearchField()
        homeworksFilterCurrentLesson = null
        homeworksGet()
    })
    homeworksTableFilterTeacherSearchFieldReset.addEventListener("click", function () {
        cancelTeachersSearchField()
        homeworksGet()
    })
    homeworksTableFilterListenerSearchFieldReset.addEventListener("click", function () {
        cancelListenersSearchField()
        homeworksGet()
    })
    homeworksTableFilterTeacherSearchFieldErase.addEventListener("click", function () {
        eraseTeachersSearchField()
    })
    homeworksTableFilterListenerSearchFieldErase.addEventListener("click", function () {
        eraseListenersSearchField()
    })
    homeworksTableFilterDateStartFieldErase.addEventListener("click", function () {
        eraseDateStartField()
        homeworksGet()
    })
    homeworksTableFilterDateEndFieldErase.addEventListener("click", function () {
        eraseDateEndField()
        homeworksGet()
    })

}

function homeworksFilterSearchListeners(){
    function regExpFilter(query, name){
        const q = new RegExp(query.trim().toLowerCase())
        return q.test(name.trim().toLowerCase())
    }

    homeworksTableFilterTeacherSearchField.addEventListener("input", function () {
        homeworksTableFilterTeacherList.querySelectorAll("a").forEach(elem => {
            regExpFilter(homeworksTableFilterTeacherSearchField.value, elem.innerHTML)?
                elem.classList.remove("d-none"):elem.classList.add("d-none")
        })
    })
    homeworksTableFilterListenerSearchField.addEventListener("input", function () {
        homeworksTableFilterListenerList.querySelectorAll("a").forEach(elem => {
            regExpFilter(homeworksTableFilterListenerSearchField.value, elem.innerHTML)?
                elem.classList.remove("d-none"):elem.classList.add("d-none")
        })
    })
}

function homeworksFilterListeners(){
    function validateDates(){
        let validationStatus = true
        let dateStart
        let dateEnd
        if (homeworksTableFilterDateStartField.value !== ""){
            dateStart = new Date(homeworksTableFilterDateStartField.value)
        }
        if (homeworksTableFilterDateEndField.value !== ""){
            dateEnd = new Date(homeworksTableFilterDateEndField.value)
        }

        if (dateStart && dateEnd){
            if (dateStart > dateEnd) {
                validationStatus = false
                homeworksTableFilterDateStartField.classList.add("is-invalid")
                homeworksTableFilterDateEndField.classList.add("is-invalid")
            }
        }
        return validationStatus
    }

    homeworksTableFilterDateStartField.addEventListener("input", function () {
        if (validateDates()){
            homeworksFilterDateFrom = homeworksTableFilterDateStartField.value
            homeworksGet()
        }
    })
    homeworksTableFilterDateEndField.addEventListener("input", function () {
        if (validateDates()){
            homeworksFilterDateTo = homeworksTableFilterDateEndField.value
            homeworksGet()
        }
    })
}

//Reset Buttons
const homeworksTableFilterResetAll = document.querySelector("#homeworksTableFilterResetAll")
const homeworksTableFilterTeacherSearchFieldReset = document.querySelector("#homeworksTableFilterTeacherSearchFieldReset")
const homeworksTableFilterTeacherSearchFieldErase = document.querySelector("#homeworksTableFilterTeacherSearchFieldErase")
const homeworksTableFilterListenerSearchFieldErase = document.querySelector("#homeworksTableFilterListenerSearchFieldErase")
const homeworksTableFilterDateStartFieldErase = document.querySelector("#homeworksTableFilterDateStartFieldErase")
const homeworksTableFilterDateEndFieldErase = document.querySelector("#homeworksTableFilterDateEndFieldErase")
const homeworksTableFilterListenerSearchFieldReset = document.querySelector("#homeworksTableFilterListenerSearchFieldReset")

//Fields
const homeworksTableFilterTeacherSearchField = document.querySelector("#homeworksTableFilterTeacherSearchField")
const homeworksTableFilterListenerSearchField = document.querySelector("#homeworksTableFilterListenerSearchField")
const homeworksTableFilterDateStartField = document.querySelector("#homeworksTableFilterDateStartField")
const homeworksTableFilterDateEndField = document.querySelector("#homeworksTableFilterDateEndField")

//Lists
const homeworksTableFilterTeacherList = document.querySelector("#homeworksTableFilterTeacherList")
const homeworksTableFilterListenerList = document.querySelector("#homeworksTableFilterListenerList")

homeworksFilterMain()