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
    const lessonID = Number(this.attributes.getNamedItem("data-lesson-reschedule-id").value)
    plansItemReschedulingModalSetButton.setAttribute("data-lesson-reschedule-id", lessonID)
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
    return true
}

function plansItemRescheduling(){
    if (plansItemReschedulingValidation()){
        const lessonID = plansItemReschedulingModalSetButton.attributes.getNamedItem("data-lesson-reschedule-id").value
        const fd = new FormData(plansItemReschedulingModalForm)
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

const plansItemReschedulingModalProgInfoList = plansItemReschedulingModal.querySelector("#plansItemReschedulingModalProgInfoList")
const plansItemReschedulingModalSetButton = plansItemReschedulingModal.querySelector("#plansItemReschedulingModalSetButton")

plansItemReschedulingMain()
