function maLessonReviewMain(){
    maLessonReviewLessonInfo()
    lessonFeedbackFormReadyButton.addEventListener("click", maLessonReviewSend)
}

function maLessonReviewLessonInfo() {
    function getListItem(name, value){
        const li = document.createElement("li")
        li.classList.add("list-group-item")
        li.innerHTML = `<b>${name}: </b>${value}`
        return li
    }

    lessonsAPIGetItem(lessonID).then(request => {
        switch (request.status){
            case 200:
                lessonAccordion.classList.remove("d-none")
                lessonAccordionInfoList.innerHTML = ""
                lessonAccordionInfoList.insertAdjacentElement("beforeend", getListItem(
                    "Наименование", request.response.name
                ))
                if (request.response.description){
                    lessonAccordionInfoList.insertAdjacentElement("beforeend", getListItem(
                        "Описание", request.response.description
                    ))
                }
                if (request.response.end_time){
                    lessonAccordionInfoList.insertAdjacentElement("beforeend", getListItem(
                        "Дата и время", getLessonDateTimeRangeString(request.response)
                    ))
                }
                if (request.response.lesson_teacher_review){
                    lessonFeedbackFormLessonMaterialsField.value = request.response.lesson_teacher_review.materials
                    lessonFeedbackFormLessonLexisField.value = request.response.lesson_teacher_review.lexis
                    lessonFeedbackFormLessonGrammarField.value = request.response.lesson_teacher_review.grammar
                    lessonFeedbackFormLessonNoteField.value = request.response.lesson_teacher_review.note
                    lessonFeedbackFormLessonOrgField.value = request.response.lesson_teacher_review.org
                    lessonFeedbackFormLessonNameField.disabled = true
                    lessonFeedbackFormLessonMaterialsField.disabled = true
                    lessonFeedbackFormLessonLexisField.disabled = true
                    lessonFeedbackFormLessonGrammarField.disabled = true
                    lessonFeedbackFormLessonNoteField.disabled = true
                    lessonFeedbackFormLessonOrgField.disabled = true
                    lessonFeedbackFormReadyButton.disabled = true
                } else {
                    lessonFeedbackFormReadyButton.disabled = false
                    lessonFeedbackFormLessonMaterialsField.innerHTML = request.response.materials.map(mat => {
                        return `${mat.name}(https://kitai-school.forschools.ru/materials/${mat.id})`
                    }).join("\n")
                }
                break
            default:
                showErrorToast("Не удалось загрузить информацию о занятии")
        }
    })
}

function maLessonReviewValidate() {
    function resetValidation(){
        lessonFeedbackFormLessonNameField.classList.remove("is-invalid")
        lessonFeedbackFormLessonMaterialsField.classList.remove("is-invalid")
        lessonFeedbackFormLessonLexisField.classList.remove("is-invalid")
        lessonFeedbackFormLessonGrammarField.classList.remove("is-invalid")
        lessonFeedbackFormLessonNoteField.classList.remove("is-invalid")
        lessonFeedbackFormLessonOrgField.classList.remove("is-invalid")
        lessonFeedbackFormLessonNameError.innerHTML = ""
        lessonFeedbackFormLessonMaterialsError.innerHTML = ""
        lessonFeedbackFormLessonLexisError.innerHTML = ""
        lessonFeedbackFormLessonGrammarError.innerHTML = ""
        lessonFeedbackFormLessonNoteError.innerHTML = ""
        lessonFeedbackFormLessonOrgError.innerHTML = ""
    }

    function setInvalid(element=null, errorElement=null, error=null){
        validationStatus = false
        if (element){
            element.classList.add("is-invalid")
        }
        if (errorElement && error){
            errorElement.innerHTML = error
        }
    }

    function validateName(){
        if (lessonFeedbackFormLessonNameField.value.trim() === ""){
            setInvalid(
                lessonFeedbackFormLessonNameField,
                lessonFeedbackFormLessonNameError,
                "Поле не может быть пустым"
            )
        } else {
            const valueLength = lessonFeedbackFormLessonNameField.value.trim().length
            if (valueLength > 200){
                setInvalid(
                    lessonFeedbackFormLessonNameField,
                    lessonFeedbackFormLessonNameError,
                    `Поле не может превышать 200 символов. У вас ${valueLength}`
                )
            }
        }
    }

    function validateMaterials(){
        if (lessonFeedbackFormLessonMaterialsField.value.trim() === ""){
            setInvalid(
                lessonFeedbackFormLessonMaterialsField,
                lessonFeedbackFormLessonMaterialsError,
                "Поле не может быть пустым"
            )
        } else {
            const valueLength = lessonFeedbackFormLessonMaterialsField.value.trim().length
            if (valueLength > 2000){
                setInvalid(
                    lessonFeedbackFormLessonMaterialsField,
                    lessonFeedbackFormLessonMaterialsError,
                    `Поле не может превышать 2000 символов. У вас ${valueLength}`
                )
            }
        }
    }

    function validateLexis(){
        if (lessonFeedbackFormLessonLexisField.value.trim() === ""){
            setInvalid(
                lessonFeedbackFormLessonLexisField,
                lessonFeedbackFormLessonLexisError,
                "Поле не может быть пустым"
            )
        } else {
            const valueLength = lessonFeedbackFormLessonLexisField.value.trim().length
            if (valueLength > 300){
                setInvalid(
                    lessonFeedbackFormLessonLexisField,
                    lessonFeedbackFormLessonLexisError,
                    `Поле не может превышать 300 символов. У вас ${valueLength}`
                )
            }
        }
    }

    function validateGrammar(){
        if (lessonFeedbackFormLessonGrammarField.value.trim() === ""){
            setInvalid(
                lessonFeedbackFormLessonGrammarField,
                lessonFeedbackFormLessonGrammarError,
                "Поле не может быть пустым"
            )
        } else {
            const valueLength = lessonFeedbackFormLessonGrammarField.value.trim().length
            if (valueLength > 300){
                setInvalid(
                    lessonFeedbackFormLessonGrammarField,
                    lessonFeedbackFormLessonGrammarError,
                    `Поле не может превышать 300 символов. У вас ${valueLength}`
                )
            }
        }
    }

    function validateNote(){
        if (lessonFeedbackFormLessonNoteField.value.trim() === ""){
            setInvalid(
                lessonFeedbackFormLessonNoteField,
                lessonFeedbackFormLessonNoteError,
                "Поле не может быть пустым"
            )
        } else {
            const valueLength = lessonFeedbackFormLessonNoteField.value.trim().length
            if (valueLength > 2000){
                setInvalid(
                    lessonFeedbackFormLessonNoteField,
                    lessonFeedbackFormLessonNoteError,
                    `Поле не может превышать 2000 символов. У вас ${valueLength}`
                )
            }
        }
    }

    function validateOrg(){
        if (lessonFeedbackFormLessonOrgField.value.trim() === ""){
            setInvalid(
                lessonFeedbackFormLessonOrgField,
                lessonFeedbackFormLessonOrgError,
                "Поле не может быть пустым"
            )
        } else {
            const valueLength = lessonFeedbackFormLessonOrgField.value.trim().length
            if (valueLength > 2000){
                setInvalid(
                    lessonFeedbackFormLessonOrgField,
                    lessonFeedbackFormLessonOrgError,
                    `Поле не может превышать 2000 символов. У вас ${valueLength}`
                )
            }
        }
    }

    let validationStatus = true
    resetValidation()
    validateName()
    validateMaterials()
    validateLexis()
    validateGrammar()
    validateNote()
    validateOrg()
    return validationStatus
}

function maLessonReviewSend() {
    function getFD() {
        const fd = new FormData(lessonFeedbackForm)
        fd.set("notify_tg_id", tgUserdata.user.id)
        return fd
    }

    if (maLessonReviewValidate()) {
        lessonsAPISetPassed(lessonID, getFD()).then(request => {
            switch (request.status) {
                case 201:
                    tgAPI.close()
                    break
                case 400:
                    if (request.response.hasOwnProperty("error")) {
                        tgAPI.showAlert(request.response.error)
                    }
                    maLessonReviewValidate(request.response)
                    break
                default:
                    tgAPI.showAlert("На сервере произошла ошибка")
                    break
            }
        })
    }
}

const lessonAccordion = document.querySelector("#maLessonAccordion")
const lessonAccordionInfoList = document.querySelector("#maLessonAccordionInfoList")
const lessonFeedbackForm = document.querySelector("#maLessonFeedbackForm")
const lessonFeedbackFormLessonNameField = document.querySelector("#maLessonFeedbackFormLessonNameField")
const lessonFeedbackFormLessonNameError = document.querySelector("#maLessonFeedbackFormLessonNameError")
const lessonFeedbackFormLessonMaterialsField = document.querySelector("#maLessonFeedbackFormLessonMaterialsField")
const lessonFeedbackFormLessonMaterialsError = document.querySelector("#maLessonFeedbackFormLessonMaterialsError")
const lessonFeedbackFormLessonLexisField = document.querySelector("#maLessonFeedbackFormLessonLexisField")
const lessonFeedbackFormLessonLexisError = document.querySelector("#maLessonFeedbackFormLessonLexisError")
const lessonFeedbackFormLessonGrammarField = document.querySelector("#maLessonFeedbackFormLessonGrammarField")
const lessonFeedbackFormLessonGrammarError = document.querySelector("#maLessonFeedbackFormLessonGrammarError")
const lessonFeedbackFormLessonNoteField = document.querySelector("#maLessonFeedbackFormLessonNoteField")
const lessonFeedbackFormLessonNoteError = document.querySelector("#maLessonFeedbackFormLessonNoteError")
const lessonFeedbackFormLessonOrgField = document.querySelector("#maLessonFeedbackFormLessonOrgField")
const lessonFeedbackFormLessonOrgError = document.querySelector("#maLessonFeedbackFormLessonOrgError")
const lessonFeedbackFormReadyButton = document.querySelector("#maLessonFeedbackFormReadyButton")

maLessonReviewMain()
