function lessonItemMain(){
    lessonsAPIGetItem(lessonID).then(request => {
        switch (request.status){
            case 200:
                lessonItemSetInfo(request.response)

                if (can_see_materials){
                    lessonItemSetMaterials(request.response.materials)
                    lessonItemSetHomeworks(request.response.homeworks)
                }
                if (request.response.lesson_teacher_review){
                    lessonItemSetReview(request.response.lesson_teacher_review)
                }
                break
            default:
                showErrorToast()
                break
        }
    })
    LessonItemCheckMaterialsButton.addEventListener("click", lessonItemSelectAllMaterialsListener)
    if (LessonItemDeleteMaterialsButton){
        LessonItemDeleteMaterialsButton.addEventListener("click", function () {
            lessonItemDeleteMaterialsSetModal(lessonItemCheckedMaterials)
        })
    }
    if (lessonItemSendMaterialsButton){
        lessonItemSendMaterialsButton.addEventListener("click", function () {
            lessonItemSendMaterialsSetModal(lessonItemCheckedMaterials)
        })
    }
    if (lessonItemRestoreButton){
        lessonItemRestoreButton.addEventListener("click", lessonItemRestoreModalSet)
    }
    if (lessonItemEditButton){
        lessonItemEditButton.addEventListener("click", function () {
            lessonEditSetModalLesson(lessonID)
        })
    }
}

function lessonItemSetInfo(lesson){
    function getLessonStatusElement(){
        const li = document.createElement("li")
        li.classList.add("list-group-item")
        switch (lesson.status){
            case 0:
                li.classList.add("list-group-item-warning")
                li.innerHTML = "Занятие не проведено"
                break
            case 1:
                li.classList.add("list-group-item-success")
                li.innerHTML = "Занятие проведено"
                break
            case 2:
                li.classList.add("list-group-item-danger")
                li.innerHTML = "Занятие отменено"
                break
        }
        return li
    }

    function getReplaceTeacherButton(){
        const btn = document.createElement("btn")
        btn.type = "button"
        btn.classList.add("btn", "btn-primary", "btn-sm", "ms-2", "lesson-item-not-passed")
        btn.innerHTML = '<i class="bi bi-person-gear"></i>'
        btn.addEventListener("click", function () {
            usersReplaceTeacherSetModal("lesson", lessonID)
        })
        return btn
    }

    function getAddListenersButton(){
        const li = document.createElement("li")
        li.classList.add("list-group-item", "lesson-item-not-passed")
        const btn = document.createElement("btn")
        btn.type = "button"
        btn.classList.add("btn", "btn-outline-primary", "btn-sm", "ms-2")
        btn.innerHTML = 'Доп. ученики <i class="bi bi-person-gear"></i>'
        btn.addEventListener("click", function () {
            lessonAdditionalListenersModalSet(lessonID, true)
        })
        li.insertAdjacentElement("beforeend", btn)
        return li
    }

    if (lesson.date && lesson.start_time && lesson.end_time){
        lessonItemMainInfo.insertAdjacentElement("beforeend", getListElement(
            "Время", getLessonDateTimeRangeString(lesson)
        ))
    } else {
        if (lesson.date){
            lessonItemMainInfo.insertAdjacentElement("beforeend", getListElement(
                "Дата", new Date(lesson.date).toLocaleDateString()
            ))
        }
    }
    if (lesson.description){
        lessonItemMainInfo.insertAdjacentElement("beforeend", getListElement(
            "Описание", lesson.description
        ))
    }
    if (lesson.place){
        lessonItemMainInfo.insertAdjacentElement("beforeend", getListElement(
            "ПРОСЬБА НЕ ПОДКЛЮЧАТЬСЯ ЗАРАНЕЕ", `<a href="${lesson.place.url}" target="_blank">ССЫЛКА</a>`
        ))
    }
    lessonItemMainInfo.insertAdjacentElement("beforeend", getLessonStatusElement())

    let teacherElem = null
    if (lesson.replace_teacher){
        teacherElem = getListElement(
            "Замена преподавателя", getUsersString([lesson.replace_teacher])
        )
    } else {
        teacherElem = getListElement(
            "Преподаватель", getUsersString([lesson.learning_plan.teacher])
        )
    }
    if (lessonItemCanSetReplace){
        teacherElem.insertAdjacentElement("beforeend", getReplaceTeacherButton())
    }
    lessonItemParticipants.insertAdjacentElement("beforeend", teacherElem)

    lesson.learning_plan.listeners.forEach(listener => {
        lessonItemParticipants.insertAdjacentElement("beforeend", getListElement(
            "Ученик", getUsersString([listener])
        ))
    })

    lesson.additional_listeners.forEach(listener => {
        lessonItemParticipants.insertAdjacentElement("beforeend", getListElement(
            "Ученик (доп.)", getUsersString([listener])
        ))
        lessonAdditionalListenersSelected.push(listener.id)
    })

    if (lessonItemCanSetReplace){
        lessonItemParticipants.insertAdjacentElement("beforeend", getAddListenersButton())
    }


    if (lesson.learning_plan.methodist) {
        lessonItemParticipants.insertAdjacentElement("beforeend", getListElement(
            "Методист", getUsersString([lesson.learning_plan.methodist])
        ))
    }

    lesson.learning_plan.curators.forEach(curator => {
        lessonItemParticipants.insertAdjacentElement("beforeend", getListElement(
            "Куратор", getUsersString([curator])
        ))
    })
}

function lessonItemSetReview(review){
    function getListElement(name, val){
        const li = document.createElement("li")
        li.classList.add("list-group-item")
        li.innerHTML = `<b>${name}: </b>${val}`
        return li
    }

    LessonItemReview.classList.remove("d-none")
    if (review.hasOwnProperty("materials")){
        LessonItemReviewList.insertAdjacentElement("beforeend", getListElement(
            "Использованные материалы",
            review.materials
        ))
    }
    if (review.hasOwnProperty("lexis")){
        LessonItemReviewList.insertAdjacentElement("beforeend", getListElement(
            "Лексика",
            review.lexis
        ))
    }
    if (review.hasOwnProperty("grammar")){
        LessonItemReviewList.insertAdjacentElement("beforeend", getListElement(
            "Грамматика",
            review.grammar
        ))
    }
    if (review.hasOwnProperty("note")){
        LessonItemReviewList.insertAdjacentElement("beforeend", getListElement(
            "Примечание",
            review.note
        ))
    }
    if (review.hasOwnProperty("org")){
        LessonItemReviewList.insertAdjacentElement("beforeend", getListElement(
            "Орг. моменты и поведение ученика",
            review.org
        ))
    }
}

function lessonItemSetButtons() {
    switch (lessonItemCheckedMaterials.length){
        case 0:
            lessonItemSendMaterialsButton.disabled = true
            LessonItemDeleteMaterialsButton.disabled = true
            break
        default:
            lessonItemSendMaterialsButton.disabled = false
            LessonItemDeleteMaterialsButton.disabled = false
            break
    }
}

function lessonItemSelectAllMaterialsListener(){
    const checks = lessonItemMaterialsList.querySelectorAll("input")
    lessonItemCheckedMaterials = []
    switch (this.attributes.getNamedItem("data-action").value){
        case "check":
            checks.forEach(check => {
                check.checked = true
                lessonItemCheckedMaterials.push(check.value)
            })
            this.attributes.getNamedItem("data-action").value = "reset"
            break
        case "reset":
            checks.forEach(check => {
                check.checked = false
            })
            this.attributes.getNamedItem("data-action").value = "check"
            break
    }
    lessonItemSetButtons()
}

function lessonItemSetMaterials(materials, del=false){
    function checkListener(){
        const index = lessonItemCheckedMaterials.indexOf(this.value)
        switch (this.checked){
            case true:
                if (index === -1){
                    lessonItemCheckedMaterials.push(this.value)
                }
                break
            case false:
                if (index !== -1){
                    lessonItemCheckedMaterials.splice(index, 1)
                }
                break
        }
        lessonItemSetButtons()
    }

    function getMaterialElement(material){
        const li = document.createElement("li")
        const a = document.createElement("a")
        const check = document.createElement("input")
        li.classList.add("list-group-item")
        a.href = `/materials/${material.id}`
        a.innerHTML = material.name
        check.classList.add("form-check-input", "me-3")
        check.type = "checkbox"
        check.value = material.id
        check.addEventListener("change", checkListener)
        li.insertAdjacentElement("beforeend", check)
        li.insertAdjacentElement("beforeend", a)
        return li
    }

    if (lessonItemAddMaterialsButton !== null){
        lessonItemAddMaterialsButton.addEventListener("click", function () {
            materialEmbedAction = "addToLesson"
            materialsEmbedSet(
                materials.forEach(material => {
                    return material.id
                })
            )
        })
    }

    switch (del){
        case true:
            materials.forEach(material => {
                const elem = lessonItemMaterialsList.querySelector(`input[value="${material}"]`)
                elem.parentElement.remove()
            })
            const checks = lessonItemMaterialsList.querySelectorAll("input")
            checks.forEach(check => {
                check.checked = false
            })
            lessonItemSendMaterialsButton.disabled = true
            LessonItemDeleteMaterialsButton.disabled = true
            lessonItemCheckedMaterials = []
            LessonItemCheckMaterialsButton.attributes.getNamedItem("data-action").value = "check"
            break
        case false:
            materials.forEach(material => {
                lessonItemMaterialsList.insertAdjacentElement("beforeend", getMaterialElement(material))
            })
    }}

function lessonItemSetHomeworks(homeworks, del=false){
    function getHomeworkElement(homework){
        const li = document.createElement("li")
        const a = document.createElement("a")
        const button = document.createElement("button")
        li.classList.add("list-group-item")
        if (homework.color){
            li.classList.add(`list-group-item-${homework.color}`)
        }
        li.setAttribute("data-hw-list-id", homework.id)
        a.href = `/homeworks/${homework.id}`
        a.innerHTML = homework.name
        button.classList.add("btn", "btn-danger", "btn-sm", "me-3")
        button.type = "button"
        button.innerHTML = '<i class="bi bi-x-lg"></i>'
        button.addEventListener("click", function () {
            lessonItemDeleteHWModalSet(homework.id)
        })
        li.insertAdjacentElement("beforeend", button)
        li.insertAdjacentElement("beforeend", a)
        return li
    }

    switch (del){
        case true:
            homeworks.forEach(homework => {
                const elem = lessonItemHomeworkList.querySelector(`[data-hw-list-id="${homework}"]`)
                elem.remove()
            })
            break
        case false:
            homeworks.forEach(homework => {
                if (homework.status !== 6){
                    lessonItemHomeworkList.insertAdjacentElement("beforeend", getHomeworkElement(homework))
                }
            })
    }}


const lessonItemMainInfo = document.querySelector("#lessonItemMainInfo")
const lessonItemParticipants = document.querySelector("#lessonItemParticipants")

//Buttons
const lessonItemAddMaterialsButton = document.querySelector("#LessonItemAddMaterialsButton")
const lessonItemSendMaterialsButton = document.querySelector("#LessonItemSendMaterialsButton")
const LessonItemDeleteMaterialsButton = document.querySelector("#LessonItemDeleteMaterialsButton")
const LessonItemCheckMaterialsButton = document.querySelector("#LessonItemCheckMaterialsButton")
const lessonItemRestoreButton = document.querySelector("#lessonItemRestoreButton")
const lessonItemEditButton = document.querySelector("#lessonItemEditButton")

//Lists
const lessonItemMaterialsList = document.querySelector("#lessonItemMaterialsList")
const lessonItemHomeworkList = document.querySelector("#lessonItemHomeworkList")
const LessonItemReview = document.querySelector("#LessonItemReview")
const LessonItemReviewList = document.querySelector("#LessonItemReviewList")

//Arrays
let lessonItemCheckedMaterials = []

lessonItemMain()