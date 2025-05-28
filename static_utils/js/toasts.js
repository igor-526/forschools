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

class toastEngine{
    title = ""
    message = ""

    constructor() {
        this.toastDiv = document.createElement("div")
        this.toastDiv.classList.add("position-fixed", "bottom-0", "end-0", "p-2")
        this.toastDiv.style.zIndex = "9999"
        this.toastDiv.style.maxWidth = "99vw"

        this.toastInfo = document.createElement("div")
        this.toastInfo.classList.add("toast")
        this.toastInfo.role = "alert"
        this.toastInfo.ariaLive = "assertive"
        this.toastInfo.ariaAtomic = "true"

        const toastHeader = document.createElement("div")
        toastHeader.classList.add("toast-header")

        this.toastHeaderStrong = document.createElement("strong")
        this.toastHeaderStrong.classList.add("me-auto")

        const toastHeaderCloseButton = document.createElement("button")
        toastHeaderCloseButton.type = "button"
        toastHeaderCloseButton.classList.add("btn-close")
        toastHeaderCloseButton.setAttribute("data-bs-dismiss", "toast")
        toastHeaderCloseButton.ariaLabel = "Close"

        const toastBody = document.createElement("div")
        toastBody.classList.add("toast-body")

        this.toastBodyText = document.createElement("div")
        this.toastBodyText.classList.add("mb-2")
        this.toastBodyButtons = document.createElement("div")
        toastBody.insertAdjacentElement("beforeend", this.toastBodyText)
        toastBody.insertAdjacentElement("beforeend", this.toastBodyButtons)

        this.toastDiv.insertAdjacentElement("beforeend", this.toastInfo)
        this.toastInfo.insertAdjacentElement("beforeend", toastHeader)
        this.toastInfo.insertAdjacentElement("beforeend", toastBody)
        toastHeader.insertAdjacentElement("beforeend", this.toastHeaderStrong)
        toastHeader.insertAdjacentElement("beforeend", toastHeaderCloseButton)
    }

    show(){
        document.body.insertAdjacentElement("beforeend", this.toastDiv)
        this.toastHeaderStrong.innerHTML = this.title
        this.toastBodyText.innerHTML = this.message
        const bsToast = new bootstrap.Toast(this.toastInfo)
        bsToast.show()
        setTimeout(() => {
            this.toastDiv.remove()
        }, 7000)
    }

    addTGButton(){
        const tgButton = document.createElement("button")
        tgButton.classList.add("btn", "btn-sm", "btn-primary")
        tgButton.innerHTML = '<i class="bi bi-telegram me-2"></i>Перейти в бот'
        this.toastBodyButtons.insertAdjacentElement("beforeend", tgButton)
    }

    setError(message=null){
        this.title = "Ошибка"
        this.message = message ? message : `На сервере произошла ошибка<br>
        Попробуйте обновить страницу или выполнить это действие позже`
        this.color = "danger"
    }

    setSuccess(message=null){
        this.title = "Успешно"
        this.message = message ? message : `Действие успешно выполнено`
        this.color = "success"
    }

    set color(color){
        if (color){
            this.toastInfo.classList.add(`bg-${color}`)
        }
    }
}