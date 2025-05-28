class homeworkUtils{
    data = null
    offcanvas = null

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
    }

    resetContent(newData=null){
        if (newData){
            this.data = newData
            if (this.offcanvas){
                this.offcanvas.resetContent()
                this.showOffcanvas()
            }
        } else {
            lessonsAPIGetItem(this.data.id).then(request => {
                switch (request.status){
                    case 200:
                        this.data = request.response
                        if (this.offcanvas){
                            this.offcanvas.resetContent()
                            this.showOffcanvas()
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
            agreementBtn.addEventListener("click", function () {
                homeworkItemShowAgreementModal(homeworkID, homeworkOffcanvas)
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
            sendBtn.addEventListener("click", function () {
                const headerElement = homeworkOffcanvas.addData("Решение",
                    homeworkItemGetAnswerContent(homeworkID, homeworkOffcanvas, "send"))
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
            checkBtn.addEventListener("click", function () {
                const headerElement = homeworkOffcanvas.addData("Проверка",
                    homeworkItemGetAnswerContent(homeworkID, homeworkOffcanvas, "check"))
                checkBtn.remove()
                headerElement.scrollIntoView({block: "start", behavior: "smooth"})
            })
            actionsElements.push(checkBtn)
        }

        if (this.data.actions.includes("edit")){
            const addMaterialsBlock = document.createElement("div")
            addMaterialsBlock.classList.add("row", "my-2", "mx-0")

            const addMaterialsButtonCol = document.createElement("div")
            addMaterialsButtonCol.classList.add("col", "p-0")
            const addMaterialsButton = document.createElement("button")
            addMaterialsButton.classList.add("btn", "btn-primary", "w-100")
            addMaterialsButton.type = "button"
            addMaterialsButton.innerHTML = '<i class="bi bi-plus-lg me-1"></i><i class="bi bi-globe2 me-2"></i>Материалы'
            addMaterialsButtonCol.insertAdjacentElement("beforeend", addMaterialsButton)
            addMaterialsBlock.insertAdjacentElement("beforeend", addMaterialsButtonCol)

            let addMaterialsTGButton = null
            if (tgID){
                const addMaterialsTGButtonCol = document.createElement("div")
                addMaterialsTGButtonCol.classList.add("col", "p-0")
                addMaterialsTGButton = document.createElement("button")
                addMaterialsTGButton.classList.add("btn", "btn-primary", "w-100", "ms-1")
                addMaterialsButton.classList.add("me-1")
                addMaterialsTGButton.type = "button"
                addMaterialsTGButton.innerHTML = '<i class="bi bi-plus-lg me-1"></i><i class="bi bi-telegram me-2"></i>Материалы'
                addMaterialsTGButton.addEventListener("click", function () {
                    const fd = new FormData()
                    fd.set("method", "edit")
                    homeworkAPISendTG(homeworkID, fd).then(request => {
                        switch (request.status){
                            case 200:
                                showSuccessToast("Проверьте Telegram")
                                break
                            case 400:
                                showErrorToast(request.response.error)
                                break
                            case 403:
                                showErrorToast("Нет доступа для редактирования ДЗ")
                                break
                            default:
                                showErrorToast()
                                break
                        }
                    })
                })
                addMaterialsTGButtonCol.insertAdjacentElement("beforeend", addMaterialsTGButton)
                addMaterialsBlock.insertAdjacentElement("beforeend", addMaterialsTGButtonCol)
            }

            addMaterialsButton.addEventListener("click", () => {
                const headerElement = homeworkOffcanvas.addData("Добавление материалов",
                    homeworkItemGetAddMaterialsContent(homeworkID, homeworkOffcanvas))
                addMaterialsButtonCol.remove()
                if (tgID){
                    addMaterialsTGButton ? addMaterialsTGButton.classList.remove("ms-1") : null
                    addMaterialsButton.classList.remove("me-1")
                }
                headerElement.scrollIntoView({block: "start", behavior: "smooth"})
            })
            actionsElements.push(addMaterialsBlock)
        }

        return actionsElements
    }

    _getMaterialsContent(){
        function setDeleteMaterialModal(matID){
            const p = document.createElement("p")
            p.innerHTML = "Действие необратимо"
            const deleteButton = document.createElement("button")
            deleteButton.type = "button"
            deleteButton.classList.add("mx-1", "my-1", "btn", "btn-danger")
            deleteButton.innerHTML = '<i class="bi bi-trash me-1"></i> Удалить'
            const deleteFileModal = mobileInfoModalSet("Удалить материал из ДЗ?",
                [p], [deleteButton])
            deleteButton.addEventListener("click", () => {
                const fd = new FormData()
                fd.append("pk", matID)
                materialsAPIDeleteFromObject(fd, "hw", homeworkID).then(request => {
                    deleteFileModal.close()
                    switch (request.status){
                        case 204:
                            homeworkOffcanvas.close()
                            homeworkItemShowOffcanvas(homeworkID)
                            showSuccessToast("Материал успешно удалён из ДЗ")
                            break
                        case 400:
                            showErrorToast()
                            break
                        case 404:
                            showErrorToast("Домашнее задание или материал не найден")
                            break
                        default:
                            showErrorToast()
                            break
                    }
                })
            })
        }

        return [mobileInfoMaterialsGetBlock(
            this.data.materials,
            this.data.actions.includes("edit") ?
                setDeleteMaterialModal : null)]
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
        function getDeleteModal(logID){
            const p = document.createElement("p")
            p.innerHTML = "Действие необратимо"
            const deleteButton = document.createElement("button")
            deleteButton.type = "button"
            deleteButton.classList.add("mx-1", "my-1", "btn", "btn-danger")
            deleteButton.innerHTML = '<i class="bi bi-trash me-1"></i> Удалить'
            const deleteLogModal = mobileInfoModalSet("Удалить ответ из ДЗ?",
                [p], [deleteButton])
            deleteButton.addEventListener("click", () => {
                homeworkAPIDeleteLog(logID).then(request => {
                    deleteLogModal.close()
                    switch (request.status){
                        case 204:
                            homeworkOffcanvas.close()
                            homeworkItemShowOffcanvas(homeworkID)
                            showSuccessToast("Ответ успешно удалён")
                            break
                        case 404:
                            showErrorToast("Ответ не найден")
                            break
                        default:
                            showErrorToast()
                    }
                })
            })
        }

        function getDeleteFileModal(fileID){
            const p = document.createElement("p")
            p.innerHTML = "Действие необратимо"
            const deleteButton = document.createElement("button")
            deleteButton.type = "button"
            deleteButton.classList.add("mx-1", "my-1", "btn", "btn-danger")
            deleteButton.innerHTML = '<i class="bi bi-trash me-1"></i> Удалить'
            const deleteFileModal = mobileInfoModalSet("Удалить файл?",
                [p], [deleteButton])
            deleteButton.addEventListener("click", () => {
                let fileInfo = fileID.split(" ")
                fileInfo = {
                    logID: fileInfo[0],
                    fileID: fileInfo[1]
                }
                const fd = new FormData()
                fd.append("pk", fileInfo.fileID)
                materialsAPIDeleteFromObject(fd, "hw_log", fileInfo.logID).then(request => {
                    deleteFileModal.close()
                    switch (request.status){
                        case 204:
                            homeworkOffcanvas.close()
                            homeworkItemShowOffcanvas(homeworkID)
                            showSuccessToast("Файл успешно удалён")
                            break
                        case 400:
                            showErrorToast("Не удалось удалить файл")
                            break
                        case 403:
                            showErrorToast("Нет доступа для изменения этого ответа")
                            break
                        default:
                            showErrorToast()
                            break
                    }
                })
            })
        }

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
                }), log.editable ? getDeleteFileModal : null
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
                        homeworkItemGetEditLogModal(homeworkID, homeworkOffcanvas, log)
                    })
                    actionsButtonBlock.insertAdjacentElement("beforeend", editBtn)
                }
                if (log.deletable){
                    const deleteBtn = document.createElement("button")
                    deleteBtn.type = "button"
                    deleteBtn.classList.add("mx-1", "btn", "btn-sm", "btn-danger")
                    deleteBtn.innerHTML = '<i class="bi bi-trash"></i>'
                    deleteBtn.addEventListener("click", () => {
                        getDeleteModal(log.id)
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

        function getButtons(){
            const declineButton = document.createElement("button")
            declineButton.type = "button"
            declineButton.innerHTML = '<i class="bi bi-x-lg"></i> Не согласовать'
            declineButton.classList.add("btn", "btn-danger", "mx-1", "my-1")
            declineButton.addEventListener("click", getDeclineListener)

            const acceptButton = document.createElement("button")
            acceptButton.type = "button"
            acceptButton.innerHTML = '<i class="bi bi-check2-all"></i> Согласовать'
            acceptButton.classList.add("btn", "btn-success", "mx-1", "my-1")
            acceptButton.addEventListener("click", getAcceptListener)

            return [declineButton, acceptButton]
        }

        const modalBody = getBody()
        const agreementModal = new modalEngine()
        agreementModal.title = `Согласование ${this.data.name}`
        agreementModal.addContent(modalBody.body)
        agreementModal.addButtons(getButtons())
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