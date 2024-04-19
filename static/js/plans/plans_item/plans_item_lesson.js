async function plansItemLessonMain(){
    await plansItemLessonSetPlaces()
    plansItemListenersLessonsAddEdit()
}


async function plansItemLessonSetPlaces(){
    const request = await collectionsGetLessonPlaces()
    if (request.status === 200){
        plansItemPhaseLessonModalPlaceField.innerHTML = '<option value="">Выберите</option>'
        request.response.map(place => {
            plansItemPhaseLessonModalPlaceField.insertAdjacentHTML("beforeend", `
            <option value="${place.id}">${place.name}</option>
            `)
        })
    }
}


function phaseItemAddModalLesson(phaseID, lessonID){
    if (lessonID === 0){
        plansItemPhaseLessonModalTitle.innerHTML = "Добавление урока"
    } else {
        plansItemPhaseLessonModalTitle.innerHTML = "Изменение урока"
    }
    plansItemPhaseLessonModalSaveButton.attributes.getNamedItem("data-phase-id")
        .value = phaseID
    plansItemPhaseLessonModalSaveButton.attributes.getNamedItem("data-lesson-id")
        .value = lessonID
    bsPlansItemPhaseLessonModal.show()
}


function phaseItemLessonClientValidation(){
    let validationStatus = true
    plansItemPhaseLessonModalNameField.classList.remove("is-invalid")
    plansItemPhaseLessonModalDateField.classList.remove("is-invalid")
    plansItemPhaseLessonModalStartField.classList.remove("is-invalid")
    plansItemPhaseLessonModalEndField.classList.remove("is-invalid")
    plansItemPhaseLessonModalNameError.innerHTML = ""

    if (plansItemPhaseLessonModalNameField.value === ""){
        plansItemPhaseLessonModalNameField.classList.add("is-invalid")
        plansItemPhaseLessonModalNameError.innerHTML = "Поле не может быть пустым"
        validationStatus = false
    }

    // if (plansItemPhaseLessonModalDateField.value === ""){
    //     plansItemPhaseLessonModalDateField.classList.add("is-invalid")
    //     validationStatus = false
    // }
    //
    // if (plansItemPhaseLessonModalStartField.value === ""){
    //     plansItemPhaseLessonModalStartField.classList.add("is-invalid")
    //     validationStatus = false
    // }
    //
    // if (plansItemPhaseLessonModalEndField.value === ""){
    //     plansItemPhaseLessonModalEndField.classList.add("is-invalid")
    //     validationStatus = false
    // }

    return validationStatus
}


function phaseItemLessonServerValidation(errors){

}


async function phaseItemLessonAdd(phaseID){
    if (phaseItemLessonClientValidation()){
        const formData = new FormData(plansItemPhaseLessonModalForm)
        if (formData.get("place") === ""){
            formData.delete("place")
        }
        const response = await fetch(`/api/v1/learning_plans/phases/${phaseID}/add/`, {
            method: "post",
            credentials: 'same-origin',
            headers:{
                "X-CSRFToken": csrftoken,
            },
            body: formData
        })
        if (response.status === 201){
            bsPlansItemPhaseLessonModal.hide()
            showToast("Урок", "Урок успешно создан")
            await planItemMain()
        } else if (response.status === 400) {
            phaseItemLessonServerValidation(await response.json())
        } else {
            bsPlansItemPhaseLessonModal.hide()
            showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
        }
    }
}


async function phaseItemLessonEdit(phaseID, lessonID){

}


//BootStrap Elements
const plansItemPhaseLessonModal = document.querySelector("#PlansItemPhaseLessonModal")
const bsPlansItemPhaseLessonModal = new bootstrap.Modal(plansItemPhaseLessonModal)
const plansItemPhaseLessonModalTitle = plansItemPhaseLessonModal.querySelector("#PlansItemPhaseLessonModalTitle")

const plansItemPhaseLessonModalForm = plansItemPhaseLessonModal.querySelector("#PlansItemPhaseLessonModalForm")
const plansItemPhaseLessonModalNameField = plansItemPhaseLessonModalForm.querySelector("#PlansItemPhaseLessonModalNameField")
const plansItemPhaseLessonModalNameError = plansItemPhaseLessonModalForm.querySelector("#PlansItemPhaseLessonModalNameError")
const plansItemPhaseLessonModalDateField = plansItemPhaseLessonModalForm.querySelector("#PlansItemPhaseLessonModalDateField")
const plansItemPhaseLessonModalStartField = plansItemPhaseLessonModalForm.querySelector("#PlansItemPhaseLessonModalStartField")
const plansItemPhaseLessonModalEndField = plansItemPhaseLessonModalForm.querySelector("#PlansItemPhaseLessonModalEndField")
const plansItemPhaseLessonModalPlaceField = plansItemPhaseLessonModalForm.querySelector("#PlansItemPhaseLessonModalPlaceField")
const plansItemPhaseLessonModalSaveButton = plansItemPhaseLessonModal.querySelector("#PlansItemPhaseLessonModalSaveButton")

plansItemListenersLessonModalSave()