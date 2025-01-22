function showToast(title, text){
    const toast = document.querySelector('#toastInfo')
    const bsToast = new bootstrap.Toast(toast)
    const toastTitle = toast.querySelector("#toastInfoTitle")
    const toastText = toast.querySelector("#toastInfoBody")
    toastTitle.innerHTML = title
    toastText.innerHTML = text
    bsToast.show()
}

function showSuccessToast(text){
    const toast = document.querySelector('#toastSuccess')
    const bsToast = new bootstrap.Toast(toast)
    const toastTitle = toast.querySelector("#toastSuccessTitle")
    const toastText = toast.querySelector("#toastSuccessBody")
    toastTitle.innerHTML = "Успешно!"
    toastText.innerHTML = text
    bsToast.show()
}

function showErrorToast(text="На сервере произошла ошибка. Попробуйте обновить страницу или позже"){
    const toast = document.querySelector('#toastError')
    const bsToast = new bootstrap.Toast(toast)
    const toastTitle = toast.querySelector("#toastErrorTitle")
    const toastText = toast.querySelector("#toastErrorBody")
    toastTitle.innerHTML = "Ошибка!"
    toastText.innerHTML = text
    bsToast.show()
}