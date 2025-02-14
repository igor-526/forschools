function homeworkListFilterMAMain(){
    if (homeworkListMASettingTeacher){
        homeworkListMAFiltersOffcanvasTeacherList = homeworkListMAFiltersOffcanvas.querySelector("#homeworkListMAFiltersOffcanvasTeacherList")
        homeworkListMAFiltersOffcanvasTeacherSearchField = homeworkListMAFiltersOffcanvas.querySelector("#homeworkListMAFiltersOffcanvasTeacherSearchField")
        homeworkListMAFiltersOffcanvasTeacherSearchFieldErase = homeworkListMAFiltersOffcanvas.querySelector("#homeworkListMAFiltersOffcanvasTeacherSearchFieldErase")
    }
    if (homeworkListMASettingListener){
        homeworkListMAFiltersOffcanvasListenerList = homeworkListMAFiltersOffcanvas.querySelector("#homeworkListMAFiltersOffcanvasListenerList")
        homeworkListMAFiltersOffcanvasListenerSearchField = homeworkListMAFiltersOffcanvas.querySelector("#homeworkListMAFiltersOffcanvasListenerSearchField")
        homeworkListMAFiltersOffcanvasListenerSearchFieldErase = homeworkListMAFiltersOffcanvas.querySelector("#homeworkListMAFiltersOffcanvasListenerSearchFieldErase")
    }
    homeworkListMAFiltersButton.addEventListener("click", function () {
        bsHomeworkListMAFiltersOffcanvas.show()
    })
    homeworkListMAFiltersOffcanvasAcceptButton.addEventListener("click", function () {
        homeworkListFilterMAAcceptListener()
    })
    homeworkListFilterMASetSearchListeners()
    homeworkListFilterMAEraseListener()
    homeworkListFilterMASetTeachersAndListeners()
}

function homeworkListFilterMASetTeachersAndListeners(){
    function getListener(element, filterList, userID){
        const index = filterList.indexOf(userID)
        switch (index){
            case -1:
                element.classList.add("active")
                filterList.push(userID)
                break
            default:
                element.classList.remove("active")
                filterList.splice(index, 1)
                break
        }
    }

    function getElement(user, filterList){
        const a = document.createElement("a")
        a.classList.add("dropdown-item")
        a.href = "#"
        a.innerHTML = `${user.first_name} ${user.last_name}`
        a.addEventListener("click", function () {
            getListener(a, filterList, user.id)
        })
        return a
    }

    if (homeworkListMASettingTeacher){
        usersAPIGetTeachers().then(request => {
            switch (request.status){
                case 200:
                    request.response.forEach(user => {
                        homeworkListMAFiltersOffcanvasTeacherList.insertAdjacentElement("beforeend",
                            getElement(user, homeworkListMAFiltersTeachers))
                    })
                    break
                default:
                    alert("Не удалось загрузить список преподавателей для фильтрации")
                    break
            }
        })
    }
    if (homeworkListMASettingListener){
        usersAPIGetListeners().then(request => {
            switch (request.status){
                case 200:
                    request.response.forEach(user => {
                        homeworkListMAFiltersOffcanvasListenerList.insertAdjacentElement("beforeend",
                            getElement(user, homeworkListMAFiltersListeners))
                    })
                    break
                default:
                    alert("Не удалось загрузить список учеников для фильтрации")
                    break
            }
        })
    }
}

function homeworkListFilterMASetSearchListeners(){
    if (homeworkListMASettingTeacher){
        homeworkListMAFiltersOffcanvasTeacherSearchField.addEventListener("input", function () {
            const query = homeworkListMAFiltersOffcanvasTeacherSearchField.value.trim().toLowerCase()
            if (query === ""){
                homeworkListMAFiltersOffcanvasTeacherList.querySelectorAll("a").forEach(element => {
                    element.classList.remove("d-none")
                })
            } else {
                const queryRegExp = new RegExp(query)
                homeworkListMAFiltersOffcanvasTeacherList.querySelectorAll("a").forEach(element => {
                    queryRegExp.test(element.innerHTML.toLowerCase()) ? element.classList.remove("d-none") : element.classList.add("d-none")
                })
            }
        })
    }
    if (homeworkListMASettingListener){
        homeworkListMAFiltersOffcanvasListenerSearchField.addEventListener("input", function () {
            const query = homeworkListMAFiltersOffcanvasListenerSearchField.value.trim().toLowerCase()
            if (query === ""){
                homeworkListMAFiltersOffcanvasListenerList.querySelectorAll("a").forEach(element => {
                    element.classList.remove("d-none")
                })
            } else {
                const queryRegExp = new RegExp(query)
                homeworkListMAFiltersOffcanvasListenerList.querySelectorAll("a").forEach(element => {
                    queryRegExp.test(element.innerHTML.toLowerCase()) ? element.classList.remove("d-none") : element.classList.add("d-none")
                })
            }
        })
    }
    homeworkListMAFilterName.addEventListener("input", function (){
        if (homeworkListMAFilterName.value.trim() !== ""){
            homeworkListMAFiltersName = homeworkListMAFilterName.value.trim()
        } else {
            homeworkListMAFiltersName = null
        }
        homeworkListMAGet()
    })
}

function homeworkListFilterMAEraseListener(){
    function eraseName(){
        homeworkListMAFilterName.value = ""
        homeworkListMAFiltersName = null
    }

    function eraseDateAssigned(){
        homeworkListMAFiltersOffcanvasAssignedFromField.value = ""
        homeworkListMAFiltersOffcanvasAssignedToField.value = ""
        homeworkListMAFiltersAssignedFrom = null
        homeworkListMAFiltersAssignedTo = null
    }

    function eraseDateChanged(){
        homeworkListMAFiltersOffcanvasChangedFromField.value = ""
        homeworkListMAFiltersOffcanvasChangedToField.value = ""
        homeworkListMAFiltersChangedFrom = null
        homeworkListMAFiltersChangedTo = null
    }

    function eraseListeners(reset=false){
        homeworkListMAFiltersOffcanvasListenerList.querySelectorAll("a").forEach(element => {
            element.classList.remove("d-none")
            if (reset){
                element.classList.remove("active")
            }
        })
        homeworkListMAFiltersOffcanvasListenerSearchField.value = ""
        if (reset){
            homeworkListMAFiltersListeners.length = 0
        }
    }

    function eraseTeachers(reset=false){
        homeworkListMAFiltersOffcanvasTeacherList.querySelectorAll("a").forEach(element => {
            element.classList.remove("d-none")
            if (reset){
                element.classList.remove("active")
            }
        })
        homeworkListMAFiltersOffcanvasTeacherSearchField.value = ""
        if (reset){
            homeworkListMAFiltersTeachers.length = 0
        }
    }

    homeworkListMAFilterNameErase.addEventListener("click", function () {
        eraseName()
        homeworkListMAGet()
    })
    if (homeworkListMASettingTeacher){
        homeworkListMAFiltersOffcanvasTeacherSearchFieldErase.addEventListener("click", function () {
            eraseTeachers()
        })
    }
    if (homeworkListMASettingListener){
        homeworkListMAFiltersOffcanvasListenerSearchFieldErase.addEventListener("click", function () {
            eraseListeners()
        })
    }
    homeworkListMAFiltersOffcanvasAssignedErase.addEventListener("click", function () {
        eraseDateAssigned()
    })
    homeworkListMAFiltersOffcanvasChangedErase.addEventListener("click", function () {
        eraseDateChanged()
    })
    homeworkListMAFiltersOffcanvasResetAllButton.addEventListener("click", function () {
        homeworkListFilterMAResetValidation()
        eraseName()
        if (homeworkListMASettingTeacher){
            eraseTeachers(true)
        }
        if (homeworkListMASettingListener){
            eraseListeners(true)
        }
        eraseDateAssigned()
        eraseDateChanged()
        bsHomeworkListMAFiltersOffcanvas.hide()
        homeworkListMAGet()
    })
}

function homeworkListFilterMAResetValidation(){
    homeworkListMAFiltersOffcanvasAssignedFromField.classList.remove("is-invalid")
    homeworkListMAFiltersOffcanvasAssignedToField.classList.remove("is-invalid")
    homeworkListMAFiltersOffcanvasChangedFromField.classList.remove("is-invalid")
    homeworkListMAFiltersOffcanvasChangedToField.classList.remove("is-invalid")
}

function homeworkListFilterMAAcceptListener(){
    function validate(){
        homeworkListFilterMAResetValidation()
        let validationStatus = true
        const today = new Date().setHours(0, 0, 0, 0)
        if (homeworkListMAFiltersOffcanvasAssignedFromField.value !== ""){
            if (new Date(homeworkListMAFiltersOffcanvasAssignedFromField.value).setHours(0, 0, 0, 0) > today){
                homeworkListMAFiltersOffcanvasAssignedFromField.classList.add("is-invalid")
                validationStatus = false
            }
        }
        if (homeworkListMAFiltersOffcanvasAssignedToField.value !== ""){
            if (new Date(homeworkListMAFiltersOffcanvasAssignedToField.value).setHours(0, 0, 0, 0) > today){
                homeworkListMAFiltersOffcanvasAssignedToField.classList.add("is-invalid")
                validationStatus = false
            }
        }
        if (homeworkListMAFiltersOffcanvasAssignedFromField.value !== "" &&
            homeworkListMAFiltersOffcanvasAssignedToField.value !== ""){
            if (new Date(homeworkListMAFiltersOffcanvasAssignedFromField.value) >
                new Date(homeworkListMAFiltersOffcanvasAssignedToField.value)){
                homeworkListMAFiltersOffcanvasAssignedFromField.classList.add("is-invalid")
                homeworkListMAFiltersOffcanvasAssignedToField.classList.add("is-invalid")
                validationStatus = false
            }
        }
        if (homeworkListMAFiltersOffcanvasChangedFromField.value !== ""){
            if (new Date(homeworkListMAFiltersOffcanvasChangedFromField.value).setHours(0, 0, 0, 0) > today){
                homeworkListMAFiltersOffcanvasChangedFromField.classList.add("is-invalid")
                validationStatus = false
            }
        }
        if (homeworkListMAFiltersOffcanvasChangedToField.value !== ""){
            if (new Date(homeworkListMAFiltersOffcanvasChangedToField.value).setHours(0, 0, 0, 0) > today){
                homeworkListMAFiltersOffcanvasChangedToField.classList.add("is-invalid")
                validationStatus = false
            }
        }
        if (homeworkListMAFiltersOffcanvasChangedFromField.value !== "" &&
            homeworkListMAFiltersOffcanvasChangedToField.value !== ""){
            if (new Date(homeworkListMAFiltersOffcanvasChangedFromField.value) >
                new Date(homeworkListMAFiltersOffcanvasChangedToField.value)){
                homeworkListMAFiltersOffcanvasChangedFromField.classList.add("is-invalid")
                homeworkListMAFiltersOffcanvasChangedToField.classList.add("is-invalid")
                validationStatus = false
            }
        }
        return validationStatus
    }

    if (validate()){
        bsHomeworkListMAFiltersOffcanvas.hide()
        homeworkListMAFiltersAssignedFrom = homeworkListMAFiltersOffcanvasAssignedFromField.value
        homeworkListMAFiltersAssignedTo = homeworkListMAFiltersOffcanvasAssignedToField.value
        homeworkListMAFiltersChangedFrom = homeworkListMAFiltersOffcanvasChangedFromField.value
        homeworkListMAFiltersChangedTo = homeworkListMAFiltersOffcanvasChangedToField.value
        homeworkListMAGet()
    }
}

//Name
const homeworkListMAFiltersButton = homeworkListMATabs.querySelector("#homeworkListMAFiltersButton")
const homeworkListMAFilterName = document.querySelector("#homeworkListMAFilterName")
const homeworkListMAFilterNameErase = document.querySelector("#homeworkListMAFilterNameErase")

//Offcanvas & buttons
const homeworkListMAFiltersOffcanvas = document.querySelector("#homeworkListMAFiltersOffcanvas")
const bsHomeworkListMAFiltersOffcanvas = new bootstrap.Offcanvas(homeworkListMAFiltersOffcanvas)
const homeworkListMAFiltersOffcanvasResetAllButton = homeworkListMAFiltersOffcanvas.querySelector("#homeworkListMAFiltersOffcanvasResetAllButton")
const homeworkListMAFiltersOffcanvasAcceptButton = homeworkListMAFiltersOffcanvas.querySelector("#homeworkListMAFiltersOffcanvasAcceptButton")
const homeworkListMAFiltersOffcanvasAssignedErase = homeworkListMAFiltersOffcanvas.querySelector("#homeworkListMAFiltersOffcanvasAssignedErase")
const homeworkListMAFiltersOffcanvasChangedErase = homeworkListMAFiltersOffcanvas.querySelector("#homeworkListMAFiltersOffcanvasChangedErase")

//Fields
const homeworkListMAFiltersOffcanvasAssignedFromField = homeworkListMAFiltersOffcanvas.querySelector("#homeworkListMAFiltersOffcanvasAssignedFromField")
const homeworkListMAFiltersOffcanvasAssignedToField = homeworkListMAFiltersOffcanvas.querySelector("#homeworkListMAFiltersOffcanvasAssignedToField")
const homeworkListMAFiltersOffcanvasChangedFromField = homeworkListMAFiltersOffcanvas.querySelector("#homeworkListMAFiltersOffcanvasChangedFromField")
const homeworkListMAFiltersOffcanvasChangedToField = homeworkListMAFiltersOffcanvas.querySelector("#homeworkListMAFiltersOffcanvasChangedToField")

//Teachers & Listeners
let homeworkListMAFiltersOffcanvasListenerList = homeworkListMAFiltersOffcanvas.querySelector("#homeworkListMAFiltersOffcanvasListenerList")
let homeworkListMAFiltersOffcanvasTeacherList = homeworkListMAFiltersOffcanvas.querySelector("#homeworkListMAFiltersOffcanvasTeacherList")
let homeworkListMAFiltersOffcanvasListenerSearchField = homeworkListMAFiltersOffcanvas.querySelector("#homeworkListMAFiltersOffcanvasListenerSearchField")
let homeworkListMAFiltersOffcanvasListenerSearchFieldErase = homeworkListMAFiltersOffcanvas.querySelector("#homeworkListMAFiltersOffcanvasListenerSearchFieldErase")
let homeworkListMAFiltersOffcanvasTeacherSearchField = homeworkListMAFiltersOffcanvas.querySelector("#homeworkListMAFiltersOffcanvasTeacherSearchField")
let homeworkListMAFiltersOffcanvasTeacherSearchFieldErase = homeworkListMAFiltersOffcanvas.querySelector("#homeworkListMAFiltersOffcanvasTeacherSearchFieldErase")

homeworkListFilterMAMain()