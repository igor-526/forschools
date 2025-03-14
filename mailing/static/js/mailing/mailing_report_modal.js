function mailingReportModalMain(){
    mailingReportModalReMailButton.addEventListener("click", function () {
        location.assign(`/mailing/new/#mailing_id=${mailingReportModalSelectedID}`)
    })
}

function mailingReportModalReset(){
    mailingReportModalInfoList.innerHTML = ""
    mailingReportModalInfoMessages.innerHTML = ""
    mailingReportModalTableBody.innerHTML = ""
}

function mailingReportModalSet(mailingID){
    mailingReportModalSelectedID = mailingID
    mailingReportModalReset()
    mailingAPIGetItem(mailingID).then(request => {
        switch (request.status){
            case 200:
                mailingReportModalSetInfo(request.response)
                bsMailingReportModal.show()
                break
            default:
                showErrorToast()
                break
        }
    })
}

function mailingReportModalSetInfo(mailing_info){
    function getMainInfoElement(name, value){
        const li = document.createElement("li")
        li.classList.add("list-group-item")
        li.innerHTML = `<b>${name}: </b>${value}`
        return li
    }

    function getMessageCard(message){
        const card = document.createElement("div")
        card.classList.add("card", "mb-3")
        const cardHeader = document.createElement("div")
        cardHeader.classList.add("card-header")
        cardHeader.innerHTML = "Сообщение"
        const cardList = document.createElement("li")
        cardList.classList.add("list-group", "list-group-flush")
        card.insertAdjacentElement("beforeend", cardHeader)
        card.insertAdjacentElement("beforeend", cardList)
        let messageTheme = "Без темы"
        if (message.theme && message.theme !== ""){
            messageTheme = message.theme
        }
        cardList.insertAdjacentElement("beforeend", getMainInfoElement(
            "Тема сообщения", messageTheme
        ))
        cardList.insertAdjacentElement("beforeend", getMainInfoElement(
            "Текст сообщения", message.text
        ))
        return card
    }

    function setMainInfo(){
        mailingReportModalInfoList.insertAdjacentElement("beforeend", getMainInfoElement(
            "Наименование", mailing_info.name
        ))
        mailingReportModalInfoList.insertAdjacentElement("beforeend", getMainInfoElement(
            "Дата и время", timeUtilsDateTimeToStr(mailing_info.dt)
        ))
        mailingReportModalInfoList.insertAdjacentElement("beforeend", getMainInfoElement(
            "Инициатор", getUsersString([mailing_info.initiator])
        ))
        if (mailing_info.result_info.info){
            mailingReportModalInfoList.insertAdjacentElement("beforeend", getMainInfoElement(
                "Количество контактов", mailing_info.result_info.info.errors + mailing_info.result_info.info.success
            ))
        }
        mailing_info.messages.forEach(message => {
            mailingReportModalInfoMessages.insertAdjacentElement("beforeend", getMessageCard(message))
        })

    }

    function getTableElements(user){
        const elements = []
        if (mailing_info.result_info[user].email){
            const trEmail = document.createElement("tr")
            const tdContact = document.createElement("td")
            tdContact.innerHTML = "Email"
            const tdStatus = document.createElement("td")
            if (mailing_info.result_info[user].email.status === "success"){
                tdStatus.innerHTML = "Успешно"
            } else {
                tdStatus.innerHTML = "Ошибка"
                mailing_info.result_info[user].email.errors.forEach(err => {
                    tdStatus.innerHTML += `<br>${err}`
                })
            }
            trEmail.insertAdjacentElement("beforeend", tdContact)
            trEmail.insertAdjacentElement("beforeend", tdStatus)
            elements.push(trEmail)
        }
        Object.keys(mailing_info.result_info[user].tg).forEach(usertype => {
            const trTG = document.createElement("tr")
            const tdContact = document.createElement("td")
            tdContact.innerHTML = usertype === "main" ? "Telegram: Основной" : `Telegram: ${usertype}`
            const tdStatus = document.createElement("td")
            if (mailing_info.result_info[user].tg[usertype].status === "success"){
                tdStatus.innerHTML = "Успешно"
            } else {
                tdStatus.innerHTML = "Ошибка"
                mailing_info.result_info[user].tg[usertype].errors.forEach(err => {
                    tdStatus.innerHTML += `<br>${err}`
                })
            }
            trTG.insertAdjacentElement("beforeend", tdContact)
            trTG.insertAdjacentElement("beforeend", tdStatus)
            elements.push(trTG)
        })
        if (elements.length > 0){
            const tdName = document.createElement("td")
            tdName.innerHTML = user
            tdName.rowSpan = elements.length
            elements[0].insertAdjacentElement("afterbegin", tdName)
        }
        return elements
    }

    setMainInfo()
    Object.keys(mailing_info.result_info).forEach(user => {
        if (user !== "info"){
            getTableElements(user).forEach(element => {
              mailingReportModalTableBody.insertAdjacentElement("beforeend", element)
            })
        }
    })
}

let mailingReportModalSelectedID = null
const mailingReportModal = document.querySelector("#mailingReportModal")
const bsMailingReportModal = new bootstrap.Modal(mailingReportModal)
const mailingReportModalInfoList = mailingReportModal.querySelector("#mailingReportModalInfoList")
const mailingReportModalInfoMessages = mailingReportModal.querySelector("#mailingReportModalInfoMessages")
const mailingReportModalTableBody = mailingReportModal.querySelector("#mailingReportModalTableBody")
const mailingReportModalReMailButton = mailingReportModal.querySelector("#mailingReportModalReMailButton")

mailingReportModalMain()