function plansAllDownloadMain(){
    learningPlansDownloadModalDownloadButton.addEventListener("click", plansAllDownload)
}

function plansAllDownloadResetModal(){
    learningPlansDownloadModalFormName.checked = true
    learningPlansDownloadModalFormTeacher.checked = true
    learningPlansDownloadModalFormHWTeacher.checked = true
    learningPlansDownloadModalFormMethodist.checked = true
    learningPlansDownloadModalFormListeners.checked = true
    learningPlansDownloadModalFormCurators.checked = true
    learningPlansDownloadModalFormSchedule.checked = true
    learningPlansDownloadModalFormLessonsCount.checked = true
    learningPlansDownloadModalFormLessonsPassedCount.checked = true
    learningPlansDownloadModalFormLessonsCanceledCount.checked = true
    learningPlansDownloadModalFormHWProcessing.checked = true
    learningPlansDownloadModalFormHWChecking.checked = true
    learningPlansDownloadModalFormHWAgreement.checked = true
    learningPlansDownloadModalFormHWProcessingTime.checked = true
    learningPlansDownloadModalFormHWCheckingTime.checked = true
    learningPlansDownloadModalFormHWAgreementTime.checked = true
    learningPlansDownloadModalFormListenersProgress.checked = true
    learningPlansDownloadModalFormListenersNote.checked = true
    learningPlansDownloadModalFormListenersEngChannel.checked = true
    learningPlansDownloadModalFormListenersLevel.checked = true
}

function plansAllDownloadSetModal(){
    plansAllDownloadResetModal()
    bsLearningPlansDownloadModal.show()
}

function plansAllDownload(){
    function getFormData(){
        const fd = new FormData(learningPlansDownloadModalForm)
        plansSelected.forEach(planID => {
            fd.append("plan_id", planID)
        })
        return fd
    }

    planItemAPIDownload(getFormData()).then(request => {
        bsLearningPlansDownloadModal.hide()
        switch (request.status){
            case 200:
                showSuccessToast("Задание успешно создано. Отследите его <a href='/generated/' target='_blank'>здесь</a>")
                break
            default:
                showErrorToast("Не удалось создать задание на выгрузку")
                break
        }
    })
}

const learningPlansDownloadModal = document.querySelector("#learningPlansDownloadModal")
const bsLearningPlansDownloadModal = new bootstrap.Modal(learningPlansDownloadModal)
const learningPlansDownloadModalForm = learningPlansDownloadModal.querySelector("#learningPlansDownloadModalForm")
const learningPlansDownloadModalFormName = learningPlansDownloadModalForm.querySelector("#learningPlansDownloadModalFormName")
const learningPlansDownloadModalFormTeacher = learningPlansDownloadModalForm.querySelector("#learningPlansDownloadModalFormTeacher")
const learningPlansDownloadModalFormHWTeacher = learningPlansDownloadModalForm.querySelector("#learningPlansDownloadModalFormHWTeacher")
const learningPlansDownloadModalFormMethodist = learningPlansDownloadModalForm.querySelector("#learningPlansDownloadModalFormMethodist")
const learningPlansDownloadModalFormListeners = learningPlansDownloadModalForm.querySelector("#learningPlansDownloadModalFormListeners")
const learningPlansDownloadModalFormCurators = learningPlansDownloadModalForm.querySelector("#learningPlansDownloadModalFormCurators")
const learningPlansDownloadModalFormSchedule = learningPlansDownloadModalForm.querySelector("#learningPlansDownloadModalFormSchedule")
const learningPlansDownloadModalFormLessonsCount = learningPlansDownloadModalForm.querySelector("#learningPlansDownloadModalFormLessonsCount")
const learningPlansDownloadModalFormLessonsPassedCount = learningPlansDownloadModalForm.querySelector("#learningPlansDownloadModalFormLessonsPassedCount")
const learningPlansDownloadModalFormLessonsCanceledCount = learningPlansDownloadModalForm.querySelector("#learningPlansDownloadModalFormLessonsCanceledCount")
const learningPlansDownloadModalFormHWProcessing = learningPlansDownloadModalForm.querySelector("#learningPlansDownloadModalFormHWProcessing")
const learningPlansDownloadModalFormHWChecking = learningPlansDownloadModalForm.querySelector("#learningPlansDownloadModalFormHWChecking")
const learningPlansDownloadModalFormHWAgreement = learningPlansDownloadModalForm.querySelector("#learningPlansDownloadModalFormHWAgreement")
const learningPlansDownloadModalFormHWProcessingTime = learningPlansDownloadModalForm.querySelector("#learningPlansDownloadModalFormHWProcessingTime")
const learningPlansDownloadModalFormHWCheckingTime = learningPlansDownloadModalForm.querySelector("#learningPlansDownloadModalFormHWCheckingTime")
const learningPlansDownloadModalFormHWAgreementTime = learningPlansDownloadModalForm.querySelector("#learningPlansDownloadModalFormHWAgreementTime")
const learningPlansDownloadModalFormListenersProgress = learningPlansDownloadModalForm.querySelector("#learningPlansDownloadModalFormListenersProgress")
const learningPlansDownloadModalFormListenersNote = learningPlansDownloadModalForm.querySelector("#learningPlansDownloadModalFormListenersNote")
const learningPlansDownloadModalFormListenersEngChannel = learningPlansDownloadModalForm.querySelector("#learningPlansDownloadModalFormListenersEngChannel")
const learningPlansDownloadModalFormListenersLevel = learningPlansDownloadModalForm.querySelector("#learningPlansDownloadModalFormListenersLevel")
const learningPlansDownloadModalDownloadButton = learningPlansDownloadModal.querySelector("#learningPlansDownloadModalDownloadButton")

plansAllDownloadMain()