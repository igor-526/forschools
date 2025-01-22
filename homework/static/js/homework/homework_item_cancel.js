function hwItemCancelMain(){
    hwItemCancelButton.addEventListener("click", hwItemCancelSetModal)
    hwItemCancelModalDeleteButton.addEventListener("click", hwItemCancel)
}

function hwItemCancelSetModal(){
    bsHwItemCancelModal.show()
}

function hwItemCancel(){
    homeworkAPISetCancelled(hwID).then(request => {
        bsHwItemCancelModal.hide()
        switch (request.status){
            case 200:
                homeworkItemShowLogs([request.response.log], false)
                hwItemCancelButton.classList.add("d-none")
                const sendButton = document.querySelector("#hwItemSendButton")
                const checkButton = document.querySelector("#hwItemCheckButton")
                if (sendButton)
                    sendButton.classList.add("d-none")
                if (checkButton)
                    checkButton.classList.add("d-none")
                showSuccessToast("ДЗ успешно отменено")
                break
            case 400:
                showErrorToast(request.response.status)
                break
            default:
                showErrorToast()
                break
        }
    })
}

const hwItemCancelButton = document.querySelector("#hwItemCancelButton")
const hwItemCancelModal = document.querySelector("#hwItemCancelModal")
const bsHwItemCancelModal = new bootstrap.Modal(hwItemCancelModal)
const hwItemCancelModalDeleteButton = hwItemCancelModal.querySelector("#hwItemCancelModalDeleteButton")

hwItemCancelMain()
