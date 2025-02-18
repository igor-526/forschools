function plansAllDownloadMain(){

}

function plansAllDownloadSetModal(){
    bslearningPlansDownloadModal.show()
}

const learningPlansDownloadModal = document.querySelector("#learningPlansDownloadModal")
const bslearningPlansDownloadModal = new bootstrap.Modal(learningPlansDownloadModal)
const learningPlansDownloadModalForm = learningPlansDownloadModal.querySelector("#learningPlansDownloadModalForm")
const learningPlansDownloadModalDownloadButton = learningPlansDownloadModal.querySelector("#learningPlansDownloadModalDownloadButton")