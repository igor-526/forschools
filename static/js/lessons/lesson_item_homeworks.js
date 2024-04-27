function lessonItemHomeworksMain() {
    HWNewSaveButton.addEventListener("click", lessonItemHomeworksSave)
    HWNewSaveAndGoButton.addEventListener("click", async function () {
        await lessonItemHomeworksSave(true)
    })
    lessonItemNewHWButton.addEventListener("click", async function(){
        await lessonItemHomeworksClean()
    })
    HWNewMaterialsAddButton.addEventListener("click", function () {
        materialEmbedAction = "addToHW"
    })
}

async function lessonItemHomeworksClean(){
    HWNewForm.reset()
    HWNewDeadlineField.value = lessonItemNewHwDeadline
    const autoName = await getAutoFieldHomeworkName(lessonID)
    if (autoName.status === 200){
        HWNewNameField.value = autoName.response.name
    }
    HWNewDescriptionField.value = "Выполните следующее задание:"
    HWNewMaterialsList.innerHTML = '<li class="list-group-item">Материалы не прикреплены</li>'
    HWNewMaterialsSet = []
}

function lessonItemHomeworksClientValidation() {
    HWNewNameField.classList.remove("is-invalid")
    HWNewDescriptionField.classList.remove("is-invalid")
    HWNewDeadlineField.classList.remove("is-invalid")
    HWNewNameError.innerHTML = ""
    HWNewDescriptionError.innerHTML = ""
    HWNewDeadlineError.innerHTML = ""
    let validationStatus = true

    if (HWNewNameField.value === ""){
        HWNewNameField.classList.add("is-invalid")
        HWNewNameError.innerHTML = "Поле не может быть пустым"
        validationStatus = false
    }

    if (HWNewDescriptionField.value === ""){
        HWNewDescriptionField.classList.add("is-invalid")
        HWNewDescriptionError.innerHTML = "Поле не может быть пустым"
        validationStatus = false
    }

    if (HWNewDeadlineField.value === ""){
        HWNewDeadlineField.classList.add("is-invalid")
        HWNewDeadlineError.innerHTML = "Поле не может быть пустым"
        validationStatus = false
    } else if (new Date() > new Date(HWNewDeadlineField.value)){
        HWNewDeadlineField.classList.add("is-invalid")
        HWNewDeadlineError.innerHTML = "Минимальный срок 1 день"
        validationStatus = false
    }

    return validationStatus
}

function lessonItemHomeworksServerValidation(errors) {
    console.log(errors)
}

async function lessonItemHomeworksSave(go = false){
    if (lessonItemHomeworksClientValidation()){
        const fd = new FormData(HWNewForm)
        if (HWNewMaterialsSet.length !== 0){
            HWNewMaterialsSet.forEach(material => {
                fd.append("materials", material)
            })
        }
        await homeworkAdd(lessonID, fd)
            .then(async request => {
                if (request.status === 201){
                    bsOffcanvasNewHW.hide()
                    await lessonItemHomeworksClean()
                    showToast("ДЗ", "Домашнее задание успешно создано")
                    if (go === true){
                        window.open(`/homeworks/${request.response.id}`)
                    }
                } else if (request.status === 400){
                    lessonItemHomeworksServerValidation(request.response)
                } else {
                    showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
                }
            })
    }
}

//Sets
let HWNewMaterialsSet = []

//Bootstrap Elements
const offcanvasNewHW = document.querySelector("#offcanvasNewHW")
const bsOffcanvasNewHW = new bootstrap.Offcanvas(offcanvasNewHW)

//Buttons
const lessonItemNewHWButton = document.querySelector("#LessonItemNewHWButton")

//Forms
const HWNewForm = offcanvasNewHW.querySelector("#HWNewForm")
const HWNewNameField = HWNewForm.querySelector("#HWNewNameField")
const HWNewNameError = HWNewForm.querySelector("#HWNewNameError")
const HWNewDescriptionField = HWNewForm.querySelector("#HWNewDescriptionField")
const HWNewDescriptionError = HWNewForm.querySelector("#HWNewDescriptionError")
const HWNewDeadlineField = HWNewForm.querySelector("#HWNewDeadlineField")
const HWNewDeadlineError = HWNewForm.querySelector("#HWNewDeadlineError")
const HWNewMaterialsAddButton = HWNewForm.querySelector("#HWNewMaterialsAddButton")
const HWNewMaterialsList = HWNewForm.querySelector("#HWNewMaterialsList")
const HWNewSaveAndGoButton = HWNewForm.querySelector("#HWNewSaveAndGoButton")
const HWNewSaveButton = HWNewForm.querySelector("#HWNewSaveButton")

lessonItemHomeworksMain()