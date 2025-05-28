function plansItemReschedulingMain(){
    collectionsAPIGetLessonPlaces().then(request => {
        switch (request.status){
            case 200:
                document.querySelectorAll(".place-select").forEach(sel => {
                    request.response.forEach(place => {
                        sel.insertAdjacentHTML("beforeend", `
                        <option value="${place.id}">${place.name}</option>`)
                    })
                })
                break
            default:
                showErrorToast()
                break
        }
    })
    plansItemReschedulingModalMondayCheck.addEventListener("change", function () {
        plansItemReschedulingModalMondayTimeStart.disabled = !plansItemReschedulingModalMondayCheck.checked
        plansItemReschedulingModalMondayTimeEnd.disabled = !plansItemReschedulingModalMondayCheck.checked
        plansItemReschedulingModalMondayPlace.disabled = !plansItemReschedulingModalMondayCheck.checked
        plansItemReschedulingSetButton("calculate")
    })
    plansItemReschedulingModalTuesdayCheck.addEventListener("change", function () {
        plansItemReschedulingModalTuesdayTimeStart.disabled = !plansItemReschedulingModalTuesdayCheck.checked
        plansItemReschedulingModalTuesdayTimeEnd.disabled = !plansItemReschedulingModalTuesdayCheck.checked
        plansItemReschedulingModalTuesdayPlace.disabled = !plansItemReschedulingModalTuesdayCheck.checked
        plansItemReschedulingSetButton("calculate")
    })
    plansItemReschedulingModalWednesdayCheck.addEventListener("change", function () {
        plansItemReschedulingModalWednesdayTimeStart.disabled = !plansItemReschedulingModalWednesdayCheck.checked
        plansItemReschedulingModalWednesdayTimeEnd.disabled = !plansItemReschedulingModalWednesdayCheck.checked
        plansItemReschedulingModalWednesdayPlace.disabled = !plansItemReschedulingModalWednesdayCheck.checked
        plansItemReschedulingSetButton("calculate")
    })
    plansItemReschedulingModalThursdayCheck.addEventListener("change", function () {
        plansItemReschedulingModalThursdayTimeStart.disabled = !plansItemReschedulingModalThursdayCheck.checked
        plansItemReschedulingModalThursdayTimeEnd.disabled = !plansItemReschedulingModalThursdayCheck.checked
        plansItemReschedulingModalThursdayPlace.disabled = !plansItemReschedulingModalThursdayCheck.checked
        plansItemReschedulingSetButton("calculate")
    })
    plansItemReschedulingModalFridayCheck.addEventListener("change", function () {
        plansItemReschedulingModalFridayTimeStart.disabled = !plansItemReschedulingModalFridayCheck.checked
        plansItemReschedulingModalFridayTimeEnd.disabled = !plansItemReschedulingModalFridayCheck.checked
        plansItemReschedulingModalFridayPlace.disabled = !plansItemReschedulingModalFridayCheck.checked
        plansItemReschedulingSetButton("calculate")
    })
    plansItemReschedulingModalSaturdayCheck.addEventListener("change", function () {
        plansItemReschedulingModalSaturdayTimeStart.disabled = !plansItemReschedulingModalSaturdayCheck.checked
        plansItemReschedulingModalSaturdayTimeEnd.disabled = !plansItemReschedulingModalSaturdayCheck.checked
        plansItemReschedulingModalSaturdayPlace.disabled = !plansItemReschedulingModalSaturdayCheck.checked
        plansItemReschedulingSetButton("calculate")
    })
    plansItemReschedulingModalSundayCheck.addEventListener("change", function () {
        plansItemReschedulingModalSundayTimeStart.disabled = !plansItemReschedulingModalSundayCheck.checked
        plansItemReschedulingModalSundayTimeEnd.disabled = !plansItemReschedulingModalSundayCheck.checked
        plansItemReschedulingModalSundayPlace.disabled = !plansItemReschedulingModalSundayCheck.checked
        plansItemReschedulingSetButton("calculate")
    })
    plansItemReschedulingModalSetButton.addEventListener("click", plansItemRescheduling)
}

function plansItemReschedulingSetModal(){
    bsPlansItemReschedulingModal.show()
    plansItemReschedulingReset()
    const lessonID = Number(this.attributes.getNamedItem("data-lesson-reschedule-id").value)
    plansItemReschedulingModalSetButton.setAttribute("data-lesson-reschedule-id", lessonID)
}

function plansItemReschedulingReset(validationOnly = false){
    if (!validationOnly){
        plansItemReschedulingModalForm.reset()
        plansItemReschedulingSetButton("calculate")
        plansItemReschedulingModalMondayTimeStart.disabled = true
        plansItemReschedulingModalMondayTimeEnd.disabled = true
        plansItemReschedulingModalMondayPlace.disabled = true
        plansItemReschedulingModalTuesdayTimeStart.disabled = true
        plansItemReschedulingModalTuesdayTimeEnd.disabled = true
        plansItemReschedulingModalTuesdayPlace.disabled = true
        plansItemReschedulingModalWednesdayTimeStart.disabled = true
        plansItemReschedulingModalWednesdayTimeEnd.disabled = true
        plansItemReschedulingModalWednesdayPlace.disabled = true
        plansItemReschedulingModalThursdayTimeStart.disabled = true
        plansItemReschedulingModalThursdayTimeEnd.disabled = true
        plansItemReschedulingModalThursdayPlace.disabled = true
        plansItemReschedulingModalFridayTimeStart.disabled = true
        plansItemReschedulingModalFridayTimeEnd.disabled = true
        plansItemReschedulingModalFridayPlace.disabled = true
        plansItemReschedulingModalSaturdayTimeStart.disabled = true
        plansItemReschedulingModalSaturdayTimeEnd.disabled = true
        plansItemReschedulingModalSaturdayPlace.disabled = true
        plansItemReschedulingModalSundayTimeStart.disabled = true
        plansItemReschedulingModalSundayTimeEnd.disabled = true
        plansItemReschedulingModalSundayPlace.disabled = true
    }
    plansItemFromProgramModalErrorsAlert.classList.add("d-none")
    plansItemFromProgramModalWarningsAlert.classList.add("d-none")
    plansItemFromProgramModalErrors.innerHTML = ""
    plansItemFromProgramModalWarnings.innerHTML = ""
    plansItemReschedulingModalDate.classList.remove("is-invalid")
    plansItemReschedulingModalMondayTimeStart.classList.remove("is-invalid")
    plansItemReschedulingModalMondayTimeEnd.classList.remove("is-invalid")
    plansItemReschedulingModalTuesdayTimeStart.classList.remove("is-invalid")
    plansItemReschedulingModalTuesdayTimeEnd.classList.remove("is-invalid")
    plansItemReschedulingModalWednesdayTimeStart.classList.remove("is-invalid")
    plansItemReschedulingModalWednesdayTimeEnd.classList.remove("is-invalid")
    plansItemReschedulingModalThursdayTimeStart.classList.remove("is-invalid")
    plansItemReschedulingModalThursdayTimeEnd.classList.remove("is-invalid")
    plansItemReschedulingModalFridayTimeStart.classList.remove("is-invalid")
    plansItemReschedulingModalFridayTimeEnd.classList.remove("is-invalid")
    plansItemReschedulingModalSaturdayTimeStart.classList.remove("is-invalid")
    plansItemReschedulingModalSaturdayTimeEnd.classList.remove("is-invalid")
    plansItemReschedulingModalSundayTimeStart.classList.remove("is-invalid")
    plansItemReschedulingModalSundayTimeEnd.classList.remove("is-invalid")
}

function plansItemReschedulingSetButton(status="calculate"){
    switch (status){
        case "calculate":
            plansItemReschedulingModalSetButton.setAttribute("data-action", "calculate")
            plansItemReschedulingModalSetButton.innerHTML = "Рассчитать"
            plansItemReschedulingModalSetButton.classList.remove("btn-warning")
            plansItemReschedulingModalSetButton.classList.add("btn-primary")
            break
        case "set":
            plansItemReschedulingModalSetButton.setAttribute("data-action", "set")
            plansItemReschedulingModalSetButton.innerHTML = "Установить"
            plansItemReschedulingModalSetButton.classList.add("btn-warning")
            plansItemReschedulingModalSetButton.classList.remove("btn-primary")
            break
    }
}

function plansItemReschedulingValidation(errors){
    function setInvalid (errorMsg, elements=[]){
        plansItemFromProgramModalErrorsAlert.classList.remove("d-none")
        plansItemFromProgramModalErrors.insertAdjacentHTML("beforeend", `
        <li>${errorMsg}</li>`)
        elements.forEach(element => {
            element.classList.add("is-invalid")
        })
        validationStatus = false
    }

    function validateStartDate(){
        if (plansItemReschedulingModalDate.value === ""){
            setInvalid(
                "Необходимо указать начальную дату продолжения обучения",
                [plansItemReschedulingModalDate]
            )
            // return
        }
        // const date = new Date(plansItemReschedulingModalDate.value).setUTCHours(0, 0, 0, 0)
        // const today = new Date().setUTCHours(0, 0, 0, 0)
        // if (today > date){
        //     setInvalid(
        //         "Дата продолжения обучения не может быть ранее, чем сегодня",
        //         [plansItemReschedulingModalDate]
        //     )
        // }
    }

    function validateDays() {
        if (
            !plansItemReschedulingModalMondayCheck.checked &&
            !plansItemReschedulingModalTuesdayCheck.checked &&
            !plansItemReschedulingModalWednesdayCheck.checked &&
            !plansItemReschedulingModalThursdayCheck.checked &&
            !plansItemReschedulingModalFridayCheck.checked &&
            !plansItemReschedulingModalSaturdayCheck.checked &&
            !plansItemReschedulingModalSundayCheck.checked
        ){
            setInvalid("Необходимо выбрать хотя бы один день")
        }
    }

    function validateMonday(){
        if (plansItemReschedulingModalMondayCheck.checked){
            if (plansItemReschedulingModalMondayTimeStart.value === ""){
                setInvalid(
                    "ПН: необходимо указать время начала занятия",
                    [plansItemReschedulingModalMondayTimeStart]
                )
            }
            if (plansItemReschedulingModalMondayTimeEnd.value === ""){
                setInvalid(
                    "ПН: необходимо указать время окончания занятия",
                    [plansItemReschedulingModalMondayTimeEnd]
                )
            }
            if (plansItemReschedulingModalMondayTimeStart.value !== "" ||
                plansItemReschedulingModalMondayTimeEnd.value !== ""){
                if (timeUtilsCompareTime(
                    plansItemReschedulingModalMondayTimeStart,
                    plansItemReschedulingModalMondayTimeEnd
                )){
                    setInvalid(
                        "ПН: время окончания занятия не может быть раньше времени начала",
                        [plansItemReschedulingModalMondayTimeStart,
                            plansItemReschedulingModalMondayTimeEnd]
                    )
                }
            }
        }
    }

    function validateTuesday(){
        if (plansItemReschedulingModalTuesdayCheck.checked){
            if (plansItemReschedulingModalTuesdayTimeStart.value === ""){
                setInvalid(
                    "ВТ: необходимо указать время начала занятия",
                    [plansItemReschedulingModalTuesdayTimeStart]
                )
            }
            if (plansItemReschedulingModalTuesdayTimeEnd.value === ""){
                setInvalid(
                    "ВТ: необходимо указать время окончания занятия",
                    [plansItemReschedulingModalTuesdayTimeEnd]
                )
            }
            if (plansItemReschedulingModalTuesdayTimeStart.value !== "" ||
                plansItemReschedulingModalTuesdayTimeEnd.value !== ""){
                if (timeUtilsCompareTime(
                    plansItemReschedulingModalTuesdayTimeStart,
                    plansItemReschedulingModalTuesdayTimeEnd
                )){
                    setInvalid(
                        "ВТ: время окончания занятия не может быть раньше времени начала",
                        [plansItemReschedulingModalMondayTimeStart,
                            plansItemReschedulingModalTuesdayTimeEnd]
                    )
                }
            }
        }
    }

    function validateWednesday(){
        if (plansItemReschedulingModalWednesdayCheck.checked){
            if (plansItemReschedulingModalWednesdayTimeStart.value === ""){
                setInvalid(
                    "СР: необходимо указать время начала занятия",
                    [plansItemReschedulingModalWednesdayTimeStart]
                )
            }
            if (plansItemReschedulingModalWednesdayTimeEnd.value === ""){
                setInvalid(
                    "СР: необходимо указать время окончания занятия",
                    [plansItemReschedulingModalWednesdayTimeEnd]
                )
            }
            if (plansItemReschedulingModalWednesdayTimeStart.value !== "" ||
                plansItemReschedulingModalWednesdayTimeEnd.value !== ""){
                if (timeUtilsCompareTime(
                    plansItemReschedulingModalWednesdayTimeStart,
                    plansItemReschedulingModalWednesdayTimeEnd
                )){
                    setInvalid(
                        "СР: время окончания занятия не может быть раньше времени начала",
                        [plansItemReschedulingModalWednesdayTimeStart,
                            plansItemReschedulingModalWednesdayTimeEnd]
                    )
                }
            }
        }
    }

    function validateThursday(){
        if (plansItemReschedulingModalThursdayCheck.checked){
            if (plansItemReschedulingModalThursdayTimeStart.value === ""){
                setInvalid(
                    "ЧТ: необходимо указать время начала занятия",
                    [plansItemReschedulingModalThursdayTimeStart]
                )
            }
            if (plansItemReschedulingModalThursdayTimeEnd.value === ""){
                setInvalid(
                    "ЧТ: необходимо указать время окончания занятия",
                    [plansItemReschedulingModalThursdayTimeEnd]
                )
            }
            if (plansItemReschedulingModalThursdayTimeStart.value !== "" ||
                plansItemReschedulingModalThursdayTimeEnd.value !== ""){
                if (timeUtilsCompareTime(
                    plansItemReschedulingModalThursdayTimeStart,
                    plansItemReschedulingModalThursdayTimeEnd
                )){
                    setInvalid(
                        "ЧТ: время окончания занятия не может быть раньше времени начала",
                        [plansItemReschedulingModalThursdayTimeStart,
                            plansItemReschedulingModalThursdayTimeEnd]
                    )
                }
            }
        }
    }

    function validateFriday(){
        if (plansItemReschedulingModalFridayCheck.checked){
            if (plansItemReschedulingModalFridayTimeStart.value === ""){
                setInvalid(
                    "ПТ: необходимо указать время начала занятия",
                    [plansItemReschedulingModalFridayTimeStart]
                )
            }
            if (plansItemReschedulingModalFridayTimeEnd.value === ""){
                setInvalid(
                    "ПТ: необходимо указать время окончания занятия",
                    [plansItemReschedulingModalFridayTimeEnd]
                )
            }
            if (plansItemReschedulingModalFridayTimeStart.value !== "" ||
                plansItemReschedulingModalFridayTimeEnd.value !== ""){
                if (timeUtilsCompareTime(
                    plansItemReschedulingModalFridayTimeStart,
                    plansItemReschedulingModalFridayTimeEnd
                )){
                    setInvalid(
                        "ПТ: время окончания занятия не может быть раньше времени начала",
                        [plansItemReschedulingModalFridayTimeStart,
                            plansItemReschedulingModalFridayTimeEnd]
                    )
                }
            }
        }
    }

    function validateSaturday(){
        if (plansItemReschedulingModalSaturdayCheck.checked){
            if (plansItemReschedulingModalSaturdayTimeStart.value === ""){
                setInvalid(
                    "СБ: необходимо указать время начала занятия",
                    [plansItemReschedulingModalSaturdayTimeStart]
                )
            }
            if (plansItemReschedulingModalSaturdayTimeEnd.value === ""){
                setInvalid(
                    "СБ: необходимо указать время окончания занятия",
                    [plansItemReschedulingModalSaturdayTimeEnd]
                )
            }
            if (plansItemReschedulingModalSaturdayTimeStart.value !== "" ||
                plansItemReschedulingModalSaturdayTimeEnd.value !== ""){
                if (timeUtilsCompareTime(
                    plansItemReschedulingModalSaturdayTimeStart,
                    plansItemReschedulingModalSaturdayTimeEnd
                )){
                    setInvalid(
                        "СБ: время окончания занятия не может быть раньше времени начала",
                        [plansItemReschedulingModalSaturdayTimeStart,
                            plansItemReschedulingModalSaturdayTimeEnd]
                    )
                }
            }
        }
    }

    function validateSunday(){
        if (plansItemReschedulingModalSundayCheck.checked){
            if (plansItemReschedulingModalSundayTimeStart.value === ""){
                setInvalid(
                    "ВС: необходимо указать время начала занятия",
                    [plansItemReschedulingModalSundayTimeStart]
                )
            }
            if (plansItemReschedulingModalSundayTimeEnd.value === ""){
                setInvalid(
                    "ВС: необходимо указать время окончания занятия",
                    [plansItemReschedulingModalSundayTimeEnd]
                )
            }
            if (plansItemReschedulingModalSundayTimeStart.value !== "" ||
                plansItemReschedulingModalSundayTimeEnd.value !== ""){
                if (timeUtilsCompareTime(
                    plansItemReschedulingModalSundayTimeStart,
                    plansItemReschedulingModalSundayTimeEnd
                )){
                    setInvalid(
                        "ВС: время окончания занятия не может быть раньше времени начала",
                        [plansItemReschedulingModalSundayTimeStart,
                            plansItemReschedulingModalSundayTimeEnd]
                    )
                }
            }
        }
    }

    let validationStatus = true
    plansItemReschedulingReset(true)
    if (errors){
        if (errors.errors){
            plansItemFromProgramModalErrorsAlert.classList.remove("d-none")
            plansItemFromProgramModalErrors.innerHTML = errors.errors
        }
        if (errors.warnings){
            plansItemFromProgramModalWarningsAlert.classList.remove("d-none")
            plansItemFromProgramModalWarnings.innerHTML = errors.warnings
        }
    } else {
        validateStartDate()
        validateDays()
        validateMonday()
        validateTuesday()
        validateWednesday()
        validateThursday()
        validateFriday()
        validateSaturday()
        validateSunday()
    }
    return validationStatus
}

function plansItemRescheduling(){
    function getFormData(){
        const fd = new FormData(plansItemReschedulingModalForm)
        if (fd.has("monday_place") && fd.get("monday_place") === "None"){
            fd.delete("monday_place")
        }
        if (fd.has("tuesday_place") && fd.get("tuesday_place") === "None"){
            fd.delete("tuesday_place")
        }
        if (fd.has("wednesday_place") && fd.get("wednesday_place") === "None"){
            fd.delete("wednesday_place")
        }
        if (fd.has("thursday_place") && fd.get("thursday_place") === "None"){
            fd.delete("thursday_place")
        }
        if (fd.has("friday_place") && fd.get("friday_place") === "None"){
            fd.delete("friday_place")
        }
        if (fd.has("saturday_place") && fd.get("saturday_place") === "None"){
            fd.delete("saturday_place")
        }
        if (fd.has("sunday_place") && fd.get("sunday_place") === "None"){
            fd.delete("sunday_place")
        }
        return fd
    }

    if (plansItemReschedulingValidation()){
        const lessonID = plansItemReschedulingModalSetButton.attributes.getNamedItem("data-lesson-reschedule-id").value
        const fd = getFormData()
        switch (plansItemReschedulingModalSetButton.attributes.getNamedItem("data-action").value){
            case "calculate":
                lessonsAPIReschedulingCalculate(lessonID, fd).then(request => {
                    switch (request.status){
                        case 200:
                            plansItemReschedulingModalProgInfoList.innerHTML = `
                    <li class="list-group">Будет перенесено ${request.response.count} уроков</li>
                    <li class="list-group">Осталось ${request.response.total_hours} часов обучения</li>
                    <li class="list-group">Плановая дата окончания ${new Date(request.response.last_date).toLocaleDateString()}</li>
                    `
                            plansItemReschedulingSetButton("set")
                            break
                        case 400:
                            plansItemReschedulingValidation(request.response)
                            break
                        default:
                            break
                    }
                })
                break
            case "set":
                lessonsAPIReschedulingSet(lessonID, fd).then(request => {
                    switch (request.status){
                        case 201:
                            bsPlansItemReschedulingModal.hide()
                            showSuccessToast("Расписание успешно изменено")
                            setTimeout(function () {
                                location.reload()
                            }, 500)
                            break
                        case 400:
                            plansItemReschedulingValidation(request.response)
                            plansItemReschedulingSetButton("calculate")
                            break
                        default:
                            bsPlansItemReschedulingModal.hide()
                            showErrorToast()
                            break
                    }
                })
                break
        }


    }
}

//Bootstrap Elements
const plansItemReschedulingModal = document.querySelector("#plansItemReschedulingModal")
const bsPlansItemReschedulingModal = new bootstrap.Modal(plansItemReschedulingModal)

//Form
const plansItemReschedulingModalForm = plansItemReschedulingModal.querySelector("#plansItemReschedulingModalForm")
const plansItemReschedulingModalDate = plansItemReschedulingModalForm.querySelector("#plansItemReschedulingModalDate")
const plansItemReschedulingModalMondayCheck = plansItemReschedulingModalForm.querySelector("#plansItemReschedulingModalMondayCheck")
const plansItemReschedulingModalMondayTimeStart = plansItemReschedulingModalForm.querySelector("#plansItemReschedulingModalMondayTimeStart")
const plansItemReschedulingModalMondayTimeEnd = plansItemReschedulingModalForm.querySelector("#plansItemReschedulingModalMondayTimeEnd")
const plansItemReschedulingModalMondayPlace = plansItemReschedulingModalForm.querySelector("#plansItemReschedulingModalMondayPlace")
const plansItemReschedulingModalTuesdayCheck = plansItemReschedulingModalForm.querySelector("#plansItemReschedulingModalTuesdayCheck")
const plansItemReschedulingModalTuesdayTimeStart = plansItemReschedulingModalForm.querySelector("#plansItemReschedulingModalTuesdayTimeStart")
const plansItemReschedulingModalTuesdayTimeEnd = plansItemReschedulingModalForm.querySelector("#plansItemReschedulingModalTuesdayTimeEnd")
const plansItemReschedulingModalTuesdayPlace = plansItemReschedulingModalForm.querySelector("#plansItemReschedulingModalTuesdayPlace")
const plansItemReschedulingModalWednesdayCheck = plansItemReschedulingModalForm.querySelector("#plansItemReschedulingModalWednesdayCheck")
const plansItemReschedulingModalWednesdayTimeStart = plansItemReschedulingModalForm.querySelector("#plansItemReschedulingModalWednesdayTimeStart")
const plansItemReschedulingModalWednesdayTimeEnd = plansItemReschedulingModalForm.querySelector("#plansItemReschedulingModalWednesdayTimeEnd")
const plansItemReschedulingModalWednesdayPlace = plansItemReschedulingModalForm.querySelector("#plansItemReschedulingModalWednesdayPlace")
const plansItemReschedulingModalThursdayCheck = plansItemReschedulingModalForm.querySelector("#plansItemReschedulingModalThursdayCheck")
const plansItemReschedulingModalThursdayTimeStart = plansItemReschedulingModalForm.querySelector("#plansItemReschedulingModalThursdayTimeStart")
const plansItemReschedulingModalThursdayTimeEnd = plansItemReschedulingModalForm.querySelector("#plansItemReschedulingModalThursdayTimeEnd")
const plansItemReschedulingModalThursdayPlace = plansItemReschedulingModalForm.querySelector("#plansItemReschedulingModalThursdayPlace")
const plansItemReschedulingModalFridayCheck = plansItemReschedulingModalForm.querySelector("#plansItemReschedulingModalFridayCheck")
const plansItemReschedulingModalFridayTimeStart = plansItemReschedulingModalForm.querySelector("#plansItemReschedulingModalFridayTimeStart")
const plansItemReschedulingModalFridayTimeEnd = plansItemReschedulingModalForm.querySelector("#plansItemReschedulingModalFridayTimeEnd")
const plansItemReschedulingModalFridayPlace = plansItemReschedulingModalForm.querySelector("#plansItemReschedulingModalFridayPlace")
const plansItemReschedulingModalSaturdayCheck = plansItemReschedulingModalForm.querySelector("#plansItemReschedulingModalSaturdayCheck")
const plansItemReschedulingModalSaturdayTimeStart = plansItemReschedulingModalForm.querySelector("#plansItemReschedulingModalSaturdayTimeStart")
const plansItemReschedulingModalSaturdayTimeEnd = plansItemReschedulingModalForm.querySelector("#plansItemReschedulingModalSaturdayTimeEnd")
const plansItemReschedulingModalSaturdayPlace = plansItemReschedulingModalForm.querySelector("#plansItemReschedulingModalSaturdayPlace")
const plansItemReschedulingModalSundayCheck = plansItemReschedulingModalForm.querySelector("#plansItemReschedulingModalSundayCheck")
const plansItemReschedulingModalSundayTimeStart = plansItemReschedulingModalForm.querySelector("#plansItemReschedulingModalSundayTimeStart")
const plansItemReschedulingModalSundayTimeEnd = plansItemReschedulingModalForm.querySelector("#plansItemReschedulingModalSundayTimeEnd")
const plansItemReschedulingModalSundayPlace = plansItemReschedulingModalForm.querySelector("#plansItemReschedulingModalSundayPlace")

//Alerts
const plansItemFromProgramModalErrorsAlert = plansItemReschedulingModal.querySelector("#plansItemFromProgramModalErrorsAlert")
const plansItemFromProgramModalErrors = plansItemReschedulingModal.querySelector("#plansItemFromProgramModalErrors")
const plansItemFromProgramModalWarningsAlert = plansItemReschedulingModal.querySelector("#plansItemFromProgramModalWarningsAlert")
const plansItemFromProgramModalWarnings = plansItemReschedulingModal.querySelector("#plansItemFromProgramModalWarnings")

const plansItemReschedulingModalProgInfoList = plansItemReschedulingModal.querySelector("#plansItemReschedulingModalProgInfoList")
const plansItemReschedulingModalSetButton = plansItemReschedulingModal.querySelector("#plansItemReschedulingModalSetButton")

plansItemReschedulingMain()
