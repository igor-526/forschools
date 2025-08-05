async function plansItemFromProgramMain(){
    plansItemFromProgramFormDayListeners()
    programsAPIProgramGetAll().then(request => {
        if (request.status === 200){
            plansItemFromProgramSetPrograms(request.response)
        }
    })
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
    pFromProgramModalSetButton.addEventListener('click', function (){
        plansItemFromProgramCalculate().then()
    })
    plansItemGenerateButton.addEventListener('click', plansItemFromProgramReset)
    plansItemFromProgramModalSearch.addEventListener("input", plansItemFromProgramSearch)
}

function plansItemFromProgramSetPrograms(programs){

    function elementListener(){
        plansItemFromProgramModalSelected = Number(this.attributes.getNamedItem("data-program-id").value)
        programsAPIProgramGetItem(this.attributes.getNamedItem("data-program-id").value).then(request => {
            if (request.status === 200){
                pFromProgramModalProgInfoTitle.innerHTML = request.response.name
                pFromProgramModalProgInfoList.innerHTML = `
                    <li class="list-group-item">Количество этапов: ${request.response.info.phases}</li>
                    <li class="list-group-item">Количество уроков: ${request.response.info.lessons}</li>
                    <li class="list-group-item">Количество ДЗ: ${request.response.info.homeworks}</li>
                    <li class="list-group-item">Цель программы: ${request.response.purpose}</li>
                    `
                if (request.response.owner){
                    pFromProgramModalProgInfoList.insertAdjacentHTML('beforeend', `
                    <li class="list-group-item">Владелец: <a href="/profile/${request.response.owner.id}">${request.response.owner.first_name} ${request.response.owner.last_name}</a> </li>`)
                }
                pFromProgramModalSetButton.classList.add("btn-primary")
                pFromProgramModalSetButton.classList.remove("btn-warning")
                pFromProgramModalSetButton.innerHTML = "Рассчитать"
                pFromProgramModalSetButton.attributes.getNamedItem("data-action").value = "calculate"
            }
        })

    }

    function getElement(program){
        const element = document.createElement("button")
        element.classList.add("nav-link")
        element.setAttribute("data-bs-toggle", "pill")
        element.setAttribute("data-program-id", program.id)
        element.type = "button"
        element.role = "tab"
        element.id = `plansItemFromProgramModalProgListP${program.id}`
        element.innerHTML = program.name
        element.addEventListener("click", elementListener)
        return element
    }

    programs.forEach(prog => {
        pFromProgramModalProgList.insertAdjacentElement('beforeend', getElement(prog))
    })
}

function plansItemFromProgramSearch(){
    if (this.value === ""){
        pFromProgramModalProgList.querySelectorAll(".nav-link").forEach(p => {
            p.classList.remove("d-none")
        })
    } else {
        const query = new RegExp(this.value.toLowerCase())
        pFromProgramModalProgList.querySelectorAll(".nav-link").forEach(p => {
            if (!query.test(p.innerHTML.toLowerCase())){
                p.classList.add("d-none")
            }
        })
    }
}

function plansItemFromProgramFormDayListeners(){
    pFromProgramModalDMondayCheck.addEventListener("change", function (){
        if (pFromProgramModalDMondayCheck.checked){
            pFromProgramModalDMondayTimeStart.disabled = false
            pFromProgramModalDMondayTimeEnd.disabled = false
            pFromProgramModalDMondayPlace.disabled = false
        } else {
            pFromProgramModalDMondayTimeStart.disabled = true
            pFromProgramModalDMondayTimeEnd.disabled = true
            pFromProgramModalDMondayPlace.disabled = true
        }
    })
    pFromProgramModalDTuesdayCheck.addEventListener("change", function (){
        if (pFromProgramModalDTuesdayCheck.checked){
            pFromProgramModalDTuesdayTimeStart.disabled = false
            pFromProgramModalDTuesdayTimeEnd.disabled = false
            pFromProgramModalDTuesdayPlace.disabled = false
        } else {
            pFromProgramModalDTuesdayTimeStart.disabled = true
            pFromProgramModalDTuesdayTimeEnd.disabled = true
            pFromProgramModalDTuesdayPlace.disabled = true
        }
    })
    pFromProgramModalDWednesdayCheck.addEventListener("change", function (){
        if (pFromProgramModalDWednesdayCheck.checked){
            pFromProgramModalDWednesdayTimeStart.disabled = false
            pFromProgramModalDWednesdayTimeEnd.disabled = false
            pFromProgramModalDWednesdayPlace.disabled = false
        } else {
            pFromProgramModalDWednesdayTimeStart.disabled = true
            pFromProgramModalDWednesdayTimeEnd.disabled = true
            pFromProgramModalDWednesdayPlace.disabled = true
        }
    })
    pFromProgramModalDThursdayCheck.addEventListener("change", function (){
        if (pFromProgramModalDThursdayCheck.checked){
            pFromProgramModalDThursdayTimeStart.disabled = false
            pFromProgramModalDThursdayTimeEnd.disabled = false
            pFromProgramModalDThursdayPlace.disabled = false
        } else {
            pFromProgramModalDThursdayTimeStart.disabled = true
            pFromProgramModalDThursdayTimeEnd.disabled = true
            pFromProgramModalDThursdayPlace.disabled = true
        }
    })
    pFromProgramModalDFridayCheck.addEventListener("change", function (){
        if (pFromProgramModalDFridayCheck.checked){
            pFromProgramModalDFridayTimeStart.disabled = false
            pFromProgramModalDFridayTimeEnd.disabled = false
            pFromProgramModalDFridayPlace.disabled = false
        } else {
            pFromProgramModalDFridayTimeStart.disabled = true
            pFromProgramModalDFridayTimeEnd.disabled = true
            pFromProgramModalDFridayPlace.disabled = true
        }
    })
    pFromProgramModalDSaturdayCheck.addEventListener("change", function (){
        if (pFromProgramModalDSaturdayCheck.checked){
            pFromProgramModalDSaturdayTimeStart.disabled = false
            pFromProgramModalDSaturdayTimeEnd.disabled = false
            pFromProgramModalDSaturdayPlace.disabled = false
        } else {
            pFromProgramModalDSaturdayTimeStart.disabled = true
            pFromProgramModalDSaturdayTimeEnd.disabled = true
            pFromProgramModalDSaturdayPlace.disabled = true
        }
    })
    pFromProgramModalDSundayCheck.addEventListener("change", function (){
        if (pFromProgramModalDSundayCheck.checked){
            pFromProgramModalDSundayTimeStart.disabled = false
            pFromProgramModalDSundayTimeEnd.disabled = false
            pFromProgramModalDSundayPlace.disabled = false
        } else {
            pFromProgramModalDSundayTimeStart.disabled = true
            pFromProgramModalDSundayTimeEnd.disabled = true
            pFromProgramModalDSundayPlace.disabled = true
        }
    })

}

function plansItemFromProgramResetValidation(){
    pFromProgramModalDate.classList.remove("is-invalid")
    pFromProgramModalDMondayTimeStart.classList.remove("is-invalid")
    pFromProgramModalDMondayTimeEnd.classList.remove("is-invalid")
    pFromProgramModalDTuesdayTimeStart.classList.remove("is-invalid")
    pFromProgramModalDTuesdayTimeEnd.classList.remove("is-invalid")
    pFromProgramModalDWednesdayTimeStart.classList.remove("is-invalid")
    pFromProgramModalDWednesdayTimeEnd.classList.remove("is-invalid")
    pFromProgramModalDThursdayTimeStart.classList.remove("is-invalid")
    pFromProgramModalDThursdayTimeEnd.classList.remove("is-invalid")
    pFromProgramModalDFridayTimeStart.classList.remove("is-invalid")
    pFromProgramModalDFridayTimeEnd.classList.remove("is-invalid")
    pFromProgramModalDSaturdayTimeStart.classList.remove("is-invalid")
    pFromProgramModalDSaturdayTimeEnd.classList.remove("is-invalid")
    pFromProgramModalDSundayTimeStart.classList.remove("is-invalid")
    pFromProgramModalDSundayTimeEnd.classList.remove("is-invalid")
    pFromProgramModalErrors.innerHTML = ""
    pFromProgramModalErrorsAlert.classList.add("d-none")
}

function plansItemFromProgramReset(){
    function setDay(data, check, start, end, place){
        if (data){
            check.checked = true
            start.value = data.start
            end.value = data.end
            place.value = data.place ? data.place : "None"
            start.disabled = false
            end.disabled = false
            place.disabled = false
        } else {
            check.checked = false
            start.value = ""
            end.value = ""
            place.value = "None"
            start.disabled = true
            end.disabled = true
            place.disabled = true
        }
    }

    plansItemFromProgramResetValidation()

    plansAPIGetSchedule(planID).then(request => {
            setDay(
                request.status === 200 && request.response.item.hasOwnProperty(0) ? request.response.item[0] : null,
                pFromProgramModalDMondayCheck,
                pFromProgramModalDMondayTimeStart,
                pFromProgramModalDMondayTimeEnd,
                pFromProgramModalDMondayPlace
            )
            setDay(
                request.status === 200 && request.response.item.hasOwnProperty(1) ? request.response.item[1] : null,
                pFromProgramModalDTuesdayCheck,
                pFromProgramModalDTuesdayTimeStart,
                pFromProgramModalDTuesdayTimeEnd,
                pFromProgramModalDTuesdayPlace
            )
            setDay(
                request.status === 200 && request.response.item.hasOwnProperty(2) ? request.response.item[2] : null,
                pFromProgramModalDWednesdayCheck,
                pFromProgramModalDWednesdayTimeStart,
                pFromProgramModalDWednesdayTimeEnd,
                pFromProgramModalDWednesdayPlace
            )
            setDay(
                request.status === 200 && request.response.item.hasOwnProperty(3) ? request.response.item[3] : null,
                pFromProgramModalDThursdayCheck,
                pFromProgramModalDThursdayTimeStart,
                pFromProgramModalDThursdayTimeEnd,
                pFromProgramModalDThursdayPlace
            )
            setDay(
                request.status === 200 && request.response.item.hasOwnProperty(4) ? request.response.item[4] : null,
                pFromProgramModalDFridayCheck,
                pFromProgramModalDFridayTimeStart,
                pFromProgramModalDFridayTimeEnd,
                pFromProgramModalDFridayPlace
            )
            setDay(
                request.status === 200 && request.response.item.hasOwnProperty(5) ? request.response.item[5] : null,
                pFromProgramModalDSaturdayCheck,
                pFromProgramModalDSaturdayTimeStart,
                pFromProgramModalDSaturdayTimeEnd,
                pFromProgramModalDSaturdayPlace
            )
            setDay(
                request.status === 200 && request.response.item.hasOwnProperty(6) ? request.response.item[6] : null,
                pFromProgramModalDSundayCheck,
                pFromProgramModalDSundayTimeStart,
                pFromProgramModalDSundayTimeEnd,
                pFromProgramModalDSundayPlace
            )
    })

    const activeProgram = pFromProgramModalProgList.querySelector(".active")
    if (activeProgram){
        activeProgram.classList.remove("active")
    }
    plansItemFromProgramModalSelected = undefined
    pFromProgramModalProgInfoTitle.innerHTML = "Программа"
    pFromProgramModalProgInfoList.innerHTML = '<li class="list-group-item">Выберите программу</li>'
}

function plansItemFromProgramClientValidation(){

    function compareTime(start, end){
        const tsH = start.value.split(":")[0]
        const tsM = start.value.split(":")[1]
        const teH = end.value.split(":")[0]
        const teM = end.value.split(":")[1]
        const ts = new Date().setHours(tsH, tsM)
        const te = new Date().setHours(teH, teM)
        return te <= ts
    }

    function setInvalid(error, elements = []){
        elements.forEach(element => element.classList.add("is-invalid"))
        errors.push(error)
        validationStatus = false
    }

    function validateTime(check, ts, te, ds){
        if (check.checked){
            checkedAnything = true

            if (ts.value !== "" && te.value !== ""){
                if (compareTime(ts, te)){
                    setInvalid(
                        `${ds}: окончание занятия должно быть позже начала`,
                        [
                            ts,
                            te
                        ]
                    )
                }
            } else {
                if (ts.value === ""){
                    setInvalid(
                        `${ds}: начало занятия не может быть пустым`,
                        [ts]
                    )
                }
                if (te.value === ""){
                    setInvalid(
                        `${ds}: окончание занятия не может быть пустым`,
                        [te]
                    )
                }
            }
        }
    }

    plansItemFromProgramResetValidation()
    let validationStatus = true
    let errors = []
    let checkedAnything = false

    if (pFromProgramModalDate.value === ""){
        setInvalid("Необходимо указать дату начала обучения",
            [pFromProgramModalDate])
    } else {
        if (new Date().getDate() > new Date(pFromProgramModalDate.value).getDate()){
            setInvalid("Дата начала обучения не может быть раньше, чем сегодня",
                [pFromProgramModalDate])
        }
    }

    validateTime(
        pFromProgramModalDMondayCheck,
        pFromProgramModalDMondayTimeStart,
        pFromProgramModalDMondayTimeEnd,
        "Понедельник"
    )
    validateTime(
        pFromProgramModalDTuesdayCheck,
        pFromProgramModalDTuesdayTimeStart,
        pFromProgramModalDTuesdayTimeEnd,
        "Вторник"
    )
    validateTime(
        pFromProgramModalDWednesdayCheck,
        pFromProgramModalDWednesdayTimeStart,
        pFromProgramModalDWednesdayTimeEnd,
        "Среда"
    )
    validateTime(
        pFromProgramModalDThursdayCheck,
        pFromProgramModalDThursdayTimeStart,
        pFromProgramModalDThursdayTimeEnd,
        "Четверг"
    )
    validateTime(
        pFromProgramModalDFridayCheck,
        pFromProgramModalDFridayTimeStart,
        pFromProgramModalDFridayTimeEnd,
        "Пятница"
    )
    validateTime(
        pFromProgramModalDSaturdayCheck,
        pFromProgramModalDSaturdayTimeStart,
        pFromProgramModalDSaturdayTimeEnd,
        "Суббота"
    )
    validateTime(
        pFromProgramModalDSundayCheck,
        pFromProgramModalDSundayTimeStart,
        pFromProgramModalDSundayTimeEnd,
        "Воскресенье"
    )

    if (!checkedAnything){
        setInvalid("Необходимо выбрать хотя бы один день недели")
    }

    if (plansItemFromProgramModalSelected === undefined){
        setInvalid("Необходимо выбрать программу обучения",
            [])
    }

    if (errors.length > 0){
        pFromProgramModalErrors.innerHTML = errors.join("<br>")
        pFromProgramModalErrorsAlert.classList.remove("d-none")
    }
    return validationStatus
}

async function plansItemFromProgramCalculate(){
    if (plansItemFromProgramClientValidation()){
        const fd = new FormData(pFromProgramModalDForm)
        fd.append("programID", plansItemFromProgramModalSelected)
        switch (pFromProgramModalSetButton.attributes.getNamedItem("data-action").value){
            case "calculate":
                planItemAPICalculateFromProgram(fd, planID).then(request => {
                    if (request.status === 200){
                        pFromProgramModalProgInfoTitle.innerHTML = "Предварительный расчёт"
                        pFromProgramModalProgInfoList.innerHTML = `
                            <li class="list-group-item">Количество этапов: ${request.response.info.phases}</li>
                            <li class="list-group-item">Количество уроков: ${request.response.info.lessons}</li>
                            <li class="list-group-item">Количество ДЗ: ${request.response.info.homeworks}</li>
                            <li class="list-group-item">Количество часов: ${request.response.total_hours}</li>
                            <li class="list-group-item">Плановая дата окончания: ${new Date(request.response.last_date).toLocaleDateString()}</li>
                            `
                        pFromProgramModalSetButton.classList.remove("btn-primary")
                        pFromProgramModalSetButton.classList.add("btn-warning")
                        pFromProgramModalSetButton.innerHTML = "Установить"
                        pFromProgramModalSetButton.attributes.getNamedItem("data-action").value = "set"
                    }
                })
                break
            case "set":
                planItemAPISetPlanFromProgram(fd, planID).then(request => {
                    if (request.status === 201){
                        bsPlansItemFromProgramModal.hide()
                        planItemMain()
                        plansItemGenerateButton.remove()
                    }
                })
                break
        }
    }
}

let plansItemFromProgramModalSelected

//bootstrap elements
const plansItemFromProgramModal = document.querySelector("#plansItemFromProgramModal")
const bsPlansItemFromProgramModal = new bootstrap.Modal(plansItemFromProgramModal)

//search
const plansItemFromProgramModalSearch = plansItemFromProgramModal.querySelector("#plansItemFromProgramModalSearch")

//form days
const pFromProgramModalDForm = plansItemFromProgramModal.querySelector("#plansItemFromProgramModalDForm")
const pFromProgramModalDate = plansItemFromProgramModal.querySelector("#plansItemFromProgramModalDate")
const pFromProgramModalDMondayCheck = pFromProgramModalDForm.querySelector("#plansItemFromProgramModalDMondayCheck")
const pFromProgramModalDMondayTimeStart = pFromProgramModalDForm.querySelector("#plansItemFromProgramModalDMondayTimeStart")
const pFromProgramModalDMondayTimeEnd = pFromProgramModalDForm.querySelector("#plansItemFromProgramModalDMondayTimeEnd")
const pFromProgramModalDMondayPlace = pFromProgramModalDForm.querySelector("#plansItemFromProgramModalDMondayPlace")
const pFromProgramModalDTuesdayCheck = pFromProgramModalDForm.querySelector("#plansItemFromProgramModalDTuesdayCheck")
const pFromProgramModalDTuesdayTimeStart = pFromProgramModalDForm.querySelector("#plansItemFromProgramModalDTuesdayTimeStart")
const pFromProgramModalDTuesdayTimeEnd = pFromProgramModalDForm.querySelector("#plansItemFromProgramModalDTuesdayTimeEnd")
const pFromProgramModalDTuesdayPlace = pFromProgramModalDForm.querySelector("#plansItemFromProgramModalDTuesdayPlace")
const pFromProgramModalDWednesdayCheck = pFromProgramModalDForm.querySelector("#plansItemFromProgramModalDWednesdayCheck")
const pFromProgramModalDWednesdayTimeStart = pFromProgramModalDForm.querySelector("#plansItemFromProgramModalDWednesdayTimeStart")
const pFromProgramModalDWednesdayTimeEnd = pFromProgramModalDForm.querySelector("#plansItemFromProgramModalDWednesdayTimeEnd")
const pFromProgramModalDWednesdayPlace = pFromProgramModalDForm.querySelector("#plansItemFromProgramModalDWednesdayPlace")
const pFromProgramModalDThursdayCheck = pFromProgramModalDForm.querySelector("#plansItemFromProgramModalDThursdayCheck")
const pFromProgramModalDThursdayTimeStart = pFromProgramModalDForm.querySelector("#plansItemFromProgramModalDThursdayTimeStart")
const pFromProgramModalDThursdayTimeEnd = pFromProgramModalDForm.querySelector("#plansItemFromProgramModalDThursdayTimeEnd")
const pFromProgramModalDThursdayPlace = pFromProgramModalDForm.querySelector("#plansItemFromProgramModalDThursdayPlace")
const pFromProgramModalDFridayCheck = pFromProgramModalDForm.querySelector("#plansItemFromProgramModalDFridayCheck")
const pFromProgramModalDFridayTimeStart = pFromProgramModalDForm.querySelector("#plansItemFromProgramModalDFridayTimeStart")
const pFromProgramModalDFridayTimeEnd = pFromProgramModalDForm.querySelector("#plansItemFromProgramModalDFridayTimeEnd")
const pFromProgramModalDFridayPlace = pFromProgramModalDForm.querySelector("#plansItemFromProgramModalDFridayPlace")
const pFromProgramModalDSaturdayCheck = pFromProgramModalDForm.querySelector("#plansItemFromProgramModalDSaturdayCheck")
const pFromProgramModalDSaturdayTimeStart = pFromProgramModalDForm.querySelector("#plansItemFromProgramModalDSaturdayTimeStart")
const pFromProgramModalDSaturdayTimeEnd = pFromProgramModalDForm.querySelector("#plansItemFromProgramModalDSaturdayTimeEnd")
const pFromProgramModalDSaturdayPlace = pFromProgramModalDForm.querySelector("#plansItemFromProgramModalDSaturdayPlace")
const pFromProgramModalDSundayCheck = pFromProgramModalDForm.querySelector("#plansItemFromProgramModalDSundayCheck")
const pFromProgramModalDSundayTimeStart = pFromProgramModalDForm.querySelector("#plansItemFromProgramModalDSundayTimeStart")
const pFromProgramModalDSundayTimeEnd = pFromProgramModalDForm.querySelector("#plansItemFromProgramModalDSundayTimeEnd")
const pFromProgramModalDSundayPlace = pFromProgramModalDForm.querySelector("#plansItemFromProgramModalDSundayPlace")

const pFromProgramModalProgList = plansItemFromProgramModal.querySelector("#plansItemFromProgramModalProgList")
const pFromProgramModalErrors = plansItemFromProgramModal.querySelector("#plansItemFromProgramModalErrors")
const pFromProgramModalErrorsAlert = plansItemFromProgramModal.querySelector("#plansItemFromProgramModalErrorsAlert")

//infocard
const pFromProgramModalProgInfoTitle = plansItemFromProgramModal.querySelector("#plansItemFromProgramModalProgInfoTitle")
const pFromProgramModalProgInfoList = plansItemFromProgramModal.querySelector("#plansItemFromProgramModalProgInfoList")

//buttons
const pFromProgramModalSetButton = plansItemFromProgramModal.querySelector("#plansItemFromProgramModalSetButton")
const plansItemGenerateButton = document.querySelector("#PlansItemGenerateButton")
plansItemFromProgramMain()