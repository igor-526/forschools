function createToast(color){
    const toastDiv = document.createElement("div")
    toastDiv.classList.add("position-fixed", "bottom-0", "end-0", "p-2")
    toastDiv.style.zIndex = "9999"
    toastDiv.style.maxWidth = "99vw"

    const toastInfo = document.createElement("div")
    toastInfo.classList.add("toast")
    if (color){
        toastInfo.classList.add(`bg-${color}`)
    }
    toastInfo.role = "alert"
    toastInfo.ariaLive = "assertive"
    toastInfo.ariaAtomic = "true"

    const toastHeader = document.createElement("div")
    toastHeader.classList.add("toast-header")

    const toastHeaderStrong = document.createElement("strong")
    toastHeaderStrong.classList.add("me-auto")

    const toastHeaderCloseButton = document.createElement("button")
    toastHeaderCloseButton.type = "button"
    toastHeaderCloseButton.classList.add("btn-close")
    toastHeaderCloseButton.setAttribute("data-bs-dismiss", "toast")
    toastHeaderCloseButton.ariaLabel = "Close"

    const toastBody = document.createElement("div")
    toastBody.classList.add("toast-body")

    toastDiv.insertAdjacentElement("beforeend", toastInfo)
    toastInfo.insertAdjacentElement("beforeend", toastHeader)
    toastInfo.insertAdjacentElement("beforeend", toastBody)
    toastHeader.insertAdjacentElement("beforeend", toastHeaderStrong)
    toastHeader.insertAdjacentElement("beforeend", toastHeaderCloseButton)
    document.body.insertAdjacentElement("beforeend", toastDiv)
    const bsToast = new bootstrap.Toast(toastInfo)
    return {
        mainDiv: toastDiv,
        title: toastHeaderStrong,
        body: toastBody,
        bs: bsToast
    }
}

function showToast(title, text, bc){
    const toast = createToast(bc)
    toast.title.innerHTML = title
    toast.body.innerHTML = text
    toast.bs.show()
    setTimeout(() => {
        toast.mainDiv.remove()
    }, 7000)
    return toast
}

function showSuccessToast(text){
    showToast("Успешно!", text, "success")
}

function showErrorToast(text="На сервере произошла ошибка. Попробуйте обновить страницу или позже"){
    showToast("Ошибка!", text, "danger")
}