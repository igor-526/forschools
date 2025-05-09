function mobileInfoOffcanvasSet(header){
    function close(){
        offcanvas.bsElement.hide()
        setTimeout(() => {
            offcanvas.element.remove()
        }, 1000)
    }

    function addData(header=null, content=[]){
        const headerElement = document.createElement("h2")
        headerElement.innerHTML = header
        headerElement.classList.add("mt-4")
        offcanvas.body.insertAdjacentElement("beforeend", headerElement)
        if (header.length > 0){
            const navButton = document.createElement("button")
            navButton.type = "button"
            navButton.classList.add("btn", "btn-sm", "btn-outline-primary", "mx-1")
            navButton.innerHTML = header
            offcanvas.navigation.insertAdjacentElement("beforeend", navButton)
            navButton.addEventListener("click", function (){
                headerElement.scrollIntoView({block: "start", behavior: "smooth"})
            })
        }
        content.forEach(item => {
            offcanvas.body.insertAdjacentElement("beforeend", item)
        })
        return headerElement
    }

    function getOffcanvas(){
        const mainDiv = document.createElement("div")
        mainDiv.classList.add("offcanvas", "offcanvas-end")
        mainDiv.tabIndex = -1

        const header = document.createElement("div")
        header.classList.add("offcanvas-header")
        const headerH = document.createElement("h5")
        const closeButton = document.createElement("button")
        closeButton.classList.add("btn-close", "text-reset")
        closeButton.type = "button"
        closeButton.setAttribute("data-bs-dismiss", "offcanvas")
        header.insertAdjacentElement("beforeend", headerH)
        header.insertAdjacentElement("beforeend", closeButton)
        mainDiv.insertAdjacentElement("beforeend", header)
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
        return {
            element: mainDiv,
            bsElement: new bootstrap.Offcanvas(mainDiv),
            header: headerH,
            navigation: bodyNavigation,
            body: bodyBlock,
            close: close,
            addData: addData
        }
    }

    const offcanvas = getOffcanvas()
    offcanvas.bsElement.show()
    offcanvas.header.innerHTML = header ? header : ""
    return offcanvas
}


function mobileInfoOffcanvasAddData(header, offcanvas, content=[]){
    const headerElement = document.createElement("h2")
    headerElement.innerHTML = header
    headerElement.classList.add("mt-4")
    offcanvas.body.insertAdjacentElement("beforeend", headerElement)
    if (header.length > 0){
        const navButton = document.createElement("button")
        navButton.type = "button"
        navButton.classList.add("btn", "btn-sm", "btn-outline-primary", "mx-1")
        navButton.innerHTML = header
        offcanvas.navigation.insertAdjacentElement("beforeend", navButton)
        navButton.addEventListener("click", function (){
            headerElement.scrollIntoView({block: "start", behavior: "smooth"})
        })
    }
    content.forEach(item => {
        offcanvas.body.insertAdjacentElement("beforeend", item)
    })
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
                materialBlock.style.width = "31%"
                materialBlock.style.backgroundImage = `url("${mat.file}")`
                materialBlock.style.backgroundSize = "cover"
                materialBlock.style.height = `${document.body.clientWidth / 4}px`
                materialBlock.style.cursor = "pointer"
                setListeners(materialBlock, mat)
                break
            case 'video_formats':
                materialBlock.innerHTML = '<i class="bi bi-file-easel"></i>'
                materialBlock.style.color = "#0d6efd"
                materialBlock.style.fontSize = "40px"
                materialBlock.classList.add("d-flex", "align-items-center", "justify-content-center")
                materialBlock.style.width = "31%"
                materialBlock.style.height = `${document.body.clientWidth / 4}px`
                materialBlock.style.cursor = "pointer"
                setListeners(materialBlock, mat)
                break
            case 'animation_formats':
                materialBlock.style.backgroundImage = `url("${mat.file}")`
                materialBlock.style.backgroundSize = "cover"
                materialBlock.style.width = "31%"
                materialBlock.style.height = `${document.body.clientWidth / 4}px`
                materialBlock.style.cursor = "pointer"
                setListeners(materialBlock, mat)
                break
            case 'archive_formats':
                materialBlock.innerHTML = '<i class="bi bi-file-earmark-zip"></i>'
                materialBlock.style.color = "#0d6efd"
                materialBlock.style.fontSize = "40px"
                materialBlock.classList.add("d-flex", "align-items-center", "justify-content-center")
                materialBlock.style.width = "31%"
                materialBlock.style.height = `${document.body.clientWidth / 4}px`
                materialBlock.style.cursor = "pointer"
                setListeners(materialBlock, mat)
                break
            case 'pdf_formats':
                materialBlock.innerHTML = '<i class="bi bi-file-earmark-pdf"></i>'
                materialBlock.style.color = "#0d6efd"
                materialBlock.style.fontSize = "40px"
                materialBlock.classList.add("d-flex", "align-items-center", "justify-content-center")
                materialBlock.style.width = "31%"
                materialBlock.style.height = `${document.body.clientWidth / 4}px`
                materialBlock.style.cursor = "pointer"
                setListeners(materialBlock, mat)
                break
            case 'word_formats':
                materialBlock.innerHTML = '<i class="bi bi-file-earmark-word"></i>'
                materialBlock.style.color = "#0d6efd"
                materialBlock.style.fontSize = "40px"
                materialBlock.classList.add("d-flex", "align-items-center", "justify-content-center")
                materialBlock.style.width = "31%"
                materialBlock.style.height = `${document.body.clientWidth / 4}px`
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
                materialBlock.style.width = "31%"
                materialBlock.style.height = `${document.body.clientWidth / 4}px`
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
        const deleteFileModal = mobileInfoModalSet("Удалить файл?",
            [p], [deleteButton])
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
    sendHWAddFilesButton.classList.add("btn", "btn-outline-primary", "my-2")
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


function mobileInfoModalSet(title="", content=[], buttons=[]){
    function close(){
        modalBs.hide()
        setTimeout(() => {
            modalDiv.remove()
        }, 1000)
    }

    const modalDiv = document.createElement("div")
    modalDiv.classList.add("modal", "fade")
    modalDiv.tabIndex = -1

    const modalDialog = document.createElement("div")
    modalDialog.classList.add("modal-dialog")
    modalDiv.insertAdjacentElement("beforeend", modalDialog)

    const modalContent = document.createElement("div")
    modalContent.classList.add("modal-content")
    modalDialog.insertAdjacentElement("beforeend", modalContent)

    const modalHeader = document.createElement("div")
    modalHeader.classList.add("modal-header")
    const modalHeaderH = document.createElement("h5")
    modalHeaderH.classList.add("modal-title")
    modalHeaderH.innerHTML = title
    const modalHeaderCloseButton = document.createElement("button")
    modalHeaderCloseButton.classList.add("btn-close")
    modalHeaderCloseButton.type = "button"
    modalHeaderCloseButton.setAttribute("data-bs-dismiss", "modal")
    modalHeaderCloseButton.ariaLabel = "Close"
    modalContent.insertAdjacentElement("beforeend", modalHeader)
    modalHeader.insertAdjacentElement("beforeend", modalHeaderH)
    modalHeader.insertAdjacentElement("beforeend", modalHeaderCloseButton)

    const modalBody = document.createElement("div")
    modalBody.classList.add("modal-body")
    modalContent.insertAdjacentElement("beforeend", modalBody)
    content.forEach(cont => {
        modalBody.insertAdjacentElement("beforeend", cont)
    })

    const modalFooter = document.createElement("div")
    modalFooter.classList.add("modal-footer")
    const modalFooterCloseButton = document.createElement("button")
    modalFooterCloseButton.classList.add("btn", "btn-secondary", "mx-1", "my-1")
    modalFooterCloseButton.setAttribute("data-bs-dismiss", "modal")
    modalFooterCloseButton.type = "button"
    modalFooterCloseButton.innerHTML = "Закрыть"
    modalContent.insertAdjacentElement("beforeend", modalFooter)
    buttons.forEach(btn => {
        modalFooter.insertAdjacentElement("beforeend", btn)
    })
    modalFooter.insertAdjacentElement("beforeend", modalFooterCloseButton)
    document.body.insertAdjacentElement("beforeend", modalDiv)
    const modalBs = new bootstrap.Modal(modalDiv)
    modalHeaderCloseButton.addEventListener("click", close)
    modalFooterCloseButton.addEventListener("click", close)
    modalBs.show()
    return {
        modal: modalDiv,
        modalBs: modalBs,
        close: close
    }
}