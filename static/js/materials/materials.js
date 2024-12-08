async function materialsMain(){
    if (see_general){
        materialsTabGeneral.addEventListener('click', async function () {
            await getMaterials(1)
            materialsTabGeneral.classList.add('active')
            materialsTabMy.classList.remove('active')
        })
        materialsTabGeneral.classList.add('active')
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
    materialsTabActionsToHWButton.addEventListener("click", function (){
        materialsToHWSet()
    })
    await materialsSetCategories()
    await materialsSetLevels()
    materialsFilterSetListeners()
    materialFilterPrograms()
}

async function getMaterials(type=currentType, offset=0, name, cat, lvl, typeMat){
    currentType = type
    currentOffset = offset
    materialsAPIGetAll(type, offset,
        materialTableFilterNameField.value.toLowerCase(),
        materialsFilterCatergoriesSelectedArray,
        materialsFilterLevelsSelectedArray,
        materialsFilterTypesSelectedArray,
        materialFilterProgramsSelectedProgsArray,
        materialFilterProgramsSelectedPhasesArray,
        materialFilterProgramsSelectedLessonsArray).then(request => {
        switch (request.status) {
            case 200:
                offset === 0 ? materialsMainShowTable(request.response) : materialsMainShowTable(request.response, "append")
                break
            default:
                showErrorToast()
                break
        }
    })
}

function materialsMainShowAll(){
    if (this.classList.contains("active")){
        materialsMainCollapseAction(0, "hide")
        this.classList.remove("active")
    } else {
        materialsMainCollapseAction(0, "show")
        this.classList.add("active")
    }

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
        const collapse = tableBody.querySelector(`[data-mat-collapse-id="${materialID}"]`)
            .querySelector(".collapse")
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
                    const matType = materialsGetType(request.response.file)
                    switch (matType) {
                        case "Видео":
                            element.innerHTML = `<video controls src="${request.response.file}" type="video/webm" style="max-height: 150px;"></video>`
                            break
                        case "Текст":
                            fetch(`${request.response.file}`).then(async request => {
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
                        case "Изображение":
                            element.innerHTML = `<a href="${request.response.file}" target="_blank"><img src="${request.response.file}" class="img-fluid" alt="Изображение" style="max-height: 150px;"></a>`
                            break
                        case "Анимация":
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
                        const bsCollapse = new bootstrap.Collapse(collapse, {
                            toggle: false
                        })
                        bsCollapse.show()
                        if (collapse.attributes.getNamedItem("data-downloaded").value === "false"){
                            getMaterial(
                            collapse.attributes.getNamedItem("data-material-id").value,
                            collapse)
                            collapse.attributes.getNamedItem("data-downloaded").value = "true"
                        }
                    })
                    break
                default:
                    const cd = getCollapseData()
                    cd.bsElement.show()
                    if (cd.element.attributes.getNamedItem("data-downloaded").value === "false"){
                            getMaterial(
                            cd.element.attributes.getNamedItem("data-material-id").value,
                            cd.element)
                        cd.element.attributes.getNamedItem("data-downloaded").value = "true"
                        }
                    break
            }
            break
        case "hide":
            switch (materialID) {
                case 0:
                    tableBody.querySelectorAll(".collapse").forEach(collapse => {
                        const bsCollapse = new bootstrap.Collapse(collapse, {
                            toggle: false
                        })
                        bsCollapse.hide()
                    })
                    break
                default:
                    const cd = getCollapseData()
                    cd.bsElement.hide()
                    break
            }
            break
    }
}

function materialsMainShowTable(list = [], action="clear"){
    function getActionsEditListener(){
        const matID = [this.attributes.getNamedItem("data-material-id").value]
        materialsEditSet(matID)
    }

    function getTableElement(material){
        const tr = document.createElement("tr")
        const tdCheckbox = document.createElement("td")
        const tdName = document.createElement("td")
        const tdType = document.createElement("td")
        const tdActions = document.createElement("td")
        const tdNameA = document.createElement("a")
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
        tdActionsShow.type = "button"
        tdActionsShow.classList.add("btn", "btn-outline-primary")
        tdActionsShow.setAttribute("data-material-id", material.id)
        tdActionsShow.innerHTML = '<i class="bi bi-eye"></i>'
        tdActionsShow.addEventListener('click', function () {
            materialsMainCollapseAction(material.id)
        })

        tdActions.insertAdjacentElement('beforeend', tdActionsBG)
        tdActionsBG.insertAdjacentElement('beforeend', tdActionsEdit)
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
        tdType.innerHTML = materialsGetType(material.file)
        tr.setAttribute("data-material-id", material.id)
        tr.insertAdjacentElement('beforeend', tdCheckbox)
        tr.insertAdjacentElement('beforeend', tdName)
        tr.insertAdjacentElement('beforeend', materialsGetTableElementCategory(material.category))
        tr.insertAdjacentElement('beforeend', materialsGetTableElementLevel(material.level))
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
        collapse.setAttribute("data-downloaded", "false")
        collapse.setAttribute("data-material-id", materialID)
        collapse.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Загрузка...</span></div>'
        return tr
    }

    function moreButtonListener(){
        getMaterials(currentType, currentOffset+15)
    }

    function getMoreButton(){
        const moreTR = document.createElement("tr")
        const moreTD = document.createElement("td")
        moreTR.insertAdjacentElement('beforeend', moreTD)
        moreTD.colSpan = 5
        const moreButton = document.createElement("button")
        moreButton.classList.add("btn", "btn-outline-primary")
        moreButton.innerHTML = '<i class="bi bi-caret-down"></i> показать больше'
        moreButton.addEventListener("click", function () {
            moreButtonListener()
            moreTR.remove()
        })
        moreTD.insertAdjacentElement("beforeend", moreButton)
        return moreTR
    }

    switch (action){
        case "clear":
            tableBody.innerHTML = ''
            list.forEach(material => {
                tableBody.insertAdjacentElement('beforeend', getTableElement(material))
                tableBody.insertAdjacentElement('beforeend', getMaterialCollapse(material.id))
            })
            if (list.length === 15) {
                tableBody.insertAdjacentElement('beforeend', getMoreButton())
            }
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
            break
        case "append":
            list.forEach(material => {
                tableBody.insertAdjacentElement('beforeend', getTableElement(material))
                tableBody.insertAdjacentElement('beforeend', getMaterialCollapse(material.id))
            })
            if (list.length === 15) {
                tableBody.insertAdjacentElement('beforeend', getMoreButton())
            }
            break
    }
    if (materialsTabActionsShowButton.classList.contains("active")){
        materialsMainCollapseAction(0, "show")
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
        currentOffset
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

function materialFilterPrograms(){
    function programItemListener(){
        const progID = Number(this.attributes.getNamedItem("data-program-id").value)
        const index = materialFilterProgramsSelectedProgsArray.indexOf(progID)
        switch (index){
            case -1:
                materialFilterProgramsSelectedProgsArray.push(progID)
                this.classList.add("active")
                break
            default:
                materialFilterProgramsSelectedProgsArray.splice(index, 1)
                this.classList.remove("active")
                break
        }
        getMaterials(currentType, 0)
        setPhases()
    }

    function phaseItemListener(){
        const phaseID = Number(this.attributes.getNamedItem("data-phase-id").value)
        const index = materialFilterProgramsSelectedPhasesArray.indexOf(phaseID)
        switch (index){
            case -1:
                materialFilterProgramsSelectedPhasesArray.push(phaseID)
                this.classList.add("active")
                break
            default:
                materialFilterProgramsSelectedPhasesArray.splice(index, 1)
                this.classList.remove("active")
                break
        }
        getMaterials(currentType, 0)
        setLessons()
    }

    function lessonItemListener(){
        const lessonID = Number(this.attributes.getNamedItem("data-lesson-id").value)
        const index = materialFilterProgramsSelectedLessonsArray.indexOf(lessonID)
        switch (index){
            case -1:
                materialFilterProgramsSelectedLessonsArray.push(lessonID)
                this.classList.add("active")
                break
            default:
                materialFilterProgramsSelectedLessonsArray.splice(index, 1)
                this.classList.remove("active")
                break
        }
        getMaterials(currentType, 0)
    }

    function getElement(name, element){
        let attrName = ""
        let buttonListener
        switch (name){
            case "program":
                attrName = "data-program-id"
                buttonListener = programItemListener
                break
            case "phase":
                attrName = "data-phase-id"
                buttonListener = phaseItemListener
                break
            case "lesson":
                attrName = "data-lesson-id"
                buttonListener = lessonItemListener
                break
        }

        const el = document.createElement("button")
        el.type = "button"
        el.classList.add("list-group-item", "list-group-item-action")
        el.setAttribute(attrName, element.id)
        el.innerHTML = element.name
        el.addEventListener("click", buttonListener)
        return el
    }

    function setPrograms(){
        materialFilterProgramsSelectedProgsArray = []
        programsAPIProgramGetAll().then(request => {
            switch (request.status){
                case 200:
                    const list = materialTableFilterProgramsProglist.querySelector(".list-group")
                    list.innerHTML = ""
                    request.response.forEach(program => {
                        list.insertAdjacentElement("beforeend", getElement("program", program))
                    })
                    break
                default:
                    showErrorToast()
            }
        })
    }

    function setPhases(){
        materialFilterProgramsSelectedPhasesArray = []
        if (materialFilterProgramsSelectedProgsArray.length !== 0){
            materialTableFilterProgramsPhaselist.classList.remove("d-none")
            programsAPIPhaseGetAll(materialFilterProgramsSelectedProgsArray)
                .then(request => {
                    switch (request.status){
                        case 200:
                            const list = materialTableFilterProgramsPhaselist.querySelector(".list-group")
                            list.innerHTML = ""
                            request.response.forEach(phase => {
                                list.insertAdjacentElement("beforeend", getElement("phase", phase))
                            })
                            break
                        default:
                            showErrorToast()
                            break
                    }
                })
        } else {
            materialTableFilterProgramsPhaselist.classList.add("d-none")
        }
    }

    function setLessons(){
        materialFilterProgramsSelectedLessonsArray = []
        if (materialFilterProgramsSelectedPhasesArray.length !== 0){
            materialTableFilterProgramsLessonslist.classList.remove("d-none")
            programsAPILessonGetAll(materialFilterProgramsSelectedPhasesArray)
                .then(request => {
                    switch (request.status){
                        case 200:
                            const list = materialTableFilterProgramsLessonslist.querySelector(".list-group")
                            list.innerHTML = ""
                            request.response.forEach(lesson => {
                                list.insertAdjacentElement("beforeend", getElement("lesson", lesson))
                            })
                            break
                        default:
                            showErrorToast()
                            break
                    }
                })
        } else {
            materialTableFilterProgramsLessonslist.classList.add("d-none")
        }
    }

    function searchListeners(){
        materialTableFilterProgramsProglistSearchErase.addEventListener("click", function () {
            materialTableFilterProgramsProglistSearch.value = ""
            materialTableFilterProgramsProglist.querySelector(".list-group")
                .querySelectorAll("button").forEach(el => {
                el.classList.remove("d-none")
            })
        })
        materialTableFilterProgramsPhaselistSearchErase.addEventListener("click", function () {
            materialTableFilterProgramsPhaselistSearch.value = ""
            materialTableFilterProgramsPhaselist.querySelector(".list-group")
                .querySelectorAll("button").forEach(el => {
                el.classList.remove("d-none")
            })
        })
        materialTableFilterProgramsLessonlistSearchErase.addEventListener("click", function () {
            materialTableFilterProgramsLessonlistSearch.value = ""
            materialTableFilterProgramsLessonslist.querySelector(".list-group")
                .querySelectorAll("button").forEach(el => {
                el.classList.remove("d-none")
            })
        })
        materialTableFilterProgramsProglistSearch.addEventListener("input", function (){
            const query = new RegExp(materialTableFilterProgramsProglistSearch.value.trim().toLowerCase())
            materialTableFilterProgramsProglist.querySelector(".list-group")
                .querySelectorAll("button").forEach(elem => {
                query.test(elem.innerHTML.toLowerCase()) ? elem.classList.remove("d-none") : elem.classList.add("d-none")
            })
        })
        materialTableFilterProgramsPhaselistSearch.addEventListener("input", function (){
            const query = new RegExp(materialTableFilterProgramsPhaselistSearch.value.trim().toLowerCase())
            materialTableFilterProgramsPhaselist.querySelector(".list-group")
                .querySelectorAll("button").forEach(elem => {
                query.test(elem.innerHTML.toLowerCase()) ? elem.classList.remove("d-none") : elem.classList.add("d-none")
            })
        })
        materialTableFilterProgramsLessonlistSearch.addEventListener("input", function (){
            const query = new RegExp(materialTableFilterProgramsLessonlistSearch.value.trim().toLowerCase())
            materialTableFilterProgramsLessonslist.querySelector(".list-group")
                .querySelectorAll("button").forEach(elem => {
                query.test(elem.innerHTML.toLowerCase()) ? elem.classList.remove("d-none") : elem.classList.add("d-none")
            })
        })
        materialTableFilterProgramsProglistSearchCancel.addEventListener("click", function () {
            materialFilterProgramsSelectedProgsArray = []
            materialTableFilterProgramsProglist.querySelector(".list-group")
                .querySelectorAll("button").forEach(elem => {
                elem.classList.remove("active")
            })
            materialTableFilterProgramsPhaselist.classList.add("d-none")
            materialTableFilterProgramsLessonslist.classList.add("d-none")
            getMaterials(currentType, 0)
        })
        materialTableFilterProgramsPhaselistSearchCancel.addEventListener("click", function () {
            materialFilterProgramsSelectedPhasesArray = []
            materialTableFilterProgramsPhaselist.querySelector(".list-group")
                .querySelectorAll("button").forEach(elem => {
                elem.classList.remove("active")
            })
            materialTableFilterProgramsLessonslist.classList.add("d-none")
            getMaterials(currentType, 0)
        })
        materialTableFilterProgramsLessonlistSearchCancel.addEventListener("click", function () {
            materialFilterProgramsSelectedLessonsArray = []
            materialTableFilterProgramsLessonslist.querySelector(".list-group")
                .querySelectorAll("button").forEach(elem => {
                elem.classList.remove("active")
            })
            getMaterials(currentType, 0)
        })
    }

    setPrograms()
    searchListeners()
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

//Filtering programs
const materialTableFilterProgramsProglist = document.querySelector("#materialTableFilterProgramsProglist")
const materialTableFilterProgramsProglistSearchCancel = materialTableFilterProgramsProglist.querySelector("#materialTableFilterProgramsProglistSearchCancel")
const materialTableFilterProgramsProglistSearch = materialTableFilterProgramsProglist.querySelector("#materialTableFilterProgramsProglistSearch")
const materialTableFilterProgramsProglistSearchErase = materialTableFilterProgramsProglist.querySelector("#materialTableFilterProgramsProglistSearchErase")
const materialTableFilterProgramsPhaselist = document.querySelector("#materialTableFilterProgramsPhaselist")
const materialTableFilterProgramsPhaselistSearchCancel = materialTableFilterProgramsPhaselist.querySelector("#materialTableFilterProgramsPhaselistSearchCancel")
const materialTableFilterProgramsPhaselistSearch = materialTableFilterProgramsPhaselist.querySelector("#materialTableFilterProgramsPhaselistSearch")
const materialTableFilterProgramsPhaselistSearchErase = materialTableFilterProgramsPhaselist.querySelector("#materialTableFilterProgramsPhaselistSearchErase")
const materialTableFilterProgramsLessonslist = document.querySelector("#materialTableFilterProgramsLessonslist")
const materialTableFilterProgramsLessonlistSearchCancel = materialTableFilterProgramsLessonslist.querySelector("#materialTableFilterProgramsLessonlistSearchCancel")
const materialTableFilterProgramsLessonlistSearch = materialTableFilterProgramsLessonslist.querySelector("#materialTableFilterProgramsLessonlistSearch")
const materialTableFilterProgramsLessonlistSearchErase = materialTableFilterProgramsLessonslist.querySelector("#materialTableFilterProgramsLessonlistSearchErase")
let materialFilterProgramsSelectedProgsArray = []
let materialFilterProgramsSelectedPhasesArray = []
let materialFilterProgramsSelectedLessonsArray = []

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
const materialsTabActionsToHWButton = document.querySelector("#materialsTabActionsToHWButton")

materialsMain()