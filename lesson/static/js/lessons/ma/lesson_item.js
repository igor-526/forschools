function maLessonItemMain(){
    lessonsAPIGetItem(lessonID).then(request => {
        switch (request.status){
            case 200:
                console.log(request.response)
                maLessonItemSetMainInfo(request.response)
                if (request.response.materials.length > 0){
                    maLessonItemSetMaterials(request.response.materials)
                }
                if (request.response.homeworks.length > 0){
                    maLessonItemSetHomeworks(request.response.homeworks)
                }
                if (request.response.lesson_teacher_review){
                    maLessonItemSetReview(request.response.lesson_teacher_review)
                }
                break
            default:
                break
        }
    })
}

function maLessonItemSetMainInfo(lesson){
    function getName(){
        if (lesson.name_fact){
            return `${lesson.name_fact} (${lesson.name})`
        }
        return lesson.name
    }

    function getListItem(name, value){
        const li = document.createElement("li")
        li.classList.add("list-group-item")
        li.innerHTML = `<b>${name}: </b>${value}`
        return li
    }

    maLessonItemMainList.insertAdjacentElement("beforeend", getListItem(
        "Наименование", getName()
    ))
    if (lesson.description){
        maLessonItemMainList.insertAdjacentElement("beforeend", getListItem(
            "Описание", lesson.description
        ))
    }
    if (lesson.start_time && lesson.end_time){
        maLessonItemMainList.insertAdjacentElement("beforeend", getListItem(
            "Дата и время", getLessonDateTimeRangeString(lesson)
        ))
    } else {
        maLessonItemMainList.insertAdjacentElement("beforeend", getListItem(
            "Дата", new Date(lesson.date).toLocaleDateString()
        ))
    }
    if (lesson.replace_teacher){
        maLessonItemParticipantsList.insertAdjacentElement("beforeend", getListItem(
            "Преподаватель (замена)",
            `${lesson.replace_teacher.first_name} ${lesson.replace_teacher.last_name}`
        ))
    } else {
        maLessonItemParticipantsList.insertAdjacentElement("beforeend", getListItem(
            "Преподаватель",
            `${lesson.learning_plan.teacher.first_name} ${lesson.learning_plan.teacher.last_name}`
        ))
    }
    lesson.learning_plan.listeners.forEach(listener => {
        maLessonItemParticipantsList.insertAdjacentElement("beforeend", getListItem(
            "Ученик",
            `${listener.first_name} ${listener.last_name}`
        ))
    })

}

function maLessonItemSetMaterials(materials){
    maLessonItemMaterials.classList.remove("d-none")
    materials.forEach(mat => {
        maLessonItemMaterialsBody.insertAdjacentElement("beforeend", materialToHTMLMobile(
            mat.file,
            mat.type
        ))
    })
}

function maLessonItemSetHomeworks(homeworks){
    function getHWListElement(hw) {
        const li = document.createElement("li")
        li.classList.add("list-group-item")
        li.innerHTML = `<a href="/ma/homeworks/${hw.id}/">${hw.name}</a>`
        if (hw.color){
            li.classList.add(`list-group-item-${hw.color}`)
        }
        return li
    }

    maLessonItemHomeworks.classList.remove("d-none")
    homeworks.forEach(hw => {
        maLessonItemHomeworksList.insertAdjacentElement("beforeend", getHWListElement(hw))
    })
}

function maLessonItemSetReview(review){
    function getListItem(name, value){
        const li = document.createElement("li")
        li.classList.add("list-group-item")
        li.innerHTML = `<b>${name}: </b>${value}`
        return li
    }

    maLessonItemReview.classList.remove("d-none")
    if (review.materials){
        maLessonItemReviewList.insertAdjacentElement("beforeend", getListItem(
            "Использованные материалы", review.materials
        ))
    }
    if (review.lexis){
        maLessonItemReviewList.insertAdjacentElement("beforeend", getListItem(
            "Лексика", review.lexis
        ))
    }
    if (review.grammar){
        maLessonItemReviewList.insertAdjacentElement("beforeend", getListItem(
            "Грамматика", review.grammar
        ))
    }
    if (review.note){
        maLessonItemReviewList.insertAdjacentElement("beforeend", getListItem(
            "Примечание", review.note
        ))
    }
    if (review.org){
        maLessonItemReviewList.insertAdjacentElement("beforeend", getListItem(
            "Орг. моменты и поведение ученика", review.org
        ))
    }

}

const maLessonItemMainList = document.querySelector("#maLessonItemMainList")
const maLessonItemParticipantsList = document.querySelector("#maLessonItemParticipantsList")
const maLessonItemMaterials = document.querySelector("#maLessonItemMaterials")
const maLessonItemMaterialsBody = document.querySelector("#maLessonItemMaterialsBody")
const maLessonItemHomeworks = document.querySelector("#maLessonItemHomeworks")
const maLessonItemHomeworksList = document.querySelector("#maLessonItemHomeworksList")
const maLessonItemReview = document.querySelector("#maLessonItemReview")
const maLessonItemReviewList = document.querySelector("#maLessonItemReviewList")

maLessonItemMain()