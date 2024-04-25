async function usersAdminTelegramMain(){
    usersShowTelegramButtonDisconnect.addEventListener('click', function (){
        bsTelegramDisconnectConfirmModal.show()
    })
    if (tgAction === "admin"){
        formUserEditTelegramButton.addEventListener('click', async function(){
            const userID = formUserEditTelegramButton.attributes.getNamedItem("data-user-id").value
            await usersAdminTelegramOpen(userID)
        })
        userShowTelegramDisconnectConfirmDeleteButton.addEventListener('click', async function(){
            const userID = formUserEditTelegramButton.attributes.getNamedItem("data-user-id").value
            await disconnectTelegram(userID)
        })
    } else if (tgAction === "profile"){

    }
}


async function usersAdminTelegramOpen(userID) {
    await telegramAPIGetUser(userID).then(response => {
        if (response.status === 200){
            if (response.response.status === "disconnected"){
                usersShowTelegramConnectedWindows.classList.add("d-none")
                usersShowTelegramNotConnectedWindows.classList.remove("d-none")
                userShowTelegramURL.innerHTML = `https://t.me/kitai_school_study_bot?start=${response.response.code}`
                userShowTelegramCode.innerHTML = `${response.response.code}`
                userShowTelegramURL.href = `https://t.me/kitai_school_study_bot?start=${response.response.code}`
                usersShowTelegramButtonDisconnect.classList.add("d-none")
                bsTelegramModal.show()
            } else if (response.response.status === "connected"){
                usersShowTelegramConnectedWindows.classList.remove("d-none")
                usersShowTelegramNotConnectedWindows.classList.add("d-none")
                usersShowTelegramButtonDisconnect.classList.remove("d-none")
                userShowTelegramDisconnectConfirmDeleteButton.setAttribute("data-user-id", userID)
                bsTelegramModal.show()
            }
        }
    })
}

async function disconnectTelegram(userID){
    await telegramAPIDisconnect(userID).then(async request => {
        if (request.status === 204){
            bsTelegramDisconnectConfirmModal.hide()
            bsTelegramModal.hide()
            bsOffcanvasUser.hide()
            showToast("Отвязка Telegram", "Telegram успешно отвязан")
            await usersAdminGetAll()
            usersAdminShow()
        } else {
        bsTelegramDisconnectConfirmModal.hide()
        bsTelegramModal.hide()
        bsOffcanvasUser.hide()
        showToast("Отвязка Telegram", "Произошла ошибка. Telegram не отвязан")
    }
    })
}


//BootStrapElements
const telegramModal = document.querySelector("#UserShowTelegramModal")
const bsTelegramModal = new bootstrap.Modal(telegramModal)
const telegramDisconnectConfirmModal = document.querySelector("#UserShowTelegramModalDisconnectConfirm")
const bsTelegramDisconnectConfirmModal = new bootstrap.Modal(telegramDisconnectConfirmModal)

const usersShowTelegramConnectedWindows = telegramModal.querySelector("#UserShowTelegramModalConnected")
const usersShowTelegramNotConnectedWindows = telegramModal.querySelector("#UserShowTelegramModalNotConnected")
const usersShowTelegramButtonDisconnect = telegramModal.querySelector("#UserShowTelegramModalButtonDisconnect")
const userShowTelegramDisconnectConfirmDeleteButton  = telegramDisconnectConfirmModal
    .querySelector("#UserShowTelegramModalDisconnectConfirmDelete")

const userShowTelegramURL = usersShowTelegramNotConnectedWindows.querySelector("#UserShowTelegramModalURL")
const userShowTelegramCode = usersShowTelegramNotConnectedWindows.querySelector("#UserShowTelegramModalCode")

usersAdminTelegramMain()