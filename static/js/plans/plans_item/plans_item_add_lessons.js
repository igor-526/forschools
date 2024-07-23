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
    plansItemAddLessonsModalAddButton.addEventListener("click", plansItemAddLessonsCreate)
}

function plansItemAddLessonsSetModal(){
    plansItemAddLessonsResetModal(false)
    bsPlansItemAddLessonsModal.show()
}

function plansItemAddLessonsResetModal(validationOnly = false){
    if (validationOnly === false){
        plansItemAddLessonsModalDate.value = ""
        plansItemAddLessonsModalCount.value = ""
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

function plansItemAddLessonsValidation(errors, warnings){
    return true
}

function plansItemAddLessonsCreate(){
    if (plansItemAddLessonsValidation){
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
const plansItemAddLessonsModalCount = plansItemAddLessonsModalForm.querySelector("#plansItemAddLessonsModalCount")
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

plansItemAddLessonsMain()