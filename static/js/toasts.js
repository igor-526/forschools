function showToast(title, text){
    const toast = document.querySelector('.toast')
    const bsToast = new bootstrap.Toast(toast)
    const toastTitle = toast.querySelector(".me-auto")
    const toastText = toast.querySelector(".toast-body")
    toastTitle.innerHTML = title
    toastText.innerHTML = text
    bsToast.show()
}