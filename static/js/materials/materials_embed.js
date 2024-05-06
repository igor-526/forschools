async function materialsEmbedMain(){
    const request = await materialsAPIGetAll(2)
    if (request.status === 200){
        materialsAllSet = request.response
        materialsEmbedShow(materialsAllSet)
    }

    materialsEmbedModalAddButton.addEventListener("click", async function () {
        switch (materialEmbedAction){
            case "addToLesson":
                const request = await lessonsAPIAddMaterials(new FormData(materialsEmbedModalTableForm), lessonID)
                if (request.status === 200){
                    bsMaterialsEmbedModal.hide()
                    showToast("Добавлено","Материалы успешно прикреплены")
                    materialsEmbedReset()
                } else {
                    bsMaterialsEmbedModal.hide()
                    showToast("Ошибка","На сервере произошла ошибка. Попробуйте обновить страницу или позже")
                    materialsEmbedReset()
                }
                break
            case "addToHW":
                HWNewMaterialsSet = new FormData(materialsEmbedModalTableForm).getAll("material")
                HWNewMaterialsList.innerHTML = `
                    <li class="list-group-item"><button type="button" class="btn btn-danger btn-sm me-2" id="HWNewMaterialsListClearButton"><i class="bi bi-trash3"></i></button>
                        Прикреплено ${HWNewMaterialsSet.length}
                    </li>`
                HWNewMaterialsList.querySelector("#HWNewMaterialsListClearButton").addEventListener("click", function () {
                    HWNewMaterialsSet = []
                    HWNewMaterialsList.innerHTML = '<li class="list-group-item">Материалы не прикреплены</li>'
                })
                bsMaterialsEmbedModal.hide()
                materialsEmbedReset()
                break
            case "addToHW_":
                HWAddMaterialsSet = new FormData(materialsEmbedModalTableForm).getAll("material")
                HWAddMaterialsList.innerHTML = `
                    <li class="list-group-item"><button type="button" class="btn btn-danger btn-sm me-2" id="HWNewMaterialsListClearButton"><i class="bi bi-trash3"></i></button>
                        Прикреплено ${HWAddMaterialsSet.length}
                    </li>`
                HWAddMaterialsList.querySelector("#HWNewMaterialsListClearButton").addEventListener("click", function () {
                    HWAddMaterialsSet = []
                    HWAddMaterialsList.innerHTML = '<li class="list-group-item">Материалы не прикреплены</li>'
                })
                bsMaterialsEmbedModal.hide()
                materialsEmbedReset()
                break
            case "programHW":
                modalLProgramHWMaterialsSet = new FormData(materialsEmbedModalTableForm).getAll("material")
                lProgramHWMaterialsList.innerHTML = ""
                modalLProgramHWMaterialsSet.forEach(matID => {
                    const mat = materialsAllSet.find(mat => Number(mat.id) === Number(matID))
                    lProgramHWMaterialsList.insertAdjacentHTML("beforeend", `
                    <li class="list-group-item"><button type="button" class="btn btn-danger material-embed-delete" data-mat-id="${mat.id}">
                    <i class="bi bi-trash3"></i></button>
                    <a href="/materials/${mat.id}">${mat.name}</a></li>`)
                })
                lProgramHWMaterialsList.querySelectorAll(".material-embed-delete").forEach(matDelButton => {
                    matDelButton.addEventListener("click", materialsEmbedDelete)
                })
                break
            case "programLesson":
                modalLProgramLessonMaterialsSet = new FormData(materialsEmbedModalTableForm).getAll("material")
                lProgramLessonMaterialsList.innerHTML = ""
                modalLProgramLessonMaterialsSet.forEach(matID => {
                    const mat = materialsAllSet.find(mat => Number(mat.id) === Number(matID))
                    lProgramLessonMaterialsList.insertAdjacentHTML("beforeend", `
                    <li class="list-group-item"><button type="button" class="btn btn-danger material-embed-delete" data-mat-id="${mat.id}">
                    <i class="bi bi-trash3"></i></button>
                    <a href="/materials/${mat.id}">${mat.name}</a></li>`)
                })
                lProgramLessonMaterialsList.querySelectorAll(".material-embed-delete").forEach(matDelButton => {
                    matDelButton.addEventListener("click", materialsEmbedDelete)
                })
                break
        }
    })
}

function materialsEmbedShow(list = materialsAllSet){
    materialsEmbedModalTableBody.innerHTML = ""
    materialsAllSet.forEach(material => {
        materialsEmbedModalTableBody.insertAdjacentHTML("beforeend", `
            <tr>
                <td><input name="material" class="form-check-input" type="checkbox" value="${material.id}" aria-label=""></td>
                <td><a href="/materials/${material.id}">${material.name}</a></td>
                <td>Категория</td>
                <td>Уровень</td>
                <td>Тип</td>
                <td><a href="/profile/${material.owner.id}">${material.owner.first_name} ${material.owner.last_name}</a></td>
            </tr>        
        `)
    })
}


function materialsEmbedDelete(){
    const matID = this.attributes.getNamedItem("data-mat-id").value
    let matIndex
    switch (materialEmbedAction){
        case "programHW":
            this.parentElement.remove()
            matIndex = modalLProgramHWMaterialsSet.indexOf(Number(matID))
            if (matIndex !== -1) {
                modalLProgramHWMaterialsSet.splice(matIndex, 1)
            }
            if (modalLProgramHWMaterialsSet.length === 0){
                lProgramHWMaterialsList.innerHTML = '<li class="list-group-item">Материалы не прикреплены</li>'
            }
            break
        case "programLesson":
            this.parentElement.remove()
            matIndex = modalLProgramLessonMaterialsSet.indexOf(Number(matID));
            if (matIndex !== -1) {
                modalLProgramLessonMaterialsSet.splice(matIndex, 1);
            }
            if (modalLProgramLessonMaterialsSet.length === 0){
                lProgramLessonMaterialsList.innerHTML = '<li class="list-group-item">Материалы не прикреплены</li>'
            }
            break
    }
}


function materialsEmbedReset() {
    materialsEmbedModalSearchForm.reset()
    materialsEmbedModalTableForm.reset()
}



//Bootstrap Elements
const materialsEmbedModal = document.querySelector("#MaterialsEmbedModal")
const bsMaterialsEmbedModal = new bootstrap.Modal(materialsEmbedModal)

//Search Form
const materialsEmbedModalSearchForm = materialsEmbedModal.querySelector("#MaterialsEmbedModalSearchForm")
const materialsEmbedModalSearchName = materialsEmbedModalSearchForm.querySelector("#MaterialsEmbedModalSearchName")
const materialsEmbedModalSearchOwner = materialsEmbedModalSearchForm.querySelector("#MaterialsEmbedModalSearchOwner")
const materialsEmbedModalSearchCategory = materialsEmbedModalSearchForm.querySelector("#MaterialsEmbedModalSearchCategory")
const materialsEmbedModalSearchLevel = materialsEmbedModalSearchForm.querySelector("#MaterialsEmbedModalSearchLevel")
const materialsEmbedModalSearchType = materialsEmbedModalSearchForm.querySelector("#MaterialsEmbedModalSearchType")
const materialsEmbedModalSearchClearButton = materialsEmbedModalSearchForm.querySelector("#MaterialsEmbedModalSearchClearButton")

//Materials Form
const materialsEmbedModalTableForm = materialsEmbedModal.querySelector("#MaterialsEmbedModalTableForm")
const materialsEmbedModalTableBody = materialsEmbedModalTableForm.querySelector("#MaterialsEmbedModalTableBody")

//Buttons
const materialsEmbedModalAddButton = materialsEmbedModal.querySelector("#MaterialsEmbedModalAddButton")
const materialsEmbedModalCloseButton = materialsEmbedModal.querySelector("#MaterialsEmbedModalCloseButton")

//Sets
let materialsAllSet = []

materialsEmbedMain()