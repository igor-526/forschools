async function getTelegramUsers(){
    const response = await fetch('/api/v1/telegram/all/')
    const responseJSON = await response.json()
    if (response.status === 200){
        return responseJSON
    } else {
        showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
        return 'error'
    }
}