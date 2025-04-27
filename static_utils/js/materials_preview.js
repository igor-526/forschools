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
    baseMaterialPreviewModalTitle.innerHTML = prevBody.title
    baseMaterialPreviewModalBody.innerHTML = ""
    baseMaterialPreviewModalBody.insertAdjacentElement("beforeend", prevBody.elem)
    baseMaterialPreviewModalSaveButton.href = href
    bsBaseMaterialPreviewModal.show()
}

const baseMaterialPreviewModal = document.querySelector("#baseMaterialPreviewModal")
const bsBaseMaterialPreviewModal = baseMaterialPreviewModal ? new bootstrap.Modal(baseMaterialPreviewModal) : null
const baseMaterialPreviewModalTitle = baseMaterialPreviewModal ? baseMaterialPreviewModal.querySelector("#baseMaterialPreviewModalTitle") : null
const baseMaterialPreviewModalBody = baseMaterialPreviewModal ? baseMaterialPreviewModal.querySelector("#baseMaterialPreviewModalBody") : null
const baseMaterialPreviewModalSaveButton = baseMaterialPreviewModal ? baseMaterialPreviewModal.querySelector("#baseMaterialPreviewModalSaveButton") : null