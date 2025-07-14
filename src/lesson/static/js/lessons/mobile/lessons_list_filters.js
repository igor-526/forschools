function lessonsMobileFiltersMain(){
    lessonsMobileSetFiltersButton.addEventListener("click", lessonsMobileFiltersSetModal)
    lessonsMobileFiltersNameFieldListeners()
    lessonsMobileFiltersDateListener()
    lessonsMobileFiltersSetSelectionListeners()
    lessonsMobileFiltersModalAcceptButton.addEventListener("click", lessonsMobileFiltersSet)
    lessonsMobileFiltersModalResetButton.addEventListener("click", lessonsMobileFiltersReset)
}

function lessonsMobileFiltersSetModal(){
    bsLessonsMobileFiltersModal.show()
}

function lessonsMobileFiltersDateListener(){
    function validate(){
        lessonsMobileFiltersModalDateFromField.classList.remove("is-invalid")
        lessonsMobileFiltersModalDateToField.classList.remove("is-invalid")
        lessonsMobileFiltersModalAcceptButton.disabled = false

        const dateFrom = lessonsMobileFiltersModalDateFromField.value === "" ? null :
            new Date(lessonsMobileFiltersModalDateFromField.value).setHours(0, 0, 0, 0)
        const dateTo = lessonsMobileFiltersModalDateToField.value === "" ? null :
            new Date(lessonsMobileFiltersModalDateToField.value).setHours(0, 0, 0, 0)
        if (dateFrom && dateTo && dateFrom > dateTo){
            lessonsMobileFiltersModalDateFromField.classList.add("is-invalid")
            lessonsMobileFiltersModalDateToField.classList.add("is-invalid")
            lessonsMobileFiltersModalAcceptButton.disabled = true
        }
    }

    lessonsMobileFiltersModalDateFromField.addEventListener("input", function () {
        if (lessonsMobileFiltersModalDateToField.value === ""){
            lessonsMobileFiltersModalDateToField.value = lessonsMobileFiltersModalDateFromField.value
        }
        validate()
    })
    lessonsMobileFiltersModalDateToField.addEventListener("input", function () {
        if (lessonsMobileFiltersModalDateFromField.value === ""){
            lessonsMobileFiltersModalDateFromField.value = lessonsMobileFiltersModalDateToField.value
        }
        validate()
    })
}

function lessonsMobileFiltersNameFieldListeners(){
    lessonsMobileFilterNameField.addEventListener("input", () =>{
        const query = lessonsMobileFilterNameField.value.toLowerCase().trim()
        lessonsMobileFilterName = query === "" ? null : query
        lessonsMobileGet()
    })
    lessonsMobileFilterNameFieldErase.addEventListener("click", () =>{
        lessonsMobileFilterNameField.value = ""
        lessonsMobileFilterName = null
        lessonsMobileGet()
    })
}

function lessonsMobileFiltersSet(){
    if (lessonsMobileFiltersModalHWAllButton.checked){
        lessonsMobileFilterHW = null
    } else if (lessonsMobileFiltersModalHWYesButton.checked) {
        lessonsMobileFilterHW = "true"
    } else if (lessonsMobileFiltersModalHWNoButton.checked) {
        lessonsMobileFilterHW = "false"
    }
    if (isAdmin){
        if (lessonsMobileFiltersModalAdminCommentAllButton.checked){
            lessonsMobileFilterComment = null
        } else if (lessonsMobileFiltersModalAdminCommentYesButton.checked) {
            lessonsMobileFilterComment = "true"
        } else if (lessonsMobileFiltersModalAdminCommentNoButton.checked) {
            lessonsMobileFilterComment = "false"
        }
    }
    lessonsMobileFilterDateStart = lessonsMobileFiltersModalDateFromField.value === "" ? null :
        lessonsMobileFiltersModalDateFromField.value
    lessonsMobileFilterDateEnd = lessonsMobileFiltersModalDateToField.value === "" ? null :
        lessonsMobileFiltersModalDateToField.value
    bsLessonsMobileFiltersModal.hide()
    lessonsMobileGet()
}

function lessonsMobileFiltersReset(){
    lessonsMobileFilterName = null
    lessonsMobileFilterHW = null
    lessonsMobileFilterComment = null
    lessonsMobileFilterDateStart = null
    lessonsMobileFilterDateEnd = null
    lessonsMobileFilterTeachersSelected.length = 0
    lessonsMobileFilterListenersSelected.length = 0
    lessonsMobileFiltersModalSelectPlacesButton.innerHTML = "Место проведения (0)"
    lessonsMobileFiltersModalSelectTeachersButton.innerHTML = "Преподаватель (0)"
    lessonsMobileFiltersModalSelectListenersButton.innerHTML = "Ученик (0)"
    lessonsMobileFiltersModalHWAllButton.checked = true
    lessonsMobileFiltersModalHWYesButton.checked = false
    lessonsMobileFiltersModalHWNoButton.checked = false
    if (isAdmin){
        lessonsMobileFiltersModalAdminCommentAllButton.checked = true
        lessonsMobileFiltersModalAdminCommentYesButton.checked = false
        lessonsMobileFiltersModalAdminCommentNoButton.checked = false
    }
    lessonsMobileFiltersModalDateFromField.value = ""
    lessonsMobileFiltersModalDateToField.value = ""
    lessonsMobileFilterNameField.value = ""
    bsLessonsMobileFiltersModal.hide()
    lessonsMobileGet()
}

function lessonsMobileFiltersSetSelectionListeners(){
    function listenersSelect(listeners=[]){
        lessonsMobileFilterListenersSelected=Array.from(listeners)
        lessonsMobileFiltersModalSelectListenersButton.innerHTML = `Ученик (${listeners.length})`
    }

    function teachersSelect(teachers=[]){
        lessonsMobileFilterTeachersSelected=Array.from(teachers)
        lessonsMobileFiltersModalSelectTeachersButton.innerHTML = `Преподаватель (${teachers.length})`
    }

    function placesSelect(places=[]){
        lessonsMobileFilterPlaces=Array.from(places)
        lessonsMobileFiltersModalSelectPlacesButton.innerHTML = `Место проведения (${places.length})`
    }

    lessonsMobileFiltersModalSelectPlacesButton.addEventListener("click", function () {
        collectionsAPIGetLessonPlaces().then(request => {
            switch (request.status){
                case 200:
                    universalInfoSelectionModal("Выбор места проведения",
                        request.response,
                        false, lessonsMobileFilterPlaces,
                        true, placesSelect)
                    break
                default:
                    showErrorToast()
                    break
            }
        })
    })

    lessonsMobileFiltersModalSelectTeachersButton.addEventListener("click", function () {
        universalInfoSelectionModal(null,
            {roles: ["Teacher"]},
            true, lessonsMobileFilterTeachersSelected,
            true, teachersSelect)
    })

    lessonsMobileFiltersModalSelectListenersButton.addEventListener("click", function () {
        universalInfoSelectionModal(null,
            {roles: ["Listener"]},
            true, lessonsMobileFilterListenersSelected,
            true, listenersSelect)
    })
}

const lessonsMobileSetFiltersButton = document.querySelector("#lessonsMobileSetFiltersButton")
const lessonsMobileFilterNameField = document.querySelector("#lessonsMobileFilterNameField")
const lessonsMobileFilterNameFieldErase = document.querySelector("#lessonsMobileFilterNameFieldErase")
const lessonsMobileFiltersModal = document.querySelector("#lessonsMobileFiltersModal")
const bsLessonsMobileFiltersModal = new bootstrap.Modal(lessonsMobileFiltersModal)
const lessonsMobileFiltersModalResetButton = lessonsMobileFiltersModal.querySelector("#lessonsMobileFiltersModalResetButton")
const lessonsMobileFiltersModalAcceptButton = lessonsMobileFiltersModal.querySelector("#lessonsMobileFiltersModalAcceptButton")
const lessonsMobileFiltersModalDateFromField = lessonsMobileFiltersModal.querySelector("#lessonsMobileFiltersModalDateFromField")
const lessonsMobileFiltersModalDateToField = lessonsMobileFiltersModal.querySelector("#lessonsMobileFiltersModalDateToField")
const lessonsMobileFiltersModalSelectPlacesButton = lessonsMobileFiltersModal.querySelector("#lessonsMobileFiltersModalSelectPlacesButton")
const lessonsMobileFiltersModalSelectTeachersButton = lessonsMobileFiltersModal.querySelector("#lessonsMobileFiltersModalSelectTeachersButton")
const lessonsMobileFiltersModalSelectListenersButton = lessonsMobileFiltersModal.querySelector("#lessonsMobileFiltersModalSelectListenersButton")
const lessonsMobileFiltersModalHWAllButton = lessonsMobileFiltersModal.querySelector("#lessonsMobileFiltersModalHWAllButton")
const lessonsMobileFiltersModalHWYesButton = lessonsMobileFiltersModal.querySelector("#lessonsMobileFiltersModalHWYesButton")
const lessonsMobileFiltersModalHWNoButton = lessonsMobileFiltersModal.querySelector("#lessonsMobileFiltersModalHWNoButton")
const lessonsMobileFiltersModalAdminCommentAllButton = lessonsMobileFiltersModal.querySelector("#lessonsMobileFiltersModalAdminCommentAllButton")
const lessonsMobileFiltersModalAdminCommentYesButton = lessonsMobileFiltersModal.querySelector("#lessonsMobileFiltersModalAdminCommentYesButton")
const lessonsMobileFiltersModalAdminCommentNoButton = lessonsMobileFiltersModal.querySelector("#lessonsMobileFiltersModalAdminCommentNoButton")

lessonsMobileFiltersMain()