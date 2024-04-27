async function homeworkItemMain(){
    const request = await homeworkAPIGetLogs(hwID)
    if (request.status === 200){
        homeworkItemLogSet = request.response
        homeworkItemShowLogs(homeworkItemLogSet)
    }
    if (HWItemSendButton !== null){
        HWItemSendButton.addEventListener("click", function () {
            HWItemSendModalForm.reset()
        })
        HWItemSendModalSendButton.addEventListener("click", async function () {
            if (homeworkItemSendClientValidation("send")){
                await homeworkAPISend(hwID, new FormData(HWItemSendModalForm), 3)
                    .then(async request => {
                        if (request.status === 500){
                            bsHWItemSendModal.hide()
                            showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
                        } else if (request.status === 201){
                            bsHWItemSendModal.hide()
                            showToast("Успешно", "Решение отправлено")
                            await homeworkAPIGetLogs(hwID)
                            homeworkItemShowLogs(homeworkItemLogSet)
                            HWItemSendButton.remove()
                        } else {
                            bsHWItemSendModal.hide()
                            showToast("Ошибка", request.response)
                        }
                    })
            }
        })
    }
    if (HWItemCheckButton !== null){
        HWItemCheckButton.addEventListener("click", function () {
            HWItemCheckModalForm.reset()
        })
        HWItemCheckModalAcceptButton.addEventListener("click", async function () {
            if(homeworkItemSendClientValidation("check")){
                await homeworkAPISend(hwID, new FormData(HWItemCheckModalForm), 4)
                    .then(async request => {
                        if (request.status === 500){
                            bsHWItemCheckModal.hide()
                            showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
                        } else if (request.status === 201){
                            bsHWItemCheckModal.hide()
                            showToast("Успешно", "ДЗ принято")
                            await homeworkAPIGetLogs(hwID)
                            homeworkItemShowLogs(homeworkItemLogSet)
                            HWItemCheckButton.remove()
                        } else {
                            bsHWItemCheckModal.hide()
                            showToast("Ошибка", request.response)
                        }
                    })
            }
        })
        HWItemCheckModalDeclineButton.addEventListener("click", async function () {
            if(homeworkItemSendClientValidation("check")){
                await homeworkAPISend(hwID, new FormData(HWItemCheckModalForm), 5)
                    .then(async request => {
                        if (request.status === 500){
                            bsHWItemCheckModal.hide()
                            showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
                        } else if (request.status === 201){
                            bsHWItemCheckModal.hide()
                            showToast("Успешно", "ДЗ отправлено на доработку")
                            await homeworkAPIGetLogs(hwID)
                            homeworkItemShowLogs(homeworkItemLogSet)
                            HWItemCheckButton.remove()
                        } else {
                            bsHWItemCheckModal.hide()
                            showToast("Ошибка", request.response)
                        }
                    })
            }
        })

    }
}

function homeworkItemShowLogs(list = homeworkItemLogSet){
    homeworkItemLogList.innerHTML = ''
    list.forEach(log => {
        let status = ""
        switch (log.status){
            case 1:
                status = "Создано"
                break
            case 2:
                status = "Открыто"
                break
            case 3:
                status = "На проверке"
                break
            case 4:
                status = "Принято"
                break
            case 5:
                status = "На доработке"
                break
            case 6:
                status = "Отменено"
                break
        }
        const datetime = new Date(log.dt).toLocaleString()
        homeworkItemLogList.insertAdjacentHTML("beforeend", `
        <a href="#" class="list-group-item list-group-item-action" data-log-id="${log.id}">
            <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1">${status}</h5>
                <small class="text-muted">${datetime}</small>
            </div>
                <p class="mb-1">${log.comment}</p>
                <small class="text-muted">${log.user.first_name} ${log.user.last_name}</small>
        </a>
        `)
    })
    homeworkItemLogList.querySelectorAll(".list-group-item").forEach(log => {
        log.addEventListener("click", function () {
            homeworkItemLogShowModal(log.attributes.getNamedItem("data-log-id").value)
        })
    })
}

function homeworkItemLogShowModal(logID) {
    const log = homeworkItemLogSet.find(log => log.id === Number(logID))
    HWItemLogModalTitle.innerHTML = `${log.user.first_name} ${log.user.last_name}`
    if (log.comment !== null){
        HWItemLogModalComment.innerHTML = log.comment
    }
    HWItemLogModalFilesImages.innerHTML = ""
    HWItemLogModalFilesAudio.innerHTML = ""
    log.files.map(file => {
        if (file.type === "image_formats"){
            HWItemLogModalFilesImages.insertAdjacentHTML("beforeend", `
                <a href="${file.path}" target="_blank">
                <img alt="file" src="${file.path}" class="col-6 mb-3" style="object-fit: contain;"></a>
            `)
        } else if (file.type === "voice_formats"){
            HWItemLogModalFilesAudio.insertAdjacentHTML("beforeend", `
                <figure>
                    <figcaption>Голосовое сообщение:</figcaption>
                    <audio controls src="${file.path}"></audio>
                </figure>
            `)
        } else if (file.type === "audio_formats"){
            HWItemLogModalFilesAudio.insertAdjacentHTML("beforeend", `
                <figure>
                    <figcaption>Аудио:</figcaption>
                    <audio controls src="${file.path}"></audio>
                </figure>
            `)
        }  else if (file.type === "video_formats"){
            console.log(file)
            HWItemLogModalFilesAudio.insertAdjacentHTML("beforeend", `
                <video controls src="${file.path}"></video>
            `)
        }

    })
    bsHWItemLogModal.show()
}

function homeworkItemSendClientValidation(form){
    // console.log(HWItemSendModalFormFileField.value === "")
    return true
}



const homeworkItemLogList = document.querySelector("#HomeworkItemLogList")

//Sets
let homeworkItemLogSet = []

//Buttons
const HWItemSendButton = document.querySelector("#HWItemSendButton")
const HWItemCheckButton = document.querySelector("#HWItemCheckButton")

//Bootstrap Elements
const HWItemSendModal = document.querySelector("#HWItemSendModal")
let bsHWItemSendModal
let HWItemSendModalForm
let HWItemSendModalFormCommentField
let HWItemSendModalFormFileField
let HWItemSendModalSendButton
if (HWItemSendModal !== null){
    bsHWItemSendModal = new bootstrap.Modal(HWItemSendModal)
    HWItemSendModalForm = HWItemSendModal.querySelector("#HWItemSendModalForm")
    HWItemSendModalFormCommentField = HWItemSendModalForm.querySelector("#HWItemSendModalFormCommentField")
    HWItemSendModalFormFileField = HWItemSendModalForm.querySelector("#HWItemSendModalFormFileField")
    HWItemSendModalSendButton = HWItemSendModal.querySelector("#HWItemSendModalSendButton")
}

const HWItemCheckModal = document.querySelector("#HWItemCheckModal")
let bsHWItemCheckModal
let HWItemCheckModalForm
let HWItemCheckModalFormCommentField
let HWItemCheckModalFormFileField
let HWItemCheckModalAcceptButton
let HWItemCheckModalDeclineButton
if (HWItemCheckModal !== null){
    bsHWItemCheckModal = new bootstrap.Modal(HWItemCheckModal)
    HWItemCheckModalForm = document.querySelector("#HWItemCheckModalForm")
    HWItemCheckModalFormCommentField = document.querySelector("#HWItemCheckModalFormCommentField")
    HWItemCheckModalFormFileField = document.querySelector("#HWItemCheckModalFormFileField")
    HWItemCheckModalAcceptButton = document.querySelector("#HWItemCheckModalAcceptButton")
    HWItemCheckModalDeclineButton = document.querySelector("#HWItemCheckModalDeclineButton")
}

const HWItemLogModal = document.querySelector("#HWItemLogModal")
const bsHWItemLogModal = new bootstrap.Modal(HWItemLogModal)
const HWItemLogModalTitle = HWItemLogModal.querySelector("#HWItemLogModalTitle")
const HWItemLogModalComment = HWItemLogModal.querySelector("#HWItemLogModalComment")

const HWItemLogModalFilesImages = HWItemLogModal.querySelector("#HWItemLogModalFilesImages")
const HWItemLogModalFilesAudio = HWItemLogModal.querySelector("#HWItemLogModalFilesAudio")

homeworkItemMain()