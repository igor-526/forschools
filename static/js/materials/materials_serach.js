function sortMaterials(){
    const sorted = this.attributes.getNamedItem("data-sorted").value
    switch (sorted){
        case "asc":
            material_set.sort(function (a, b){
                if (a.name.toLowerCase() > b.name.toLowerCase()) {
                    return -1
                }
                if (a.name.toLowerCase() < b.name.toLowerCase()) {
                    return 1
                }
                return 0
            })
            searchMaterials()
            this.attributes.getNamedItem("data-sorted").value = "desc"
            break
        case "desc":
            material_set.sort(function (a, b){
                if (a.name.toLowerCase() > b.name.toLowerCase()) {
                    return 1
                }
                if (a.name.toLowerCase() < b.name.toLowerCase()) {
                    return -1
                }
                return 0
            })
            searchMaterials()
            this.attributes.getNamedItem("data-sorted").value = "asc"
            break
    }

}

function filterMaterial(material, formData){
    const name = new RegExp(formData.get("name").toLowerCase())
    const owner = new RegExp(formData.get("owner").toLowerCase())
    const type = formData.get("type").toLowerCase()
    const category = formData.get("category")
    const level = formData.get("level")

    let statusName
    let statusOwner
    let statusType
    let statusCategory
    let statusLevel

    if (formData.get("name") !== ""){
        statusName = name.test(material.name.toLowerCase())
    } else {
        statusName = true
    }

    if (formData.get("owner") !== ""){
        statusOwner = owner
            .test(`${material.owner.first_name.toLowerCase()} ${material.owner.last_name.toLowerCase()}`)
    } else {
        statusOwner = true
    }

    if (formData.get("type") !== "none"){
        const splttedFilePath = material.file.split('.')
        const fileFormat = splttedFilePath[splttedFilePath.length - 1]
        switch (type){
            case "pdf":
                statusType = fileFormat === "pdf";
                console.log(statusType)
                break
            case "gif":
                statusType = fileFormat === "gif";
                break
            case "archive":
                statusType = archiveFormats.includes(fileFormat)
                break
            case "video":
                statusType = videoFormats.includes(fileFormat)
                break
            case "image":
                statusType = imageFormats.includes(fileFormat)
                break
            default:
                statusType = true
        }
    } else {
        statusType = true
    }

    if (formData.get("category") !== "none"){
        let categoryIDs = []
        material.category.forEach(function (cat) {
            categoryIDs.push(Number(cat.id))
        })
        statusCategory = categoryIDs.includes(Number(category))
    } else {
        statusCategory = true
    }

    if (formData.get("level") !== "none"){
        let levelIDs = []
        material.level.forEach(function (lvl) {
            levelIDs.push(Number(lvl.id))
        })
        statusLevel = levelIDs.includes(Number(level))
    } else {
        statusLevel = true
    }

    return statusName && statusOwner && statusType && statusCategory && statusLevel
}

function searchMaterials(){
    console.log("dfs")
    const formData = new FormData(materialsCollapseSearchForm)
    if (formData.get("name") !== "" ||
        formData.get("category") !== "none" ||
        formData.get("level") !== "none" ||
        formData.get("owner") !== "" ||
        formData.get("type") !== "none"){
        materialFilteredSet = material_set.filter(m => filterMaterial(m, formData))
        showMaterials(materialFilteredSet)
    } else {
        showMaterials()
    }
}

//Bootstrap Elements
const materialsCollapseSearch = document.querySelector("#MaterialsCollapseSearch")

//Forms
const materialsCollapseSearchForm = materialsCollapseSearch.querySelector("#MaterialsCollapseSearchForm")
const materialsCollapseSearchName = materialsCollapseSearchForm.querySelector("#MaterialsCollapseSearchName")
const materialsCollapseSearchCategory = materialsCollapseSearchForm.querySelector("#MaterialsCollapseSearchCategory")
const materialsCollapseSearchOwner = materialsCollapseSearchForm.querySelector("#MaterialsCollapseSearchOwner")
const materialsCollapseSearchType =  materialsCollapseSearchForm.querySelector("#MaterialsCollapseSearchType")
const materialsCollapseSearchLevel =  materialsCollapseSearchForm.querySelector("#MaterialsCollapseSearchLevel")

//Buttons
const materialsCollapseSearchButton = document.querySelector("#MaterialsCollapseSearchButton")
const materialTableSortNameButton = document.querySelector("#MaterialTableSortNameButton")
const materialsCollapseSearchClearButton = materialsCollapseSearchForm.querySelector("#MaterialsCollapseSearchClearButton")

let materialFilteredSet = []

materialTableSortNameButton.addEventListener("click", sortMaterials)

const materialsSearchFields = [
    materialsCollapseSearchName,
    materialsCollapseSearchCategory,
    materialsCollapseSearchOwner,
    materialsCollapseSearchType,
    materialsCollapseSearchLevel]

const clearButtons = [
    materialsCollapseSearchButton,
    materialsCollapseSearchClearButton
]

materialsSearchFields.forEach(function (field) {
    field.addEventListener("input", searchMaterials)
})

clearButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        materialsCollapseSearchForm.reset()
        materialFilteredSet = []
        showMaterials()
    })
})