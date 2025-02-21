function learningPlansFilterMain() {
    learningPlansFilterSetTeachersListeners()
    learningPlansFilterSetSearchListeners()
    learningPlansFilterSetFilterListeners()
    learningPlansFilterSetSortListeners()
    learningPlansFilterSetEraseResetListeners()
    learningPlansFilterSetStatusListeners()
}

function learningPlansFilterSetTeachersListeners() {
    function getListener(element, userID, selectedArray){
        const index = selectedArray.indexOf(userID)
        switch (index){
            case -1:
                selectedArray.push(userID)
                element.classList.add("active")
                break
            default:
                selectedArray.splice(index, 1)
                element.classList.remove("active")
                break
        }
        learningPlansGet()
    }

    function getElement(user, selectedArray){
        const a = document.createElement("a")
        a.classList.add("dropdown-item")
        a.href = "#"
        a.innerHTML = `${user.first_name} ${user.last_name}`
        a.addEventListener("click", function (){
            getListener(a, user.id, selectedArray)
        })
        return a
    }

    usersAPIGetListeners().then(request => {
        switch (request.status){
            case 200:
                request.response.forEach(user => {
                    plansFilterListenerList.insertAdjacentElement(
                        "beforeend", getElement(user, learningPlansSelectedListeners))
                })
                break
            default:
                showErrorToast("Не удалось загрузить список учеников")
        }
    })
    usersAPIGetTeachers().then(request => {
        switch (request.status){
            case 200:
                request.response.forEach(user => {
                    plansFilterTeacherList.insertAdjacentElement(
                        "beforeend", getElement(user, learningPlansSelectedTeachers))
                })
                break
            default:
                showErrorToast("Не удалось загрузить список преподавателей")
        }
    })
}

function learningPlansFilterSetEraseResetListeners() {
    function resetStatus(){
        plansFilterStatusProcessing.classList.add("active")
        plansFilterStatusClosed.classList.remove("active")
        plansFilterStatusAll.classList.remove("active")
        learningPlansSelectedStatus = "processing"
    }

    function eraseTeacher(reset=false){
        plansFilterTeacherSearchField.value = ""
        plansFilterTeacherList.querySelectorAll("a").forEach(elem => {
            elem.classList.remove("d-none")
            if (reset){
                elem.classList.remove("active")
            }
        })
        if (reset){
            learningPlansSelectedTeachers.length = 0
        }
    }

    function eraseListener(reset=false){
        plansFilterListenerSearchField.value = ""
        plansFilterListenerList.querySelectorAll("a").forEach(elem => {
            elem.classList.remove("d-none")
            if (reset){
                elem.classList.remove("active")
            }
        })
        if (reset){
            learningPlansSelectedListeners.length = 0
        }
    }

    function eraseName(){
        learningPlansSelectedName = null
        plansFilterNameField.value = ""
    }

    function resetNameSort(){
        plansFilterNameSort.classList.add("btn-outline-secondary")
        plansFilterNameSort.classList.remove("btn-warning", "btn-success")
        learningPlansSelectedNameSort = null
        learningPlansGet()
    }

    plansFilterEraseAll.addEventListener("click", function (){
        resetNameSort()
        resetStatus()
        eraseName()
        eraseTeacher(true)
        eraseListener(true)
        learningPlansGet()
    })
    plansFilterNameErase.addEventListener("click", function (){
        eraseName()
        learningPlansGet()
    })
    plansFilterTeacherSearchFieldErase.addEventListener("click", function (){
        eraseTeacher()
    })
    plansFilterListenerSearchFieldErase.addEventListener("click", function (){
        eraseListener()
    })
    plansFilterTeacherSearchFieldReset.addEventListener("click", function (){
        eraseTeacher(true)
        learningPlansGet()
    })
    plansFilterListenerSearchFieldReset.addEventListener("click", function (){
        eraseListener(true)
        learningPlansGet()
    })
}

function learningPlansFilterSetSearchListeners() {
    plansFilterTeacherSearchField.addEventListener("input", function () {
        const query = new RegExp(plansFilterTeacherSearchField.value.trim().toLowerCase())
        plansFilterTeacherList.querySelectorAll("a").forEach(elem => {
            query.test(elem.innerHTML.toLowerCase())?elem.classList.remove("d-none"):elem.classList.add("d-none")
        })
    })
    plansFilterListenerSearchField.addEventListener("input", function () {
        const query = new RegExp(plansFilterListenerSearchField.value.trim().toLowerCase())
        plansFilterListenerList.querySelectorAll("a").forEach(elem => {
            query.test(elem.innerHTML.toLowerCase())?elem.classList.remove("d-none"):elem.classList.add("d-none")
        })
    })
}

function learningPlansFilterSetFilterListeners() {
    plansFilterNameField.addEventListener("input", function () {
        learningPlansSelectedName = plansFilterNameField.value.trim().toLowerCase()
        learningPlansGet()
    })
}

function learningPlansFilterSetSortListeners() {
    plansFilterNameSort.addEventListener("click", function () {
        switch (learningPlansSelectedNameSort){
            case null:
                plansFilterNameSort.classList.remove("btn-outline-secondary", "btn-warning")
                plansFilterNameSort.classList.add("btn-success")
                learningPlansSelectedNameSort = "asc"
                break
            case "asc":
                plansFilterNameSort.classList.remove("btn-outline-secondary", "btn-success")
                plansFilterNameSort.classList.add("btn-warning")
                learningPlansSelectedNameSort = "desc"
                break
            case "desc":
                plansFilterNameSort.classList.remove("btn-outline-secondary", "btn-warning")
                plansFilterNameSort.classList.add("btn-success")
                learningPlansSelectedNameSort = "asc"
                break
        }
        learningPlansGet()
    })
}

function learningPlansFilterSetStatusListeners(){
    plansFilterStatusProcessing.addEventListener("click", function () {
        learningPlansSelectedStatus = "processing"
        learningPlansGet()
    })
    plansFilterStatusClosed.addEventListener("click", function () {
        learningPlansSelectedStatus = "closed"
        learningPlansGet()
    })
    plansFilterStatusAll.addEventListener("click", function () {
        learningPlansSelectedStatus = null
        learningPlansGet()
    })
}

//Fields
const plansFilterNameField = document.querySelector("#plansFilterNameField")
const plansFilterTeacherSearchField = document.querySelector("#plansFilterTeacherSearchField")
const plansFilterListenerSearchField = document.querySelector("#plansFilterListenerSearchField")

const plansFilterStatusProcessing = document.querySelector("#plansFilterStatusProcessing")
const plansFilterStatusClosed = document.querySelector("#plansFilterStatusClosed")
const plansFilterStatusAll = document.querySelector("#plansFilterStatusAll")

//Reset/Erase
const plansFilterEraseAll = document.querySelector("#plansFilterEraseAll")
const plansFilterNameErase = document.querySelector("#plansFilterNameErase")
const plansFilterTeacherSearchFieldErase = document.querySelector("#plansFilterTeacherSearchFieldErase")
const plansFilterListenerSearchFieldErase = document.querySelector("#plansFilterListenerSearchFieldErase")
const plansFilterTeacherSearchFieldReset = document.querySelector("#plansFilterTeacherSearchFieldReset")
const plansFilterListenerSearchFieldReset = document.querySelector("#plansFilterListenerSearchFieldReset")

//Lists
const plansFilterTeacherList = document.querySelector("#plansFilterTeacherList")
const plansFilterListenerList = document.querySelector("#plansFilterListenerList")

//Sort
const plansFilterNameSort = document.querySelector("#plansFilterNameSort")

learningPlansFilterMain()