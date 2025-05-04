function mobileInfoOffcanvasSet(header){
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
            body: bodyBlock
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


function mobileInfoOffcanvasClose(offcanvas) {
    offcanvas.bsElement.hide()
    setTimeout(() => {
        offcanvas.element.remove()
    }, 1000)
}


function mobileInfoMaterialsGetBlock(materials=[]){
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
                materialBlock.addEventListener("click", function () {
                    materialPreviewModalSet(mat.type, mat.file)
                })
                break
            case 'video_formats':
                materialBlock.innerHTML = '<i class="bi bi-file-easel"></i>'
                materialBlock.style.color = "#0d6efd"
                materialBlock.style.fontSize = "40px"
                materialBlock.classList.add("d-flex", "align-items-center", "justify-content-center")
                materialBlock.style.width = "31%"
                materialBlock.style.height = `${document.body.clientWidth / 4}px`
                materialBlock.style.cursor = "pointer"
                materialBlock.addEventListener("click", function () {
                    materialPreviewModalSet(mat.type, mat.file)
                })
                break
            case 'animation_formats':
                materialBlock.style.backgroundImage = `url("${mat.file}")`
                materialBlock.style.backgroundSize = "cover"
                materialBlock.style.width = "31%"
                materialBlock.style.height = `${document.body.clientWidth / 4}px`
                materialBlock.style.cursor = "pointer"
                materialBlock.addEventListener("click", function () {
                    materialPreviewModalSet(mat.type, mat.file)
                })
                break
            case 'archive_formats':
                materialBlock.innerHTML = '<i class="bi bi-file-earmark-zip"></i>'
                materialBlock.style.color = "#0d6efd"
                materialBlock.style.fontSize = "40px"
                materialBlock.classList.add("d-flex", "align-items-center", "justify-content-center")
                materialBlock.style.width = "31%"
                materialBlock.style.height = `${document.body.clientWidth / 4}px`
                materialBlock.style.cursor = "pointer"
                materialBlock.addEventListener("click", function () {
                    materialPreviewModalSet(mat.type, mat.file)
                })
                break
            case 'pdf_formats':
                materialBlock.innerHTML = '<i class="bi bi-file-earmark-pdf"></i>'
                materialBlock.style.color = "#0d6efd"
                materialBlock.style.fontSize = "40px"
                materialBlock.classList.add("d-flex", "align-items-center", "justify-content-center")
                materialBlock.style.width = "31%"
                materialBlock.style.height = `${document.body.clientWidth / 4}px`
                materialBlock.style.cursor = "pointer"
                materialBlock.addEventListener("click", function () {
                    materialPreviewModalSet(mat.type, mat.file)
                })
                break
            case 'word_formats':
                materialBlock.innerHTML = '<i class="bi bi-file-earmark-word"></i>'
                materialBlock.style.color = "#0d6efd"
                materialBlock.style.fontSize = "40px"
                materialBlock.classList.add("d-flex", "align-items-center", "justify-content-center")
                materialBlock.style.width = "31%"
                materialBlock.style.height = `${document.body.clientWidth / 4}px`
                materialBlock.style.cursor = "pointer"
                materialBlock.addEventListener("click", function () {
                    materialPreviewModalSet(mat.type, mat.file)
                })
                break
            case 'voice_formats':
                const voice = document.createElement("audio")
                voice.controls = true
                voice.src = mat.file
                materialBlock.insertAdjacentElement("beforeend", voice)
                materialBlock.style.width = "100%"
                break
            case 'audio_formats':
                const audio = document.createElement("audio")
                audio.controls = true
                audio.src = mat.file
                materialBlock.insertAdjacentElement("beforeend", audio)
                materialBlock.style.width = "100%"
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
                break
            case 'presentation_formats':
                materialBlock.innerHTML = '<i class="bi bi-file-earmark-ppt"></i>'
                materialBlock.style.color = "#0d6efd"
                materialBlock.style.fontSize = "40px"
                materialBlock.classList.add("d-flex", "align-items-center", "justify-content-center")
                materialBlock.style.width = "31%"
                materialBlock.style.height = `${document.body.clientWidth / 4}px`
                materialBlock.style.cursor = "pointer"
                materialBlock.addEventListener("click", function () {
                    materialPreviewModalSet(mat.type, mat.file)
                })
                break
        }

        mainDiv.insertAdjacentElement("beforeend", materialBlock)
    })
    return mainDiv
}