function lessonItemMain(){
    lessonsAPIGetItem(lessonID).then(request => {
        switch (request.status){
            case 200:
                if (lessonItemAddMaterialsButton !== null){
                    lessonItemAddMaterialsButton.addEventListener("click", function () {
                        materialEmbedAction = "addToLesson"
                        materialsEmbedSet(
                            request.response.materials.map(material => {
                                return material.id
                            })
                        )
                    })
                }
                if (can_see_materials){
                    lessonItemSetMaterials(request.response.materials)
                    lessonItemSetHomeworks(request.response.homeworks)
                }
                break
            default:
                showErrorToast()
                break
        }
    })
    LessonItemCheckMaterialsButton.addEventListener("click", lessonItemSelectAllMaterialsListener)
    if (LessonItemDeleteMaterialsButton){
        LessonItemDeleteMaterialsButton.addEventListener("click", function () {
            lessonItemDeleteMaterialsSetModal(lessonItemCheckedMaterials)
        })
    }
    if (lessonItemSendMaterialsButton){
        lessonItemSendMaterialsButton.addEventListener("click", function () {
            lessonItemSendMaterialsSetModal(lessonItemCheckedMaterials)
        })
    }
    if (lessonItemRestoreButton){
        lessonItemRestoreButton.addEventListener("click", lessonItemRestoreModalSet)
    }
    if (lessonItemEditButton){
        lessonItemEditButton.addEventListener("click", function () {
            lessonEditSetModalLesson(lessonID)
        })
    }
}

function lessonItemSetButtons() {
    switch (lessonItemCheckedMaterials.length){
        case 0:
            lessonItemSendMaterialsButton.disabled = true
            LessonItemDeleteMaterialsButton.disabled = true
            break
        default:
            lessonItemSendMaterialsButton.disabled = false
            LessonItemDeleteMaterialsButton.disabled = false
            break
    }
}

function lessonItemSelectAllMaterialsListener(){
    const checks = lessonItemMaterialsList.querySelectorAll("input")
    lessonItemCheckedMaterials = []
    switch (this.attributes.getNamedItem("data-action").value){
        case "check":
            checks.forEach(check => {
                check.checked = true
                lessonItemCheckedMaterials.push(check.value)
            })
            this.attributes.getNamedItem("data-action").value = "reset"
            break
        case "reset":
            checks.forEach(check => {
                check.checked = false
            })
            this.attributes.getNamedItem("data-action").value = "check"
            break
    }
    lessonItemSetButtons()
}

function lessonItemSetMaterials(materials, del=false){
    function checkListener(){
        const index = lessonItemCheckedMaterials.indexOf(this.value)
        switch (this.checked){
            case true:
                if (index === -1){
                    lessonItemCheckedMaterials.push(this.value)
                }
                break
            case false:
                if (index !== -1){
                    lessonItemCheckedMaterials.splice(index, 1)
                }
                break
        }
        lessonItemSetButtons()
    }

    function getMaterialElement(material){
        const li = document.createElement("li")
        const a = document.createElement("a")
        const check = document.createElement("input")
        li.classList.add("list-group-item")
        a.href = `/materials/${material.id}`
        a.innerHTML = material.name
        a.target = "_blank"
        check.classList.add("form-check-input", "me-3")
        check.type = "checkbox"
        check.value = material.id
        check.addEventListener("change", checkListener)
        li.insertAdjacentElement("beforeend", check)
        li.insertAdjacentElement("beforeend", a)
        return li
    }
    switch (del){
        case true:
            materials.forEach(material => {
                const elem = lessonItemMaterialsList.querySelector(`input[value="${material}"]`)
                elem.parentElement.remove()
            })
            const checks = lessonItemMaterialsList.querySelectorAll("input")
            checks.forEach(check => {
                check.checked = false
            })
            lessonItemSendMaterialsButton.disabled = true
            LessonItemDeleteMaterialsButton.disabled = true
            lessonItemCheckedMaterials = []
            LessonItemCheckMaterialsButton.attributes.getNamedItem("data-action").value = "check"
            break
        case false:
            materials.forEach(material => {
                lessonItemMaterialsList.insertAdjacentElement("beforeend", getMaterialElement(material))
            })
    }}

function lessonItemSetHomeworks(homeworks, del=false){
    function getHomeworklElement(homework){
        const li = document.createElement("li")
        const a = document.createElement("a")
        const button = document.createElement("button")
        li.classList.add("list-group-item")
        li.setAttribute("data-hw-list-id", homework.id)
        a.href = `/homeworks/${homework.id}`
        a.innerHTML = homework.name
        a.target = "_blank"
        button.classList.add("btn", "btn-danger", "btn-sm", "me-3")
        button.type = "button"
        button.innerHTML = '<i class="bi bi-x-lg"></i>'
        button.addEventListener("click", function () {
            lessonItemDeleteHWModalSet(homework.id)
        })
        li.insertAdjacentElement("beforeend", button)
        li.insertAdjacentElement("beforeend", a)
        return li
    }

    switch (del){
        case true:
            homeworks.forEach(homework => {
                const elem = lessonItemHomeworkList.querySelector(`[data-hw-list-id="${homework}"]`)
                elem.remove()
            })
            break
        case false:
            homeworks.forEach(homework => {
                if (homework.status !== 6){
                    lessonItemHomeworkList.insertAdjacentElement("beforeend", getHomeworklElement(homework))
                }
            })
    }}

//Buttons
const lessonItemAddMaterialsButton = document.querySelector("#LessonItemAddMaterialsButton")
const lessonItemSendMaterialsButton = document.querySelector("#LessonItemSendMaterialsButton")
const LessonItemDeleteMaterialsButton = document.querySelector("#LessonItemDeleteMaterialsButton")
const LessonItemCheckMaterialsButton = document.querySelector("#LessonItemCheckMaterialsButton")
const lessonItemRestoreButton = document.querySelector("#lessonItemRestoreButton")
const lessonItemEditButton = document.querySelector("#lessonItemEditButton")

//Lists
const lessonItemMaterialsList = document.querySelector("#lessonItemMaterialsList")
const lessonItemHomeworkList = document.querySelector("#lessonItemHomeworkList")

//Arrays
let lessonItemCheckedMaterials = []

lessonItemMain()