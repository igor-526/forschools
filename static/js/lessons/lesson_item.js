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

//Buttons
const lessonItemAddMaterialsButton = document.querySelector("#LessonItemAddMaterialsButton")
const lessonItemSendMaterialsButton = document.querySelector("#LessonItemSendMaterialsButton")
const LessonItemDeleteMaterialsButton = document.querySelector("#LessonItemDeleteMaterialsButton")
const LessonItemCheckMaterialsButton = document.querySelector("#LessonItemCheckMaterialsButton")

//Lists
const lessonItemMaterialsList = document.querySelector("#lessonItemMaterialsList")

//Arrays
let lessonItemCheckedMaterials = []

lessonItemMain()