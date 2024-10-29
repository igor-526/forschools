function homeworkItemLogMain(){
    hwItemLogModalDeleteButton.addEventListener("click", function () {
        bsHwItemLogDeleteConfirmModal.show()
    })
    hwItemLogDeleteConfirmModalDeleteButton.addEventListener("click", homeworkItemLogDelete)
}

function homeworkItemLogGetBody(log){
    const body = document.createElement("div")
    if (log.comment){
        const logHTMLComment = document.createElement("p")
        logHTMLComment.innerHTML = log.comment
        body.insertAdjacentElement("beforeend", logHTMLComment)
    }
    const logHTMLImageVideo = []
    const logHTMLAudioVoice = []
    log.files.forEach(file => {
        switch (file.type){
            case "image_formats":
                const imageElementA = document.createElement("a")
                const imageElementIMG = document.createElement("img")
                imageElementA.href = file.path
                imageElementA.target = "_blank"
                imageElementIMG.alt = "Изображение к ДЗ"
                imageElementIMG.src = file.path
                imageElementIMG.classList.add("col-5", "mb-3")
                imageElementIMG.style = "object-fit: contain;"
                imageElementA.insertAdjacentElement("beforeend", imageElementIMG)
                logHTMLImageVideo.push(imageElementA)
                break
            case "voice_formats":
                const voiceElementFigure = document.createElement("figure")
                const voiceElementFigcaption = document.createElement("figcaption")
                const voiceElementAudio = document.createElement("audio")
                voiceElementFigcaption.innerHTML = "Голосовое сообщение"
                voiceElementAudio.controls = true
                voiceElementAudio.src = file.path
                voiceElementFigure.insertAdjacentElement("beforeend", voiceElementFigcaption)
                voiceElementFigure.insertAdjacentElement("beforeend", voiceElementAudio)
                logHTMLAudioVoice.push(voiceElementFigure)
                break
            case "audio_formats":
                const audioElementFigure = document.createElement("figure")
                const audioElementFigcaption = document.createElement("figcaption")
                const audioElementAudio = document.createElement("audio")
                audioElementFigcaption.innerHTML = "Голосовое сообщение"
                audioElementAudio.controls = true
                audioElementAudio.src = file.path
                audioElementFigure.insertAdjacentElement("beforeend", audioElementFigcaption)
                audioElementFigure.insertAdjacentElement("beforeend", audioElementAudio)
                logHTMLAudioVoice.push(audioElementFigure)
                break
            case "video_formats":
                const videoElement = document.createElement("video")
                videoElement.controls = true
                videoElement.src = file.path
                videoElement.classList.add("col-5", "mb-3")
                break
            default:
                break
        }
    })
    if (logHTMLImageVideo.length > 0){
        const logHTMLImageVideo = document.createElement("p")
        logHTMLImageVideo.forEach(elem => {
            logHTMLImageVideo.insertAdjacentElement("beforeend", elem)
        })
        body.insertAdjacentElement("beforeend", logHTMLImageVideo)
    }
    if (logHTMLAudioVoice.length > 0){
        const logHTMLAudioVoice = document.createElement("p")
        logHTMLAudioVoice.forEach(elem => {
            logHTMLAudioVoice.insertAdjacentElement("beforeend", elem)
        })
        body.insertAdjacentElement("beforeend", logHTMLAudioVoice)
    }
    return body
}

function homeworkItemLogShowModal(logID) {
    hwItemLogModalTitle.innerHTML = ""
    hwItemLogModalBody.innerHTML = ""
    homeworkAPIGetLog(logID).then(request => {
        switch (request.status){
            case 200:
                selectedHW = logID
                hwItemLogModalTitle.innerHTML = `${request.response.user.first_name} ${request.response.user.last_name}`
                hwItemLogModalBody.insertAdjacentElement("beforeend", homeworkItemLogGetBody(request.response))
                request.response.deletable ? hwItemLogModalDeleteButton.classList.remove("d-none") :
                    hwItemLogModalDeleteButton.classList.add("d-none")
                bsHwItemLogModal.show()
                break
            default:
                showErrorToast()
        }
    })
}

function homeworkItemLogDelete(){
    homeworkAPIDeleteLog(selectedHW).then(request => {
        bsHwItemLogModal.hide()
        bsHwItemLogDeleteConfirmModal.hide()
        switch (request.status) {
            case 204:
                showSuccessToast("Запись успешно удалена")
                break
            case 403:
                showErrorToast("У Вас нет прав на удаление этой записи")
                break
            default:
                showErrorToast()
                break
        }
        setTimeout(function () {
            location.reload()
        }, 1500)
    })
}

let selectedHW

//Log Modal
const hwItemLogModal = document.querySelector("#hwItemLogModal")
const bsHwItemLogModal = new bootstrap.Modal(hwItemLogModal)
const hwItemLogModalTitle = hwItemLogModal.querySelector("#hwItemLogModalTitle")
const hwItemLogModalBody = hwItemLogModal.querySelector("#hwItemLogModalBody")
const hwItemLogModalDeleteButton = hwItemLogModal.querySelector("#hwItemLogModalDeleteButton")

//Delete Confirm Modal
const hwItemLogDeleteConfirmModal = document.querySelector("#hwItemLogDeleteConfirmModal")
const bsHwItemLogDeleteConfirmModal = new bootstrap.Modal(hwItemLogDeleteConfirmModal)
const hwItemLogDeleteConfirmModalDeleteButton = hwItemLogDeleteConfirmModal.querySelector("#hwItemLogDeleteConfirmModalDeleteButton")

homeworkItemLogMain()