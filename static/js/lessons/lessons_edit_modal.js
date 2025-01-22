function lessonEditMain(){
    lessonEditSetPlaces()
    lessonEditModalSaveButton.addEventListener("click", lessonEditSave)
    lessonEditModalStartField.addEventListener("input", function (){
        lessonEditModalEndField.value = getPlus1HourTime(lessonEditModalStartField)
    })
}


function lessonEditSetPlaces(){
    collectionsAPIGetLessonPlaces().then(request => {
        switch (request.status){
            case 200:
                lessonEditModalPlaceField.innerHTML = '<option value="">Выберите</option>'
                request.response.forEach(place => {
                    lessonEditModalPlaceField.insertAdjacentHTML("beforeend", `
                    <option value="${place.id}">${place.name}</option>
                    `)
                })
                break
            default:
                showErrorToast()
                break
        }
    })
}


function lessonEditReset(validationOnly = false){
    function resetValidation(){
        lessonEditModalNameField.classList.remove("is-invalid")
        lessonEditModalDateField.classList.remove("is-invalid")
        lessonEditModalStartField.classList.remove("is-invalid")
        lessonEditModalEndField.classList.remove("is-invalid")
        lessonEditModalNameError.innerHTML = ""
    }

    resetValidation()
    if (!validationOnly){
        lessonEditModalForm.reset()
        lessonEditSelectedLessonID = null
    }
}


function lessonEditSetModalLesson(lessonID=null, phaseID=null, elements=null){
    lessonEditReset()
    if (lessonID === null){
        lessonEditModalTitle.innerHTML = "Новое занятие"
        getAutoFieldLessonName(phaseID).then(request => {
            switch (request.status){
                case 200:
                    lessonEditModalNameField.value = request.response.name
                    break
                default:
                    showErrorToast()
                    break
            }
        })
    } else {
        lessonsAPIGetItem(lessonID).then(request => {
            switch (request.status){
                case 200:
                    lessonEditSelectedLessonID = request.response.id
                    lessonEditSelectedElements = elements
                    lessonEditModalTitle.innerHTML = "Изменение занятия"
                    lessonEditModalNameField.value = request.response.name
                    lessonEditModalDescriptionField.value = request.response.description
                    lessonEditModalDateField.value = request.response.date
                    lessonEditModalStartField.value = request.response.start_time
                    lessonEditModalEndField.value = request.response.end_time
                    if (request.response.place){
                        lessonEditModalPlaceField.value = request.response.place.id
                    }
                    break
                default:
                    showErrorToast()
                    break
            }
        })
    }
    bsLessonEditModal.show()
}


function lessonEditValidation(){
    function setInvalid(errorstr="", elements = []){
        validationStatus = false
        elements.forEach(element => {
            element.classList.add("is-invalid")
        })
    }

    function validateName(){
        if (lessonEditModalNameField.value.trim() === ""){
            setInvalid("Наименование занятия не может быть пустым", [lessonEditModalNameField])
        }
    }

    function validateTime(){
        if (lessonEditModalStartField.value === ""){
            setInvalid("Необходимо ввести время начала занятия",
                [lessonEditModalStartField])
        }
        if (lessonEditModalStartField.value === ""){
            setInvalid("Необходимо ввести время окончания занятия",
                [lessonEditModalStartField])
        }
        if (lessonEditModalStartField.value !== "" && lessonEditModalStartField.value !== ""){
            if (compareTime(lessonEditModalStartField, lessonEditModalEndField)){
                setInvalid("Время окончания занятия не может быть раньше времени начала",
                    [lessonEditModalStartField, lessonEditModalEndField])
            }
        }
    }

    let validationStatus = true
    validateName()
    validateTime()
    return validationStatus
}


function lessonEditSave(){
    function getFormData(){
        return new FormData(lessonEditModalForm)
    }
    if (lessonEditValidation()){
        if (lessonEditSelectedLessonID){
            lessonsAPIUpdateLesson(getFormData(), lessonEditSelectedLessonID).then(request => {
                switch (request.status){
                    case 200:
                        bsLessonEditModal.hide()
                        showSuccessToast("Занятия успешно изменено")
                        if (lessonEditSelectedElements){
                            if(lessonEditSelectedElements.hasOwnProperty("name")){
                                lessonEditSelectedElements.name.innerHTML = request.response.name
                            }
                            if(lessonEditSelectedElements.hasOwnProperty("date")){
                                lessonEditSelectedElements.date.innerHTML = new Date(request.response.date).toLocaleDateString()
                            }
                            if(lessonEditSelectedElements.hasOwnProperty("time") && request.response.start_time){
                                lessonEditSelectedElements.time.innerHTML = lessonTimeRangeToStr(
                                    request.response.start_time,
                                    request.response.end_time
                                )
                            }
                        } else {
                            setTimeout(function () {
                                location.reload()
                            }, 500)
                        }
                        break
                    default:
                        bsLessonEditModal.hide()
                        showErrorToast()
                }
            })
        }
    }
}


let lessonEditSelectedLessonID = null
let lessonEditSelectedElements = null

//BootStrap Elements
const lessonEditModal = document.querySelector("#lessonEditModal")
const bsLessonEditModal = new bootstrap.Modal(lessonEditModal)

const lessonEditModalTitle = lessonEditModal.querySelector("#lessonEditModalTitle")
const lessonEditModalForm = lessonEditModal.querySelector("#lessonEditModalForm")
const lessonEditModalNameField = lessonEditModalForm.querySelector("#lessonEditModalNameField")
const lessonEditModalNameError = lessonEditModalForm.querySelector("#lessonEditModalNameError")
const lessonEditModalDescriptionField = lessonEditModalForm.querySelector("#lessonEditModalDescriptionField")
const lessonEditModalDescriptionError = lessonEditModalForm.querySelector("#lessonEditModalDescriptionError")
const lessonEditModalStartField = lessonEditModalForm.querySelector("#lessonEditModalStartField")
const lessonEditModalEndField = lessonEditModalForm.querySelector("#lessonEditModalEndField")
const lessonEditModalDateField = lessonEditModalForm.querySelector("#lessonEditModalDateField")
const lessonEditModalPlaceField = lessonEditModalForm.querySelector("#lessonEditModalPlaceField")
const lessonEditModalPlaceError = lessonEditModalForm.querySelector("#lessonEditModalPlaceError")
const lessonEditModalSaveButton = lessonEditModal.querySelector("#lessonEditModalSaveButton")

lessonEditMain()