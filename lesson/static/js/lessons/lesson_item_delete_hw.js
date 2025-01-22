function lessonItemDeleteHWMain(){
    lessonItemDeleteHWModalButton.addEventListener("click", lessonItemDeleteHWDestroy)
}

function lessonItemDeleteHWModalSet(hw_id){
    bsLessonItemDeleteHWModal.show()
    lessonItemDeleteHWModalButton.setAttribute("data-hw-id", hw_id)
}

function lessonItemDeleteHWDestroy(){
    const homeworkID = lessonItemDeleteHWModalButton.attributes.getNamedItem("data-hw-id").value
    homeworkAPISetCancelled(homeworkID).then(request => {
        switch (request.status){
            case 200:
                bsLessonItemDeleteHWModal.hide()
                showSuccessToast("ДЗ успешно отменено")
                lessonItemSetHomeworks([homeworkID], true)
                break
            default:
                bsLessonItemDeleteHWModal.hide()
                showErrorToast(request.response.status)
                break
        }
    })
}

const lessonItemDeleteHWModal = document.querySelector("#lessonItemDeleteHWModal")
const bsLessonItemDeleteHWModal = new bootstrap.Modal(lessonItemDeleteHWModal)
const lessonItemDeleteHWModalButton = lessonItemDeleteHWModal.querySelector("#lessonItemDeleteHWModalButton")

lessonItemDeleteHWMain()