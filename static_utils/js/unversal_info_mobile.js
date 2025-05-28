class offcanvasEngine{
    allContent = []
    title = ""

    constructor() {
        this.generate()
    }

    generate(){
        const mainDiv = document.createElement("div")
        mainDiv.classList.add("offcanvas", "offcanvas-end")
        mainDiv.tabIndex = -1
        this.id = offcanvasEngineID
        mainDiv.id = `offcanvasGenerated${this.id}`
        offcanvasEngineID += 1

        const headerDiv = document.createElement("div")
        headerDiv.classList.add("offcanvas-header")
        const headerH = document.createElement("h5")
        const closeButton = document.createElement("button")
        closeButton.classList.add("btn-close", "text-reset")
        closeButton.type = "button"
        closeButton.setAttribute("data-bs-dismiss", "offcanvas")
        headerDiv.insertAdjacentElement("beforeend", headerH)
        headerDiv.insertAdjacentElement("beforeend", closeButton)
        mainDiv.insertAdjacentElement("beforeend", headerDiv)
        closeButton.addEventListener("click", function (){
            setTimeout(() => {
                mainDiv.remove()
            }, 500)
        })

        const body = document.createElement("div")
        body.classList.add("offcanvas-body")
        const bodyNavigation = document.createElement("nav")
        bodyNavigation.classList.add("d-flex", "mb-5")
        bodyNavigation.style.overflowX = "scroll"
        const bodyBlock = document.createElement("div")
        body.insertAdjacentElement("beforeend", bodyNavigation)
        body.insertAdjacentElement("beforeend", bodyBlock)
        mainDiv.insertAdjacentElement("beforeend", body)
        document.body.insertAdjacentElement("beforeend", mainDiv)
        this.offcanvasElement = mainDiv
        this.offcanvasBsElement = new bootstrap.Offcanvas(mainDiv)
        this.offcanvasHeaderHElement = headerH
        this.offcanvasNavigation = bodyNavigation
        this.offcanvasBody = bodyBlock
    }

    set header(header){
        this.title = header
        this.offcanvasHeaderHElement.innerHTML = header
    }

    show(){
        if (!document.querySelector(`#offcanvasGenerated${this.id}`)){
            this.generate()
            this._restoreAllContent()
        }
        this.offcanvasBsElement.show()
    }

    close(){
        this.offcanvasBsElement.hide()
        setTimeout(() => {
            this.offcanvasElement.remove()
        }, 1000)
    }

    addData(header, content){
        const contentToAdd = {
            header: header,
            elements: content instanceof Array ? content : [content]
        }
        if (!contentToAdd.elements.length){
            return null
        }
        this.allContent.push(contentToAdd)
        return this._addContentItemToOffcanvas(contentToAdd)
    }

    _addContentItemToOffcanvas(content){
        const headerElement = document.createElement(isMobile ? "h2" : "h4")
        headerElement.innerHTML = content.header
        headerElement.classList.add("mt-4")
        this.offcanvasBody.insertAdjacentElement("beforeend", headerElement)
        if (content.header.length > 0){
            const navButton = document.createElement("button")
            navButton.type = "button"
            navButton.classList.add("btn", "btn-sm", "btn-outline-primary", "mx-1")
            navButton.innerHTML = content.header
            this.offcanvasNavigation.insertAdjacentElement("beforeend", navButton)
            navButton.addEventListener("click", function (){
                headerElement.scrollIntoView({block: "start", behavior: "smooth"})
            })
        }
        content.elements.forEach(item => {
            this.offcanvasBody.insertAdjacentElement("beforeend", item)
        })
        return headerElement
    }

    _restoreAllContent(){
        this.offcanvasHeaderHElement.innerHTML = this.title
        this.allContent.forEach(item => {
            this._addContentItemToOffcanvas(item)
        })
    }

    resetContent(){
        this.offcanvasBody.innerHTML = ""
        this.offcanvasNavigation.innerHTML = ""
    }
}

class modalEngine{
    constructor() {
        this.modalDiv = document.createElement("div")
        this.modalDiv.classList.add("modal", "fade")
        this.modalDiv.tabIndex = -1

        const modalDialog = document.createElement("div")
        modalDialog.classList.add("modal-dialog")
        this.modalDiv.insertAdjacentElement("beforeend", modalDialog)

        const modalContent = document.createElement("div")
        modalContent.classList.add("modal-content")
        modalDialog.insertAdjacentElement("beforeend", modalContent)

        const modalHeader = document.createElement("div")
        modalHeader.classList.add("modal-header")
        this.modalHeaderH = document.createElement("h5")
        this.modalHeaderH.classList.add("modal-title")
        const modalHeaderCloseButton = document.createElement("button")
        modalHeaderCloseButton.classList.add("btn-close")
        modalHeaderCloseButton.type = "button"
        modalHeaderCloseButton.setAttribute("data-bs-dismiss", "modal")
        modalHeaderCloseButton.ariaLabel = "Close"
        modalContent.insertAdjacentElement("beforeend", modalHeader)
        modalHeader.insertAdjacentElement("beforeend", this.modalHeaderH)
        modalHeader.insertAdjacentElement("beforeend", modalHeaderCloseButton)

        this.modalBody = document.createElement("div")
        this.modalBody.classList.add("modal-body")
        this.modalBody.style.maxHeight = `${window.innerHeight - 140}px`
        this.modalBody.style.overflowY = "scroll"
        modalContent.insertAdjacentElement("beforeend", this.modalBody)
        this.modalFooter = document.createElement("div")
        this.modalFooter.classList.add("modal-footer")
        const modalFooterCloseButton = document.createElement("button")
        modalFooterCloseButton.classList.add("btn", "btn-secondary", "mx-1", "my-1")
        modalFooterCloseButton.setAttribute("data-bs-dismiss", "modal")
        modalFooterCloseButton.type = "button"
        modalFooterCloseButton.innerHTML = "Закрыть"
        modalContent.insertAdjacentElement("beforeend", this.modalFooter)
        this.modalFooter.insertAdjacentElement("beforeend", modalFooterCloseButton)
        document.body.insertAdjacentElement("beforeend", this.modalDiv)
        this.modalBs = new bootstrap.Modal(this.modalDiv)
        modalHeaderCloseButton.addEventListener("click", () => {this.close()})
        modalFooterCloseButton.addEventListener("click", () => {this.close()})

    }

    set title(title){
        this.modalHeaderH.innerHTML = title
    }

    show(){
        this.modalBs.show()
    }

    close(){
        this.modalBs.hide()
        setTimeout(() => {
            this.modalDiv.remove()
        }, 1000)
    }

    setClasses(classes=[]){
        classes.forEach(cl => {
            this.modalDiv.classList.add(cl)
        })
    }

    addContent(content){
        let contentToAdd = []
        if (content instanceof Array){
            contentToAdd = content
        } else {
            contentToAdd = [content]
        }
        contentToAdd.forEach(cont => {
            this.modalBody.insertAdjacentElement("beforeend", cont)
        })
    }

    addButtons(buttons){
        let buttonsToAdd = []
        if (buttons instanceof Array){
            buttonsToAdd = buttons
        } else {
            buttonsToAdd = [buttons]
        }
        buttonsToAdd.forEach(btn => {
            this.modalFooter.insertAdjacentElement("beforeend", btn)
        })
    }
}

class pageEngine{
    allColumns = []

    constructor(contentBody) {
        this.contentBody = contentBody
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect
                if (this.allColumns.length > 0 && width > 700){
                    this.allColumns.forEach(col => {
                        col.classList.add("col-6")
                        col.classList.remove("col-12")
                    })
                }
                if (this.allColumns.length > 0 && width <= 700){
                    this.allColumns.forEach(col => {
                        col.classList.add("col-12")
                        col.classList.remove("col-6")
                    })
                }
            }
        })
        resizeObserver.observe(this.contentBody)
    }

    addData(title, content){
        let contentToAdd = []
        if (content instanceof Array){
            contentToAdd = content
        } else {
            contentToAdd = [content]
        }
        if (!contentToAdd.length){
            return null
        }
        const column = document.createElement("div")
        column.classList.add("p-6", "mb-4")
        this.contentBody.insertAdjacentElement("beforeend", column)
        if (title !== ""){
            this.titleH = document.createElement("h4")
            this.titleH.innerHTML = title
            column.insertAdjacentElement("beforeend", this.titleH)
        }

        contentToAdd.forEach(cont => {
            column.insertAdjacentElement("beforeend", cont)
        })
        this.allColumns.push(column)
        return column
    }

    resetContent(){
        this.contentBody.innerHTML = ""
        this.allColumns.length = 0
    }
}


function mobileInfoMaterialsGetBlock(materials=[], deleteFunc=null){
    function setListeners(block, mat, openable=true) {
        if (deleteFunc){
            block.addEventListener("touchstart", () => {
                materialAction = "open"
                timeout = setTimeout(() => {
                    block.style.border = "5px solid red"
                    materialAction = "delete"
                }, 700)
            })
            block.addEventListener("touchmove", () => {
                clearTimeout(timeout)
                materialAction = null
                block.style.border = "1px solid #0d6efd"
            })
            block.addEventListener("touchend", (e) => {
                clearTimeout(timeout)
                block.style.border = "1px solid #0d6efd"
                switch (materialAction){
                    case "delete":
                        e.preventDefault()
                        deleteFunc(mat.id)
                        break
                    case "open":
                        e.preventDefault()
                        materialPreviewModalSet(mat.type, mat.file)
                        break
                }
            })
        } else {
            if (openable){
                block.addEventListener("click", () => {
                    materialPreviewModalSet(mat.type, mat.file)
                })
            }
        }

    }

    let materialAction = null
    let timeout
    const mainDiv = document.createElement("div")
    mainDiv.classList.add("d-flex")
    mainDiv.style.flexWrap = "wrap"
    materials.forEach(mat => {
        const materialBlock = document.createElement("div")
        materialBlock.classList.add("m-1")
        materialBlock.style.border = "1px solid #0d6efd"
        materialBlock.style.borderRadius = "10px"

        switch (mat.type){
            case 'image_formats':
                materialBlock.style.width = "25%"
                const materialBlockImg = document.createElement("img")
                materialBlockImg.style.width = "100%"
                materialBlockImg.src = mat.file
                materialBlockImg.alt = "Изображение"
                materialBlock.insertAdjacentElement("beforeend", materialBlockImg)
                materialBlock.style.cursor = "pointer"
                setListeners(materialBlock, mat)
                break
            case 'video_formats':
                materialBlock.innerHTML = '<i class="bi bi-file-easel"></i>'
                materialBlock.style.color = "#0d6efd"
                materialBlock.style.fontSize = "40px"
                materialBlock.classList.add("d-flex", "align-items-center", "justify-content-center")
                materialBlock.style.width = "25%"
                materialBlock.style.cursor = "pointer"
                setListeners(materialBlock, mat)
                break
            case 'animation_formats':
                materialBlock.style.width = "25%"
                materialBlock.style.cursor = "pointer"
                const materialBlockAnim = document.createElement("img")
                materialBlockAnim.style.width = "100%"
                materialBlockAnim.src = mat.file
                materialBlockAnim.alt = "Анимация"
                materialBlock.insertAdjacentElement("beforeend", materialBlockAnim)
                setListeners(materialBlock, mat)
                break
            case 'archive_formats':
                materialBlock.innerHTML = '<i class="bi bi-file-earmark-zip"></i>'
                materialBlock.style.color = "#0d6efd"
                materialBlock.style.fontSize = "40px"
                materialBlock.classList.add("d-flex", "align-items-center", "justify-content-center")
                materialBlock.style.width = "25%"
                materialBlock.style.height = "25%"
                materialBlock.style.cursor = "pointer"
                setListeners(materialBlock, mat)
                break
            case 'pdf_formats':
                materialBlock.innerHTML = '<i class="bi bi-file-earmark-pdf"></i>'
                materialBlock.style.color = "#0d6efd"
                materialBlock.style.fontSize = "40px"
                materialBlock.classList.add("d-flex", "align-items-center", "justify-content-center")
                materialBlock.style.width = "25%"
                materialBlock.style.cursor = "pointer"
                setListeners(materialBlock, mat)
                break
            case 'word_formats':
                materialBlock.innerHTML = '<i class="bi bi-file-earmark-word"></i>'
                materialBlock.style.color = "#0d6efd"
                materialBlock.style.fontSize = "40px"
                materialBlock.classList.add("d-flex", "align-items-center", "justify-content-center")
                materialBlock.style.width = "25%"
                materialBlock.style.cursor = "pointer"
                setListeners(materialBlock, mat)
                break
            case 'voice_formats':
                const voice = document.createElement("audio")
                voice.controls = true
                voice.src = mat.file
                materialBlock.insertAdjacentElement("beforeend", voice)
                materialBlock.style.width = "100%"
                setListeners(materialBlock, mat, false)
                break
            case 'audio_formats':
                const audio = document.createElement("audio")
                audio.controls = true
                audio.src = mat.file
                materialBlock.insertAdjacentElement("beforeend", audio)
                materialBlock.style.width = "100%"
                setListeners(materialBlock, mat, false)
                break
            case 'text_formats':
                const splittedHref = mat.file.split("/")
                const folder = splittedHref[splittedHref.length-2]
                const file = splittedHref[splittedHref.length-1]
                const href = `/api/v1/materials/get_text/?folder=${folder}&file=${file}`
                fetch(href).then(async request => {
                    if (request.status === 200) {
                        materialBlock.innerHTML = await request.json()
                    } else {
                        materialBlock.innerHTML = "Произошла ошибка при загрузке материала"
                    }
                })
                materialBlock.style.width = "100%"
                materialBlock.classList.add("p-3")
                setListeners(materialBlock, mat, false)
                break
            case 'presentation_formats':
                materialBlock.innerHTML = '<i class="bi bi-file-earmark-ppt"></i>'
                materialBlock.style.color = "#0d6efd"
                materialBlock.style.fontSize = "40px"
                materialBlock.classList.add("d-flex", "align-items-center", "justify-content-center")
                materialBlock.style.width = "25%"
                materialBlock.style.cursor = "pointer"
                setListeners(materialBlock, mat)
                break
        }
        mainDiv.insertAdjacentElement("beforeend", materialBlock)
    })
    return mainDiv
}


function mobileInfoGetUploadFilesBlock(filesArray){
    function setDeleteModal(matID){
        const p = document.createElement("p")
        p.innerHTML = "Действие необратимо"
        const deleteButton = document.createElement("button")
        deleteButton.type = "button"
        deleteButton.classList.add("mx-1", "my-1", "btn", "btn-danger")
        deleteButton.innerHTML = '<i class="bi bi-trash me-1"></i> Удалить'
        const deleteFileModal = new modalEngine()
        deleteFileModal.title = "Удалить файл?"
        deleteFileModal.addContent(p)
        deleteFileModal.addButtons(deleteButton)
        deleteFileModal.show()
        deleteButton.addEventListener("click", () => {
            const index = filesArray.indexOf(filesArray.find(mat => mat.id === matID))
            if (index !== -1){
                filesArray.splice(index, 1)
                updateFilesBlock()
            }
            deleteFileModal.close()
        })
    }

    function updateFilesBlock(file, type){
        if (file && type){
            let reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onloadend = () => {
                filesArray.push({
                    type: type,
                    file: reader.result,
                    fileForm: file,
                })
                for (let i = 0; i < filesArray.length; i++) {
                    filesArray[i].id = i + 1
                }
                filesBlock.innerHTML = ""
                filesBlock.insertAdjacentElement("beforeend", mobileInfoMaterialsGetBlock(filesArray, setDeleteModal))
            }
        } else {
            filesBlock.innerHTML = ""
            filesBlock.insertAdjacentElement("beforeend", mobileInfoMaterialsGetBlock(filesArray, setDeleteModal))
        }

    }

    const sendHWFilesInput = document.createElement("input")
    sendHWFilesInput.type = "file"
    const filesBlock = document.createElement("div")

    const sendHWAddFilesButton = document.createElement("button")
    sendHWAddFilesButton.type = "button"
    sendHWAddFilesButton.classList.add("btn", "btn-outline-primary", "my-2", "w-100")
    sendHWAddFilesButton.style.height = "100px"
    sendHWAddFilesButton.innerHTML = "Нажмите или перенесите сюда файлы для добавления"
    sendHWAddFilesButton.addEventListener("click", () => {
        sendHWFilesInput.click()
    })
    sendHWAddFilesButton.addEventListener("dragenter", () => {
        sendHWAddFilesButton.classList.remove("btn-outline-primary")
        sendHWAddFilesButton.classList.add("btn-warning")
    })
    sendHWAddFilesButton.addEventListener("dragleave", () => {
        sendHWAddFilesButton.classList.add("btn-outline-primary")
        sendHWAddFilesButton.classList.remove("btn-warning")
    })
    sendHWAddFilesButton.addEventListener("drop", (e) => {
        e.preventDefault()
        e.stopPropagation()
        sendHWAddFilesButton.classList.add("btn-outline-primary")
        sendHWAddFilesButton.classList.remove("btn-warning")
        let draggedData = e.dataTransfer
        let files = draggedData.files
        Array.from(files).forEach((file) => {
            const fileType = universalFileValidator(file)
            if (!fileType){
                showErrorToast("Такой тип файла не поддерживается")
                return null
            }
            updateFilesBlock(file, fileType)
        })
    })
    sendHWFilesInput.addEventListener("change", () => {
        Array.from(sendHWFilesInput.files).forEach((file) => {
            const fileType = universalFileValidator(file)
            if (!fileType){
                showErrorToast("Такой тип файла не поддерживается")
                return null
            }
            updateFilesBlock(file, fileType)
        })
        sendHWFilesInput.value = ""
    })
    return {
        button: sendHWAddFilesButton,
        block:filesBlock
    }
}


function materialPreviewModalSet(type, href){
    function getImg(href){
        const img = document.createElement("img")
        img.src = href
        img.alt = "Изображение"
        img.classList.add("img-fluid")
        return img
    }

    function getAudio(href){
        const audio = document.createElement("audio")
        audio.controls = true
        audio.src = href
        return audio
    }

    function getVideo(href){
        const video = document.createElement("video")
        video.controls = true
        video.src = href
        video.classList.add("img-fluid")
        return video
    }

    function getText(href){
        const p = document.createElement("p")
        const splittedHref = href.split("/")
        const folder = splittedHref[splittedHref.length-2]
        const file = splittedHref[splittedHref.length-1]
        href = `/api/v1/materials/get_text/?folder=${folder}&file=${file}`
        fetch(href).then(async request => {
            if (request.status === 200) {
                p.innerHTML = await request.json()
            } else {
                p.innerHTML = "Произошла ошибка при загрузке материала"
            }
        })
        return p
    }

    function getPDF(href){
        const pdf = document.createElement("embed")
        pdf.type = "application/pdf"
        pdf.src = href
        pdf.style = "width: 100%; height: 700px;"
        return pdf
    }

    function getOffice(href){
        const word = document.createElement("iframe")
        word.src = `https://view.officeapps.live.com/op/embed.aspx?src=${location.host}/${href}`
        word.style = "width: 100%;"
        return word
    }

    function getUnsupported(){
        const p = document.createElement("p")
        p.innerHTML = "Предварительный просмотр материала не поддерживается"
        return p
    }

    function getBody(type, href){
        switch (type) {
            case "image_formats":
                return {title: "Изображение",
                    elem: getImg(href)}
            case "animation_formats":
                return {title: "Анимация",
                    elem: getImg(href)}
            case "voice_formats":
                return {title: "Голосовое сообщение",
                    elem: getAudio(href)}
            case "audio_formats":
                return {title: "Аудиозапись",
                    elem: getAudio(href)}
            case "video_formats":
                return {title: "Видео",
                    elem: getVideo(href)}
            case "pdf_formats":
                return {title: "PDF файл",
                    elem: getPDF(href)}
            case "word_formats":
                return {title: "Документ Word",
                    elem: getOffice(href)}
            case "presentation_formats":
                return {title: "Презентация",
                    elem: getOffice(href)}
            case "text_formats":
                return {title: "Текст",
                    elem: getText(href)}
            default:
                return {title: "Не поддерживается",
                    elem: getUnsupported()}
        }
    }

    const prevBody = getBody(type, href)
    const materialPreviewModal = new modalEngine()
    materialPreviewModal.title = prevBody.title
    materialPreviewModal.addContent(prevBody.elem)

    const materialPreviewSaveButton = document.createElement("a")
    materialPreviewSaveButton.classList.add("btn", "btn-primary")
    materialPreviewSaveButton.innerHTML = 'Скачать'
    materialPreviewSaveButton.href = href
    materialPreviewModal.setClasses(["modal-xxl"])
    materialPreviewModal.addButtons(materialPreviewSaveButton)
    materialPreviewModal.show()
}


function universalInfoSelectionModal(
    custom = false,
    searchParams = {},
    multiple = true,
    autoSelected = [],
    nullSelection = false,
    readyFunction = ()=>{}
){
    function getSearchBlock(){
        const mainBlock = document.createElement("div")
        mainBlock.classList.add("input-group", "mb-3")

        const queryField = document.createElement("input")
        queryField.type = "text"
        queryField.classList.add("form-control", "form-control-sm")
        queryField.ariaLabel = ""
        queryField.placeholder = "Поиск:"
        queryField.addEventListener("input", () => {
            const value = queryField.value.trim().toLowerCase()
            getUsers(value ? value : null)
        })

        const resetButton = document.createElement("button")
        resetButton.type = "button"
        resetButton.classList.add("btn", "btn-sm", "btn-outline-danger")
        resetButton.innerHTML = '<i class="bi bi-x-lg"></i>'
        resetButton.addEventListener("click", function (){
            queryField.value = ""
            selected.length = 0
            getUsers(null)
            updateReadyButton()
        })


        const eraseButton = document.createElement("button")
        eraseButton.type = "button"
        eraseButton.classList.add("btn", "btn-sm", "btn-outline-danger")
        eraseButton.innerHTML = '<i class="bi bi-eraser"></i>'
        eraseButton.addEventListener("click", function (){
            queryField.value = ""
            getUsers(null)
        })

        mainBlock.insertAdjacentElement("beforeend", resetButton)
        mainBlock.insertAdjacentElement("beforeend", queryField)
        mainBlock.insertAdjacentElement("beforeend", eraseButton)

        return mainBlock
    }

    function getUsers(fullName=null){
        let params = {
            setting: null,
            id: null,
            tg: null,
            username: null,
            fullName: fullName,
            roles: [],
            excludeMe: true,
            ...searchParams
        }
        usersAPIGetAll(
            params.setting, params.id, params.tg,
            params.username, params.fullName, params.roles,
            null,null,null,
            params.excludeMe
        ).then(request => {
            switch (request.status){
                case 200:
                    showUsers(request.response)
                    break
                default:
                    showErrorToast()
                    break
            }
        })
    }

    function showUsers(users=[]){
        usersList.innerHTML = ""
        if (users.length === 0){
            const noContentLi = document.createElement("li")
            noContentLi.classList.add("list-group-item")
            noContentLi.innerHTML = "Результатов нет"
            usersList.insertAdjacentElement("beforeend", noContentLi)
            return null
        }
        users.forEach(user => {
            const a = document.createElement("a")
            a.classList.add("list-group-item")
            a.innerHTML = `${user.first_name} ${user.last_name}`
            a.href = "#"
            if (selected.includes(user.id)){
                a.classList.add("active")
            }
            a.addEventListener("click", () => {
                selectListener(user.id, a)
            })
            usersList.insertAdjacentElement("beforeend", a)
        })
    }

    function showCustom(){
        searchParams.forEach(param => {
            const a = document.createElement("a")
            a.classList.add("list-group-item")
            a.innerHTML = param.name
            if (param.more_data){
                a.innerHTML += ` (${param.more_data})`
            }
            a.href = "#"
            if (selected.includes(param.id)){
                a.classList.add("active")
            }
            a.addEventListener("click", () => {
                selectListener(param.id, a)
            })
            usersList.insertAdjacentElement("beforeend", a)
        })
    }

    function selectListener(userID, element) {
        if (multiple){
            const index = selected.indexOf(userID)
            switch (index){
                case -1:
                    selected.push(userID)
                    element.classList.add("active")
                    break
                default:
                    selected.splice(index, 1)
                    element.classList.remove("active")
                    break
            }
        } else {
            usersList.querySelectorAll("a").forEach(elem => {
                elem.classList.remove("active")
            })
            element.classList.add("active")
            selected.length = 0
            selected.push(userID)
        }
        updateReadyButton()
    }

    function updateReadyButton(){
        if (!multiple && nullSelection){
            return null
        }
        if (multiple){
            readyButton.innerHTML = `Выбрать (${selected.length})`
        }
        readyButton.disabled = !nullSelection && !selected.length
    }

    const readyButton = document.createElement("button")
    readyButton.type = "button"
    readyButton.classList.add("btn", "btn-success")
    readyButton.innerHTML = "Выбрать"
    readyButton.addEventListener("click", function () {
        modal.close()
        readyFunction(selected)
    })

    const selected = Array.from(autoSelected)
    const usersList = document.createElement("ul")
    usersList.classList.add("list-group")
    if (custom){
        showCustom()
    } else {
        getUsers()
    }
    updateReadyButton()
    let title
    if (custom){
        title = custom
    } else {
        title = multiple ? "Выбор пользователей" : "Выбор пользователя"
    }
    const modal = new modalEngine()
    modal.title = title
    modal.addContent([getSearchBlock(), usersList])
    modal.addButtons(readyButton)
    modal.show()
}

let offcanvasEngineID = 1