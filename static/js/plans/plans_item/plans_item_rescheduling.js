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
    })
    plansItemReschedulingModalTuesdayCheck.addEventListener("change", function () {
        plansItemReschedulingModalTuesdayTimeStart.disabled = !plansItemReschedulingModalTuesdayCheck.checked
        plansItemReschedulingModalTuesdayTimeEnd.disabled = !plansItemReschedulingModalTuesdayCheck.checked
        plansItemReschedulingModalTuesdayPlace.disabled = !plansItemReschedulingModalTuesdayCheck.checked
    })
    plansItemReschedulingModalWednesdayCheck.addEventListener("change", function () {
        plansItemReschedulingModalWednesdayTimeStart.disabled = !plansItemReschedulingModalWednesdayCheck.checked
        plansItemReschedulingModalWednesdayTimeEnd.disabled = !plansItemReschedulingModalWednesdayCheck.checked
        plansItemReschedulingModalWednesdayPlace.disabled = !plansItemReschedulingModalWednesdayCheck.checked
    })
    plansItemReschedulingModalThursdayCheck.addEventListener("change", function () {
        plansItemReschedulingModalThursdayTimeStart.disabled = !plansItemReschedulingModalThursdayCheck.checked
        plansItemReschedulingModalThursdayTimeEnd.disabled = !plansItemReschedulingModalThursdayCheck.checked
        plansItemReschedulingModalThursdayPlace.disabled = !plansItemReschedulingModalThursdayCheck.checked
    })
    plansItemReschedulingModalFridayCheck.addEventListener("change", function () {
        plansItemReschedulingModalFridayTimeStart.disabled = !plansItemReschedulingModalFridayCheck.checked
        plansItemReschedulingModalFridayTimeEnd.disabled = !plansItemReschedulingModalFridayCheck.checked
        plansItemReschedulingModalFridayPlace.disabled = !plansItemReschedulingModalFridayCheck.checked
    })
    plansItemReschedulingModalSaturdayCheck.addEventListener("change", function () {
        plansItemReschedulingModalSaturdayTimeStart.disabled = !plansItemReschedulingModalSaturdayCheck.checked
        plansItemReschedulingModalSaturdayTimeEnd.disabled = !plansItemReschedulingModalSaturdayCheck.checked
        plansItemReschedulingModalSaturdayPlace.disabled = !plansItemReschedulingModalSaturdayCheck.checked
    })
    plansItemReschedulingModalSundayCheck.addEventListener("change", function () {
        plansItemReschedulingModalSundayTimeStart.disabled = !plansItemReschedulingModalSundayCheck.checked
        plansItemReschedulingModalSundayTimeEnd.disabled = !plansItemReschedulingModalSundayCheck.checked
        plansItemReschedulingModalSundayPlace.disabled = !plansItemReschedulingModalSundayCheck.checked
    })
}

function plansItemReschedulingSetModal(){
    bsPlansItemReschedulingModal.show()
    plansItemReschedulingModalForm.reset()
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
    const lessonID = Number(this.attributes.getNamedItem("data-lesson-reschedule-id").value)
}

function plansItemReschedulingValidation(errors){

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

plansItemReschedulingMain()
