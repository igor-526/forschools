function supportMain(){
    if (forschoolsSupportButton){
        forschoolsSupportButton.addEventListener("click", function (){
            supportReset()
            bsSupportNewTicketModal.show()
        })
        supportNewTicketModalSendButton.addEventListener("click", supportSend)
    }

}

function supportReset(validationOnly = false){
    function resetValidation(){
        supportNewTicketModalDescription.classList.remove("is-invalid")
        supportNewTicketModalAttachmentsField.classList.remove("is-invalid")
        supportNewTicketModalDescriptionError.innerHTML = ""
        supportNewTicketModalAttachmentsError.innerHTML = ""
    }

    resetValidation()
    if (!validationOnly){
        supportNewTicketModalForm.reset()
    }
}

function supportValidation(errors = null){
    function setInvalid(element=null, errorElement=null, error=null){
        if (element){
            element.classList.add("is-invalid")
        }
        if (errorElement && error){
            errorElement.innerHTML = error
        }
        validationStatus = false
    }

    function validateDescription(errors=null){
        if (errors){
            setInvalid(supportNewTicketModalDescription, supportNewTicketModalDescriptionError, errors)
        } else {
            if (supportNewTicketModalDescription.value.trim() === ""){
                setInvalid(supportNewTicketModalDescription,
                    supportNewTicketModalDescriptionError,
                    "Поле не может быть пустым")
            } else {
                if (supportNewTicketModalDescription.value.length > 3000){
                    setInvalid(supportNewTicketModalDescription,
                        supportNewTicketModalDescriptionError,
                        "Максимально 3000 символов")
                }
            }
        }
    }

    function validateAttachments(errors=null){
        if (errors){
            setInvalid(supportNewTicketModalAttachmentsField, supportNewTicketModalAttachmentsError, errors)
        }
    }

    supportReset(true)
    let validationStatus = true
    if (errors){
        if (errors.hasOwnProperty("description")){
            validateDescription(errors.description)
        }
        if (errors.hasOwnProperty("attachments")){
            validateAttachments(errors.attachments)
        }
    } else {
        validateDescription()
        validateAttachments()
    }
    return validationStatus

}

function supportSend(){
    function getFD(){
        const fd = new FormData(supportNewTicketModalForm)
        fd.set("description", fd.get("description").trim())
        fd.set("path_info", window.location.href)
        return fd
    }

    if (supportValidation()){
        supportAPITicketCreate(getFD()).then(request => {
            switch (request.status){
                case 201:
                    bsSupportNewTicketModal.hide()
                    showSuccessToast("Обращение создано. Ожидайте ответа в течение 3-х суток")
                    break
                case 400:
                    supportValidation(request.response)
                    break
                default:
                    bsSupportNewTicketModal.hide()
                    showErrorToast()
                    break
            }
        })
    }
}


const forschoolsSupportButton = document.querySelector("#forschoolsSupportButton")
const supportNewTicketModal = document.querySelector("#supportNewTicketModal")
const bsSupportNewTicketModal = new bootstrap.Modal(supportNewTicketModal)
const supportNewTicketModalForm = supportNewTicketModal.querySelector("#supportNewTicketModalForm")
const supportNewTicketModalDescription = supportNewTicketModalForm.querySelector("#supportNewTicketModalDescription")
const supportNewTicketModalAttachmentsField = supportNewTicketModalForm.querySelector("#supportNewTicketModalAttachmentsField")
const supportNewTicketModalDescriptionError = supportNewTicketModalForm.querySelector("#supportNewTicketModalDescriptionError")
const supportNewTicketModalAttachmentsError = supportNewTicketModalForm.querySelector("#supportNewTicketModalAttachmentsError")
const supportNewTicketModalSendButton = supportNewTicketModal.querySelector("#supportNewTicketModalSendButton")

supportMain()