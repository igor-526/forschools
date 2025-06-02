class lessonUtils{
    data = null
    offcanvas = null
    lessonName = "Занятие"

    constructor(data){
        this.data = data
        this.lessonName = this._getLessonName()
    }

    _getLessonName(){
        if (!this.data){
            return null
        }
        let name = this.data.name
        if (this.data.name_fact){
            name += ` (${this.data.name_fact})`
        }
        return name
    }

    showOffcanvas(reset_data = false){
        if (!this.offcanvas){
            this.offcanvas = new offcanvasEngine()
        }
        this.offcanvas.header = `<a target="_blank" href="/lessons/${this.data.id}/" class="btn btn-sm btn-primary me-2"><i class="bi bi-globe"></i></a>${this.lessonName}`
        this.offcanvas.addData("Основные данные", this._getMainInfoContent())
        if ((this.data.hasOwnProperty("actions") && this.data.actions.length > 0) || isAdmin){
            this.offcanvas.addData("Действия", this._getActionsContent())
        }
        if (this.data.hasOwnProperty("lesson_teacher_review") && this.data.lesson_teacher_review){
            this.offcanvas.addData("Ревью", this._getReviewContent())
        }
        if (this.data.status === 0 && this.data.hasOwnProperty("place") && this.data.place){
            this.offcanvas.addData("Место проведения", this._getLessonPlaceContent())
        }
        if (this.data.hasOwnProperty("homeworks")){
            this.offcanvas.addData('Домашние задания', this._getHomeworkContent())
        }
        if (this.data.hasOwnProperty("learning_plan") && (isTeacher || isCurator || isMethodist || isAdmin)){
            this.offcanvas.addData('План обучения', this._getLearningPlanContent())
        }
        if (!this.offcanvas.offcanvasElement.classList.contains("showing")){
            this.offcanvas.show()
        }
        if (reset_data){
            this.resetOffcanvas()
        }
    }

    resetOffcanvas(newData=null){
        if (newData){
            this.data = newData
            this.offcanvas.resetContent()
            this.showOffcanvas()
        } else {
            lessonsAPIGetItem(this.data.id).then(request => {
                switch (request.status){
                    case 200:
                        this.data = request.response
                        this.offcanvas.resetContent()
                        this.showOffcanvas()
                        break
                    default:
                        const toast = new toastEngine()
                        toast.setError()
                        toast.show()
                        break
                }
            })
        }
    }

    generateOnPage(contentBody){
        this.page = new pageEngine(contentBody)
        this.page.addData("Основные данные", this._getMainInfoContent())
        if (this.data.hasOwnProperty("actions") && this.data.actions.length > 0){
            this.page.addData("Действия", this._getActionsContent())
        }
        if (this.data.hasOwnProperty("lesson_teacher_review") && this.data.lesson_teacher_review){
            this.page.addData("Ревью", this._getReviewContent())
        }
        if (this.data.status === 0 && this.data.hasOwnProperty("place") && this.data.place){
            this.page.addData("Место проведения", this._getLessonPlaceContent())
        }
        if (this.data.hasOwnProperty("homeworks")){
            this.page.addData('Домашние задания', this._getHomeworkContent())
        }
        if (this.data.hasOwnProperty("learning_plan") && (isTeacher || isCurator || isMethodist || isAdmin)){
            this.page.addData('План обучения', this._getLearningPlanContent())
        }
    }

    _getMainInfoContent(){
        const elements = []
        const dateTimeP = document.createElement("p")
        dateTimeP.classList.add("mb-1")
        dateTimeP.insertAdjacentElement("beforeend", iconUtilsGetIcon(
            "datetime_grey.svg", "Дата и время"
        ))
        dateTimeP.innerHTML += `<span class="fw-bold">Время: </span> ${getLessonDateTimeRangeString(this.data)}`
        elements.push(dateTimeP)

        const teacherP = document.createElement("p")
        teacherP.classList.add("mb-1")
        teacherP.insertAdjacentElement("beforeend", iconUtilsGetIcon(
            "teacher_grey.svg", "Преподаватель"
        ))
        teacherP.innerHTML += '<span class="fw-bold">Преподаватель: </span>'
        if (this.data.hasOwnProperty("learning_plan")){
            if (this.data.replace_teacher){
                teacherP.innerHTML += `${this.data.replace_teacher.first_name} 
            ${this.data.replace_teacher.last_name} (замена ${this.data.learning_plan.teacher.first_name} 
            ${this.data.learning_plan.teacher.last_name})`
            } else {
                teacherP.innerHTML += `${this.data.learning_plan.teacher.first_name} 
            ${this.data.learning_plan.teacher.last_name}`
            }
            elements.push(teacherP)
            const listenerIcon = iconUtilsGetIcon(
                "student_grey.svg", "Ученик"
            )

            this.data.learning_plan.listeners.forEach(listener => {
                const listenerP = document.createElement("p")
                listenerP.classList.add("mb-1")
                listenerP.insertAdjacentElement("beforeend", listenerIcon)
                listenerP.innerHTML += `<span class="fw-bold">Ученик: </span> ${listener.first_name} ${listener.last_name}`
                elements.push(listenerP)
            })
        }


        if (this.data.hasOwnProperty("additional_listeners")){
            const listenerIcon = iconUtilsGetIcon(
                "student_grey.svg", "Ученик"
            )
            this.data.additional_listeners.forEach(listener => {
                const listenerP = document.createElement("p")
                listenerP.classList.add("mb-1")
                listenerP.insertAdjacentElement("beforeend", listenerIcon)
                listenerP.innerHTML += `<span class="fw-bold">Ученик (доп.): </span> ${listener.first_name} ${listener.last_name}`
                elements.push(listenerP)
            })
        }

        if (isAdmin){
            this.adminCommentP = document.createElement("p")
            this.adminCommentP.classList.add("mb-1")
            this.adminCommentP.insertAdjacentElement("beforeend", iconUtilsGetIcon(
                "comment_grey.svg", "Комментарий"
            ))
            this.adminCommentP.innerHTML += `<span class="fw-bold" style="color: #0d6dfb;">${this.data.admin_comment ?
                this.data.admin_comment : "Комментарий отсутствует"}</span>`
            elements.push(this.adminCommentP)
            this.adminCommentP.addEventListener("click", () => {this._adminCommentModalSet()})
        }

        const statusP = document.createElement("p")
        statusP.classList.add("mb-1")
        statusP.insertAdjacentElement("beforeend", iconUtilsGetIcon(
            "info_grey.svg", "Статус"
        ))
        switch (this.data.status){
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

        if (this.data.awaiting_action){
            const passLessonButton = document.createElement("button")
            passLessonButton.type = "button"
            passLessonButton.classList.add("btn", "btn-success", "w-100", "my-3")
            passLessonButton.innerHTML = "Провести занятие"
            passLessonButton.addEventListener("click", () => {
                this._setPassedFormSetOffcanvas()
            })
            elements.push(passLessonButton)
            if (getHashValue("form")){
                this._setPassedFormSetOffcanvas()
            }
        }
        return elements
    }

    _getActionsContent(){
        const buttons = []
        console.log(this.data)
        if (this.data.hasOwnProperty("learning_plan") && (isAdmin || isMethodist)){
            const planButton = document.createElement("a")
            planButton.target = "_blank"
            planButton.href = `/learning_plans/${this.data.learning_plan.id}/`
            planButton.classList.add("btn", "btn-primary", "w-100", "mb-2")
            planButton.innerHTML = '<i class="bi bi-card-list me-1"></i>План обучения'
            buttons.push(planButton)

            const logsButton = document.createElement("a")
            logsButton.target = "_blank"
            logsButton.href = `/user_logs/#plan_id=${this.data.learning_plan.id}`
            logsButton.classList.add("btn", "btn-primary", "w-100", "mb-2")
            logsButton.innerHTML = '<i class="bi bi-clock-history"></i><i class="bi bi-card-list me-1"></i>Логи плана обучения'
            buttons.push(logsButton)
        }

        if (this.data.hasOwnProperty("actions") && this.data.actions.includes("edit")){
            const editButton = document.createElement("button")
            editButton.type = "button"
            editButton.classList.add("btn", "btn-primary", "w-100", "mb-2")
            editButton.innerHTML = '<i class="bi bi-pencil me-1"></i>Изменить занятие'
            editButton.addEventListener("click", () => {
                this._editOffcanvasSet()
            })
            buttons.push(editButton)
        }

        if (this.data.hasOwnProperty("actions") && this.data.actions.includes("replace_teacher")){
            const replaceTeacherButton = document.createElement("button")
            replaceTeacherButton.type = "button"
            replaceTeacherButton.classList.add("btn", "btn-primary", "w-100", "mb-2")
            replaceTeacherButton.innerHTML = '<i class="bi bi-person-fill-gear me-1"></i>Замена преподавателя'
            buttons.push(replaceTeacherButton)
            replaceTeacherButton.addEventListener("click", () => {
                const currentTeacherID = this.data.replace_teacher ? this.data.replace_teacher.id :
                    this.data.learning_plan.teacher.id
                universalInfoSelectionModal(null,
                    {roles: ["Teacher"]},
                    false, [currentTeacherID],
                    false, (teacherID) => {
                        this._replaceTeacher(teacherID)
                    })
            })
        }

        if (this.data.hasOwnProperty("actions") && this.data.actions.includes("add_listeners")){
            const addListenersButton = document.createElement("button")
            addListenersButton.type = "button"
            addListenersButton.classList.add("btn", "btn-primary", "w-100", "mb-2")
            addListenersButton.innerHTML = '<i class="bi bi-people-fill me-1"></i>Доп. ученики'
            addListenersButton.addEventListener("click", () => {
                let currentListeners = this.data.learning_plan.listeners.map(listener => {return listener.id})
                currentListeners = currentListeners.concat(this.data.additional_listeners.map(listener => {return listener.id}))
                universalInfoSelectionModal(null,
                    {roles: ["Listener"]},
                    true, currentListeners,
                    true, (listenersIDS) => {
                        this._addListeners(listenersIDS)
                    })
            })
            buttons.push(addListenersButton)
        }

        if (this.data.hasOwnProperty("actions") && this.data.actions.includes("set_not_held")){
            const setNotHeldButton = document.createElement("button")
            setNotHeldButton.type = "button"
            setNotHeldButton.classList.add("btn", "btn-danger", "w-100", "mb-2")
            setNotHeldButton.innerHTML = '<i class="bi bi-x-lg me-1"></i>Занятие не проведено'
            setNotHeldButton.addEventListener("click", () => {
                this._setNotHeldSetModal()
            })
            buttons.push(setNotHeldButton)
        }

        if (this.data.hasOwnProperty("actions") && this.data.actions.includes("delete")){
            const deleteButton = document.createElement("button")
            deleteButton.type = "button"
            deleteButton.classList.add("btn", "btn-danger", "w-100", "mb-2")
            deleteButton.innerHTML = '<i class="bi bi-trash me-1"></i>Удалить занятие'
            deleteButton.addEventListener("click", () => {
                this._deleteSetModal()
            })
            buttons.push(deleteButton)
        }

        return buttons
    }

    _getReviewContent(){
        const elements = []
        const review = this.data.lesson_teacher_review

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

    _getLessonPlaceContent(){
        const content = []
        const place = this.data.place
        if (place.conf_id){
            const infoConfID = document.createElement("div")
            infoConfID.innerHTML = `<b>ID конференции: </b>${place.conf_id}`
            content.push(infoConfID)
        }
        if (place.access_code){
            const infoAccessCode = document.createElement("div")
            infoAccessCode.innerHTML = `<b>Код подключения: </b>${place.access_code}`
            content.push(infoAccessCode)
        }

        const copyButton = document.createElement("button")
        copyButton.classList.add("btn", "btn-primary", "w-100", "my-2")
        copyButton.innerHTML = '<i class="bi bi-copy me-1"></i> Копировать ссылку'
        copyButton.type = "button"
        copyButton.addEventListener("click", function () {
            navigator.clipboard.writeText(place.url)
            copyButton.classList.remove("btn-primary")
            copyButton.classList.add("btn-success")
            setTimeout(function (){
                copyButton.classList.add("btn-primary")
                copyButton.classList.remove("btn-success")
            }, 500)
        })
        content.push(copyButton)

        const goButton = document.createElement("button")
        goButton.classList.add("btn", "btn-primary", "w-100", "my-2")
        goButton.innerHTML = '<i class="bi bi-globe2 me-1"></i> Перейти по ссылке'
        goButton.type = "button"
        goButton.addEventListener("click", function () {
            window.open(place.url, "_blank")
        })
        content.push(goButton)

        if (tgID){
            const tgButton = document.createElement("button")
            tgButton.classList.add("btn", "btn-primary", "w-100", "my-2")
            tgButton.innerHTML = '<i class="bi bi-telegram me-1"></i> Отправить себе ссылку в TG'
            content.push(tgButton)
            const fd = new FormData()
            fd.set("tg_id", tgID)
            const lessonID = this.data.id
            tgButton.addEventListener("click", () => {
                lessonsAPISendPlace(lessonID, fd).then(request => {
                    const toast = new toastEngine()
                    switch (request.status){
                        case 200:
                            toast.title = "Отправлено"
                            toast.message = "Проверьте Telegram"
                            toast.addTGButton()
                            break
                        case 400:
                            toast.setError(request.response.errors)
                            break
                        default:
                            toast.setError()
                            break
                    }
                    toast.show()
                })
            })
        }
        return content
    }

    _getHomeworkContent(){
        const ul = document.createElement("ul")
        ul.classList.add("list-group", "list-group-flush")

        this.data.homeworks.forEach(hw => {
            const a = document.createElement("a")
            a.classList.add("list-group-item", "list-group-item-action")
            a.href = "#"
            a.innerHTML = hw.name
            if (hw.color){
                a.classList.add(`list-group-item-${hw.color}`)
            }
            a.addEventListener("click", function () {
                const hwUtils = new homeworkUtils(hw)
                hwUtils.showOffcanvas(true)
            })
            ul.insertAdjacentElement("beforeend", a)
        })

        if (this.data.actions.includes("add_homework")){
            const newHWWebButton = document.createElement("button")
            newHWWebButton.classList.add("btn", "btn-primary", "my-3")
            newHWWebButton.type = "button"
            newHWWebButton.innerHTML = '<i class="bi bi-plus-lg"></i><i class="bi bi-globe me-1"></i>Задать ДЗ в браузере'
            newHWWebButton.addEventListener("click", () => {
                this._addHomeworkBrowserOffcanvasSet()
            })
            ul.insertAdjacentElement("beforeend", newHWWebButton)

            if (tgID){
                const newHWTGButton = document.createElement("button")
                newHWTGButton.classList.add("btn", "btn-primary", "my-3")
                newHWTGButton.type = "button"
                newHWTGButton.innerHTML = '<i class="bi bi-plus-lg"></i><i class="bi bi-telegram me-1"></i>Задать ДЗ в Telegram'
                newHWTGButton.addEventListener("click", () => {
                    this._addHomeworkTelegram()
                })
                ul.insertAdjacentElement("beforeend", newHWTGButton)
            }
        }

        return ul
    }

    _getLearningPlanContent(){
        const plan = this.data.learning_plan
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
            methodistP.innerHTML += `<span class="fw-bold">Методист: </span> ${plan.methodist.first_name} ${plan.methodist.last_name}`
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

    _adminCommentModalSet(){
        const m = new modalEngine()
        m.title = `Комментарий к занятию "${this.lessonName}"`

        const textAreaDiv = document.createElement("div")
        textAreaDiv.classList.add("mb-3")

        const textAreaLabel = document.createElement("label")
        textAreaLabel.classList.add("form-label")
        textAreaLabel.innerHTML = "Комментарий"
        textAreaLabel.for = "lessonItemAdminCommentTextArea"

        const textAreaInput = document.createElement("textarea")
        textAreaInput.rows = 10
        textAreaInput.classList.add("form-control")
        textAreaInput.id = "lessonItemAdminCommentTextArea"
        if (this.data.admin_comment){
            textAreaInput.value = this.data.admin_comment
        }

        const textAreaInvalidFeedback = document.createElement("div")
        textAreaInvalidFeedback.classList.add("invalid-feedback")

        textAreaDiv.insertAdjacentElement("beforeend", textAreaLabel)
        textAreaDiv.insertAdjacentElement("beforeend", textAreaInput)
        textAreaDiv.insertAdjacentElement("beforeend", textAreaInvalidFeedback)

        m.addContent(textAreaDiv)

        const deleteButton = document.createElement("button")
        deleteButton.type = "button"
        deleteButton.classList.add("btn", "btn-danger")
        deleteButton.addEventListener("click", () => {this._adminCommentDestroy(m)})
        deleteButton.innerHTML = '<i class="bi bi-trash3"></i>'

        const saveButton = document.createElement("button")
        saveButton.type = "button"
        saveButton.classList.add("btn", "btn-success")
        saveButton.addEventListener("click", () => {
            this._adminCommentUpdate(this.data.id, m, textAreaInput, textAreaInvalidFeedback)
        })
        saveButton.innerHTML = '<i class="bi bi-floppy"></i> Сохранить'

        m.addButtons([deleteButton, saveButton])
        m.show()
    }

    _adminCommentDestroy(modal){
        lessonsAPISetAdminComment(this.data.id, null).then(request => {
            modal.close()
            const toast = new toastEngine()
            switch (request.status){
                case 200:
                    toast.setSuccess("Комментарий успешно удалён")
                    if (this.offcanvas){
                        this.resetOffcanvas(request.response)
                    }
                    break
                case 403:
                    toast.setError("Нет доступа")
                    break
                default:
                    toast.setError("Не удалось удалить комментарий")
                    break
            }
            toast.show()
        })
    }

    _adminCommentUpdate(lessonID, modal, field, error){
        function validate(errors){
            if (errors && errors.comment){
                field.classList.add("is-invalid")
                error.innerHTML = errors.comment
                return false
            }

            let validationStatus = true
            field.classList.remove("is-invalid")
            error.innerHTML = ""
            const comment = field.value.trim()
            if (comment.length === 0){
                field.classList.add("is-invalid")
                error.innerHTML = "Комментарий не должен быть пустым<br>Для удаления комментария воспользуйтесь красной кнопкой"
                validationStatus = false
            } else if (comment.length > 2000){
                field.classList.add("is-invalid")
                error.innerHTML = "Комментарий не может содержать больше 2000 символов"
                validationStatus = false
            }
            return validationStatus
        }

        function getFormData(){
            const fd = new FormData()
            fd.set("comment", field.value.trim())
            return fd
        }

        if (validate()){
            lessonsAPISetAdminComment(lessonID, getFormData()).then(request => {
                const toast = new toastEngine()
                switch (request.status){
                    case 201:
                        modal.close()
                        toast.setSuccess("Комментарий успешно изменён")
                        toast.show()
                        if (this.offcanvas){
                            this.resetOffcanvas(request.response)
                        }
                        break
                    case 400:
                        validate(request.response)
                        break
                    case 403:
                        modal.close()
                        toast.setError("Нет доступа")
                        break
                    default:
                        modal.close()
                        toast.setError("Не удалось добавить комментарий")
                        break
                }
            })
        }
    }

    _setPassedFormSetOffcanvas(){
        const lessonItemSetPassedOffcanvas = new offcanvasEngine()
        lessonItemSetPassedOffcanvas.header = `Провести занятие ${this.lessonName}`
        const onlyName = this.data.awaiting_action === "name_only"
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
            name: "name",
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
                name: "materials",
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
                name: "lexis",
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
                name: "grammar",
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
                name: "note",
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
                name: "org",
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
        passButton.innerHTML = '<i class="bi bi-card-checklist me-1"></i> Провести занятие'
        passButton.addEventListener("click", () => {
            this._setPassed(lessonItemSetPassedOffcanvas, validateInfo, form)
        })
        lessonItemSetPassedOffcanvas.addData("", [form, passButton])
        lessonItemSetPassedOffcanvas.show()
    }

    _setPassed(lessonItemSetPassedOffcanvas, validateInfo, form){
        function getFormData(){
            const fd = new FormData(form)
            if (tgID){
                fd.append("notify_tg_id", tgID)
            }
            return fd
        }

        if (universalFieldValidator(validateInfo)){
            lessonsAPISetPassed(this.data.id, getFormData()).then(request => {
                switch (request.status){
                    case 200:
                        lessonItemSetPassedOffcanvas.close()
                        showSuccessToast("Занятие проведено")
                        break
                    case 400:
                        if (request.response.hasOwnProperty("errors")){
                            validateInfo.forEach(field => {
                                if (request.response.errors.hasOwnProperty(field.name)){
                                    field.error = request.response.errors[field.name]
                                }
                            })
                            universalFieldValidator(validateInfo)
                        }
                        break
                    default:
                        lessonItemSetPassedOffcanvas.close()
                        showErrorToast()
                        break
                }
            })
        }
    }

    _addHomeworkTelegram(){
        const fd = new FormData()
        fd.append("lesson_id", this.data.id)
        fd.append("tg_id", tgID)
        homeworkAPIAdd(fd).then(request => {
            const toast = new toastEngine()
            switch (request.status){
                case 200:
                    toast.title = "Отправлено"
                    toast.message = "Продолжите в Telegram"
                    toast.addTGButton()
                    break
                case 400:
                    toast.setError(request.response.error)
                    break
                default:
                    toast.setError()
                    break
            }
            toast.show()
        })
    }

    _addHomeworkBrowserOffcanvasSet(){
        function addTextField(){
            const addTextMaterialDiv = document.createElement("div")
            addTextMaterialDiv.classList.add("my-2")
            const addTextMaterialTextArea = document.createElement("textarea")
            addTextMaterialTextArea.classList.add("form-control")
            addTextMaterialTextArea.rows = 5
            addTextMaterialTextArea.placeholder = "Текстовый материал"
            const addTextMaterialInvalidFeedback = document.createElement("div")
            addTextMaterialInvalidFeedback.classList.add("invalid-feedback")
            addTextMaterialDiv.insertAdjacentElement("beforeend", addTextMaterialTextArea)
            addTextMaterialDiv.insertAdjacentElement("beforeend", addTextMaterialInvalidFeedback)
            textMaterialsForm.insertAdjacentElement("beforeend", addTextMaterialDiv)
            addTextMaterialDiv.scrollIntoView({block: "start", behavior: "smooth"})
            textMaterialsFields.push({
                field: addTextMaterialTextArea,
                invalidFeedback: addTextMaterialInvalidFeedback
            })
        }

        function validateAndGetFormData(lessonID){
            const fd = new FormData(textMaterialsForm)
            let fullLength = 0
            let validationStatus = true
            textMaterialsFields.forEach(field => {
                field.field.classList.remove("is-invalid")
                field.invalidFeedback.innerHTML = ""
                const value = field.field.value.trim()
                if (value.length > 3800){
                    field.field.classList.add("is-invalid")
                    field.invalidFeedback.innerHTML = "Длина поля не может превышать 3800 символов"
                    validationStatus = false
                }
                if (value !== ""){
                    fd.append("text_materials", value)
                    fullLength++
                }
            })
            selectedFiles.forEach(file => {
                fd.append("files", file.fileForm, file.fileForm.name)
                fullLength++
            })
            if (!fullLength){
                showErrorToast("Необходимо добавить хотя бы один материал")
                validationStatus = false
            }
            fd.append("lesson", lessonID)
            return validationStatus ? fd : null
        }

        const lessonAddHWOffcanvas = new offcanvasEngine()
        lessonAddHWOffcanvas.header = `Новое ДЗ к занятию "${this.lessonName}"`

        const selectedFiles = []
        const textMaterialsFields = []
        const uploadBlock = mobileInfoGetUploadFilesBlock(selectedFiles)
        const textMaterialsForm = document.createElement("form")
        textMaterialsForm.acceptCharset = "utf-8"
        const addTextMaterialFieldButton = document.createElement("button")
        addTextMaterialFieldButton.classList.add("btn", "btn-secondary", "w-100", "my-1")
        addTextMaterialFieldButton.type = "button"
        addTextMaterialFieldButton.innerHTML = 'Добавить текст'
        addTextMaterialFieldButton.addEventListener("click", addTextField)
        const sendHWButton = document.createElement("button")
        sendHWButton.classList.add("btn", "btn-success", "w-100", "mt-5")
        sendHWButton.type = "button"
        sendHWButton.innerHTML = 'Задать ДЗ'
        sendHWButton.addEventListener("click", () => {
            this._addHomework(lessonAddHWOffcanvas, validateAndGetFormData(this.data.id))
        })

        lessonAddHWOffcanvas.addData("", uploadBlock.button)
        lessonAddHWOffcanvas.addData("", uploadBlock.block)
        lessonAddHWOffcanvas.addData("", textMaterialsForm)
        lessonAddHWOffcanvas.addData("", addTextMaterialFieldButton)
        lessonAddHWOffcanvas.addData("", sendHWButton)
        lessonAddHWOffcanvas.show()
    }

    _addHomework(lessonAddHWOffcanvas, formData){
        if (!formData)
            return null
        homeworkAPIAdd(formData).then(request => {
            lessonAddHWOffcanvas.close()
            const toast = new toastEngine()
            switch (request.status){
                case 201:
                    toast.setSuccess()
                    if (this.data.status === 0){
                        this._setPassedFormSetOffcanvas()
                    }
                    break
                default:
                    toast.setError()
                    break
            }
            toast.show()
        })
    }

    _editOffcanvasSet(){
        function selectPlaceModal(){
            collectionsAPIGetLessonPlaces().then(request => {
                switch (request.status){
                    case 200:
                        const places = [{
                            id: null,
                            name: "Без места"
                        }]
                        universalInfoSelectionModal("Выбор места проведения",
                            places.concat(request.response), false,
                            selectedPlace ? [selectedPlace] : [],
                            true, (placeID) => {
                                selectedPlace = placeID[0]
                                if (selectedPlace === null){
                                    placeButton.innerHTML = "Отсутствует"
                                } else {
                                    placeButton.innerHTML =
                                        request.response.find(place => place.id === selectedPlace).name
                                }
                            })
                        break
                    default:
                        showErrorToast()
                        break
                }
            })
        }

        function validateAndGetFormData(){
            nameFieldInvalidFeedback.innerHTML = ""
            nameFieldInput.classList.remove("is-invalid")
            dateFieldInput.classList.remove("is-invalid")
            timeStartFieldInput.classList.remove("is-invalid")
            timeEndFieldInput.classList.remove("is-invalid")
            let validationStatus = true

            if (nameFieldInput.value.trim().length === 0){
                nameFieldInput.classList.add("is-invalid")
                nameFieldInvalidFeedback.innerHTML = "Наименование не может быть пустым"
                validationStatus = false
            }
            if (nameFieldInput.value.trim().length > 200){
                nameFieldInput.classList.add("is-invalid")
                nameFieldInvalidFeedback.innerHTML = "Наименование не может превышать 200 символов"
                validationStatus = false
            }
            if (!timeStartFieldInput.value){
                timeStartFieldInput.classList.add("is-invalid")
                validationStatus = false
            }
            if (!timeEndFieldInput.value){
                timeEndFieldInput.classList.add("is-invalid")
                validationStatus = false
            }
            if (timeStartFieldInput.value && timeEndFieldInput.value){
                if (!timeUtilsValidateTime(timeStartFieldInput, timeEndFieldInput)){
                    timeStartFieldInput.classList.add("is-invalid")
                    timeEndFieldInput.classList.add("is-invalid")
                    validationStatus = false
                }
            }
            if (!validationStatus){
                return null
            }
            const formData = new FormData()
            formData.set("name", nameFieldInput.value.trim())
            formData.set("date", dateFieldInput.value)
            formData.set("start_time", timeStartFieldInput.value)
            formData.set("end_time", timeEndFieldInput.value)
            if (selectedPlace){
                formData.set("place", selectedPlace)
            }
            return formData
        }

        const editOffcanvas = new offcanvasEngine()
        editOffcanvas.header = `Изменение "${this.lessonName}"`
        let selectedPlace = this.data.place ? this.data.place.id : null
        console.log(this.data)

        const nameFieldDiv = document.createElement("div")
        nameFieldDiv.classList.add("mb-4")
        const nameFieldLabel = document.createElement("label")
        nameFieldLabel.classList.add("form-label")
        nameFieldLabel.innerHTML = "Наименование"
        const nameFieldInput = document.createElement("input")
        nameFieldInput.type = "text"
        nameFieldInput.classList.add("form-control")
        nameFieldInput.value = this.data.name
        const nameFieldInvalidFeedback = document.createElement("div")
        nameFieldInvalidFeedback.classList.add("invalid-feedback")
        nameFieldDiv.insertAdjacentElement("beforeend", nameFieldLabel)
        nameFieldDiv.insertAdjacentElement("beforeend", nameFieldInput)
        nameFieldDiv.insertAdjacentElement("beforeend", nameFieldInvalidFeedback)

        const dateFieldDiv = document.createElement("div")
        dateFieldDiv.classList.add("mb-1")
        const dateFieldLabel = document.createElement("label")
        dateFieldLabel.classList.add("form-label")
        dateFieldLabel.innerHTML = "Дата и время"
        const dateFieldInput = document.createElement("input")
        dateFieldInput.type = "date"
        dateFieldInput.classList.add("form-control")
        dateFieldInput.value = this.data.date
        dateFieldDiv.insertAdjacentElement("beforeend", dateFieldLabel)
        dateFieldDiv.insertAdjacentElement("beforeend", dateFieldInput)

        const timeFieldDiv = document.createElement("div")
        timeFieldDiv.classList.add("input-group", "mb-4")
        const timeStartFieldInput = document.createElement("input")
        timeStartFieldInput.type = "time"
        timeStartFieldInput.classList.add("form-control")
        timeStartFieldInput.value = this.data.start_time ? this.data.start_time : ""
        const timeFieldDivider = document.createElement("span")
        timeFieldDivider.classList.add("input-group-text")
        timeFieldDivider.innerHTML = "-"
        const timeEndFieldInput = document.createElement("input")
        timeEndFieldInput.type = "time"
        timeEndFieldInput.classList.add("form-control")
        timeEndFieldInput.value = this.data.end_time ? this.data.end_time : ""
        timeFieldDiv.insertAdjacentElement("beforeend", timeStartFieldInput)
        timeFieldDiv.insertAdjacentElement("beforeend", timeFieldDivider)
        timeFieldDiv.insertAdjacentElement("beforeend", timeEndFieldInput)

        const placeDiv = document.createElement("div")
        placeDiv.classList.add("mb-4")
        const placeDivLabel = document.createElement("label")
        placeDivLabel.classList.add("form-label")
        placeDivLabel.innerHTML = "Место проведения"
        const placeButton = document.createElement("button")
        placeButton.type = "button"
        placeButton.classList.add("btn", "btn-outline-primary", "w-100")
        placeButton.innerHTML = this.data.place ? this.data.place.name : "Отсутствует"
        placeButton.addEventListener("click", selectPlaceModal)
        placeDiv.insertAdjacentElement("beforeend", placeDivLabel)
        placeDiv.insertAdjacentElement("beforeend", placeButton)

        const saveButton = document.createElement("button")
        saveButton.type = "button"
        saveButton.classList.add("btn", "btn-success", "w-100", "mt-5")
        saveButton.innerHTML = '<i class="bi bi-floppy me-2"></i>Сохранить'
        saveButton.addEventListener("click", () => {
            const fd = validateAndGetFormData()
            this._edit(editOffcanvas, fd)
        })

        editOffcanvas.addData("", [
            nameFieldDiv, dateFieldDiv,
            timeFieldDiv, placeDiv, saveButton
        ])
        editOffcanvas.show()
    }

    _edit(editOffcanvas, formData){
        lessonsAPIUpdateLesson(this.data.id, formData).then(request => {
            const toast = new toastEngine()
            switch (request.status){
                case 200:
                    toast.setSuccess("Занятие изменено")
                    this.resetOffcanvas(request.response)
                    break
                case 400:
                    toast.setError("Ошибка в данных")
                    break
                case 403:
                    toast.setError("Нет доступа")
                    break
                default:
                    toast.setError()
                    break
            }
            editOffcanvas.close()
            toast.show()
        })
    }

    _replaceTeacher(teacherID){
        const currentTeacherID = this.data.replace_teacher ? this.data.replace_teacher.id :
            this.data.learning_plan.teacher.id
        if (teacherID[0] === currentTeacherID){
            return null
        }
        lessonsAPIReplaceTeacher(teacherID[0], this.data.id).then(request => {
            const toast = new toastEngine()
            switch (request.status){
                case 200:
                    toast.setSuccess("Преподаватель успешно заменён")
                    this.resetOffcanvas(request.response)
                    break
                case 400:
                    toast.setError(request.response.error)
                    break
                case 403:
                    toast.setError("Нет доступа для изменения преподавателя")
                    break
                default:
                    toast.setError()
                    break
            }
            toast.show()
        })
    }

    _addListeners(listenersIDs){
        function getFormData(){
            const formData = new FormData()
            listenersIDs.forEach(listenerID => {
                formData.append("additional_listener", listenerID)
            })
            return formData
        }

        lessonsAPISetAdditionalListeners(this.data.id, getFormData()).then(request => {
            const toast = new toastEngine()
            switch (request.status){
                case 200:
                    toast.setSuccess("Ученики изменены")
                    this.resetOffcanvas(request.response)
                    break
                case 400:
                    toast.setError(request.response.error)
                    break
                case 403:
                    toast.setError("Нет доступа для изменения учеников")
                    break
                default:
                    toast.setError()
                    break
            }
            toast.show()
        })
    }

    _setNotHeldSetModal(){
        const setNotHeldModal = new modalEngine()
        setNotHeldModal.title = "Занятие не проведено"

        const p = document.createElement("p")
        p.innerHTML = "Действие необратимо"

        const setNotHeldButton = document.createElement("button")
        setNotHeldButton.type = "button"
        setNotHeldButton.classList.add("btn", "btn-danger")
        setNotHeldButton.innerHTML = "Подтвердить"
        setNotHeldButton.addEventListener("click", () => {
            this._setNotHeld(setNotHeldModal)
        })

        setNotHeldModal.addContent(p)
        setNotHeldModal.addButtons(setNotHeldButton)
        setNotHeldModal.show()
    }

    _setNotHeld(setNotHeldModal){
        lessonsAPISetNotHeld(this.data.id).then(request => {
            const toast = new toastEngine()
            switch (request.status){
                case 200:
                    toast.setSuccess("Занятие не проведено")
                    setNotHeldModal.close()
                    this.resetOffcanvas(request.response)
                    break
                case 400:
                    toast.setError(request.response.error)
                    break
                case 403:
                    toast.setError("Нет доступа")
                    break
                default:
                    toast.setError()
                    break
            }
            toast.show()
        })
    }

    _deleteSetModal(){
        const deleteModal = new modalEngine()
        deleteModal.title = `Удалить ${this.lessonName}`

        const p = document.createElement("p")
        p.innerHTML = "Действие необратимо"

        const deleteButton = document.createElement("button")
        deleteButton.type = "button"
        deleteButton.classList.add("btn", "btn-danger")
        deleteButton.innerHTML = '<i class="bi bi-trash me-2"></i> Удалить'
        deleteButton.addEventListener("click", () => {
            this._delete(deleteModal)
        })

        deleteModal.addContent(p)
        deleteModal.addButtons(deleteButton)
        deleteModal.show()
    }

    _delete(deleteModal){
        lessonsAPIDestroyItem(this.data.id).then(request => {
            const toast = new toastEngine()
            deleteModal.close()
            switch (request.status){
                case 204:
                    toast.setSuccess("Занятие удалено")
                    this.offcanvas.close()
                    break
                case 403:
                    toast.setError("Нет доступа для удаления занятия")
                    break
                case 404:
                    toast.setError("Занятие не найдено")
                    this.offcanvas.close()
                    break
                default:
                    toast.setError()
                    break
            }
            toast.show()
        })
    }
}
