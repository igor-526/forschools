function tgJournalStatusMain(){

}

function tgJournalStatusReset(){
    tgJournalStatusModalTextCard.classList.add("d-none")
    tgJournalStatusModalErrorsCard.classList.add("d-none")
    tgJournalStatusModalMsgInfoCard.classList.add("d-none")
    tgJournalStatusModalInfo.innerHTML = ""
    tgJournalStatusModalText.innerHTML = ""
    tgJournalStatusModalErrors.innerHTML = ""
    tgJournalStatusModalMsgInfo.innerHTML = ""
}

function tgJournalStatusSetModal(noteID){
    tgJournalStatusReset()
    tgJournalStatusModalCurrentNoteId = noteID
    telegramAPIGetJournalNote(noteID).then(request => {
        switch (request.status){
            case 200:
                console.log(request.response)
                tgJournalStatusModalInfo.innerHTML = `
                    <b>Тип события:</b> ${tgJournalGetEventStr(request.response.event)}<br>
                    <b>Дата и время:</b> ${timeUtilsDateTimeToStr(request.response.dt)}<br>
                    <b>Получатель:</b> <a href="/profile/${request.response.recipient.id}" target="_blank">
                    ${request.response.recipient.first_name} ${request.response.recipient.last_name}</a><br>
                `
                if (request.response.data.text){
                    tgJournalStatusModalTextCard.classList.remove("d-none")
                    tgJournalStatusModalText.innerHTML = request.response.data.text
                }
                if (request.response.data.errors.length !== 0){
                    tgJournalStatusModalErrorsCard.classList.remove("d-none")
                    tgJournalStatusModalErrors.innerHTML = request.response.data.errors.join("<br>")
                }
                if (request.response.data.status === "success"){
                    tgJournalStatusModalMsgInfoCard.classList.remove("d-none")
                    tgJournalStatusModalMsgInfo.innerHTML = "Сообщение не прочитано"
                }
                bsTgJournalStatusModal.show()
                break
            default:
                showErrorToast()
                break
        }
    })
}

const tgJournalStatusModal = document.querySelector("#tgJournalStatusModal")
const bsTgJournalStatusModal = new bootstrap.Modal(tgJournalStatusModal)
const tgJournalStatusModalTextCard = tgJournalStatusModal.querySelector("#tgJournalStatusModalTextCard")
const tgJournalStatusModalErrorsCard = tgJournalStatusModal.querySelector("#tgJournalStatusModalErrorsCard")
const tgJournalStatusModalMsgInfoCard = tgJournalStatusModal.querySelector("#tgJournalStatusModalMsgInfoCard")
const tgJournalStatusModalInfo = tgJournalStatusModal.querySelector("#tgJournalStatusModalInfo")
const tgJournalStatusModalText = tgJournalStatusModal.querySelector("#tgJournalStatusModalText")
const tgJournalStatusModalErrors = tgJournalStatusModal.querySelector("#tgJournalStatusModalErrors")
const tgJournalStatusModalMsgInfo = tgJournalStatusModal.querySelector("#tgJournalStatusModalMsgInfo")
let tgJournalStatusModalCurrentNoteId = 0
