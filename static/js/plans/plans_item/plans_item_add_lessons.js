function plansItemAddLessonsMain(){
    collectionsAPIGetLessonPlaces().then(request => {
        switch (request.status){
            case 200:
                request.response.forEach(place => {
                    plansItemAddLessonsModal.querySelectorAll(".place-select").forEach(placeinput => {
                        placeinput.insertAdjacentHTML("beforeend", `
                        <option value="${place.id}">${place.name}</option>>`)
                    })
                })
                break
            default:
                showErrorToast()
                break
        }
    })
    plansItemAddLessonsModalMondayCheck.addEventListener("click", function () {
        plansItemAddLessonsModalMondayTimeStart.disabled = !plansItemAddLessonsModalMondayCheck.checked
        plansItemAddLessonsModalMondayTimeEnd.disabled = !plansItemAddLessonsModalMondayCheck.checked
        plansItemAddLessonsModalMondayPlace.disabled = !plansItemAddLessonsModalMondayCheck.checked
    })
    plansItemAddLessonsModalTuesdayCheck.addEventListener("click", function () {
        plansItemAddLessonsModalTuesdayTimeStart.disabled = !plansItemAddLessonsModalTuesdayCheck.checked
        plansItemAddLessonsModalTuesdayTimeEnd.disabled = !plansItemAddLessonsModalTuesdayCheck.checked
        plansItemAddLessonsModalTuesdayPlace.disabled = !plansItemAddLessonsModalTuesdayCheck.checked
    })
    plansItemAddLessonsModalWednesdayCheck.addEventListener("click", function () {
        plansItemAddLessonsModalWednesdayTimeStart.disabled = !plansItemAddLessonsModalWednesdayCheck.checked
        plansItemAddLessonsModalWednesdayTimeEnd.disabled = !plansItemAddLessonsModalWednesdayCheck.checked
        plansItemAddLessonsModalWednesdayPlace.disabled = !plansItemAddLessonsModalWednesdayCheck.checked
    })
    plansItemAddLessonsModalThursdayCheck.addEventListener("click", function () {
        plansItemAddLessonsModalThursdayTimeStart.disabled = !plansItemAddLessonsModalThursdayCheck.checked
        plansItemAddLessonsModalThursdayTimeEnd.disabled = !plansItemAddLessonsModalThursdayCheck.checked
        plansItemAddLessonsModalThursdayPlace.disabled = !plansItemAddLessonsModalThursdayCheck.checked
    })
    plansItemAddLessonsModalFridayCheck.addEventListener("click", function () {
        plansItemAddLessonsModalFridayTimeStart.disabled = !plansItemAddLessonsModalFridayCheck.checked
        plansItemAddLessonsModalFridayTimeEnd.disabled = !plansItemAddLessonsModalFridayCheck.checked
        plansItemAddLessonsModalFridayPlace.disabled = !plansItemAddLessonsModalFridayCheck.checked
    })
    plansItemAddLessonsModalSaturdayCheck.addEventListener("click", function () {
        plansItemAddLessonsModalSaturdayTimeStart.disabled = !plansItemAddLessonsModalSaturdayCheck.checked
        plansItemAddLessonsModalSaturdayTimeEnd.disabled = !plansItemAddLessonsModalSaturdayCheck.checked
        plansItemAddLessonsModalSaturdayPlace.disabled = !plansItemAddLessonsModalSaturdayCheck.checked
    })
    plansItemAddLessonsModalSundayCheck.addEventListener("click", function () {
        plansItemAddLessonsModalSundayTimeStart.disabled = !plansItemAddLessonsModalSundayCheck.checked
        plansItemAddLessonsModalSundayTimeEnd.disabled = !plansItemAddLessonsModalSundayCheck.checked
        plansItemAddLessonsModalSundayPlace.disabled = !plansItemAddLessonsModalSundayCheck.checked
    })
    plansItemAddLessonsModalMondayTimeStart.addEventListener("input", function () {
        plansItemAddLessonsModalMondayTimeEnd.value = getPlus1HourTime(plansItemAddLessonsModalMondayTimeStart)
    })
    plansItemAddLessonsModalTuesdayTimeStart.addEventListener("input", function () {
        plansItemAddLessonsModalTuesdayTimeEnd.value = getPlus1HourTime(plansItemAddLessonsModalTuesdayTimeStart)
    })
    plansItemAddLessonsModalWednesdayTimeStart.addEventListener("input", function () {
        plansItemAddLessonsModalWednesdayTimeEnd.value = getPlus1HourTime(plansItemAddLessonsModalWednesdayTimeStart)
    })
    plansItemAddLessonsModalThursdayTimeStart.addEventListener("input", function () {
        plansItemAddLessonsModalThursdayTimeEnd.value = getPlus1HourTime(plansItemAddLessonsModalThursdayTimeStart)
    })
    plansItemAddLessonsModalFridayTimeStart.addEventListener("input", function () {
        plansItemAddLessonsModalFridayTimeEnd.value = getPlus1HourTime(plansItemAddLessonsModalFridayTimeStart)
    })
    plansItemAddLessonsModalSaturdayTimeStart.addEventListener("input", function () {
        plansItemAddLessonsModalSaturdayTimeEnd.value = getPlus1HourTime(plansItemAddLessonsModalSaturdayTimeStart)
    })
    plansItemAddLessonsModalSundayTimeStart.addEventListener("input", function () {
        plansItemAddLessonsModalSundayTimeEnd.value = getPlus1HourTime(plansItemAddLessonsModalSundayTimeStart)
    })
    plansItemAddLessonsModalAddButton.addEventListener("click", plansItemAddLessonsCreate)
}

function plansItemAddLessonsSetModal(){
    plansItemAddLessonsResetModal(false)
    bsPlansItemAddLessonsModal.show()
}

function plansItemAddLessonsResetModal(validationOnly = false){
    function resetValidation(){
        plansItemAddLessonsModalErrorsAlert.classList.add("d-none")
        plansItemAddLessonsModalErrorsList.innerHTML = ""
        plansItemAddLessonsModalDate.classList.remove("is-invalid")
        plansItemAddLessonsModalMondayTimeStart.classList.remove("is-invalid")
        plansItemAddLessonsModalMondayTimeEnd.classList.remove("is-invalid")
        plansItemAddLessonsModalTuesdayTimeStart.classList.remove("is-invalid")
        plansItemAddLessonsModalTuesdayTimeEnd.classList.remove("is-invalid")
        plansItemAddLessonsModalWednesdayTimeStart.classList.remove("is-invalid")
        plansItemAddLessonsModalWednesdayTimeEnd.classList.remove("is-invalid")
        plansItemAddLessonsModalThursdayTimeStart.classList.remove("is-invalid")
        plansItemAddLessonsModalThursdayTimeEnd.classList.remove("is-invalid")
        plansItemAddLessonsModalFridayTimeStart.classList.remove("is-invalid")
        plansItemAddLessonsModalFridayTimeEnd.classList.remove("is-invalid")
        plansItemAddLessonsModalSaturdayTimeStart.classList.remove("is-invalid")
        plansItemAddLessonsModalSaturdayTimeEnd.classList.remove("is-invalid")
        plansItemAddLessonsModalSundayTimeStart.classList.remove("is-invalid")
        plansItemAddLessonsModalSundayTimeEnd.classList.remove("is-invalid")
    }

    resetValidation()
    if (!validationOnly){
        plansItemAddLessonsModalDate.value = ""
        plansItemAddLessonsModalMondayCheck.checked = false
        plansItemAddLessonsModalTuesdayCheck.checked = false
        plansItemAddLessonsModalWednesdayCheck.checked = false
        plansItemAddLessonsModalThursdayCheck.checked = false
        plansItemAddLessonsModalFridayCheck.checked = false
        plansItemAddLessonsModalSaturdayCheck.checked = false
        plansItemAddLessonsModalSundayCheck.checked = false
        plansItemAddLessonsModalMondayTimeStart.value = ""
        plansItemAddLessonsModalMondayTimeEnd.value = ""
        plansItemAddLessonsModalMondayPlace.value = "None"
        plansItemAddLessonsModalTuesdayTimeStart.value = ""
        plansItemAddLessonsModalTuesdayTimeEnd.value = ""
        plansItemAddLessonsModalTuesdayPlace.value = "None"
        plansItemAddLessonsModalWednesdayTimeStart.value = ""
        plansItemAddLessonsModalWednesdayTimeEnd.value = ""
        plansItemAddLessonsModalWednesdayPlace.value = "None"
        plansItemAddLessonsModalThursdayTimeStart.value = ""
        plansItemAddLessonsModalThursdayTimeEnd.value = ""
        plansItemAddLessonsModalThursdayPlace.value = "None"
        plansItemAddLessonsModalFridayTimeStart.value = ""
        plansItemAddLessonsModalFridayTimeEnd.value = ""
        plansItemAddLessonsModalFridayPlace.value = "None"
        plansItemAddLessonsModalSaturdayTimeStart.value = ""
        plansItemAddLessonsModalSaturdayTimeEnd.value = ""
        plansItemAddLessonsModalSaturdayPlace.value = "None"
        plansItemAddLessonsModalSundayTimeStart.value = ""
        plansItemAddLessonsModalSundayTimeEnd.value = ""
        plansItemAddLessonsModalSundayPlace.value = "None"
        plansItemAddLessonsModalMondayTimeStart.disabled = true
        plansItemAddLessonsModalMondayTimeEnd.disabled = true
        plansItemAddLessonsModalMondayPlace.disabled = true
        plansItemAddLessonsModalTuesdayTimeStart.disabled = true
        plansItemAddLessonsModalTuesdayTimeEnd.disabled = true
        plansItemAddLessonsModalTuesdayPlace.disabled = true
        plansItemAddLessonsModalWednesdayTimeStart.disabled = true
        plansItemAddLessonsModalWednesdayTimeEnd.disabled = true
        plansItemAddLessonsModalWednesdayPlace.disabled = true
        plansItemAddLessonsModalThursdayTimeStart.disabled = true
        plansItemAddLessonsModalThursdayTimeEnd.disabled = true
        plansItemAddLessonsModalThursdayPlace.disabled = true
        plansItemAddLessonsModalFridayTimeStart.disabled = true
        plansItemAddLessonsModalFridayTimeEnd.disabled = true
        plansItemAddLessonsModalFridayPlace.disabled = true
        plansItemAddLessonsModalSaturdayTimeStart.disabled = true
        plansItemAddLessonsModalSaturdayTimeEnd.disabled = true
        plansItemAddLessonsModalSaturdayPlace.disabled = true
        plansItemAddLessonsModalSundayTimeStart.disabled = true
        plansItemAddLessonsModalSundayTimeEnd.disabled = true
        plansItemAddLessonsModalSundayPlace.disabled = true
    }
}

function plansItemAddLessonsValidation(errors=null, warnings=null){
    function setInvalid(error=null, elements=[]){
        if (error){
            plansItemAddLessonsModalErrorsAlert.classList.remove("d-none")
            plansItemAddLessonsModalErrorsList.innerHTML += `<li>${error}</li>`
        }
        elements.forEach(element => {
            element.classList.add("is-invalid")
        })
        validationStatus = false
    }

    function validateStartDate() {
        if (plansItemAddLessonsModalDate.value === ""){
            setInvalid("Необходимо указать дату начала обучения",
                [plansItemAddLessonsModalDate])
        } else {
            if (new Date().getDate() > new Date(plansItemAddLessonsModalDate.value).getDate()){
                setInvalid("Дата начала обучения не может быть раньше, чем сегодня",
                    [plansItemAddLessonsModalDate])
            }
        }
    }

    function validateChecks(){
        if (
            !plansItemAddLessonsModalMondayCheck.checked &&
            !plansItemAddLessonsModalTuesdayCheck.checked &&
            !plansItemAddLessonsModalWednesdayCheck.checked &&
            !plansItemAddLessonsModalThursdayCheck.checked &&
            !plansItemAddLessonsModalFridayCheck.checked &&
            !plansItemAddLessonsModalSaturdayCheck.checked &&
            !plansItemAddLessonsModalSundayCheck.checked
        ){
            setInvalid("Необходимо выбрать хотя бы один день недели")
        }
    }

    function validateMonday() {
        const val = timeUtilsValidateTimeInScheduleModals(
            plansItemAddLessonsModalMondayCheck,
            plansItemAddLessonsModalMondayTimeStart,
            plansItemAddLessonsModalMondayTimeEnd
        )
        if (val.status === "error"){
            setInvalid(`ПН: ${val.error}`, val.elements)
        }
    }

    function validateTuesday() {
        const val = timeUtilsValidateTimeInScheduleModals(
            plansItemAddLessonsModalTuesdayCheck,
            plansItemAddLessonsModalTuesdayTimeStart,
            plansItemAddLessonsModalTuesdayTimeEnd
        )
        if (val.status === "error"){
            setInvalid(`ВТ: ${val.error}`, val.elements)
        }
    }

    function validateWednesday() {
        const val = timeUtilsValidateTimeInScheduleModals(
            plansItemAddLessonsModalWednesdayCheck,
            plansItemAddLessonsModalWednesdayTimeStart,
            plansItemAddLessonsModalWednesdayTimeEnd
        )
        if (val.status === "error"){
            setInvalid(`СР: ${val.error}`, val.elements)
        }
    }

    function validateThursday() {
        const val = timeUtilsValidateTimeInScheduleModals(
            plansItemAddLessonsModalThursdayCheck,
            plansItemAddLessonsModalThursdayTimeStart,
            plansItemAddLessonsModalThursdayTimeEnd
        )
        if (val.status === "error"){
            setInvalid(`ЧТ: ${val.error}`, val.elements)
        }
    }

    function validateFriday() {
        const val = timeUtilsValidateTimeInScheduleModals(
            plansItemAddLessonsModalFridayCheck,
            plansItemAddLessonsModalFridayTimeStart,
            plansItemAddLessonsModalFridayTimeEnd
        )
        if (val.status === "error"){
            setInvalid(`ПТ: ${val.error}`, val.elements)
        }
    }

    function validateSaturday() {
        const val = timeUtilsValidateTimeInScheduleModals(
            plansItemAddLessonsModalSaturdayCheck,
            plansItemAddLessonsModalSaturdayTimeStart,
            plansItemAddLessonsModalSaturdayTimeEnd
        )
        if (val.status === "error"){
            setInvalid(`СБ: ${val.error}`, val.elements)
        }
    }

    function validateSunday() {
        const val = timeUtilsValidateTimeInScheduleModals(
            plansItemAddLessonsModalSundayCheck,
            plansItemAddLessonsModalSundayTimeStart,
            plansItemAddLessonsModalSundayTimeEnd
        )
        if (val.status === "error"){
            setInvalid(`ВС: ${val.error}`, val.elements)
        }
    }

    let validationStatus = true
    plansItemAddLessonsResetModal(true)
    validateStartDate()
    validateChecks()
    validateMonday()
    validateTuesday()
    validateWednesday()
    validateThursday()
    validateFriday()
    validateSaturday()
    validateSunday()
    return validationStatus
}

function plansItemAddLessonsCreate(){
    if (plansItemAddLessonsValidation()){
        planItemAPIAddLessons(new FormData(plansItemAddLessonsModalForm), planID).then(request => {
            switch (request.status){
                case 201:
                    bsPlansItemAddLessonsModal.hide()
                    showSuccessToast("Занятия успешно добавлены")
                    setTimeout(function () {
                        location.reload()
                    }, 700)
                    break
                default:
                    bsPlansItemAddLessonsModal.hide()
                    showErrorToast()
                    break
            }
        })
    }
}


const plansItemAddLessonsModal = document.querySelector("#plansItemAddLessonsModal")
const bsPlansItemAddLessonsModal = new bootstrap.Modal(plansItemAddLessonsModal)
const plansItemAddLessonsModalForm = plansItemAddLessonsModal.querySelector("#plansItemAddLessonsModalForm")
const plansItemAddLessonsModalDate = plansItemAddLessonsModalForm.querySelector("#plansItemAddLessonsModalDate")
const plansItemAddLessonsModalMondayCheck = plansItemAddLessonsModalForm.querySelector("#plansItemAddLessonsModalMondayCheck")
const plansItemAddLessonsModalMondayTimeStart = plansItemAddLessonsModalForm.querySelector("#plansItemAddLessonsModalMondayTimeStart")
const plansItemAddLessonsModalMondayTimeEnd = plansItemAddLessonsModalForm.querySelector("#plansItemAddLessonsModalMondayTimeEnd")
const plansItemAddLessonsModalMondayPlace = plansItemAddLessonsModalForm.querySelector("#plansItemAddLessonsModalMondayPlace")
const plansItemAddLessonsModalTuesdayCheck = plansItemAddLessonsModalForm.querySelector("#plansItemAddLessonsModalTuesdayCheck")
const plansItemAddLessonsModalTuesdayTimeStart = plansItemAddLessonsModalForm.querySelector("#plansItemAddLessonsModalTuesdayTimeStart")
const plansItemAddLessonsModalTuesdayTimeEnd = plansItemAddLessonsModalForm.querySelector("#plansItemAddLessonsModalTuesdayTimeEnd")
const plansItemAddLessonsModalTuesdayPlace = plansItemAddLessonsModalForm.querySelector("#plansItemAddLessonsModalTuesdayPlace")
const plansItemAddLessonsModalWednesdayCheck = plansItemAddLessonsModalForm.querySelector("#plansItemAddLessonsModalWednesdayCheck")
const plansItemAddLessonsModalWednesdayTimeStart = plansItemAddLessonsModalForm.querySelector("#plansItemAddLessonsModalWednesdayTimeStart")
const plansItemAddLessonsModalWednesdayTimeEnd = plansItemAddLessonsModalForm.querySelector("#plansItemAddLessonsModalWednesdayTimeEnd")
const plansItemAddLessonsModalWednesdayPlace = plansItemAddLessonsModalForm.querySelector("#plansItemAddLessonsModalWednesdayPlace")
const plansItemAddLessonsModalThursdayCheck = plansItemAddLessonsModalForm.querySelector("#plansItemAddLessonsModalThursdayCheck")
const plansItemAddLessonsModalThursdayTimeStart = plansItemAddLessonsModalForm.querySelector("#plansItemAddLessonsModalThursdayTimeStart")
const plansItemAddLessonsModalThursdayTimeEnd = plansItemAddLessonsModalForm.querySelector("#plansItemAddLessonsModalThursdayTimeEnd")
const plansItemAddLessonsModalThursdayPlace = plansItemAddLessonsModalForm.querySelector("#plansItemAddLessonsModalThursdayPlace")
const plansItemAddLessonsModalFridayCheck = plansItemAddLessonsModalForm.querySelector("#plansItemAddLessonsModalFridayCheck")
const plansItemAddLessonsModalFridayTimeStart = plansItemAddLessonsModalForm.querySelector("#plansItemAddLessonsModalFridayTimeStart")
const plansItemAddLessonsModalFridayTimeEnd = plansItemAddLessonsModalForm.querySelector("#plansItemAddLessonsModalFridayTimeEnd")
const plansItemAddLessonsModalFridayPlace = plansItemAddLessonsModalForm.querySelector("#plansItemAddLessonsModalFridayPlace")
const plansItemAddLessonsModalSaturdayCheck = plansItemAddLessonsModalForm.querySelector("#plansItemAddLessonsModalSaturdayCheck")
const plansItemAddLessonsModalSaturdayTimeStart = plansItemAddLessonsModalForm.querySelector("#plansItemAddLessonsModalSaturdayTimeStart")
const plansItemAddLessonsModalSaturdayTimeEnd = plansItemAddLessonsModalForm.querySelector("#plansItemAddLessonsModalSaturdayTimeEnd")
const plansItemAddLessonsModalSaturdayPlace = plansItemAddLessonsModalForm.querySelector("#plansItemAddLessonsModalSaturdayPlace")
const plansItemAddLessonsModalSundayCheck = plansItemAddLessonsModalForm.querySelector("#plansItemAddLessonsModalSundayCheck")
const plansItemAddLessonsModalSundayTimeStart = plansItemAddLessonsModalForm.querySelector("#plansItemAddLessonsModalSundayTimeStart")
const plansItemAddLessonsModalSundayTimeEnd = plansItemAddLessonsModalForm.querySelector("#plansItemAddLessonsModalSundayTimeEnd")
const plansItemAddLessonsModalSundayPlace = plansItemAddLessonsModalForm.querySelector("#plansItemAddLessonsModalSundayPlace")
const plansItemAddLessonsModalAddButton = plansItemAddLessonsModal.querySelector("#plansItemAddLessonsModalAddButton")
const plansItemAddLessonsModalErrorsAlert = plansItemAddLessonsModal.querySelector("#plansItemAddLessonsModalErrorsAlert")
const plansItemAddLessonsModalErrorsList = plansItemAddLessonsModal.querySelector("#plansItemAddLessonsModalErrorsList")

plansItemAddLessonsMain()