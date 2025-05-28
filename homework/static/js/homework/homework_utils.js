class homeworkUtils{
    data = null
    offcanvas = null
    page = null

    constructor(data){
        this.data = data
    }

    showOffcanvas(resetData = false){
        if (!this.offcanvas){
            this.offcanvas = new offcanvasEngine()
        }
        this.offcanvas.header = `<a target="_blank" href="/homeworks/${this.data.id}/" 
        class="btn btn-sm btn-primary me-2">
        <i class="bi bi-globe"></i></a>${this.data.name}`

        this.offcanvas.addData("Основные данные", this._getMainInfoContent())
        if (this.data.hasOwnProperty("actions") && this.data.actions.length){
            this.offcanvas.addData("Действия", this._getActionsContent())
        }
        if (this.data.hasOwnProperty("materials") && this.data.hasOwnProperty("actions")){
            this.offcanvas.addData("Матариалы", this._getMaterialsContent())
        }
        if (this.data.hasOwnProperty("logs") && this.data.hasOwnProperty("actions")){
            const logsContent = this._getLogsContent(true)
            const allHistoryButton = document.createElement("button")
            allHistoryButton.type = "button"
            allHistoryButton.classList.add("btn", "btn-primary", "w-100", "mt-2")
            allHistoryButton.innerHTML = '<i class="bi bi-clock-history me-2"></i>Вся история'
            allHistoryButton.addEventListener("click", () => {
                this._setLogsOffcanvas()
            })
            this.offcanvas.addData("Последний ответ", [logsContent, allHistoryButton])
        }

        if (!this.offcanvas.offcanvasElement.classList.contains("showing")){
            this.offcanvas.show()
        }
        if (resetData){
            this.resetContent()
        }
    }

    generateOnPage(contentBody){
        this.contentBody = contentBody
        this.page = new pageEngine(this.contentBody)
        this.page.addData("Основные данные", this._getMainInfoContent())
        if (this.data.hasOwnProperty("actions") && this.data.actions.length){
            this.page.addData("Действия", this._getActionsContent())
        }
        if (this.data.hasOwnProperty("materials") && this.data.hasOwnProperty("actions")){
            this.page.addData("Матариалы", this._getMaterialsContent())
        }
        if (this.data.hasOwnProperty("logs") && this.data.hasOwnProperty("actions")){
            const logsContent = this._getLogsContent(true)
            const allHistoryButton = document.createElement("button")
            allHistoryButton.type = "button"
            allHistoryButton.classList.add("btn", "btn-primary", "w-100", "mt-2")
            allHistoryButton.innerHTML = '<i class="bi bi-clock-history me-2"></i>Вся история'
            allHistoryButton.addEventListener("click", () => {
                this._setLogsOffcanvas()
            })
            this.page.addData("Последний ответ", [logsContent, allHistoryButton])
        }
    }

    resetContent(newData=null){
        if (newData){
            this.data = newData
            if (this.offcanvas){
                this.offcanvas.resetContent()
                this.showOffcanvas()
            }
            if (this.page){
                this.page.resetContent()
                this.generateOnPage(this.contentBody)
            }
        } else {
            homeworkAPIGetItem(this.data.id).then(request => {
                switch (request.status){
                    case 200:
                        this.data = request.response
                        if (this.offcanvas){
                            this.offcanvas.resetContent()
                            this.showOffcanvas()
                        }
                        if (this.page){
                            this.page.resetContent()
                            this.generateOnPage(this.contentBody)
                        }
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

    _getMainInfoContent(){
        const elements = []

        const teacherP = document.createElement("p")
        teacherP.classList.add("mb-1")
        teacherP.insertAdjacentElement("beforeend", iconUtilsGetIcon(
            "teacher_grey.svg", "Преподаватель"
        ))
        teacherP.innerHTML += `<span class="fw-bold">Преподаватель: </span> ${this.data.teacher.first_name} ${this.data.teacher.last_name}`
        elements.push(teacherP)

        const listenerP = document.createElement("p")
        listenerP.classList.add("mb-1")
        listenerP.insertAdjacentElement("beforeend", iconUtilsGetIcon(
            "student_grey.svg", "Ученик"
        ))
        listenerP.innerHTML += `<span class="fw-bold">Ученик: </span> ${this.data.listener.first_name} ${this.data.listener.last_name}`
        elements.push(listenerP)

        if (this.data.lesson_info){
            const lessonP = document.createElement("p")
            lessonP.classList.add("mb-1")
            lessonP.insertAdjacentElement("beforeend", iconUtilsGetIcon(
                "lesson_grey.svg", "Занятие"
            ))
            lessonP.innerHTML += `<span class="fw-bold">Занятие: </span> ${this.data.lesson_info.name}`
            lessonP.style.color = "#0d6efd"
            lessonP.addEventListener("click", () => {
                lessonsAPIGetItem(this.data.lesson_info.id).then(request => {
                    switch (request.status){
                        case 200:
                            const lsnUtils = new lessonUtils(request.response)
                            lsnUtils.showOffcanvas()
                            break
                        default:
                            const toast = new toastEngine()
                            toast.setError()
                            toast.show()
                            break
                    }
                })
            })
            elements.push(lessonP)
        }
        return elements
    }

    _getActionsContent(){
        const actionsElements = []

        if (this.data.actions.includes("agreement")){
            const agreementBtn = document.createElement("button")
            agreementBtn.type = "button"
            agreementBtn.classList.add("my-2", "w-100", "btn", "btn-warning")
            agreementBtn.innerHTML = '<i class="bi bi-card-list"></i> Согласование'
            agreementBtn.addEventListener("click", () => {
                this._agreementSetModal()
            })
            actionsElements.push(agreementBtn)
        }

        if (this.data.actions.includes("cancel")){
            const cancelBtn = document.createElement("button")
            cancelBtn.type = "button"
            cancelBtn.classList.add("my-2", "w-100", "btn", "btn-danger")
            cancelBtn.innerHTML = '<i class="bi bi-x-lg"></i> Отменить'
            cancelBtn.addEventListener("click", () => {
                this._cancelSetModal()
            })
            actionsElements.push(cancelBtn)
        }

        if (this.data.actions.includes("send")){
            const sendBtn = document.createElement("button")
            sendBtn.type = "button"
            sendBtn.classList.add("my-2", "w-100", "btn", "btn-primary")
            sendBtn.innerHTML = '<i class="bi bi-pencil-square"></i> Отправить решение'
            sendBtn.addEventListener("click", () => {
                let headerElement
                if (this.offcanvas){
                    headerElement = this.offcanvas.addData("Решение", this._getAnswerContent("send"))
                }
                if (this.page){
                    headerElement = this.page.addData("Решение", this._getAnswerContent("send"))
                }
                sendBtn.remove()
                headerElement.scrollIntoView({block: "start", behavior: "smooth"})
            })
            actionsElements.push(sendBtn)
        }

        if (this.data.actions.includes("check")){
            const checkBtn = document.createElement("button")
            checkBtn.type = "button"
            checkBtn.classList.add("my-2", "w-100", "btn", "btn-primary")
            checkBtn.innerHTML = '<i class="bi bi-pencil-square"></i> Проверить'
            checkBtn.addEventListener("click", () => {
                let headerElement
                if (this.offcanvas){
                    headerElement = this.offcanvas.addData("Проверка", this._getAnswerContent("check"))
                }
                if (this.page){
                    headerElement = this.page.addData("Проверка", this._getAnswerContent("check"))
                }
                checkBtn.remove()
                headerElement.scrollIntoView({block: "start", behavior: "smooth"})
            })
            actionsElements.push(checkBtn)
        }
        if (this.data.send_tg && this.data.send_tg.self){
            const sendTGBtn = document.createElement("button")
            sendTGBtn.type = "button"
            sendTGBtn.classList.add("my-2", "w-100", "btn", "btn-primary")
            sendTGBtn.innerHTML = '<i class="bi bi-telegram me-2"></i>Посмотреть в TG'
            sendTGBtn.addEventListener("click", () => {
                this._sendTGSelf()
            })
            actionsElements.push(sendTGBtn)
        }

        return actionsElements
    }

    _getMaterialsContent(){
        let deleteMaterialFunction = null
        if (this.data.actions.includes("edit")){
            deleteMaterialFunction = (matID) => {
                this._deleteMaterialSetModal(matID)
            }
        }
        const content = [mobileInfoMaterialsGetBlock(
            this.data.materials, deleteMaterialFunction)]

        if (this.data.actions.includes("edit")){
            const addMaterialsButton = document.createElement("button")
            addMaterialsButton.classList.add("btn", "btn-primary", "w-100", "my-1")
            addMaterialsButton.type = "button"
            addMaterialsButton.innerHTML = '<i class="bi bi-plus-lg me-1"></i><i class="bi bi-globe2 me-2"></i>Добавить через браузер'
            content.push(addMaterialsButton)
            addMaterialsButton.addEventListener("click", () => {
                let headerElement
                if (this.offcanvas){
                    headerElement = this.offcanvas.addData("Добавление материалов", this._addMaterialsInBrowserGetContent())
                }
                if (this.page){
                    headerElement = this.page.addData("Добавление материалов", this._addMaterialsInBrowserGetContent())
                }
                addMaterialsButton.remove()
                headerElement.scrollIntoView({block: "start", behavior: "smooth"})
            })

            if (tgID){
                const addMaterialsTGButton = document.createElement("button")
                addMaterialsTGButton.classList.add("btn", "btn-primary", "w-100", "my-1")
                addMaterialsTGButton.type = "button"
                addMaterialsTGButton.innerHTML = '<i class="bi bi-plus-lg me-1"></i><i class="bi bi-telegram me-2"></i>Добавить через TG'
                content.push(addMaterialsTGButton)
                addMaterialsTGButton.addEventListener("click", () => {
                    this._addMaterialsInTelegram()
                })
            }
        }

        return content
    }

    _getAnswerContent(mode){
        function validateAndGetFormData(action){
            comment.field.classList.remove("is-invalid")
            comment.invalidFeedback.innerHTML = ""
            const filesExists = selectedFiles.length > 0
            const commentValue = comment.field.value.trim()
            if (!filesExists && !commentValue){
                comment.field.classList.add("is-invalid")
                comment.invalidFeedback.innerHTML = "Добавьте или файл или комментарий"
                return false
            }
            if (commentValue.length > 2000){
                comment.field.classList.add("is-invalid")
                comment.invalidFeedback.innerHTML = "Объём не может превышать 2000 символов"
                return false
            }
            const fd = new FormData()
            switch (action){
                case "send":
                    fd.append("status", "3")
                    break
                case "check_accept":
                    fd.append("status", "4")
                    break
                case "check_decline":
                    fd.append("status", "5")
                    break
            }
            if (commentValue){
                fd.set("comment", commentValue)
            }
            selectedFiles.forEach(file => {
                fd.append("files", file.fileForm, file.fileForm.name)
            })
            return fd
        }

        function getComment(){
            const sendHWCommentDiv = document.createElement("div")
            sendHWCommentDiv.classList.add("my-2")
            const sendHWCommentTextArea = document.createElement("textarea")
            sendHWCommentTextArea.classList.add("form-control")
            sendHWCommentTextArea.rows = 5
            sendHWCommentTextArea.placeholder = "Комментарий"
            const sendHWCommentInvalidFeedback = document.createElement("div")
            sendHWCommentInvalidFeedback.classList.add("invalid-feedback")
            sendHWCommentDiv.insertAdjacentElement("beforeend", sendHWCommentTextArea)
            sendHWCommentDiv.insertAdjacentElement("beforeend", sendHWCommentInvalidFeedback)
            return {
                block: sendHWCommentDiv,
                field: sendHWCommentTextArea,
                invalidFeedback: sendHWCommentInvalidFeedback
            }
        }

        const selectedFiles = []
        const uploadBlock = mobileInfoGetUploadFilesBlock(selectedFiles)
        const comment = getComment()
        const content = [uploadBlock.button, uploadBlock.block, comment.block]
        switch (mode){
            case "send":
                const sendBtn = document.createElement("button")
                sendBtn.type = "button"
                sendBtn.classList.add("btn", "btn-success", "w-100", "my-1")
                sendBtn.innerHTML = '<i class="bi bi-check2 me-1"></i>Отправить решение'
                sendBtn.addEventListener("click", () => {
                    const formData = validateAndGetFormData("send")
                    if (formData === false){
                        return null
                    }
                    this._homeworkSend(formData)
                })
                content.push(sendBtn)
                break
            case "check":
                const acceptBtn = document.createElement("button")
                acceptBtn.type = "button"
                acceptBtn.classList.add("btn", "btn-success", "w-100", "my-1")
                acceptBtn.innerHTML = '<i class="bi bi-check2 me-1"></i>Принять ДЗ'
                acceptBtn.addEventListener("click", () => {
                    const formData = validateAndGetFormData("check_accept")
                    if (formData === false){
                        return null
                    }
                    this._homeworkSend(formData)
                })
                content.push(acceptBtn)
                const declineBtn = document.createElement("button")
                declineBtn.type = "button"
                declineBtn.classList.add("btn", "btn-warning", "w-100", "my-1")
                declineBtn.innerHTML = '<i class="bi bi-x-lg me-1"></i>Отправить на доработку'
                declineBtn.addEventListener("click", () => {
                    const formData = validateAndGetFormData("check_decline")
                    if (formData === false){
                        return null
                    }
                    this._homeworkSend(formData)
                })
                content.push(declineBtn)
                break
        }
        return content
    }

    _cancelSetModal(){
        const cancelModal = new modalEngine()
        cancelModal.title = `Отменить ${this.data.name}`

        const p = document.createElement("p")
        p.innerHTML = "Для отмены данного действия удалите запись отмены в истории ДЗ"

        const cancelButton = document.createElement("button")
        cancelButton.type = "button"
        cancelButton.classList.add("btn", "btn-danger")
        cancelButton.innerHTML = '<i class="bi bi-trash me-2"></i> Удалить'
        cancelButton.addEventListener("click", () => {
            this._cancel(cancelModal)
        })

        cancelModal.addContent(p)
        cancelModal.addButtons(cancelButton)
        cancelModal.show()
    }

    _getLogsContent(last=false){
        const logsToShow = []
        for (let i = 0; i < this.data.logs.length; i++) {
            if (last){
                if (this.data.logs[0].status === 1 || this.data.logs[0].status === 7){
                    break
                }
                if (logsToShow.length === 0){
                    logsToShow.push(this.data.logs[i])
                    continue
                }
                if (logsToShow.length > 0 && logsToShow[logsToShow.length - 1].status === this.data.logs[i].status){
                    logsToShow.push(this.data.logs[i])
                } else {
                    break
                }
            } else {
                logsToShow.push(this.data.logs[i])
            }
        }
        const mainDiv = document.createElement("div")

        if (logsToShow.length === 0){
            mainDiv.innerHTML = "<p>Ответов пока нет...</p>"
            return mainDiv
        }

        const ul = document.createElement("ul")
        ul.classList.add("list-group")

        logsToShow.forEach(log => {
            const li = document.createElement("li")
            li.classList.add("list-group-item")
            if (log.agreement && log.agreement.hasOwnProperty("accepted")){
                li.classList.add(log.agreement.accepted?"list-group-item-info":"list-group-item-warning")
            }
            const statusInfo = document.createElement("div")
            statusInfo.classList.add("d-flex", "justify-content-between", "mb-2")
            const statusInfoStatus = document.createElement("span")
            statusInfoStatus.classList.add("ms-2", "me-auto", "fw-bold")
            statusInfoStatus.innerHTML = homeworkItemShowLogsStrStatus(log.status)
            const statusInfoDT = document.createElement("div")
            statusInfoDT.style.color = "grey"
            statusInfoDT.innerHTML = timeUtilsDateTimeToStr(log.dt)
            li.insertAdjacentElement("beforeend", statusInfo)
            statusInfo.insertAdjacentElement("beforeend", statusInfoStatus)
            statusInfo.insertAdjacentElement("beforeend", statusInfoDT)
            const dataDiv = document.createElement("div")
            const dataDivComment = document.createElement("p")
            dataDivComment.innerHTML = log.comment
            dataDiv.insertAdjacentElement("beforeend", dataDivComment)
            dataDiv.insertAdjacentElement("beforeend", mobileInfoMaterialsGetBlock(
                log.files.map(file => {
                    return {
                        id: `${log.id} ${file.id}`,
                        file: file.path,
                        type: file.type
                    }
                }), log.editable ? (fileID) => {this._deleteFileFromLogModalSet(fileID)} : null
            ))
            const userDiv = document.createElement("div")
            userDiv.classList.add("d-flex", "align-items-end")
            if (log.editable || log.deletable){
                const actionsButtonBlock = document.createElement("div")
                if (log.editable){
                    const editBtn = document.createElement("button")
                    editBtn.type = "button"
                    editBtn.classList.add("mx-1", "btn", "btn-sm", "btn-warning")
                    editBtn.innerHTML = '<i class="bi bi-pen"></i>'
                    editBtn.addEventListener("click", () => {
                        this._editLogSetModal(log)
                    })
                    actionsButtonBlock.insertAdjacentElement("beforeend", editBtn)
                }
                if (log.deletable){
                    const deleteBtn = document.createElement("button")
                    deleteBtn.type = "button"
                    deleteBtn.classList.add("mx-1", "btn", "btn-sm", "btn-danger")
                    deleteBtn.innerHTML = '<i class="bi bi-trash"></i>'
                    deleteBtn.addEventListener("click", () => {
                        this._deleteLogSetModal(log.id)
                    })
                    actionsButtonBlock.insertAdjacentElement("beforeend", deleteBtn)
                }
                userDiv.insertAdjacentElement("beforeend", actionsButtonBlock)
                userDiv.classList.add("justify-content-between", "mt-2")
            } else {
                userDiv.classList.add("justify-content-end")
            }

            const userDivSpan = document.createElement("small")
            userDivSpan.style.color = "grey"
            userDivSpan.innerHTML = `${log.user.first_name} ${log.user.last_name}`
            userDiv.insertAdjacentElement("beforeend", userDivSpan)

            li.insertAdjacentElement("beforeend", dataDiv)
            li.insertAdjacentElement("beforeend", userDiv)
            ul.insertAdjacentElement("beforeend", li)
        })

        mainDiv.insertAdjacentElement("beforeend", ul)
        return mainDiv
    }

    _setLogsOffcanvas(){
        const o = new offcanvasEngine()
        o.header = `История "${this.data.name}"`
        o.addData("", this._getLogsContent(false))
        o.show()
    }

    _editLogSetModal(log){
        function getFormDataAndValidate(){
            comment.field.classList.remove("is-invalid")
            comment.invalidFeedback.innerHTML = ""
            const commentValue = comment.field.value.trim()
            if (commentValue.length > 2000){
                comment.field.classList.add("is-invalid")
                comment.invalidFeedback.innerHTML = "Объём не может превышать 2000 символов"
                return false
            }
            const fd = new FormData()
            fd.set("comment", commentValue ? commentValue : "-")
            selectedFiles.forEach(file => {
                fd.append("files", file.fileForm, file.fileForm.name)
            })
            return fd
        }

        function getComment(){
            const sendHWCommentDiv = document.createElement("div")
            sendHWCommentDiv.classList.add("my-2")
            const sendHWCommentTextArea = document.createElement("textarea")
            sendHWCommentTextArea.classList.add("form-control")
            sendHWCommentTextArea.rows = 5
            sendHWCommentTextArea.placeholder = "Комментарий"
            const sendHWCommentInvalidFeedback = document.createElement("div")
            sendHWCommentInvalidFeedback.classList.add("invalid-feedback")
            sendHWCommentDiv.insertAdjacentElement("beforeend", sendHWCommentTextArea)
            sendHWCommentDiv.insertAdjacentElement("beforeend", sendHWCommentInvalidFeedback)
            return {
                block: sendHWCommentDiv,
                field: sendHWCommentTextArea,
                invalidFeedback: sendHWCommentInvalidFeedback
            }
        }

        const comment = getComment()
        comment.field.innerHTML = log.comment
        const selectedFiles = []
        const editButton = document.createElement("button")
        editButton.classList.add("btn", "btn-success")
        editButton.innerHTML = '<i class="bi bi-check2 me-2"></i>Применить'
        editButton.addEventListener("click", () => {
            const fd = getFormDataAndValidate()
            if (!fd){
                return null
            }
            this._editLog(editModal, log.id, fd)
        })
        const h6 = document.createElement("h6")
        h6.innerHTML = "Добавление файлов"
        const uploadBlock = mobileInfoGetUploadFilesBlock(selectedFiles)
        const editModal = new modalEngine()
        editModal.title = "Изменение ответа"
        editModal.addContent([comment.block, h6, uploadBlock.button, uploadBlock.block])
        editModal.addButtons(editButton)
        editModal.show()
    }

    _editLog(editModal, logID, formData){
        homeworkAPIUpdateLog(logID, formData).then(request => {
            editModal.close()
            const toast = new toastEngine()
            switch (request.status){
                case 200:
                    toast.setSuccess("Ответ успешно изменён")
                    this.resetContent(request.response)
                    break
                case 400:
                    toast.setError(request.response.error)
                    break
                case 403:
                    toast.setError("Нет доступа для изменения этого ответа")
                    break
                case 404:
                    toast.setError("Ответ не найден")
                    break
                default:
                    toast.setError()
                    break
            }
            toast.show()
        })
    }

    _deleteLogSetModal(logID){
        const p = document.createElement("p")
        p.innerHTML = "Действие необратимо"
        const deleteButton = document.createElement("button")
        deleteButton.type = "button"
        deleteButton.classList.add("mx-1", "my-1", "btn", "btn-danger")
        deleteButton.innerHTML = '<i class="bi bi-trash me-1"></i> Удалить'
        const deleteLogModal = new modalEngine()
        deleteLogModal.title = "Удалить ответ из ДЗ?"
        deleteLogModal.addContent(p)
        deleteLogModal.addButtons(deleteButton)
        deleteLogModal.show()
        deleteButton.addEventListener("click", () => {
            this._deleteLog(deleteLogModal, logID)
        })
    }

    _deleteLog(deleteLogModal, logID){
        homeworkAPIDeleteLog(logID).then(request => {
            deleteLogModal.close()
            const toast = new toastEngine()
            switch (request.status){
                case 204:
                    toast.setSuccess("Ответ успешно удалён")
                    this.resetContent()
                    break
                case 403:
                    toast.setError("Нет доступа для удаления ответа")
                    break
                case 404:
                    toast.setError("Ответ не найден")
                    break
                default:
                    toast.setError()
                    break
            }
            toast.show()
        })
    }

    _cancel(cancelModal){
        homeworkAPISetCancelled(this.data.id).then(request => {
            cancelModal.close()
            const toast = new toastEngine()
            switch (request.status){
                case 200:
                    toast.setSuccess("ДЗ отменено")
                    this.resetContent(request.response)
                    break
                case 400:
                    toast.setError(request.response.error)
                    break
                case 403:
                    toast.setError("Нет доступа для удаления ДЗ")
                    break
                default:
                    toast.setError()
                    break
            }
            toast.show()
        })
    }

    _agreementSetModal(){
        function getBody(){
            const agreementCommentDiv = document.createElement("div")
            agreementCommentDiv.classList.add("mb-3")
            const agreementCommentLabel = document.createElement("label")
            agreementCommentLabel.classList.add("form-label")
            agreementCommentLabel.for = "#agreementCommentInput"
            agreementCommentLabel.innerHTML = "Комментарий"
            const agreementCommentTextArea = document.createElement("textarea")
            agreementCommentTextArea.classList.add("form-control")
            agreementCommentTextArea.rows = 5
            agreementCommentTextArea.id = "agreementCommentInput"
            agreementCommentTextArea.placeholder = "При несогласовании ДЗ комментарий обязателен"
            const agreementCommentInvalidFeedback = document.createElement("div")
            agreementCommentInvalidFeedback.classList.add("invalid-feedback")
            agreementCommentDiv.insertAdjacentElement("beforeend", agreementCommentLabel)
            agreementCommentDiv.insertAdjacentElement("beforeend", agreementCommentTextArea)
            agreementCommentDiv.insertAdjacentElement("beforeend", agreementCommentInvalidFeedback)
            return {
                body: [agreementCommentDiv],
                textarea: agreementCommentTextArea,
                invalidFeedback: agreementCommentInvalidFeedback
            }
        }

        function getFormDataAndValidate(nullValue=true){
            modalBody.textarea.classList.remove("is-invalid")
            modalBody.invalidFeedback.innerHTML = ""
            const comment = modalBody.textarea.value.trim()
            if (nullValue && comment.length === 0){
                modalBody.textarea.classList.add("is-invalid")
                modalBody.invalidFeedback.innerHTML = "Поле не может быть пустым"
                return false
            }
            if (comment.length > 2000){
                modalBody.textarea.classList.add("is-invalid")
                modalBody.invalidFeedback.innerHTML = "Объём не может превышать 2000 символов"
                return false
            }
            const fd = new FormData()
            if (comment.length !== 0){
                fd.set("comment", comment)
            }
            return fd
        }

        const modalBody = getBody()
        const agreementModal = new modalEngine()
        agreementModal.title = `Согласование ${this.data.name}`

        const declineButton = document.createElement("button")
        declineButton.type = "button"
        declineButton.innerHTML = '<i class="bi bi-x-lg"></i> Не согласовать'
        declineButton.classList.add("btn", "btn-danger", "mx-1", "my-1")
        declineButton.addEventListener("click", () => {
            const fd = getFormDataAndValidate(true)
            if (!fd){
                return null
            }
            this._agreementDecline(agreementModal, fd)
        })

        const acceptButton = document.createElement("button")
        acceptButton.type = "button"
        acceptButton.innerHTML = '<i class="bi bi-check2-all"></i> Согласовать'
        acceptButton.classList.add("btn", "btn-success", "mx-1", "my-1")
        acceptButton.addEventListener("click", () => {
            const fd = getFormDataAndValidate(false)
            if (!fd){
                return null
            }
            this._agreementAccept(agreementModal, fd)
        })

        agreementModal.addContent(modalBody.body)
        agreementModal.addButtons([declineButton, acceptButton])
        agreementModal.show()
    }

    _agreementAccept(agreementModal, formData){
        homeworkAPIAgreement(this.data.id, "accept", formData).then(request => {
            agreementModal.close()
            const toast = new toastEngine()
            switch (request.status){
                case 200:
                    toast.setSuccess("ДЗ согласовано")
                    this.resetContent(request.response)
                    break
                case 400:
                    toast.setError(request.response.error)
                    break
                case 403:
                    toast.setError("Нет доступа для согласования")
                    break
                case 404:
                    toast.setError("ДЗ не найдено")
                    this.offcanvas.close()
                    break
                default:
                    toast.setError()
                    break
            }
            toast.show()
        })
    }

    _agreementDecline(agreementModal, formData){
        homeworkAPIAgreement(this.data.id, "decline", formData).then(request => {
            agreementModal.close()
            const toast = new toastEngine()
            switch (request.status){
                case 200:
                    toast.setSuccess("ДЗ не согласовано")
                    this.resetContent(request.response)
                    break
                case 400:
                    toast.setError(request.response.error)
                    break
                case 403:
                    toast.setError("Нет доступа для согласования")
                    break
                case 404:
                    toast.setError("ДЗ не найдено")
                    this.offcanvas.close()
                    break
                default:
                    toast.setError()
                    break
            }
            toast.show()
        })
    }

    _homeworkSend(formData){
        homeworkAPISend(this.data.id, formData).then(request => {
            const toast = new toastEngine()
            switch (request.status){
                case 201:
                    toast.setSuccess("Отправлено")
                    this.resetContent(request.response)
                    break
                case 400:
                    toast.setError(request.response)
                    break
                case 404:
                    toast.setError("ДЗ не найдено")
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

    _addMaterialsInBrowserGetContent(){
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

        function validateAndGetFormData(){
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
            return validationStatus ? fd : null
        }

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
        const addMaterialsButton = document.createElement("button")
        addMaterialsButton.classList.add("btn", "btn-success", "w-100", "my-1")
        addMaterialsButton.type = "button"
        addMaterialsButton.innerHTML = 'Добавить материалы'
        addMaterialsButton.addEventListener("click", () => {
            const formData = validateAndGetFormData()
            if (!formData){
                return null
            }
            this._addMaterials(formData)
        })
        return [uploadBlock.button, uploadBlock.block, textMaterialsForm,
            addTextMaterialFieldButton, addMaterialsButton]
    }

    _addMaterials(formData){
        materialsAPIAddToObject(formData, "hw", this.data.id).then(request => {
            const toast = new toastEngine()
            switch (request.status){
                case 200:
                    toast.setSuccess("Материалы успешно добавлены")
                    this.resetContent()
                    break
                case 400:
                    toast.setError(request.response.hasOwnProperty("error") ?
                        request.response.error : null)
                    break
                case 403:
                    toast.setError("Нет доступа для изменения занятия")
                    break
                case 404:
                    toast.setError(request.response.hasOwnProperty("error") ?
                        request.response.error : "Домашнее задание не найдено")
                    break
                default:
                    toast.setError()
                    break
            }
            toast.show()
        })
    }

    _addMaterialsInTelegram(){
        const fd = new FormData()
        fd.set("method", "edit")
        homeworkAPISendTG(this.data.id, fd).then(request => {
            const toast = new toastEngine()
            switch (request.status){
                case 200:
                    toast.setSuccess("Проверьте Telegram")
                    toast.addTGButton()
                    break
                case 400:
                    toast.setError(request.response.error)
                    break
                case 403:
                    toast.setError("Нет доступа для редактирования ДЗ")
                    break
                default:
                    toast.setError()
                    break
            }
            toast.show()
        })
    }

    _deleteMaterialSetModal(matID){
        const p = document.createElement("p")
        p.innerHTML = "Действие необратимо"
        const deleteButton = document.createElement("button")
        deleteButton.type = "button"
        deleteButton.classList.add("mx-1", "my-1", "btn", "btn-danger")
        deleteButton.innerHTML = '<i class="bi bi-trash me-1"></i> Удалить'
        const deleteMaterialModal = new modalEngine()
        deleteMaterialModal.title = "Удалить материал из ДЗ?"
        deleteMaterialModal.addContent(p)
        deleteMaterialModal.addButtons(deleteButton)
        deleteButton.addEventListener("click", () => {
            const fd = new FormData()
            fd.append("pk", matID)
            this._deleteMaterial(deleteMaterialModal, fd)
        })
        deleteMaterialModal.show()
    }

    _deleteMaterial(deleteMaterialModal, formData){
        materialsAPIDeleteFromObject(formData, "hw", this.data.id).then(request => {
            deleteMaterialModal.close()
            const toast = new toastEngine()
            switch (request.status){
                case 204:
                    toast.setSuccess("Материал успешно удалён из ДЗ")
                    this.resetContent()
                    break
                case 400:
                    toast.setError(request.response.hasOwnProperty("error") ? request.response.error : null)
                    break
                case 403:
                    toast.setError("Нет доступа для изменения ДЗ")
                    break
                case 404:
                    toast.setError("Домашнее задание или материал не найден")
                    break
                default:
                    toast.setError()
                    break
            }
            toast.show()
        })
    }

    _sendTGSelf(){
        const fd = new FormData()
        fd.set("user_id", this.data.send_tg.self.id)
        fd.set("method", "open")
        // if (message !== ""){
        //     fd.set("message", message)
        // }
        homeworkAPISendTG(this.data.id, fd).then(request => {
            const toast = new toastEngine()
            switch (request.status){
                case 200:
                    toast.message = "Проверьте Telegram"
                    toast.title = "Отправлено"
                    toast.addTGButton()
                    break
                case 400:
                    toast.setError(request.response.error)
                    break
                case 403:
                    toast.setError("Нет доступа для отправки")
                    break
                default:
                    toast.setError()
                    break
            }
            toast.show()
        })
    }

    _deleteFileFromLogModalSet(fileID){
        const p = document.createElement("p")
        p.innerHTML = "Действие необратимо"
        const deleteButton = document.createElement("button")
        deleteButton.type = "button"
        deleteButton.classList.add("mx-1", "my-1", "btn", "btn-danger")
        deleteButton.innerHTML = '<i class="bi bi-trash me-1"></i> Удалить'
        const deleteFileModal = new modalEngine()
        deleteFileModal.title = "Удалить файл из ответа?"
        deleteFileModal.addContent(p)
        deleteFileModal.addButtons(deleteButton)
        deleteFileModal.show()
        deleteButton.addEventListener("click", () => {
            let fileInfo = fileID.split(" ")
            fileInfo = {
                logID: fileInfo[0],
                fileID: fileInfo[1]
            }
            const fd = new FormData()
            fd.append("pk", fileInfo.fileID)
            console.log(this.data)
            this._deleteFileFromLog(deleteFileModal, fd, fileInfo.logID)
        })
    }

    _deleteFileFromLog(deleteFileModal, formData, logID){
        materialsAPIDeleteFromObject(formData, "hw_log", logID).then(request => {
            deleteFileModal.close()
            const toast = new toastEngine()
            switch (request.status){
                case 204:
                    toast.setSuccess("Файл успешно удалён")
                    this.resetContent()
                    break
                case 400:
                    toast.setError("Не удалось удалить файл")
                    break
                case 403:
                    toast.setError("Нет доступа для изменения этого ответа")
                    break
                default:
                    toast.setError()
                    break
            }
            toast.show()
        })
    }
}

function homeworkItemShowLogsStrStatus(status){
    switch (status){
        case 1:
            return  "Создано"
        case 2:
            return  "Открыто"
        case 3:
            return  "На проверке"
        case 4:
            return  "Принято"
        case 5:
            return  "На доработке"
        case 6:
            return  "Отменено"
        case 7:
            return  "Задано"
        default:
            return ""
    }
}