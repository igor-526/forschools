function usersAdminTelegramShow(telegramNotes = [], userID, code=null, tableBody, tgModal){
    function getRoleString(role){
        switch (role){
            case 'main':
                return 'Основной'
            case 'parent':
                return 'Родитель'
            default:
                return "Не определено"
        }
    }

    function getNickname(nickname){
        switch (nickname){
            case null:
                return 'Никнейм отсутствует'
            default:
                return `<a href="https://t.me/${nickname}" target="_blank">@${nickname}</a>`
        }
    }

    function GetElement(telegram){
        const tr = document.createElement("tr")
        const tdRole = document.createElement("td")
        tdRole.innerHTML = getRoleString(telegram.usertype)
        tr.insertAdjacentElement("beforeend", tdRole)
        const tdID = document.createElement("td")
        tdID.innerHTML = telegram.tg_id
        tr.insertAdjacentElement("beforeend", tdID)
        const tdNickname = document.createElement("td")
        tdNickname.innerHTML = getNickname(telegram.nickname)
        tr.insertAdjacentElement("beforeend", tdNickname)
        const tdName = document.createElement("td")
        tdName.innerHTML = `${telegram.last_name?telegram.last_name:""} ${telegram.first_name?telegram.first_name:""}`
        tr.insertAdjacentElement("beforeend", tdName)
        const tdJoinDT = document.createElement("td")
        tdJoinDT.innerHTML = timeUtilsDateTimeToStr(telegram.join_dt)
        tr.insertAdjacentElement("beforeend", tdJoinDT)
        const tdActions = document.createElement("td")
        if (telegram.usertype !== "main"){
            const tdActionsSetMainButton = document.createElement("button")
            tdActionsSetMainButton.classList.add("btn", "btn-warning", "mx-1")
            tdActionsSetMainButton.type = "button"
            tdActionsSetMainButton.innerHTML = '<i class="bi bi-arrow-90deg-up"></i>'
            tdActionsSetMainButton.setAttribute("data-bs-toggle", "tooltip")
            tdActionsSetMainButton.setAttribute("data-bs-placement", "bottom")
            tdActionsSetMainButton.setAttribute("title", "Сделать основным")
            new bootstrap.Tooltip(tdActionsSetMainButton)
            tdActionsSetMainButton.addEventListener("click", function () {
                usersAdminTelegramSetMainModalSet(userID, telegram.id, tgModal)
            })
            tdActions.insertAdjacentElement("beforeend", tdActionsSetMainButton)
        }
        const tdActionsDisconnectButton = document.createElement("button")
        tdActionsDisconnectButton.classList.add("btn", "btn-danger", "mx-1")
        tdActionsDisconnectButton.type = "button"
        tdActionsDisconnectButton.innerHTML = '<i class="bi bi-x-lg"></i>'
        tdActionsDisconnectButton.setAttribute("data-bs-toggle", "tooltip")
        tdActionsDisconnectButton.setAttribute("data-bs-placement", "bottom")
        tdActionsDisconnectButton.setAttribute("title", "Удалить привязку")
        new bootstrap.Tooltip(tdActionsDisconnectButton)
        tdActionsDisconnectButton.addEventListener("click", function () {
            usersAdminTelegramDisconnectModalSet(
                userID, telegram.id, tgModal, telegram.usertype === "main"
            )
        })
        tdActions.insertAdjacentElement("beforeend", tdActionsDisconnectButton)
        tr.insertAdjacentElement("beforeend", tdActions)
        return tr
    }

    function GetConnectingElement(main=true){
        function getText(){
            if (!code){
                return "Привязка Telegram невозможна"
            }
            let text
            if (main){
                text = ""
            } else {
                text = "Возможно привязать дополнительные аккаунты Telegram. С дополнительных аккаунтов можно будет наблюдать за пользователем и писать сообщения<br><br>"
            }
            text += `
                Для автоматической привязки необходимо с устройства, на котором установлен Telegram перейти по ссылке:<br>
                <a href="https://t.me/kitai_school_study_bot?start=${code}" target="_blank">https://t.me/kitai_school_study_bot?start=${code}</a><br><br><b>ИЛИ</b><br><br>
                Для ручной привязки необходимо найти в Telegram бота @kitai_school_study_bot, после чего написать команду "/start ${code}" (без кавычек)<br><br>
                `
            return text
        }

        function getCopyText(){
            return `Для автоматической привязки необходимо с устройства, на котором установлен Telegram перейти по 
следующей ссылке: https://t.me/kitai_school_study_bot?start=${code}\nИЛИ\nДля ручной привязки необходимо 
найти в Telegram бота @kitai_school_study_bot, после чего написать команду "/start ${code}" (без кавычек)`
        }

        const tr = document.createElement("tr")
        tr.classList.add("table-warning")
        const td = document.createElement("td")
        td.colSpan = 6
        td.innerHTML = getText()
        const copyHrefButton = document.createElement("button")
        copyHrefButton.type = "button"
        copyHrefButton.innerHTML = '<i class="bi bi-copy"></i> ссылка'
        copyHrefButton.classList.add("btn", "btn-sm", "btn-primary", "mx-1")
        copyHrefButton.addEventListener("click", function () {
            navigator.clipboard.writeText(`https://t.me/kitai_school_study_bot?start=${code}`)
            copyHrefButton.classList.remove("btn-primary")
            copyHrefButton.classList.add("btn-success")
            setTimeout(function (){
                copyHrefButton.classList.add("btn-primary")
                copyHrefButton.classList.remove("btn-success")
            }, 500)
        })
        const copyCommandButton = document.createElement("button")
        copyCommandButton.type = "button"
        copyCommandButton.innerHTML = '<i class="bi bi-copy"></i> команда'
        copyCommandButton.classList.add("btn", "btn-sm", "btn-primary", "mx-1")
        copyCommandButton.addEventListener("click", function () {
            navigator.clipboard.writeText(`/start ${code}`)
            copyCommandButton.classList.remove("btn-primary")
            copyCommandButton.classList.add("btn-success")
            setTimeout(function (){
                copyCommandButton.classList.add("btn-primary")
                copyCommandButton.classList.remove("btn-success")
            }, 500)
        })
        const copyAllButton = document.createElement("button")
        copyAllButton.type = "button"
        copyAllButton.innerHTML = '<i class="bi bi-copy"></i> инструкция'
        copyAllButton.classList.add("btn", "btn-sm", "btn-primary", "mx-1")
        copyAllButton.addEventListener("click", function () {
            navigator.clipboard.writeText(getCopyText())
            copyAllButton.classList.remove("btn-primary")
            copyAllButton.classList.add("btn-success")
            setTimeout(function (){
                copyAllButton.classList.add("btn-primary")
                copyAllButton.classList.remove("btn-success")
            }, 500)
        })
        td.insertAdjacentElement("beforeend", copyHrefButton)
        td.insertAdjacentElement("beforeend", copyCommandButton)
        td.insertAdjacentElement("beforeend", copyAllButton)
        tr.insertAdjacentElement("beforeend", td)
        return tr
    }

    telegramNotes.forEach(telegramNote => {
        tableBody.insertAdjacentElement("beforeend", GetElement(telegramNote))
    })
    tableBody.insertAdjacentElement("beforeend", GetConnectingElement(
        telegramNotes.length === 0
    ))

}


function usersAdminTelegramSet(userID) {
    function getModalBody(){
        const table = document.createElement("table")
        table.classList.add("table", "table-hover")
        const tableHead = document.createElement("thead")
        const tableBody = document.createElement("tbody")
        table.insertAdjacentElement("beforeend", tableHead)
        table.insertAdjacentElement("beforeend", tableBody)
        const tr = document.createElement("tr")
        tableHead.insertAdjacentElement("beforeend", tr)
        const tableHeadNames = ["Роль", "TG ID", "Никнейм", "ФИ", "Время привязки", "Действие"]
        tableHeadNames.forEach(name => {
            const th = document.createElement("th")
            th.scope = "col"
            th.innerHTML = name
            tr.insertAdjacentElement("beforeend", th)
        })
        return {
            table: table,
            tableBody: tableBody
        }
    }

    telegramAPIGetTelegramNotes(userID).then(request => {
        switch (request.status){
            case 200:
                const table = getModalBody()
                const telegramModal = new modalEngine()
                telegramModal.setClasses(["modal-xl"])
                telegramModal.title = "Менеджер Telegram"
                telegramModal.addContent(table.table)
                telegramModal.show()
                usersAdminTelegramShow(request.response.telegrams, userID,
                    request.response.code, table.tableBody, telegramModal)
                break
            default:
                showErrorToast()
                break
        }
    })
}


function usersAdminTelegramDisconnectModalSet(userID, noteID, telegramModal, main=false) {
    function disconnect(userID, NoteID, disconnectModal, telegramModal){
        telegramAPIDisconnect(NoteID, userID).then(request => {
            disconnectModal.close()
            switch (request.status){
                case 204:
                    telegramModal.close()
                    usersAdminTelegramSet(userID)
                    break
                default:
                    showErrorToast()
                    break
            }
        })
    }

    const content = []
    const infoMain = document.createElement("p")
    infoMain.innerHTML = "Действие необратимо. Telegram можно будет привязать заново"
    content.push(infoMain)
    if (main){
        const infoMore = document.createElement("p")
        infoMore.innerHTML = "<b>ВНИМАНИЕ! ПРИ ОТВЯЗКЕ ОСНОВНОГО TELEGRAM " +
            "ВСЕ ДОПОЛНИТЕЛЬНЫЕ ОТВЯЖУТСЯ АВТОМАТИЧЕСКИ!</b>"
        content.push(infoMore)
    }
    const disconnectButton = document.createElement("button")
    disconnectButton.innerHTML = '<i class="bi bi-x-lg me-2"></i>Отвязать'
    disconnectButton.type = "button"
    disconnectButton.classList.add("btn", "btn-danger")
    const disconnectModal = new modalEngine()
    disconnectModal.title = "Отвязка Telegram"
    disconnectModal.addContent(content)
    disconnectModal.addButtons(disconnectButton)
    disconnectModal.show()
    disconnectButton.addEventListener("click", function () {
        disconnect(userID, noteID, disconnectModal, telegramModal)
    })
}

function usersAdminTelegramSetMainModalSet(userID, noteID, telegramModal) {
    function setMain(userID, NoteID, disconnectModal, telegramModal){
        telegramAPISetMain(NoteID, userID).then(request => {
            disconnectModal.close()
            switch (request.status){
                case 200:
                    telegramModal.close()
                    usersAdminTelegramSet(userID)
                    break
                default:
                    showErrorToast()
                    break
            }
        })
    }

    const infoMain = document.createElement("p")
    infoMain.innerHTML = "Действие обратимо"
    const setMainButton = document.createElement("button")
    setMainButton.innerHTML = '<i class="bi bi-arrow-90deg-up me-2"></i>Сделать основным'
    setMainButton.type = "button"
    setMainButton.classList.add("btn", "btn-warning")
    const setMainModal = new modalEngine()
    setMainModal.title = "Сделать Telegram основным"
    setMainModal.addContent(infoMain)
    setMainModal.addButtons(setMainButton)
    setMainModal.show()
    setMainButton.addEventListener("click", function () {
        setMain(userID, noteID, setMainModal, telegramModal)
    })
}
