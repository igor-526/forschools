async function openProfileTelegramModal() {
    const response = await fetch(`/api/v1/users/${userID}/disconnect_telegram/`, {
        method: 'get',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        }
    })
    if (response.status === 204){
        usersShowTelegramConnectedWindows.classList.remove("d-none")
        usersShowTelegramNotConnectedWindows.classList.add("d-none")
        usersShowTelegramButtonDisconnect.classList.remove("d-none")
        bsTelegramModal.show()
    } else if (response.status === 200){
        usersShowTelegramConnectedWindows.classList.add("d-none")
        usersShowTelegramNotConnectedWindows.classList.remove("d-none")
        await response.json().then(resp => {
            userShowTelegramURL.innerHTML = `https://t.me/kitai_school_study_bot?start=${resp.code}`
            userShowTelegramCode.innerHTML = `${resp.code}`
            userShowTelegramURL.href = `https://t.me/kitai_school_study_bot?start=${resp.code}`
            usersShowTelegramButtonDisconnect.classList.add("d-none")
        })
        bsTelegramModal.show()
    } else {
        showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обнорвить страницу или позже")
    }
}

function showTelegramOptions(){
    bsTelegramModal.show()
    const userId = this.attributes.getNamedItem('data-user-id').value
    const userObj = userSet.find(u => u.id === Number(userId))
    if (userObj.telegram.length === 0){
        usersShowTelegramConnectedWindows.classList.add("d-none")
        usersShowTelegramNotConnectedWindows.classList.remove("d-none")
        usersShowTelegramButtonDisconnect.classList.add("d-none")
        userShowTelegramURL.innerHTML = `https://t.me/kitai_school_study_bot?start=${userObj.tg_code}`
        userShowTelegramCode.innerHTML = `${userObj.tg_code}`
        userShowTelegramURL.href = `https://t.me/kitai_school_study_bot?start=${userObj.tg_code}`
    } else {
        usersShowTelegramConnectedWindows.classList.remove("d-none")
        usersShowTelegramNotConnectedWindows.classList.add("d-none")
        usersShowTelegramButtonDisconnect.classList.remove("d-none")
        userShowTelegramDisconnectConfirmDeleteButton.setAttribute('data-user-id', userObj.id)
    }

}

async function disconnectTelegram(){
    const userID = this.attributes.getNamedItem('data-user-id').value
    const response = await fetch(`/api/v1/users/${userID}/disconnect_telegram/`, {
        method: 'delete',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        }
    })
    if (response.status === 200){
        bsTelegramDisconnectConfirmModal.hide()
        bsTelegramModal.hide()
        bsOffcanvasUser.hide()
        showToast("Отвязка Telegram", "Telegram успешно отвязан")
        await getUsers()
        showUsers()
    } else {
        bsTelegramDisconnectConfirmModal.hide()
        bsTelegramModal.hide()
        bsOffcanvasUser.hide()
        showToast("Отвязка Telegram", "Произошла ошибка. Telegram не отвязан")
    }
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

usersShowTelegramButtonDisconnect.addEventListener('click', function (){
    bsTelegramDisconnectConfirmModal.show()
})

userShowTelegramDisconnectConfirmDeleteButton.addEventListener('click', disconnectTelegram)


