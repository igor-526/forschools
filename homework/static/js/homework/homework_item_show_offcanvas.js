function homeworkItemShowOffcanvas(homeworkID){
    homeworkItemShowOffcanvasSelectedHWID = homeworkID
    homeworkAPIGetItem(homeworkID).then(request => {
        switch (request.status){
            case 200:
                const homeworkOffcanvas = mobileInfoOffcanvasSet(request.response.name)
                mobileInfoOffcanvasAddData("Основные данные", homeworkOffcanvas,
                    homeworkItemShowOffcanvasGetMainInfoContent(request.response))
                if (request.response.actions.length){
                    mobileInfoOffcanvasAddData("Действия", homeworkOffcanvas,
                        homeworkItemShowOffcanvasGetActionsContent(request.response.id, request.response.actions, homeworkOffcanvas))
                }
                if (request.response.materials.length){
                    homeworkOffcanvas.addData("Материалы",
                        homeworkItemShowOffcanvasGetMaterialsContent(
                            request.response.id, homeworkOffcanvas, request.response.materials
                        ))
                }

                homeworkAPIGetLogs(homeworkID).then(request => {
                    switch (request.status){
                        case 200:
                            const logsInfo = homeworkItemShowOffcanvasGetLogsInfo(homeworkID, homeworkOffcanvas, request.response, true)
                            const allHistoryButton = document.createElement("button")
                            allHistoryButton.type = "button"
                            allHistoryButton.innerHTML = "Вся история"
                            allHistoryButton.classList.add("btn", "btn-primary", "w-100", "my-2")
                            allHistoryButton.addEventListener("click", function () {
                                homeworkItemLogsShowOffcanvas(homeworkID, homeworkOffcanvas)
                            })

                            mobileInfoOffcanvasAddData("Последний ответ", homeworkOffcanvas, [logsInfo, allHistoryButton])
                            break
                        default:
                            showErrorToast()
                            break
                    }
                })
                break
            default:
                showErrorToast()
                break
        }
    })
}

function homeworkItemShowOffcanvasGetMainInfoContent(hw){
    const elements = []

    const teacherP = document.createElement("p")
    teacherP.classList.add("mb-1")
    teacherP.insertAdjacentElement("beforeend", iconUtilsGetIcon(
        "teacher_grey.svg", "Преподаватель"
    ))
    teacherP.innerHTML += `<span class="fw-bold">Преподаватель: </span> ${hw.teacher.first_name} ${hw.teacher.last_name}`
    elements.push(teacherP)

    const listenerP = document.createElement("p")
    listenerP.classList.add("mb-1")
    listenerP.insertAdjacentElement("beforeend", iconUtilsGetIcon(
        "student_grey.svg", "Ученик"
    ))
    listenerP.innerHTML += `<span class="fw-bold">Ученик: </span> ${hw.listener.first_name} ${hw.listener.last_name}`
    elements.push(listenerP)

    if (hw.lesson_info){
        const lessonP = document.createElement("p")
        lessonP.classList.add("mb-1")
        lessonP.insertAdjacentElement("beforeend", iconUtilsGetIcon(
            "lesson_grey.svg", "Занятие"
        ))
        lessonP.innerHTML += `<span class="fw-bold">Занятие: </span> ${hw.lesson_info.name}`
        lessonP.style.color = "#0d6efd"
        lessonP.addEventListener("click", function () {
            lessonShowOffcanvas(hw.lesson_info.id)
        })
        elements.push(lessonP)
    }

    return elements
}

function homeworkItemShowOffcanvasGetActionsContent(homeworkID, actions=[], homeworkOffcanvas){
    const actionsElements = []

    if (actions.includes("agreement")){
        const agreementBtn = document.createElement("button")
        agreementBtn.type = "button"
        agreementBtn.classList.add("my-2", "w-100", "btn", "btn-warning")
        agreementBtn.innerHTML = '<i class="bi bi-card-list"></i> Согласование'
        agreementBtn.addEventListener("click", function () {
            homeworkItemShowAgreementModal(homeworkID, homeworkOffcanvas)
        })
        actionsElements.push(agreementBtn)
    }

    if (actions.includes("cancel")){
        const cancelBtn = document.createElement("button")
        cancelBtn.type = "button"
        cancelBtn.classList.add("my-2", "w-100", "btn", "btn-danger")
        cancelBtn.innerHTML = '<i class="bi bi-x-lg"></i> Отменить'
        cancelBtn.addEventListener("click", function () {
            homeworkItemShowCancelModal(homeworkID, homeworkOffcanvas)
        })
        actionsElements.push(cancelBtn)
    }

    if (actions.includes("send")){
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

    if (actions.includes("check")){
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
    if (actions.includes("edit")){
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

function homeworkItemShowOffcanvasGetMaterialsContent(homeworkID, homeworkOffcanvas, materials=[]){
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

    return [mobileInfoMaterialsGetBlock(materials, setDeleteMaterialModal)]
}

function homeworkItemShowOffcanvasGetLogsInfo(homeworkID, homeworkOffcanvas, logs=[], last=true){
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
    for (let i = 0; i < logs.length; i++) {
        if (last){
            if (logs[0].status === 1 || logs[0].status === 7){
                break
            }
            if (logsToShow.length === 0){
                logsToShow.push(logs[i])
                continue
            }
            if (logsToShow.length > 0 && logsToShow[logsToShow.length - 1].status === logs[i].status){
                logsToShow.push(logs[i])
            } else {
                break
            }
        } else {
            logsToShow.push(logs[i])
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
        console.log(log)
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

function homeworkItemLogsShowOffcanvas(homeworkID, homeworkOffcanvas){
    homeworkAPIGetLogs(homeworkID).then(request => {
        switch (request.status){
            case 200:
                const logsInfo = homeworkItemShowOffcanvasGetLogsInfo(
                    homeworkID, homeworkOffcanvas, request.response, false
                )
                const homeworkLogsOffcanvas = mobileInfoOffcanvasSet("История ДЗ")
                mobileInfoOffcanvasAddData("", homeworkLogsOffcanvas, [logsInfo])
                break
            default:
                showErrorToast()
                break
        }
    })
}

function homeworkItemShowAgreementModal(homeworkID, homeworkOffcanvas){
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

    function getDeclineListener(){
        const fd = getFormDataAndValidate(true)
        if (fd === false){
            return null
        }
        homeworkAPIAgreement(homeworkID, "decline", fd).then(request => {
            switch (request.status){
                case 200:
                    agreementModal.close()
                    homeworkOffcanvas.close()
                    showSuccessToast("ДЗ не согласовано")
                    homeworkItemShowOffcanvas(homeworkID)
                    break
                case 400:
                    break
                default:
                    agreementModal.close()
                    showErrorToast()
                    break
            }
        })
    }

    function getAcceptListener(){
        const fd = getFormDataAndValidate(false)
        if (fd === false){
            return null
        }
        homeworkAPIAgreement(homeworkID, "accept", fd).then(request => {
            switch (request.status){
                case 200:
                    agreementModal.close()
                    homeworkOffcanvas.close()
                    showSuccessToast("ДЗ согласовано")
                    homeworkItemShowOffcanvas(homeworkID)
                    break
                case 400:
                    break
                default:
                    showErrorToast()
                    break
            }
        })
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
    const agreementModal = mobileInfoModalSet("Согласование",
        modalBody.body, getButtons()
    )
}

function homeworkItemShowCancelModal(homeworkID, homeworkOffcanvas){
    function getCancelHWButtonListener(){
        homeworkAPISetCancelled(homeworkID).then(request => {
            cancelModal.close()
            switch (request.status){
                case 200:
                    homeworkOffcanvas.close()
                    homeworkItemShowOffcanvas(homeworkID)
                    showSuccessToast("ДЗ отменено")
                    break
                case 403:
                    showErrorToast("Нет доступа для удаления ДЗ")
                    break
                default:
                    showErrorToast()
                    break
            }
        })
    }

    function getBody(){
        const p = document.createElement("p")
        p.innerHTML = "Отмена занятия не удалит его<br>Действие обратимо"
        return [p]
    }

    function getButtons(){
        const cancelHWButton = document.createElement("button")
        cancelHWButton.type = "button"
        cancelHWButton.innerHTML = '<i class="bi bi-x-lg"></i> Отменить ДЗ'
        cancelHWButton.classList.add("btn", "btn-danger", "mx-1", "my-1")
        cancelHWButton.addEventListener("click", getCancelHWButtonListener)

        return [cancelHWButton]
    }

    const cancelModal = mobileInfoModalSet("Согласование",
        getBody(), getButtons()
    )
}

function homeworkItemGetAnswerContent(homeworkID, homeworkOffcanvas, mode){
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

    function sendListener(action) {
        const formData = validateAndGetFormData(action)
        if (formData === false){
            return null
        }
        homeworkAPISend(homeworkID, formData).then(request => {
            switch (request.status){
                case 201:
                    homeworkOffcanvas.close()
                    homeworkItemShowOffcanvas(homeworkID)
                    showSuccessToast("Решение успешно отправлено!")
                    break
                case 400:
                    console.log(request.response)
                    break
                default:
                    showErrorToast()
                    break
            }
        })
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
            sendBtn.addEventListener("click", function () {
                sendListener("send")
            })
            content.push(sendBtn)
            break
        case "check":
            const acceptBtn = document.createElement("button")
            acceptBtn.type = "button"
            acceptBtn.classList.add("btn", "btn-success", "w-100", "my-1")
            acceptBtn.innerHTML = '<i class="bi bi-check2 me-1"></i>Принять ДЗ'
            acceptBtn.addEventListener("click", function () {
                sendListener("check_accept")
            })
            content.push(acceptBtn)
            const declineBtn = document.createElement("button")
            declineBtn.type = "button"
            declineBtn.classList.add("btn", "btn-warning", "w-100", "my-1")
            declineBtn.innerHTML = '<i class="bi bi-x-lg me-1"></i>Отправить на доработку'
            declineBtn.addEventListener("click", function () {
                sendListener("check_decline")
            })
            content.push(declineBtn)
            break
    }
    return content
}

function homeworkItemGetAddMaterialsContent(homeworkID, homeworkOffcanvas){
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

    function sendListener(){
        const formData = validateAndGetFormData()
        if (!formData)
            return null
        materialsAPIAddToObject(formData, "hw", homeworkID).then(request => {
            switch (request.status){
                case 200:
                    homeworkOffcanvas.close()
                    homeworkItemShowOffcanvas(homeworkID)
                    showSuccessToast("Материалы успешно добавлены")
                    break
                case 400:
                    showErrorToast(request.response.hasOwnProperty("error") ?
                        request.response.error : null)
                    break
                case 404:
                    showErrorToast(request.response.hasOwnProperty("error") ?
                        request.response.error : "Домашнее задание не найдено")
                    break
                default:
                    showErrorToast()
                    break
            }
        })
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
    addMaterialsButton.addEventListener("click", sendListener)
    return [uploadBlock.button, uploadBlock.block, textMaterialsForm,
        addTextMaterialFieldButton, addMaterialsButton]
}

function homeworkItemGetEditLogModal(homeworkID, homeworkOffcanvas, log){
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

    function editButtonListener(){
        const fd = getFormDataAndValidate()
        if (fd === false){
            return null
        }
        homeworkAPIUpdateLog(log.id, fd).then(request => {
            editModal.close()
            switch (request.status){
                case 200:
                    homeworkOffcanvas.close()
                    homeworkItemShowOffcanvas(homeworkID)
                    showSuccessToast("Ответ успешно изменён")
                    break
                case 400:
                    showErrorToast(request.response.hasOwnProperty("error") ?
                        request.response.error :
                        "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
                    break
                case 403:
                    showErrorToast("Нет доступа для изменения этого ответа")
                    break
                default:
                    showErrorToast()
                    break
            }
        })
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
    editButton.addEventListener("click", editButtonListener)
    const h6 = document.createElement("h6")
    h6.innerHTML = "Добавление файлов"
    const uploadBlock = mobileInfoGetUploadFilesBlock(selectedFiles)
    const editModal = mobileInfoModalSet("Изменение ответа",
        [comment.block, h6, uploadBlock.button, uploadBlock.block], [editButton]
    )
}

let homeworkItemShowOffcanvasSelectedHWID = null