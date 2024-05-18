async function materialsMain(){
    if (see_general){
        materialsTabGeneral.addEventListener('click', async function () {
            await getMaterials(1)
            this.classList.add('active')
            materialsTabMy.classList.remove('active')
        })
        await getMaterials(1)
    } else {
        materialsTabGeneral.classList.remove("active")
        materialsTabGeneral.classList.add("disabled")
        materialsTabMy.classList.add("active")
        await getMaterials(2)
    }
    materialsTabMy.addEventListener('click', function () {
        getMaterials(2)
        materialsTabMy.classList.add('active')
        materialsTabGeneral.classList.remove('active')
    })
    materialsTabActionsShowButton.addEventListener('click', materialsMainShowAll)
    materialTableSelectAll.addEventListener('change', function (){
        materialsMainSelect(0, materialTableSelectAll.checked)
    })
    materialTableFilterResetAll.addEventListener('click', materialsFilterReset)
    materialsTabActionsEditButton.addEventListener("click", function () {
        materialsEditSet(materialsMainSelectedArray)
    })
    materialsTabActionsDeleteButton.addEventListener("click", function () {
        materialsEditDeleteSet(materialsMainSelectedArray)
    })
    materialsTabActionsTelegramButton.addEventListener("click", function (){
        materialsTelegramSet(materialsMainSelectedArray)
    })
    await materialsSetCategories()
    await materialsSetLevels()
    materialsFilterSetListeners()
}

async function getMaterials(type=currentType, offset=0, name, cat, lvl, typeMat){
    currentType = type
    currentOffset = offset
    materialsAPIGetAll(type, offset, name, cat, lvl, typeMat).then(request => {
        switch (request.status) {
            case 200:
                materialsMainShowTable(request.response)
                break
            default:
                showErrorToast()
                break
        }
    })
}

function getMaterialType(format){
    format = format.toLowerCase()
    if (mediaFormats.imageFormats.includes(format)){
        return 'Изображение'
    } else if (mediaFormats.videoFormats.includes(format)) {
        return 'Видео'
    } else if (mediaFormats.animationFormats.includes(format)) {
        return 'Анмиация'
    } else if (mediaFormats.archiveFormats.includes(format)) {
        return 'Архив'
    } else if (mediaFormats.pdfFormats.includes(format)) {
        return 'PDF-документ'
    } else if (mediaFormats.voiceFormats.includes(format)) {
        return 'Голосовое сообщение'
    } else if (mediaFormats.audioFormats.includes(format)) {
        return 'Аудио'
    } else if (mediaFormats.textFormats.includes(format)) {
        return 'Текст'
    }else if (mediaFormats.presentationFormats.includes(format)) {
        return 'Презентация'
    }
}

function materialsMainShowAll(){
    materialsMainCollapseAction(0, "show")
}

function materialsMainSelect(matID, select=true){

    function appendArray(matID){
        if (!materialsMainSelectedArray.includes(Number(matID))){
            materialsMainSelectedArray.push(Number(matID))
        }
    }

    function popArray(matID){
        const index = materialsMainSelectedArray.indexOf(Number(matID))
        if (index !== -1){
            materialsMainSelectedArray.splice(index, 1)
        }
    }

    switch (matID) {
        case 0:
            tableBody.querySelectorAll("input").forEach(matCheck => {
                matCheck.checked = select
                if (select){
                    appendArray(Number(matCheck.value))
                } else {
                    popArray(Number(matCheck.value))
                }
            })
            break
        default:
            const chk = tableBody.querySelector(`[value="${matID}"]`, 'input')
            if (chk.checked){
                appendArray(Number(chk.value))
            } else {
                popArray(Number(chk.value))
            }
    }
    materialsTabActionsButton.disabled = (materialsMainSelectedArray.length === 0)
}

function materialsMainCollapseAction(materialID, action="show"){
    function getCollapseData(){
        const collapse = tableBody.querySelector(`#materialItemCollapse${materialID}`)
        const bsCollapse = new bootstrap.Collapse(collapse)
        return {
            element: collapse,
            bsElement: bsCollapse
        }
    }

    async function getMaterial(matID, element){
        materialsAPIGet(matID).then(async request => {
            switch (request.status) {
                case 200:
                    const splittedFile = request.response.file.split('.')
                    const matType = getMaterialType(splittedFile[splittedFile.length - 1])
                    console.log(matType)
                    switch (matType) {
                        case "Видео":
                            element.innerHTML = `<video controls src="${request.response.file}" type="video/webm" style="max-height: 150px;"></video>`
                            break
                        case "Текст":
                            await fetch(`${request.response.file}`).then(async request => {
                                if (request.status === 200) {
                                    element.innerHTML = await request.text()
                                } else {
                                    element.innerHTML = "Произошла ошибка при загрузке материала"
                                }
                            })
                            break
                        case "Аудио" || 'Голосовое сообщение':
                            element.innerHTML = `<audio controls src="${request.response.file}"></audio>`
                            break
                        case "Изображение" || 'Анмиация':
                            element.innerHTML = `<a href="${request.response.file}" target="_blank"><img src="${request.response.file}" class="img-fluid" alt="Изображение" style="max-height: 150px;"></a>`
                            break
                        default:
                            element.innerHTML = "<div>Формат пока не поддерживается</div>"
                            break
                    }
                    break
                default:
                    break
            }
        })
    }

    switch (action) {
        case "show":
            switch (materialID) {
                case 0:
                    tableBody.querySelectorAll(".collapse").forEach(collapse => {
                        const bsCollapse = new bootstrap.Collapse(collapse)
                        bsCollapse.show()
                        collapse.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Загрузка...</span></div>'
                        getMaterial(
                            collapse.attributes.getNamedItem("data-material-id").value,
                            collapse)
                    })
                    break
                default:
                    const cd = getCollapseData()
                    cd.bsElement.show()
                    getMaterial(
                        cd.element.attributes.getNamedItem("data-material-id").value,
                        cd.element)
                    break
            }
            break
        case "hide":
            break
    }
}

function materialsMainShowTable(list = [], action="clear"){
    function getActionsEditListener(){
        const matID = [this.attributes.getNamedItem("data-material-id").value]
        materialsEditSet(matID)
    }

    function getTableElementCategory(categories){
        const tdCategory = document.createElement("td")
        let categoryHTML = ''
        categories.forEach(category => {
            categoryHTML += `${category.name}<br>`
        })
        tdCategory.innerHTML = categoryHTML
        return tdCategory
    }

    function getTableElementLevel(levels){
        const tdLevel = document.createElement("td")
        let levelHTML = ''
        levels.forEach(level => {
            levelHTML += `${level.name}<br>`
        })
        tdLevel.innerHTML = levelHTML
        return tdLevel
    }

    function getTableElement(material){
        const splittedFile = material.file.split('.')
        const tr = document.createElement("tr")
        const tdCheckbox = document.createElement("td")
        const tdName = document.createElement("td")
        const tdType = document.createElement("td")
        const tdActions = document.createElement("td")
        const tdNameA = document.createElement("a")
        const tdActionsDownload = document.createElement("a")
        const tdActionsDownloadButton = document.createElement("button")
        const tdActionsShow = document.createElement("button")
        const tdActionsEdit = document.createElement("button")
        const tdActionsBG = document.createElement('div')

        tdActionsBG.role = "group"
        tdActionsBG.classList.add("btn-group")

        tdActionsEdit.type = "button"
        tdActionsEdit.classList.add("btn", "btn-outline-warning")
        tdActionsEdit.innerHTML = '<i class="bi bi-pencil"></i>'
        tdActionsEdit.setAttribute("data-material-id", material.id)
        tdActionsEdit.addEventListener('click', getActionsEditListener)

        tdActionsDownload.href = material.file
        tdActionsDownload.download = ""
        tdActionsDownloadButton.type = "button"
        tdActionsDownloadButton.classList.add('btn', 'btn-outline-primary')
        tdActionsDownloadButton.innerHTML = '<i class="bi bi-download"></i>'
        tdActionsDownload.insertAdjacentElement('beforeend', tdActionsDownloadButton)

        tdActionsShow.type = "button"
        tdActionsShow.classList.add("btn", "btn-outline-primary")
        tdActionsShow.setAttribute("data-material-id", material.id)
        tdActionsShow.setAttribute("data-bs-toggle", "collapse")
        tdActionsShow.setAttribute("data-bs-target", `materialItemCollapse${material.id}`)
        tdActionsShow.innerHTML = '<i class="bi bi-eye"></i>'
        tdActionsShow.addEventListener('click', function () {
            materialsMainCollapseAction(material.id)
        })

        tdActions.insertAdjacentElement('beforeend', tdActionsBG)
        tdActionsBG.insertAdjacentElement('beforeend', tdActionsEdit)
        tdActionsBG.insertAdjacentElement('beforeend', tdActionsDownload)
        tdActionsBG.insertAdjacentElement('beforeend', tdActionsShow)

        const tdCheckboxCheck = document.createElement('input')
        tdCheckboxCheck.type = "checkbox"
        tdCheckboxCheck.classList.add("form-check-input")
        tdCheckboxCheck.value = material.id
        tdCheckboxCheck.addEventListener('change', function (){
            materialsMainSelect(material.id, tdCheckboxCheck.checked)
        })
        tdCheckbox.insertAdjacentElement('beforeend', tdCheckboxCheck)
        tdNameA.href = `/materials/${material.id}`
        tdNameA.style = "color: #003366; text-decoration: none;"
        tdNameA.innerHTML = material.name
        tdNameA.target = "_blank"
        tdName.insertAdjacentElement('beforeend', tdNameA)
        tdType.innerHTML = getMaterialType(splittedFile[splittedFile.length - 1])
        tr.setAttribute("data-material-id", material.id)
        tr.insertAdjacentElement('beforeend', tdCheckbox)
        tr.insertAdjacentElement('beforeend', tdName)
        tr.insertAdjacentElement('beforeend', getTableElementCategory(material.category))
        tr.insertAdjacentElement('beforeend', getTableElementLevel(material.level))
        tr.insertAdjacentElement('beforeend', tdType)
        tr.insertAdjacentElement('beforeend', tdActions)
        return tr
    }

    function getMaterialCollapse(materialID){
        const tr = document.createElement("tr")
        const td = document.createElement("td")
        tr.insertAdjacentElement('beforeend', td)
        tr.setAttribute("data-mat-collapse-id", materialID)
        td.colSpan = 6
        const collapse = document.createElement("div")
        td.insertAdjacentElement('beforeend', collapse)
        collapse.classList.add("collapse")
        collapse.id = `materialItemCollapse${materialID}`
        collapse.setAttribute("data-material-id", materialID)
        collapse.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Загрузка...</span></div>'
        return tr
    }

    switch (action){
        case "clear":
            tableBody.innerHTML = ''
            list.forEach(material => {
                tableBody.insertAdjacentElement('beforeend', getTableElement(material))
                tableBody.insertAdjacentElement('beforeend', getMaterialCollapse(material.id))
            })
            break
        case "replace":
            list.forEach(material => {
                const element = tableBody.querySelector(`tr[data-material-id="${material.id}"]`)
                element.replaceWith(getTableElement(material))
            })
            break
        case "delete":
            list.forEach(material => {
                const element = tableBody.querySelector(`tr[data-material-id="${material}"]`)
                const elementCollapse = tableBody.querySelector(`tr[data-mat-collapse-id="${material}"]`)
                element.remove()
                elementCollapse.remove()
            })
    }
}

function materialsSetCategories(){
    collectionsAPIGetMatCats().then(request => {
        switch (request.status){
            case 200:
                materialTableFilterCatList.querySelectorAll("li").forEach(e => {
                    e.remove()
                })
                materialsModalEditCatSelect.innerHTML = new_lvl_cat? "<option value='new'>Новая категория</option>" : ""
                materialsCatergoriesArray = request.response.map(category => {
                    formMaterialNewCategorySelect.insertAdjacentHTML("beforeend", `<option value="${category.name}">${category.name}</option>`)
                    materialsModalEditCatSelect.insertAdjacentHTML("beforeend", `<option value="${category.name}">${category.name}</option>`)
                    materialTableFilterCatList.insertAdjacentHTML("beforeend", `
                    <li data-cat-id="${category.id}"><a class="dropdown-item" href="#">${category.name}</a></li>`)
                    return category
                })
                materialsFilterSetListeners("cat")
                break
            default:
                showErrorToast()
                break
        }
    })
}

function materialsSetLevels(){
    collectionsAPIGetMatLevels().then(request => {
        switch (request.status){
            case 200:
                materialTableFilterLevelList.querySelectorAll("li").forEach(e => {
                    e.remove()
                })
                materialsModalEditLvlSelect.innerHTML = new_lvl_cat? "<option value='new'>Новый уровень</option>" : ""
                materialsLevelsArray = request.response.map(level => {
                    formMaterialNewLvlSelect.insertAdjacentHTML("beforeend", `<option value="${level.name}">${level.name}</option>`)
                    materialsModalEditLvlSelect.insertAdjacentHTML("beforeend", `<option value="${level.name}">${level.name}</option>`)
                    materialsModalEditLvlSelect.insertAdjacentHTML("beforeend", `
                    <li data-lvl-id="${level.id}"><a class="dropdown-item" href="#">${level.name}</a></li>`)
                    return level
                })
                materialsFilterSetListeners("lvl")
                break
            default:
                showErrorToast()
                break
        }
    })
}

async function materialsFilterSearch(){
    await getMaterials(
        currentType,
        currentOffset,
        materialTableFilterNameField.value.toLowerCase(),
        materialsFilterCatergoriesSelectedArray,
        materialsFilterLevelsSelectedArray,
        materialsFilterTypesSelectedArray
    )
}

function materialsFilterSetListeners(action=""){
    function categories(){
        materialTableFilterCatList.querySelectorAll('li').forEach(cat => {
            cat.addEventListener("click", async function (){
                const catID = Number(this.attributes.getNamedItem("data-cat-id").value)
                const index = materialsFilterCatergoriesSelectedArray.indexOf(catID)
                switch (index) {
                    case -1:
                        materialsFilterCatergoriesSelectedArray.push(catID)
                        this.querySelector('a').classList.add("active")
                        break
                    default:
                        materialsFilterCatergoriesSelectedArray.splice(index, 1)
                        this.querySelector('a').classList.remove("active")
                        break
                }
                await materialsFilterSearch()
            })
        })
    }

    function levels(){
        materialTableFilterLevelList.querySelectorAll('li').forEach(lvl => {
            lvl.addEventListener("click", async function (){
                const lvlID = Number(this.attributes.getNamedItem("data-lvl-id").value)
                const index = materialsFilterLevelsSelectedArray.indexOf(lvlID)
                switch (index) {
                    case -1:
                        materialsFilterLevelsSelectedArray.push(lvlID)
                        this.querySelector('a').classList.add("active")
                        break
                    default:
                        materialsFilterLevelsSelectedArray.splice(index, 1)
                        this.querySelector('a').classList.remove("active")
                        break
                }
                await materialsFilterSearch()
            })
        })
    }

    function types(){
        materialTableFilterTypeList.querySelectorAll('li').forEach(type => {
            type.addEventListener("click", async function (){
                const typeName = this.attributes.getNamedItem("data-type-name").value
                const index = materialsFilterTypesSelectedArray.indexOf(typeName)
                switch (index) {
                    case -1:
                        materialsFilterTypesSelectedArray.push(typeName)
                        this.querySelector('a').classList.add("active")
                        break
                    default:
                        materialsFilterTypesSelectedArray.splice(index, 1)
                        this.querySelector('a').classList.remove("active")
                        break
                }
                await materialsFilterSearch()
            })
        })
    }

    function name(){
        materialTableFilterNameField.addEventListener("input", materialsFilterSearch)
        materialTableFilterNameFieldErase.addEventListener("click", async function () {
            materialTableFilterNameField.value = ""
            await materialsFilterSearch()
        })
    }

    function categoriesSearch(){
        materialTableFilterCatSearchField.addEventListener("input", function () {
            const query = new RegExp(materialTableFilterCatSearchField.value.toLowerCase())
            materialTableFilterCatList.querySelectorAll("li").forEach(cat => {
                query.test(cat.querySelector('a').innerHTML.toLowerCase()) ? cat.classList.remove("d-none") : cat.classList.add("d-none")
            })
        })
        materialTableFilterCatSearchFieldErase.addEventListener("click", function (){
            materialTableFilterCatSearchField.value = ""
            materialTableFilterCatList.querySelectorAll("li").forEach(cat => {
                cat.classList.remove("d-none")
            })
        })
    }

    function levelsSearch(){
        materialTableFilterLevelSearchField.addEventListener("input", function () {
            const query = new RegExp(materialTableFilterLevelSearchField.value.toLowerCase())
            materialTableFilterLevelList.querySelectorAll("li").forEach(lvl => {
                query.test(lvl.querySelector('a').innerHTML.toLowerCase()) ? lvl.classList.remove("d-none") : lvl.classList.add("d-none")
            })
        })
        materialTableFilterLevelSearchFieldErase.addEventListener("click", function (){
            materialTableFilterLevelSearchField.value = ""
            materialTableFilterLevelList.querySelectorAll("li").forEach(lvl => {
                lvl.classList.remove("d-none")
            })
        })
    }

    function typesSearch(){
        materialTableFilterTypeSearchField.addEventListener("input", function () {
            const query = new RegExp(materialTableFilterTypeSearchField.value.toLowerCase())
            materialTableFilterTypeList.querySelectorAll("li").forEach(type => {
                query.test(type.querySelector('a').innerHTML.toLowerCase()) ? type.classList.remove("d-none") : type.classList.add("d-none")
            })
        })
        materialTableFilterTypeSearchFieldErase.addEventListener("click", function (){
            materialTableFilterTypeSearchField.value = ""
            materialTableFilterTypeList.querySelectorAll("li").forEach(type => {
                type.classList.remove("d-none")
            })
        })
    }

    switch (action) {
        case "cat":
            categories()
            break
        case "lvl":
            levels()
            break
        default:
            types()
            name()
            categoriesSearch()
            levelsSearch()
            typesSearch()
            break
    }
}

async function materialsFilterReset(){
    materialsFilterCatergoriesSelectedArray = []
    materialsFilterLevelsSelectedArray = []
    materialsFilterTypesSelectedArray = []
    materialTableFilterCatList.querySelectorAll("li").forEach(e => {
        e.classList.remove("d-none")
        e.querySelector("a").classList.remove("active")
    })
    materialTableFilterLevelList.querySelectorAll("li").forEach(e => {
        e.classList.remove("d-none")
        e.querySelector("a").classList.remove("active")
    })
    materialTableFilterTypeList.querySelectorAll("li").forEach(e => {
        e.classList.remove("d-none")
        e.querySelector("a").classList.remove("active")
    })
    materialTableFilterNameField.value = ""
    materialTableFilterCatSearchField.value = ""
    materialTableFilterLevelSearchField.value = ""
    materialTableFilterTypeSearchField.value = ""
    getMaterials(currentType, 0)
}

//Tabs
const materialsTabGeneral = document.querySelector("#MaterialsTabGeneral")
const materialsTabMy = document.querySelector("#MaterialsTabMy")
let currentType
let currentOffset

//Table
const tableBody = document.querySelector("#MaterialTableBody")

//Buttons
const materialsTabActionsShowButton = document.querySelector("#materialsTabActionsShowButton")
const materialTableSelectAll = document.querySelector("#materialTableSelectAll")

//Filtering
const materialTableFilterCatList = document.querySelector("#materialTableFilterCatList")
const materialTableFilterLevelList = document.querySelector("#materialTableFilterLevelList")
const materialTableFilterTypeList = document.querySelector("#materialTableFilterTypeList")

const materialTableFilterNameField = document.querySelector("#materialTableFilterNameField")
const materialTableFilterCatSearchField = document.querySelector("#materialTableFilterCatSearchField")
const materialTableFilterLevelSearchField = document.querySelector("#materialTableFilterLevelSearchField")
const materialTableFilterTypeSearchField = document.querySelector("#materialTableFilterTypeSearchField")

const materialTableFilterResetAll = document.querySelector("#materialTableFilterResetAll")
const materialTableFilterNameFieldErase = document.querySelector("#materialTableFilterNameFieldErase")
const materialTableFilterCatSearchFieldErase = document.querySelector("#materialTableFilterCatSearchFieldErase")
const materialTableFilterLevelSearchFieldErase = document.querySelector("#materialTableFilterLevelSearchFieldErase")
const materialTableFilterTypeSearchFieldErase = document.querySelector("#materialTableFilterTypeSearchFieldErase")

const materialTableSortNameButton = document.querySelector("#materialTableSortNameButton")

let materialsMainSelectedArray = []
let materialsCatergoriesArray = []
let materialsLevelsArray = []
let materialsFilterCatergoriesSelectedArray = []
let materialsFilterLevelsSelectedArray = []
let materialsFilterTypesSelectedArray = []

//Actions
const materialsTabActionsButton = document.querySelector("#materialsTabActionsButton")
const materialsTabActionsTelegramButton = document.querySelector("#materialsTabActionsTelegramButton")
const materialsTabActionsEditButton = document.querySelector("#materialsTabActionsEditButton")
const materialsTabActionsDeleteButton = document.querySelector("#materialsTabActionsDeleteButton")

materialsMain()