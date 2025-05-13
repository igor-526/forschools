function homeworksMobileFiltersMain(){
    homeworksMobileFiltersDateListener()
    homeworksMobileFiltersNameFieldListeners()
    homeworksMobileFiltersSelectionListeners()
    homeworksMobileFiltersModalResetButton.addEventListener("click", homeworksMobileFiltersReset)
    homeworksMobileFiltersModalAcceptButton.addEventListener("click", homeworksMobileFiltersSet)
}

function homeworksMobileFiltersSetModal(){
    bsHomeworksMobileFiltersModal.show()
}

function homeworksMobileFiltersDateListener(){
    function validate(fromField, toField){
        fromField.classList.remove("is-invalid")
        toField.classList.remove("is-invalid")
        homeworksMobileFiltersModalAcceptButton.disabled = false

        const dateFrom = fromField.value === "" ? null :
            new Date(fromField.value).setHours(0, 0, 0, 0)
        const dateTo = toField.value === "" ? null :
            new Date(toField.value).setHours(0, 0, 0, 0)
        if (dateFrom && dateTo && dateFrom > dateTo){
            fromField.classList.add("is-invalid")
            toField.classList.add("is-invalid")
            homeworksMobileFiltersModalAcceptButton.disabled = true
        }
    }

    homeworksMobileFiltersModalAssignedDateFromField.addEventListener("input", function () {
        if (homeworksMobileFiltersModalAssignedDateToField.value === ""){
            homeworksMobileFiltersModalAssignedDateToField.value = homeworksMobileFiltersModalAssignedDateFromField.value
        }
        validate(
            homeworksMobileFiltersModalAssignedDateFromField,
            homeworksMobileFiltersModalAssignedDateToField
        )
    })
    homeworksMobileFiltersModalAssignedDateToField.addEventListener("input", function () {
        if (homeworksMobileFiltersModalAssignedDateFromField.value === ""){
            homeworksMobileFiltersModalAssignedDateFromField.value = homeworksMobileFiltersModalAssignedDateToField.value
        }
        validate(
            homeworksMobileFiltersModalAssignedDateFromField,
            homeworksMobileFiltersModalAssignedDateToField
        )
    })
    homeworksMobileFiltersModalLastChangeDateFromField.addEventListener("input", function () {
        if (homeworksMobileFiltersModalLastChangeDateToField.value === ""){
            homeworksMobileFiltersModalLastChangeDateToField.value = homeworksMobileFiltersModalLastChangeDateFromField.value
        }
        validate(
            homeworksMobileFiltersModalLastChangeDateFromField,
            homeworksMobileFiltersModalLastChangeDateToField
        )
    })
    homeworksMobileFiltersModalLastChangeDateToField.addEventListener("input", function () {
        if (homeworksMobileFiltersModalLastChangeDateFromField.value === ""){
            homeworksMobileFiltersModalLastChangeDateFromField.value = homeworksMobileFiltersModalLastChangeDateToField.value
        }
        validate(
            homeworksMobileFiltersModalLastChangeDateFromField,
            homeworksMobileFiltersModalLastChangeDateToField
        )
    })
}

function homeworksMobileFiltersNameFieldListeners(){
    homeworksMobileFilterNameField.addEventListener("input", () =>{
        const query = homeworksMobileFilterNameField.value.toLowerCase().trim()
        homeworksMobileFilterName = query === "" ? null : query
        homeworkMobileGet()
    })
    homeworksMobileFilterNameFieldErase.addEventListener("click", () =>{
        homeworksMobileFilterNameField.value = ""
        homeworksMobileFilterName = null
        homeworkMobileGet()
    })
}

function homeworksMobileFiltersSelectionListeners(){
    function listenersSelect(listeners=[]){
        homeworksMobileFilterSelectedListeners=Array.from(listeners)
        homeworksMobileFiltersModalSelectListenersButton.innerHTML = `Ученик (${listeners.length})`
    }

    function teachersSelect(teachers=[]){
        homeworksMobileFilterSelectedTeachers=Array.from(teachers)
        homeworksMobileFiltersModalSelectTeachersButton.innerHTML = `Преподаватель (${teachers.length})`
    }

    homeworksMobileFiltersModalSelectTeachersButton.addEventListener("click", function () {
        universalInfoSelectionModal(null,
            {roles: ["Teacher"]},
            true, homeworksMobileFilterSelectedTeachers,
            true, teachersSelect)
    })

    homeworksMobileFiltersModalSelectListenersButton.addEventListener("click", function () {
        universalInfoSelectionModal(null,
            {roles: ["Listener"]},
            true, homeworksMobileFilterSelectedListeners,
            true, listenersSelect)
    })
}

function homeworksMobileFiltersReset(){
    homeworksMobileFilterName = null
    homeworksMobileFilterSelectedTeachers.length = 0
    homeworksMobileFilterSelectedListeners.length = 0
    homeworksMobileFilterDateFrom = null
    homeworksMobileFilterDateTo = null
    homeworksMobileFilterDateChangedFrom = null
    homeworksMobileFilterDateChangedTo = null
    homeworksMobileFiltersModalAssignedDateFromField.value = ""
    homeworksMobileFiltersModalAssignedDateToField.value = ""
    homeworksMobileFiltersModalLastChangeDateFromField.value = ""
    homeworksMobileFiltersModalLastChangeDateToField.value = ""
    homeworksMobileFilterNameField.value = ""
    homeworksMobileFiltersModalSelectTeachersButton.innerHTML = "Преподаватель (0)"
    homeworksMobileFiltersModalSelectListenersButton.innerHTML = "Ученик (0)"
    bsHomeworksMobileFiltersModal.hide()
    homeworkMobileGet()
}

function homeworksMobileFiltersSet(){
    homeworksMobileFilterDateFrom = homeworksMobileFiltersModalAssignedDateFromField.value === "" ? null :
        homeworksMobileFiltersModalAssignedDateFromField.value
    homeworksMobileFilterDateTo = homeworksMobileFiltersModalAssignedDateToField.value === "" ? null :
        homeworksMobileFiltersModalAssignedDateToField.value
    homeworksMobileFilterDateChangedFrom = homeworksMobileFiltersModalLastChangeDateFromField.value === "" ? null :
        homeworksMobileFiltersModalLastChangeDateFromField.value
    homeworksMobileFilterDateChangedTo = homeworksMobileFiltersModalLastChangeDateToField.value === "" ? null :
        homeworksMobileFiltersModalLastChangeDateToField.value
    bsHomeworksMobileFiltersModal.hide()
    homeworkMobileGet()
}

const homeworksMobileFiltersModal = document.querySelector("#homeworksMobileFiltersModal")
const bsHomeworksMobileFiltersModal = new bootstrap.Modal(homeworksMobileFiltersModal)
const homeworksMobileFiltersModalAssignedDateFromField = homeworksMobileFiltersModal.querySelector("#homeworksMobileFiltersModalAssignedDateFromField")
const homeworksMobileFiltersModalAssignedDateToField = homeworksMobileFiltersModal.querySelector("#homeworksMobileFiltersModalAssignedDateToField")
const homeworksMobileFiltersModalLastChangeDateFromField = homeworksMobileFiltersModal.querySelector("#homeworksMobileFiltersModalLastChangeDateFromField")
const homeworksMobileFiltersModalLastChangeDateToField = homeworksMobileFiltersModal.querySelector("#homeworksMobileFiltersModalLastChangeDateToField")
const homeworksMobileFiltersModalSelectTeachersButton = homeworksMobileFiltersModal.querySelector("#homeworksMobileFiltersModalSelectTeachersButton")
const homeworksMobileFiltersModalSelectListenersButton = homeworksMobileFiltersModal.querySelector("#homeworksMobileFiltersModalSelectListenersButton")
const homeworksMobileFiltersModalResetButton = homeworksMobileFiltersModal.querySelector("#homeworksMobileFiltersModalResetButton")
const homeworksMobileFiltersModalAcceptButton = homeworksMobileFiltersModal.querySelector("#homeworksMobileFiltersModalAcceptButton")

const homeworksMobileFilterNameField = document.querySelector("#homeworksMobileFilterNameField")
const homeworksMobileFilterNameFieldErase = document.querySelector("#homeworksMobileFilterNameFieldErase")

homeworksMobileFiltersMain()