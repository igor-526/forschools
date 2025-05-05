function downloadDataEngineSetModal(mode="", params={}){
    function addSwitch(name="", title=""){
        const switchDiv = document.createElement("div")
        switchDiv.classList.add("form-check", "form-switch")
        const switchInput = document.createElement("input")
        switchInput.name = name
        switchInput.classList.add("form-check-input")
        switchInput.type = "checkbox"
        switchInput.checked = true
        switchInput.id = `downloadDataModalForm_${name}`
        const switchLabel = document.createElement("label")
        switchLabel.classList.add("form-check-label")
        switchLabel.for = `downloadDataModalForm_${name}`
        switchLabel.innerHTML = title
        switchDiv.insertAdjacentElement("beforeend", switchInput)
        switchDiv.insertAdjacentElement("beforeend", switchLabel)
        downloadDataModalForm.insertAdjacentElement("beforeend", switchDiv)
    }

    if (!downloadDataInited){
        downloadDataModalDownloadButton.addEventListener("click", downloadDataStart)
        downloadDataInited = true
    }
    downloadDataParams = params
    downloadDataCurrentMode = mode
    downloadDataModalForm.innerHTML = ""
    switch (mode){
        case "lessons":
            downloadDataModalHeader.innerHTML = "Выгрузка данных (занятия)"
            addSwitch("name_plan", "Наименование (план обучения)")
            addSwitch("name_fact", "Наименование (фактическое)")
            addSwitch("date", "Дата")
            addSwitch("time", "Время")
            addSwitch("teacher", "Преподаватель")
            addSwitch("listeners", "Ученики")
            addSwitch("methodist", "Методист")
            addSwitch("curators", "Кураторы")
            addSwitch("status", "Статус")
            addSwitch("review_materials", "Ревью (Материалы)")
            addSwitch("review_lexis", "Ревью (Лексика)")
            addSwitch("review_grammar", "Ревью (Грамматика)")
            addSwitch("review_note", "Ревью (Примечание)")
            addSwitch("review_org", "Ревью (Орг. моменты и поведение ученика)")
            addSwitch("admin_comment", "Комментарий администратора")
            addSwitch("hw_all", "ДЗ (общее количество)")
            addSwitch("hw_agreement", "ДЗ (ожидает согласования)")
            addSwitch("hw_processing", "ДЗ (ожидает выполнения)")
            addSwitch("hw_checking", "ДЗ (ожидает проверки)")
            addSwitch("hw_accepted", "ДЗ (принято)")
            bsDownloadDataModal.show()
            break
        default:
            showErrorToast()
            break
    }
}


function downloadDataValidateAndGetFD(errors = []){
    function showErrors(errors = []){
        downloadDataModalErrors.classList.remove("d-none")
        downloadDataModalErrors.innerHTML += errors.join("<br>")
    }

    let fieldsCounter = 0
    downloadDataModalErrors.innerHTML = ""
    downloadDataModalErrors.classList.add("d-none")

    if (errors.length > 0){
        showErrors(errors)
        return false
    }

    const formData = new FormData(downloadDataModalForm)

    for (let _ of formData) {
        fieldsCounter ++
    }

    if (fieldsCounter === 0){
        showErrors(["Необходимо выбрать хотя бы одно поле"])
        return false
    }

    for (let key of Object.keys(downloadDataParams)){
        if (!downloadDataParams[key]){
            continue
        }
        if (downloadDataParams[key].constructor === Array){
            downloadDataParams[key].forEach(val => {
                formData.append(key, val)
            })
            continue
        }
        formData.append(key, downloadDataParams[key])
    }
    return formData
}


function downloadDataStart(){
    const fd = downloadDataValidateAndGetFD()
    if (fd) {
        switch (downloadDataCurrentMode){
            case "lessons":
                lessonsAPIDownloadData(fd).then(request => {
                    switch (request.status){
                        default:
                            console.log(request.response)
                    }
                })
        }
    }
}


let downloadDataInited = false
let downloadDataParams = {}
let downloadDataCurrentMode = null
const downloadDataModal = document.querySelector("#downloadDataModal")
const bsDownloadDataModal = new bootstrap.Modal(downloadDataModal)
const downloadDataModalHeader = downloadDataModal.querySelector("#downloadDataModalHeader")
const downloadDataModalForm = downloadDataModal.querySelector("#downloadDataModalForm")
const downloadDataModalErrors = downloadDataModal.querySelector("#downloadDataModalErrors")
const downloadDataModalDownloadButton = downloadDataModal.querySelector("#downloadDataModalDownloadButton")