function maHomeworkItemLogSetModal(logID){
    homeworkAPIGetLog(logID).then(request => {
        switch (request.status){
            case 200:
                bsMaHomeworkItemLogModalTitle.innerHTML = maHomeworkItemShowLogsStrStatus(request.response.status)
                maHomeworkItemLogModalComment.innerHTML = request.response.comment
                maHomeworkItemLogModalContent.innerHTML = ""
                request.response.files.forEach(file => {
                    maHomeworkItemLogModalContent.insertAdjacentElement("beforeend", materialToHTMLMobile(
                        file.path,
                        file.type
                    ))
                })
                bsMaHomeworkItemLogModal.show()
                break
            default:
                break
        }
    })
}

const maHomeworkItemLogModal = document.querySelector("#maHomeworkItemLogModal")
const bsMaHomeworkItemLogModal = new bootstrap.Modal(maHomeworkItemLogModal)
const bsMaHomeworkItemLogModalTitle = maHomeworkItemLogModal.querySelector("#maHomeworkItemLogModalTitle")
const maHomeworkItemLogModalComment = maHomeworkItemLogModal.querySelector("#maHomeworkItemLogModalComment")
const maHomeworkItemLogModalContent = maHomeworkItemLogModal.querySelector("#maHomeworkItemLogModalContent")