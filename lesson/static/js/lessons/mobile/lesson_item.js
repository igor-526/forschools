function lessonMobileItemMain(){
    lessonMobileItemBackButton.addEventListener("click", function () {
        lessonMobileItemBlock.classList.add("d-none")
        lessonMobileListBlock.classList.remove("d-none")
        lessonMobileListBlock.style.opacity = 1
        mobileTitleH.innerHTML = "Занятия"
        window.scrollTo(0, lessonMobileItemScrollY)
    })
}

function lessonMobileItemSet(lessonID) {
    lessonMobileItemScrollY = window.scrollY
    lessonMobileItemSelectedID = lessonID
    window.scrollTo(0, 0)
    let opacity = 1.0
    const mobileTitleBlockAddH = (startMobileTitleBlockHeight - mobileTitleBlock.clientHeight) / 100
    const intervalOpacity = setInterval(() => {
        opacity -= 0.01
        if (opacity <= 0){
            mobileContent.style.marginTop = `${startMobileTitleBlockHeight}px`
            lessonMobileListBlock.classList.add("d-none")
            lessonMobileItemBlock.classList.remove("d-none")
            clearInterval(intervalOpacity)
        }
        lessonMobileListBlock.style.opacity = opacity
        const newMobileTitleBlockH = mobileTitleBlock.clientHeight + mobileTitleBlockAddH
        mobileTitleBlock.style.height = `${newMobileTitleBlockH > startMobileTitleBlockHeight ? startMobileTitleBlockHeight : newMobileTitleBlockH}px`
    }, 2)
    lessonsMobileListLoadingSpinner.classList.remove("d-none")
    lessonsAPIGetItem(lessonID).then(request => {
        switch (request.status){
            case 200:
                lessonMobileItemShow(request.response)
                lessonsMobileListLoadingSpinner.classList.add("d-none")
                break
            default:
                showErrorToast()
                break
        }
    })
}

function lessonMobileItemShow(lesson){
    function getMainInfoContent(){
        const stringArray = []
        stringArray.push(`
            <img src="/static/icons/datetime_grey.svg" alt="Дата и время" style="height: 20px;" class="me-1">
            <span class="fw-bold">Время: </span> ${getLessonDateTimeRangeString(lesson)}
            `)
        stringArray.push(`
            <img src="/static/icons/teacher_grey.svg" alt="Преподаватель" style="height: 20px;" class="me-1">
            <span class="fw-bold">Преподаватель: </span> ${lesson.learning_plan.teacher.first_name} ${lesson.learning_plan.teacher.first_name}
            `)
        lesson.learning_plan.listeners.forEach(listener => {
            stringArray.push(`
            <img src="/static/icons/student_grey.svg" alt="Ученик" style="height: 20px;" class="me-1">
            <span class="fw-bold">Ученик: </span> ${listener.first_name} ${listener.first_name}
            `)
        })
        let statusString = ""
        switch (lesson.status){
            case 0:
                statusString = "<span style='color: #c7ba00'>Занятие не проведено</span>"
                break
            case 1:
                statusString = "<span style='color: #478e00'>Занятие проведено</span>"
                break
            case 2:
                statusString = "<span style='color: #8e0007'>Занятие отменено</span>"
                break
            default:
                statusString = "<span>Неизвестно</span>"
                break
        }

        if (lessonsMobileParamsIsAdmin){
            stringArray.push(`
                <img src="/static/icons/comment_grey.svg" alt="Комментарий" style="height: 20px;" class="me-1">
                <span class="fw-bold" style="color: #0d6dfb;" onclick="lessonsMobileAdminCommentModalSet(${lessonMobileItemSelectedID})">${lesson.admin_comment ? lesson.admin_comment : "Комментарий отсутствует"}</span>
                `)
        }

        stringArray.push(`
            <img src="/static/icons/info_grey.svg" alt="Статус" style="height: 20px;" class="me-1">
            <span class="fw-bold">Статус: </span> ${statusString}
            `)

        return stringArray.join("<br>")
    }

    function getReviewContent(){
        const stringArray = []
        stringArray.push(`
            <span class="fw-bold">Использованные материалы: </span>
            ${lesson.lesson_teacher_review.materials}
        `)
        stringArray.push(`
            <span class="fw-bold">Лексика: </span>
            ${lesson.lesson_teacher_review.lexis}
        `)
        stringArray.push(`
            <span class="fw-bold">Грамматика: </span>
            ${lesson.lesson_teacher_review.grammar}
        `)
        stringArray.push(`
            <span class="fw-bold">Примечания: </span>
            ${lesson.lesson_teacher_review.note}
        `)
        stringArray.push(`
            <span class="fw-bold">Организационные моменты: </span>
            ${lesson.lesson_teacher_review.org}
        `)

        return stringArray.join("<br>")
    }

    function getHomeworksContent(){
        return "Тут будет краткий обзор ДЗ и переход на них"
    }

    function getMaterialsContent(){
        return "Тут будет показ материалов и возможность добавления"
    }

    function getLearningPlanContent(){
        return "Тут будет вся информация о плане обучения"
    }

    function getActionsContent(){
        return `
        <button class="btn btn-outline-primary w-100 my-1">Изменить</button>
        <button class="btn btn-outline-danger w-100 my-1">Удалить</button>
        <button class="btn btn-outline-primary w-100 my-1">Заменить преподавателя</button>
        <button class="btn btn-outline-primary w-100 my-1">Добавить учеников</button>
        `
    }

    function setSection(name, content){
        const contentDiv = document.createElement("div")
        contentDiv.classList.add("mb-5")
        const h = document.createElement("h2")
        h.innerHTML = name
        contentDiv.insertAdjacentElement("beforeend", h)
        contentDiv.insertAdjacentHTML("beforeend", content)
        lessonMobileItemContent.insertAdjacentElement("beforeend", contentDiv)

        const btn = document.createElement("button")
        btn.classList.add("btn", "btn-sm", "btn-outline-primary", "mx-1")
        btn.innerHTML = name
        btn.type = "button"
        btn.addEventListener("click", function () {
            window.scrollTo(0, contentDiv.getBoundingClientRect().y - mobileTitleBlock.clientHeight + startMobileTitleBlockHeight - 60)
        })
        lessonMobileItemNavigation.insertAdjacentElement("beforeend", btn)
    }

    console.log(lesson)
    mobileTitleH.innerHTML = lesson.name
    lessonMobileItemNavigation.innerHTML = ""
    lessonMobileItemContent.innerHTML = ""
    setSection("Основная информация", getMainInfoContent())
    if (lesson.lesson_teacher_review){
        setSection("Ревью", getReviewContent())
    }
    setSection("Домашние задания", getHomeworksContent())
    setSection("План обучения", getLearningPlanContent())
    setSection("Материалы", getMaterialsContent())
    setSection("Действия", getActionsContent())
}


let lessonMobileItemSelectedID = null
let lessonMobileItemScrollY = 0

const lessonMobileItemBlock = document.querySelector("#lessonMobileItemBlock")
const lessonMobileListBlock = document.querySelector("#lessonMobileListBlock")
const lessonMobileItemBackButton = lessonMobileItemBlock.querySelector("#lessonMobileItemBackButton")
const lessonMobileItemNavigation = lessonMobileItemBlock.querySelector("#lessonMobileItemNavigation")
const lessonMobileItemContent = lessonMobileItemBlock.querySelector("#lessonMobileItemContent")

lessonMobileItemMain()

