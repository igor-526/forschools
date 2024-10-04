function usersAdminTelegramMain(){
    usersShowTelegramButtonDisconnect.addEventListener('click', function (){
        bsTelegramDisconnectConfirmModal.show()
    })
    if (tgAction === "admin"){
        userShowTelegramDisconnectConfirmDeleteButton.addEventListener('click', usersAdminTelegramDisconnect)
    } else if (tgAction === "profile"){

    }
}


function usersAdminTelegramSet(userID) {
    usersAdminTelegramSelectedUser = userID
    telegramAPIGetUser(userID).then(request => {
        switch (request.status){
            case 200:
                switch (request.response.status){
                    case "disconnected":
                        usersShowTelegramConnectedWindows.classList.add("d-none")
                        usersShowTelegramNotConnectedWindows.classList.remove("d-none")
                        userShowTelegramURL.innerHTML = `https://t.me/kitai_school_study_bot?start=${request.response.code}`
                        userShowTelegramCode.innerHTML = `${request.response.code}`
                        userShowTelegramURL.href = `https://t.me/kitai_school_study_bot?start=${request.response.code}`
                        usersShowTelegramButtonDisconnect.classList.add("d-none")
                        break
                    case "connected":
                        usersShowTelegramConnectedWindows.classList.remove("d-none")
                        usersShowTelegramNotConnectedWindows.classList.add("d-none")
                        usersShowTelegramButtonDisconnect.classList.remove("d-none")
                        break
                }
                bsTelegramModal.show()
                break
            default:
                showErrorToast()
                break
        }


        if (response.status === 200){
            if (response.response.status === "disconnected"){

            } else if (response.response.status === "connected"){

            }
        }
    })
}

function usersAdminTelegramDisconnect(){
    telegramAPIDisconnect(usersAdminTelegramSelectedUser).then(request => {
        bsTelegramDisconnectConfirmModal.hide()
        bsTelegramModal.hide()
        switch (request.status){
            case 204:
                showSuccessToast( "Telegram успешно отвязан")
                usersAdminGetAll()
                break
            default:
                bsOffcanvasUser.hide()
                showErrorToast("Произошла ошибка. Telegram не отвязан")
                break
        }
    })
}


let usersAdminTelegramSelectedUser = null
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