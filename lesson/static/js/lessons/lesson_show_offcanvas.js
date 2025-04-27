function lessonShowOffcanvas(lessonID, isAdmin=lessonsMobileParamsIsAdmin){
    lessonShowOffcanvasSelectedLessonID = lessonID
    lessonsAPIGetItem(lessonID).then(request => {
        switch (request.status){
            case 200:
                const lessonOffcanvas = mobileInfoOffcanvasSet(request.response.name)
                mobileInfoOffcanvasAddData("Основные данные", lessonOffcanvas,
                    lessonShowGetMainInfoContent(request.response, isAdmin))
                if (request.response.lesson_teacher_review){
                    mobileInfoOffcanvasAddData("Ревью", lessonOffcanvas,
                        lessonShowGetReviewContent(request.response.lesson_teacher_review))
                }
                const materialsInfo = mobileInfoMaterialsGetBlock(request.response.materials)
                const addMaterialsButton = document.createElement("button")
                addMaterialsButton.classList.add("btn", "btn-primary", "mt-2", "mx-1", "w-100")
                addMaterialsButton.type = "button"
                addMaterialsButton.innerHTML = "Добавить материалы"
                addMaterialsButton.disabled = true
                mobileInfoOffcanvasAddData("Материалы", lessonOffcanvas, [materialsInfo, addMaterialsButton])
                mobileInfoOffcanvasAddData("Домашние задания", lessonOffcanvas,
                    lessonShowGetHomeworksContent(request.response.homeworks, isAdmin))
                mobileInfoOffcanvasAddData("План обучения", lessonOffcanvas,
                    lessonShowGetLearningPlanContent(request.response.learning_plan))
                break
            default:
                showErrorToast()
                break
        }
    })
}

function lessonShowGetMainInfoContent(lesson, isAdmin){
    const elements = []

    const dateTimeP = document.createElement("p")
    dateTimeP.classList.add("mb-1")
    dateTimeP.insertAdjacentElement("beforeend", iconUtilsGetIcon(
        "datetime_grey.svg", "Дата и время"
    ))
    dateTimeP.innerHTML += `<span class="fw-bold">Время: </span> ${getLessonDateTimeRangeString(lesson)}`
    elements.push(dateTimeP)

    const teacherP = document.createElement("p")
    teacherP.classList.add("mb-1")
    teacherP.insertAdjacentElement("beforeend", iconUtilsGetIcon(
        "teacher_grey.svg", "Преподаватель"
    ))
    teacherP.innerHTML += `<span class="fw-bold">Преподаватель: </span> ${lesson.learning_plan.teacher.first_name} ${lesson.learning_plan.teacher.last_name}`
    elements.push(teacherP)

    const listenerIcon = iconUtilsGetIcon(
        "student_grey.svg", "Ученик"
    )
    lesson.learning_plan.listeners.forEach(listener => {
        const listenerP = document.createElement("p")
        listenerP.classList.add("mb-1")
        listenerP.insertAdjacentElement("beforeend", listenerIcon)
        listenerP.innerHTML += `<span class="fw-bold">Ученик: </span> ${listener.first_name} ${listener.last_name}`
        elements.push(listenerP)
    })

    if (isAdmin){
        const commentP = document.createElement("p")
        commentP.classList.add("mb-1")
        commentP.insertAdjacentElement("beforeend", iconUtilsGetIcon(
            "comment_grey.svg", "Комментарий"
        ))
        commentP.innerHTML += `<span class="fw-bold" style="color: #0d6dfb;">${lesson.admin_comment ?
            lesson.admin_comment : "Комментарий отсутствует"}</span>`
        elements.push(commentP)
        commentP.addEventListener("click", function () {
            lessonsMobileAdminCommentModalSet(lessonShowOffcanvasSelectedLessonID)
        })
    }

    const statusP = document.createElement("p")
    statusP.classList.add("mb-1")
    statusP.insertAdjacentElement("beforeend", iconUtilsGetIcon(
        "info_grey.svg", "Статус"
    ))
    switch (lesson.status){
        case 0:
            statusP.innerHTML += '<span class="fw-bold">Статус: </span><span  class="fw-bold" style="color: #c7ba00">Занятие не проведено</span>'
            break
        case 1:
            statusP.innerHTML += '<span class="fw-bold">Статус: </span><span  class="fw-bold" style="color: #478e00">Занятие проведено</span>'
            break
        case 2:
            statusP.innerHTML += '<span class="fw-bold">Статус: </span><span class="fw-bold" style="color: #8e0007">Занятие отменено</span>'
            break
        default:
            statusP.innerHTML += '<span class="fw-bold">Статус: </span><span>Неизвестно</span>'
            break
    }
    elements.push(statusP)

    if (lesson.awaiting_action){
        const passLessonButton = document.createElement("button")
        passLessonButton.type = "button"
        passLessonButton.classList.add("btn", "btn-success", "w-100", "my-3")
        passLessonButton.innerHTML = "Провести занятие"
        passLessonButton.addEventListener("click", function () {
            lessonItemSetPassedOffcanvas(lesson.id, false)
        })
        elements.push(passLessonButton)
    }

    return elements
}

function lessonShowGetHomeworksContent(homeworks, isAdmin){
    const ul = document.createElement("ul")
    ul.classList.add("list-group", "list-group-flush")

    homeworks.forEach(hw => {
        const a = document.createElement("a")
        a.classList.add("list-group-item", "list-group-item-action")
        a.href = "#"
        a.innerHTML = hw.name
        if (hw.color){
            a.classList.add(`list-group-item-${hw.color}`)
        }
        a.addEventListener("click", function () {
            homeworkItemShowOffcanvas(hw.id, isAdmin)
        })
        ul.insertAdjacentElement("beforeend", a)
    })

    const newHWButton = document.createElement("button")
    newHWButton.classList.add("btn", "btn-primary", "my-3")
    newHWButton.type = "button"
    newHWButton.innerHTML = "Задать ДЗ"
    newHWButton.disabled = true
    ul.insertAdjacentElement("beforeend", newHWButton)

    return [ul]
}

function lessonShowGetLearningPlanContent(plan){
    const elements = []

    const teacherP = document.createElement("p")
    teacherP.classList.add("mb-1")
    teacherP.insertAdjacentElement("beforeend", iconUtilsGetIcon(
        "teacher_grey.svg", "Преподаватель"
    ))
    teacherP.innerHTML += `<span class="fw-bold">Преподаватель: </span> ${plan.teacher.first_name} ${plan.teacher.last_name}`
    elements.push(teacherP)

    const listenerIcon = iconUtilsGetIcon(
        "student_grey.svg", "Ученик"
    )
    plan.listeners.forEach(listener => {
        const listenerP = document.createElement("p")
        listenerP.classList.add("mb-1")
        listenerP.insertAdjacentElement("beforeend", listenerIcon)
        listenerP.innerHTML += `<span class="fw-bold">Ученик: </span> ${listener.first_name} ${listener.last_name}`
        elements.push(listenerP)
    })

    if (plan.methodist){
        const methodistP = document.createElement("p")
        methodistP.classList.add("mb-1")
        methodistP.insertAdjacentElement("beforeend", iconUtilsGetIcon(
            "man_grey.svg", "Методист"
        ))
        methodistP.innerHTML += `<span class="fw-bold">Местодист: </span> ${plan.methodist.first_name} ${plan.methodist.last_name}`
        elements.push(methodistP)
    }

    if (plan.curators.length > 0){
        const curatorIcon = iconUtilsGetIcon(
            "man_grey.svg", "Куратор"
        )
        plan.curators.forEach(curator => {
            const curatorP = document.createElement("p")
            curatorP.classList.add("mb-1")
            curatorP.insertAdjacentElement("beforeend", curatorIcon)
            curatorP.innerHTML += `<span class="fw-bold">Куратор: </span> ${curator.first_name} ${curator.last_name}`
            elements.push(curatorP)
        })
    }


    return elements
}

function lessonShowGetReviewContent(review){
    const elements = []

    const icon = iconUtilsGetIcon(
        "info_grey.svg", "Пункт"
    )

    const materialsP = document.createElement("p")
    materialsP.classList.add("mb-1")
    materialsP.insertAdjacentElement("beforeend", icon)
    materialsP.innerHTML += `
    <span class="fw-bold">Использованные материалы: </span> ${review.materials}
    `
    elements.push(materialsP)

    const lexisP = document.createElement("p")
    lexisP.classList.add("mb-1")
    lexisP.insertAdjacentElement("beforeend", icon)
    lexisP.innerHTML += `
    <span class="fw-bold">Лексика: </span> ${review.lexis}
    `
    elements.push(lexisP)

    const grammarP = document.createElement("p")
    grammarP.classList.add("mb-1")
    grammarP.insertAdjacentElement("beforeend", icon)
    grammarP.innerHTML += `
    <span class="fw-bold">Грамматика: </span> ${review.grammar}
    `
    elements.push(grammarP)

    const noteP = document.createElement("p")
    noteP.classList.add("mb-1")
    noteP.insertAdjacentElement("beforeend", icon)
    noteP.innerHTML += `
    <span class="fw-bold">Примечания: </span> ${review.note}
    `
    elements.push(noteP)

    const orgP = document.createElement("p")
    orgP.classList.add("mb-1")
    orgP.insertAdjacentElement("beforeend", icon)
    orgP.innerHTML += `
    <span class="fw-bold">Орг. моменты и поведение ученика: </span> ${review.org}
    `
    elements.push(orgP)

    return elements
}

function lessonItemSetPassedOffcanvas(lessonID, onlyName=false){
    const lessonSetPassedOffcanvas = mobileInfoOffcanvasSet("Провести занятие")
    let validateInfo = []

    const form = document.createElement("form")

    const nameDiv = document.createElement("div")
    nameDiv.classList.add("mb-4")
    const nameLabel = document.createElement("div")
    nameLabel.innerHTML = "Наименование занятия"
    const nameInput = document.createElement("input")
    nameInput.classList.add("form-control")
    nameInput.ariaLabel = ""
    nameInput.name = "name"
    const nameHelp = document.createElement("div")
    nameHelp.innerHTML = "Наименование занятия по УМК"
    nameHelp.classList.add("form-text")
    const nameError = document.createElement("div")
    nameError.classList.add("invalid-feedback")
    form.insertAdjacentElement("beforeend", nameDiv)
    nameDiv.insertAdjacentElement("beforeend", nameLabel)
    nameDiv.insertAdjacentElement("beforeend", nameInput)
    nameDiv.insertAdjacentElement("beforeend", nameHelp)
    nameDiv.insertAdjacentElement("beforeend", nameError)
    validateInfo.push({
        inputElement: nameInput,
        errorElement: nameError,
        error: null,
        min_length: 1,
        max_length: 200,
    })

    if (!onlyName){
        const materialsDiv = document.createElement("div")
        materialsDiv.classList.add("mb-4")
        const materialsLabel = document.createElement("div")
        materialsLabel.innerHTML = "Использованные материалы"
        const materialsInput = document.createElement("textarea")
        materialsInput.classList.add("form-control")
        materialsInput.ariaLabel = ""
        materialsInput.name = "materials"
        materialsInput.rows = 4
        const materialsHelp = document.createElement("div")
        materialsHelp.innerHTML = "Напишите о материалах, которыми вы пользовались во время проведения занятия"
        materialsHelp.classList.add("form-text")
        const materialsError = document.createElement("div")
        materialsError.classList.add("invalid-feedback")
        form.insertAdjacentElement("beforeend", materialsDiv)
        materialsDiv.insertAdjacentElement("beforeend", materialsLabel)
        materialsDiv.insertAdjacentElement("beforeend", materialsInput)
        materialsDiv.insertAdjacentElement("beforeend", materialsHelp)
        materialsDiv.insertAdjacentElement("beforeend", materialsError)
        validateInfo.push({
            inputElement: materialsInput,
            errorElement: materialsError,
            error: null,
            min_length: 1,
            max_length: 2000,
        })

        const lexisDiv = document.createElement("div")
        lexisDiv.classList.add("mb-4")
        const lexisLabel = document.createElement("div")
        lexisLabel.innerHTML = "Лексика"
        const lexisInput = document.createElement("textarea")
        lexisInput.classList.add("form-control")
        lexisInput.ariaLabel = ""
        lexisInput.name = "lexis"
        lexisInput.rows = 4
        const lexisHelp = document.createElement("div")
        lexisHelp.innerHTML = ""
        lexisHelp.classList.add("form-text")
        const lexisError = document.createElement("div")
        lexisError.classList.add("invalid-feedback")
        form.insertAdjacentElement("beforeend", lexisDiv)
        lexisDiv.insertAdjacentElement("beforeend", lexisLabel)
        lexisDiv.insertAdjacentElement("beforeend", lexisInput)
        lexisDiv.insertAdjacentElement("beforeend", lexisHelp)
        lexisDiv.insertAdjacentElement("beforeend", lexisError)
        validateInfo.push({
            inputElement: lexisInput,
            errorElement: lexisError,
            error: null,
            min_length: 1,
            max_length: 300,
        })

        const grammarDiv = document.createElement("div")
        grammarDiv.classList.add("mb-4")
        const grammarLabel = document.createElement("div")
        grammarLabel.innerHTML = "Грамматика"
        const grammarInput = document.createElement("textarea")
        grammarInput.classList.add("form-control")
        grammarInput.ariaLabel = ""
        grammarInput.name = "grammar"
        grammarInput.rows = 4
        const grammarHelp = document.createElement("div")
        grammarHelp.innerHTML = ""
        grammarHelp.classList.add("form-text")
        const grammarError = document.createElement("div")
        grammarError.classList.add("invalid-feedback")
        form.insertAdjacentElement("beforeend", grammarDiv)
        grammarDiv.insertAdjacentElement("beforeend", grammarLabel)
        grammarDiv.insertAdjacentElement("beforeend", grammarInput)
        grammarDiv.insertAdjacentElement("beforeend", grammarHelp)
        grammarDiv.insertAdjacentElement("beforeend", grammarError)
        validateInfo.push({
            inputElement: grammarInput,
            errorElement: grammarError,
            error: null,
            min_length: 1,
            max_length: 300,
        })

        const noteDiv = document.createElement("div")
        noteDiv.classList.add("mb-4")
        const noteLabel = document.createElement("div")
        noteLabel.innerHTML = "Примечания"
        const noteInput = document.createElement("textarea")
        noteInput.classList.add("form-control")
        noteInput.ariaLabel = ""
        noteInput.name = "note"
        noteInput.rows = 4
        const noteHelp = document.createElement("div")
        noteHelp.innerHTML = ""
        noteHelp.classList.add("form-text")
        const noteError = document.createElement("div")
        noteError.classList.add("invalid-feedback")
        form.insertAdjacentElement("beforeend", noteDiv)
        noteDiv.insertAdjacentElement("beforeend", noteLabel)
        noteDiv.insertAdjacentElement("beforeend", noteInput)
        noteDiv.insertAdjacentElement("beforeend", noteHelp)
        noteDiv.insertAdjacentElement("beforeend", noteError)
        validateInfo.push({
            inputElement: noteInput,
            errorElement: noteError,
            error: null,
            min_length: 1,
            max_length: 2000,
        })

        const orgDiv = document.createElement("div")
        orgDiv.classList.add("mb-4")
        const orgLabel = document.createElement("div")
        orgLabel.innerHTML = "Организационные моменты и поведение ученика"
        const orgInput = document.createElement("textarea")
        orgInput.classList.add("form-control")
        orgInput.ariaLabel = ""
        orgInput.name = "org"
        orgInput.rows = 4
        const orgHelp = document.createElement("div")
        orgHelp.innerHTML = ""
        orgHelp.classList.add("form-text")
        const orgError = document.createElement("div")
        orgError.classList.add("invalid-feedback")
        form.insertAdjacentElement("beforeend", orgDiv)
        orgDiv.insertAdjacentElement("beforeend", orgLabel)
        orgDiv.insertAdjacentElement("beforeend", orgInput)
        orgDiv.insertAdjacentElement("beforeend", orgHelp)
        orgDiv.insertAdjacentElement("beforeend", orgError)
        validateInfo.push({
            inputElement: orgInput,
            errorElement: orgError,
            error: null,
            min_length: 1,
            max_length: 2000,
        })
    }

    const passButton = document.createElement("button")
    passButton.classList.add("btn", "btn-success", "w-100")
    passButton.type = "button"
    passButton.innerHTML = "Провести занятие"
    passButton.addEventListener("click", function (){
        lessonItemSetPassed(lessonID, validateInfo, form)
    })

    mobileInfoOffcanvasAddData("", lessonSetPassedOffcanvas, [form, passButton])
}

function lessonItemSetPassed(lessonID, validateInfo, form) {
    universalFieldValidatior(validateInfo)
}

let lessonShowOffcanvasSelectedLessonID = null