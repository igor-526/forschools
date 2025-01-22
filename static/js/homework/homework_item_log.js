function homeworkItemLogMain(){
    hwItemLogModalDeleteButton.addEventListener("click", function () {
        bsHwItemLogDeleteConfirmModal.show()
    })
    hwItemLogModalLogAnswerAcceptButton.addEventListener("click", function () {
        homeworkItemLogAnswer("accept")
    })
    hwItemLogModalLogAnswerDeclineButton.addEventListener("click", function () {
        homeworkItemLogAnswer("decline")
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
        const logHTMLImageVideoP = document.createElement("p")
        logHTMLImageVideo.forEach(elem => {
            logHTMLImageVideoP.insertAdjacentElement("beforeend", elem)
        })
        body.insertAdjacentElement("beforeend", logHTMLImageVideoP)
    }
    if (logHTMLAudioVoice.length > 0){
        const logHTMLAudioVoiceP = document.createElement("p")
        logHTMLAudioVoice.forEach(elem => {
            logHTMLAudioVoiceP.insertAdjacentElement("beforeend", elem)
        })
        body.insertAdjacentElement("beforeend", logHTMLAudioVoiceP)
    }
    return body
}

function homeworkItemLogShowModal(logID) {
    function reset(){
        hwItemLogModalTitle.innerHTML = ""
        hwItemLogModalBody.innerHTML = ""
        hwItemLogModalLogAnswerBodyMessageField.value = ""
        hwItemLogModalLogAnswerBodyMessageFieldError.innerHTML = ""
        hwItemLogModalLogAnswerBodyMessageField.classList.remove("is-invalid")
        hwItemLogModalLogAnswerBody.classList.add("d-none")
        hwItemLogModalLogAnswerAcceptButton.classList.add("d-none")
        hwItemLogModalLogAnswerDeclineButton.classList.add("d-none")
    }

    reset()
    homeworkAPIGetLog(logID).then(request => {
        switch (request.status){
            case 200:
                selectedHWLog = logID
                hwItemLogModalTitle.innerHTML = `${request.response.user.first_name} ${request.response.user.last_name}`
                hwItemLogModalBody.insertAdjacentElement("beforeend", homeworkItemLogGetBody(request.response))
                request.response.deletable ? hwItemLogModalDeleteButton.classList.remove("d-none") :
                    hwItemLogModalDeleteButton.classList.add("d-none")
                if (request.response.agreement.hasOwnProperty("accepted") && hwCanAcceptLogs){
                    if (!request.response.agreement.accepted){
                        hwItemLogModalLogAnswerBody.classList.remove("d-none")
                        hwItemLogModalLogAnswerAcceptButton.classList.remove("d-none")
                        hwItemLogModalLogAnswerDeclineButton.classList.remove("d-none")
                    }
                }
                bsHwItemLogModal.show()
                break
            default:
                showErrorToast()
        }
    })
}

function homeworkItemLogDelete(){
    homeworkAPIDeleteLog(selectedHWLog).then(request => {
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

function homeworkItemLogAnswer(action){
    function validate(){
        let validationStatus = true
        hwItemLogModalLogAnswerBodyMessageField.classList.remove("is-invalid")
        hwItemLogModalLogAnswerBodyMessageFieldError.innerHTML = ""
        if (action === "decline"){
            if (hwItemLogModalLogAnswerBodyMessageField.value.trim() === ""){
                hwItemLogModalLogAnswerBodyMessageField.classList.add("is-invalid")
                hwItemLogModalLogAnswerBodyMessageFieldError.innerHTML = "Напишите сообщение преподавателю"
                validationStatus = false
            }
        }
        if (hwItemLogModalLogAnswerBodyMessageField.value.trim().length > 2000){
            hwItemLogModalLogAnswerBodyMessageField.classList.add("is-invalid")
            hwItemLogModalLogAnswerBodyMessageFieldError.innerHTML = "Длина сообщения не может превышать 2000 символов"
            validationStatus = false
        }
        return validationStatus
    }

    function getFD(){
        const fd = new FormData()
        if (hwItemLogModalLogAnswerBodyMessageField.value.trim().length > 0){
            fd.set("message", hwItemLogModalLogAnswerBodyMessageField.value.trim())
        }
        fd.set("action", action)
        return fd
    }

    if (validate()){
        homeworkAPIAnswerLog(selectedHWLog, getFD()).then(request => {
            bsHwItemLogModal.hide()
            switch (request.status){
                case 200:
                    showSuccessToast("Ответ успешно отправлен")
                    setTimeout(function () {
                        location.reload()
                    }, 1000)
                    break
                default:
                    showErrorToast()
                    break
            }
        })
    }
}

let selectedHWLog

//Log Modal
const hwItemLogModal = document.querySelector("#hwItemLogModal")
const bsHwItemLogModal = new bootstrap.Modal(hwItemLogModal)
const hwItemLogModalTitle = hwItemLogModal.querySelector("#hwItemLogModalTitle")
const hwItemLogModalBody = hwItemLogModal.querySelector("#hwItemLogModalBody")
const hwItemLogModalDeleteButton = hwItemLogModal.querySelector("#hwItemLogModalDeleteButton")

//Log Modal Metodist
const hwItemLogModalLogAnswerBody = hwItemLogModal.querySelector("#hwItemLogModalLogAnswerBody")
const hwItemLogModalLogAnswerBodyMessageField = hwItemLogModalLogAnswerBody.querySelector("#hwItemLogModalLogAnswerBodyMessageField")
const hwItemLogModalLogAnswerBodyMessageFieldError = hwItemLogModalLogAnswerBody.querySelector("#hwItemLogModalLogAnswerBodyMessageFieldError")
const hwItemLogModalLogAnswerAcceptButton = hwItemLogModal.querySelector("#hwItemLogModalLogAnswerAcceptButton")
const hwItemLogModalLogAnswerDeclineButton = hwItemLogModal.querySelector("#hwItemLogModalLogAnswerDeclineButton")

//Delete Confirm Modal
const hwItemLogDeleteConfirmModal = document.querySelector("#hwItemLogDeleteConfirmModal")
const bsHwItemLogDeleteConfirmModal = new bootstrap.Modal(hwItemLogDeleteConfirmModal)
const hwItemLogDeleteConfirmModalDeleteButton = hwItemLogDeleteConfirmModal.querySelector("#hwItemLogDeleteConfirmModalDeleteButton")

homeworkItemLogMain()