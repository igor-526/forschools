function materialsEmbedMain(){
    materialsEmbedSet()
    materialsEmbedFilter()
    materialsEmbedFilterPrograms()
    materialsEmbedTableSelectAll.addEventListener("change", function (){
        materialsEmbedSelectListener(this.checked)
    })
    materialEmbedTableEraseAll.addEventListener("click", function () {
        materialsEmbedSelectedArray = []
        materialsEmbedSelectListener(false)
    })
    materialEmbedTableFilterResetAll.addEventListener("click", function(){
        materialsEmbedReset()
        materialsEmbedGetAll(currentType, 0)
    })
    materialsEmbedShowAllButton.addEventListener("click", async function () {
        await materialsEmbedCollapseAction(0, materialsEmbedShowAllButton)
    })

    materialsEmbedModalAddButton.addEventListener("click", materialEmbedChange)
}

function materialsEmbedSelectListener(element, updonly = false){
    function updateButton() {
        materialsEmbedModalAddButton.innerHTML = `Изменить (${materialsEmbedSelectedArray.length})`
    }

    if (updonly){
        updateButton()
        return
    }

    switch (element){
        case true:
            materialsEmbedModalTableBody.querySelectorAll(".form-check-input").forEach(elem => {
                const matID = Number(elem.value)
                const index = materialsEmbedSelectedArray.indexOf(matID)
                if (index === -1){
                    materialsEmbedSelectedArray.push(matID)
                }
                elem.checked = true
            })
            break
        case false:
            materialsEmbedModalTableBody.querySelectorAll(".form-check-input").forEach(elem => {
                const matID = Number(elem.value)
                const index = materialsEmbedSelectedArray.indexOf(matID)
                if (index !== -1){
                    materialsEmbedSelectedArray.splice(index, 1)
                }
                elem.checked = false
            })
            break
        default:
            const matID = Number(element.value)
            const index = materialsEmbedSelectedArray.indexOf(matID)
            switch (element.checked){
                case true:
                    if (index === -1){
                        materialsEmbedSelectedArray.push(matID)
                    }
                    break
                case false:
                    if (index !== -1){
                        materialsEmbedSelectedArray.splice(index, 1)
                    }
                    break
            }
            break
    }
    updateButton()
}

function materialsEmbedGetAll(type=currentType, offset = currentOffset){

    if (type !== currentType){
        currentType = type
    }
    if (offset !== currentOffset){
        currentOffset = offset
    }

    materialsAPIGetAll(
        type, offset,
        materialsEmbedTableFilterNameField.value,
        materialsEmbedFilterCategoriesSelectedArray,
        materialsEmbedFilterLevelsSelectedArray,
        materialsEmbedFilterTypesSelectedArray,
        materialsEmbedFilterProgramsSelectedProgsArray,
        materialsEmbedFilterProgramsSelectedPhasesArray,
        materialsEmbedFilterProgramsSelectedLessonsArray).then(request => {
        if (request.status === 200){
            materialsEmbedShow(
                request.response,
                (offset === 0) ? "clear" : "append"
            )
        }
    })
}

async function materialsEmbedCollapseAction(matID, button) {
    switch (matID) {
        case 0:
            const buttons = materialsEmbedModalTableBody.querySelectorAll('[data-collapse-button-mat-id]')

            switch (button.classList.contains("active")){
                case true:
                    button.classList.remove("active")
                    buttons.forEach(btn => {
                        btn.classList.remove("active")
                        const colID = btn.attributes.getNamedItem("data-collapse-button-mat-id").value
                        const colElem = materialsEmbedModalTableBody.querySelector(`[data-mat-collapse-id="${colID}"]`)
                        const bsColElem = new bootstrap.Collapse(colElem, {
                            toggle: false
                        })
                        bsColElem.hide()
                    })
                    break
                case false:
                    button.classList.add("active")
                    buttons.forEach( btn => {
                        btn.classList.add("active")
                        const colID = btn.attributes.getNamedItem("data-collapse-button-mat-id").value
                        const colElem = materialsEmbedModalTableBody.querySelector(`[data-mat-collapse-id="${colID}"]`)
                        const bsColElem = new bootstrap.Collapse(colElem, {
                            toggle: false
                        })
                        bsColElem.show()
                        if (colElem.attributes.getNamedItem("data-downloaded").value === "false") {
                            materialsSetCollapsePreview(colID, colElem)
                            colElem.attributes.getNamedItem("data-downloaded").value = "true"
                        }
                    })
                    break
            }
            break
        default:
            const colElem = materialsEmbedModalTableBody.querySelector(`[data-mat-collapse-id="${matID}"]`)
            const bsColElem = new bootstrap.Collapse(colElem, {
                toggle: false
            })
            switch (button.classList.contains("active")) {
                case true:
                    button.classList.remove("active")
                    bsColElem.hide()
                    break
                case false:
                    button.classList.add("active")
                    bsColElem.show()
                    if (colElem.attributes.getNamedItem("data-downloaded").value === "false") {
                        await materialsSetCollapsePreview(matID, colElem)
                        colElem.attributes.getNamedItem("data-downloaded").value = "true"
                    }
                    break
            }
            break
    }
}

function materialsEmbedShow(list, action="clear"){
    function getTableElement(material){
        const tr = document.createElement("tr")
        const tdCheckbox = document.createElement("td")
        const tdName = document.createElement("td")
        const tdType = document.createElement("td")
        const tdActions = document.createElement("td")
        const tdNameA = document.createElement("a")
        const tdActionsShow = document.createElement("button")
        tdActionsShow.type = "button"
        tdActionsShow.classList.add("btn", "btn-outline-primary")
        tdActionsShow.innerHTML = '<i class="bi bi-eye"></i>'
        tdActionsShow.setAttribute("data-collapse-button-mat-id", material.id)
        tdActionsShow.addEventListener('click', async function () {
            await materialsEmbedCollapseAction(material.id, tdActionsShow)
        })
        tdActions.insertAdjacentElement('beforeend', tdActionsShow)
        const tdCheckboxCheck = document.createElement('input')
        tdCheckboxCheck.type = "checkbox"
        tdCheckboxCheck.classList.add("form-check-input")
        tdCheckboxCheck.value = material.id
        if (materialsEmbedSelectedArray.indexOf(Number(material.id)) !== -1){
            tdCheckboxCheck.checked = true
        }
        tdCheckboxCheck.addEventListener("change", function () {
            materialsEmbedSelectListener(this)
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
        td.colSpan = 6
        const collapse = document.createElement("div")
        td.insertAdjacentElement('beforeend', collapse)
        collapse.classList.add("collapse")
        collapse.setAttribute("data-mat-collapse-id", materialID)
        collapse.setAttribute("data-downloaded", "false")
        collapse.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Загрузка...</span></div>'
        return tr
    }

    function moreListener(){
        materialsEmbedGetAll(currentType, currentOffset+15)
    }

    if (action === "clear"){
        materialsEmbedModalTableBody.innerHTML = ""
    }
    list.forEach(material => {
        materialsEmbedModalTableBody.insertAdjacentElement("beforeend", getTableElement(material))
        materialsEmbedModalTableBody.insertAdjacentElement("beforeend", getMaterialCollapse(material.id))
        if (materialsEmbedShowAllButton.classList.contains("active")){
            materialsEmbedCollapseAction(material.id, materialsEmbedModalTableBody.querySelector(`[data-collapse-button-mat-id="${material.id}"]`))
        }
    })
    if (list.length === 15){
        const moreTR = document.createElement("tr")
        const moreTD = document.createElement("td")
        moreTR.insertAdjacentElement('beforeend', moreTD)
        moreTD.colSpan = 5
        const moreButton = document.createElement("button")
        moreButton.classList.add("btn", "btn-outline-primary")
        moreButton.innerHTML = '<i class="bi bi-caret-down"></i>'
        moreButton.addEventListener("click", function () {
            moreListener()
            moreTR.remove()
        })
        moreTD.insertAdjacentElement("beforeend", moreButton)
        materialsEmbedModalTableBody.insertAdjacentElement("beforeend", moreTR)
    }
}

function materialsEmbedReset(){
    materialsEmbedTableFilterCatList.querySelectorAll("li").forEach(elem => {
        elem.classList.remove("d-none")
        elem.firstElementChild.classList.remove("active")
    })
    materialsEmbedTableFilterLevelList.querySelectorAll("li").forEach(elem => {
        elem.classList.remove("d-none")
        elem.firstElementChild.classList.remove("active")
    })
    materialsEmbedTableFilterTypeList.querySelectorAll("li").forEach(elem => {
        elem.classList.remove("d-none")
        elem.firstElementChild.classList.remove("active")
    })
    materialsEmbedTableFilterNameField.value = ""
    materialsEmbedTableFilterCatSearchField.value = ""
    materialsEmbedTableFilterLevelSearchField.value = ""
    materialsEmbedTableFilterTypeSearchField.value = ""
    materialsEmbedFilterCategoriesSelectedArray = []
    materialsEmbedFilterLevelsSelectedArray = []
    materialsEmbedFilterTypesSelectedArray = []
}

function materialsEmbedSet(selected = []){
    materialsEmbedSelectedArray = selected
    if (see_general){
        materialsEmbedTabGeneral.addEventListener('click', function () {
            materialsEmbedGetAll(1, 0)
            this.classList.add('active')
            materialsEmbedTabMy.classList.remove('active')
        })
        materialsEmbedGetAll(1, 0)
    } else {
        materialsEmbedTabGeneral.classList.remove("active")
        materialsEmbedTabGeneral.classList.add("disabled")
        materialsEmbedTabMy.classList.add("active")
        materialsEmbedGetAll(2, 0)
    }
    materialsEmbedTabMy.addEventListener('click', function () {
            materialsEmbedGetAll(2, 0)
            materialsEmbedTabMy.classList.add('active')
            materialsEmbedTabGeneral.classList.remove('active')
        }
    )
    materialsEmbedReset()
}

function materialsEmbedFilter(){
    function catListener(){
        const catID = Number(this.attributes.getNamedItem("data-cat-id").value)
        const index = materialsEmbedFilterCategoriesSelectedArray.indexOf(catID)
        switch (index){
            case -1:
                this.querySelector("a").classList.add("active")
                materialsEmbedFilterCategoriesSelectedArray.push(catID)
                break
            default:
                this.querySelector("a").classList.remove("active")
                materialsEmbedFilterCategoriesSelectedArray.splice(index, 1)
                break
        }
        materialsEmbedGetAll(currentType, 0)
    }

    function lvlListener(){
        const lvlID = Number(this.attributes.getNamedItem("data-lvl-id").value)
        const index = materialsEmbedFilterLevelsSelectedArray.indexOf(lvlID)
        switch (index){
            case -1:
                this.querySelector("a").classList.add("active")
                materialsEmbedFilterLevelsSelectedArray.push(lvlID)
                break
            default:
                this.querySelector("a").classList.remove("active")
                materialsEmbedFilterLevelsSelectedArray.splice(index, 1)
                break
        }
        materialsEmbedGetAll(currentType, 0)
    }

    function getCatLvl(){
        collectionsAPIGetMatCats().then(request => {
            switch (request.status) {
                case 200:
                    request.response.forEach(cat => {
                        materialsEmbedTableFilterCatList.insertAdjacentHTML("beforeend", `<li data-cat-id="${cat.id}"><a class="dropdown-item" href="#">${cat.name}</a></li>`)
                    })
                    materialsEmbedTableFilterCatList.querySelectorAll("li").forEach(cat => {
                        cat.addEventListener("click", catListener)
                    })
                    break
                default:
                    showErrorToast()
                    break
            }
        })
        collectionsAPIGetMatLevels().then(request => {
            switch (request.status) {
                case 200:
                    request.response.forEach(lvl => {
                        materialsEmbedTableFilterLevelList.insertAdjacentHTML("beforeend", `<li data-lvl-id="${lvl.id}"><a class="dropdown-item" href="#">${lvl.name}</a></li>`)
                    })
                    materialsEmbedTableFilterLevelList.querySelectorAll("li").forEach(lvl => {
                        lvl.addEventListener("click", lvlListener)
                    })
                    break
                default:
                    showErrorToast()
                    break
            }
        })
        materialsEmbedTableFilterCatSearchFieldErase.addEventListener("click", function (){
            materialsEmbedTableFilterCatSearchField.value = ""
            materialsEmbedTableFilterCatList.querySelectorAll("li").forEach(cat => {
                cat.classList.remove("d-none")
            })
        })
        materialsEmbedTableFilterLevelSearchFieldErase.addEventListener("click", function (){
            materialsEmbedTableFilterLevelSearchField.value = ""
            materialsEmbedTableFilterLevelList.querySelectorAll("li").forEach(lvl => {
                lvl.classList.remove("d-none")
            })
        })
        materialsEmbedTableFilterCatSearchField.addEventListener("input", function (){
            const query = new RegExp(materialsEmbedTableFilterCatSearchField.value.trim().toLowerCase())
            materialsEmbedTableFilterCatList.querySelectorAll("li").forEach(cat => {
                query.test(cat.firstElementChild.innerHTML.toLowerCase()) ? cat.classList.remove("d-none") : cat.classList.add("d-none")
            })
        })
        materialsEmbedTableFilterLevelSearchField.addEventListener("input", function (){
            const query = new RegExp(materialsEmbedTableFilterLevelSearchField.value.trim().toLowerCase())
            materialsEmbedTableFilterLevelList.querySelectorAll("li").forEach(lvl => {
                query.test(lvl.firstElementChild.innerHTML.toLowerCase()) ? lvl.classList.remove("d-none") : lvl.classList.add("d-none")
            })
        })
    }

    function nameListeners(){
        materialsEmbedTableFilterNameFieldErase.addEventListener("click", function (){
            materialsEmbedTableFilterNameField.value = ""
            materialsEmbedGetAll(currentType, 0)
        })
        materialsEmbedTableFilterNameField.addEventListener("input", function (){
            materialsEmbedGetAll(currentType, 0)
        })
    }

    function typeListeners(){
        materialsEmbedTableFilterTypeSearchFieldErase.addEventListener("click", function (){
            materialsEmbedTableFilterTypeSearchField.value = ""
            materialsEmbedTableFilterTypeList.querySelectorAll("li").forEach(typeMat => {
                typeMat.classList.remove("d-none")
            })
        })
        materialsEmbedTableFilterTypeSearchField.addEventListener("input", function (){
            const query = new RegExp(materialsEmbedTableFilterTypeSearchField.value.trim().toLowerCase())
            materialsEmbedTableFilterTypeList.querySelectorAll("li").forEach(matType => {
                query.test(matType.firstElementChild.innerHTML.toLowerCase()) ? matType.classList.remove("d-none") : matType.classList.add("d-none")
            })
        })
        materialsEmbedTableFilterTypeList.querySelectorAll("li").forEach(matType => {
            matType.addEventListener("click", function (){
                const val = matType.attributes.getNamedItem("data-type-name").value
                const index = materialsEmbedFilterTypesSelectedArray.indexOf(val)
                switch (index) {
                    case -1:
                        materialsEmbedFilterTypesSelectedArray.push(val)
                        matType.firstElementChild.classList.add("active")
                        break
                    default:
                        materialsEmbedFilterTypesSelectedArray.splice(index, 1)
                        matType.firstElementChild.classList.remove("active")
                        break
                }
                materialsEmbedGetAll(currentType, 0)
            })
        })
    }

    getCatLvl()
    nameListeners()
    typeListeners()
}

function materialsEmbedFilterPrograms(){
    function programItemListener(){
        const progID = Number(this.attributes.getNamedItem("data-program-id").value)
        const index = materialsEmbedFilterProgramsSelectedProgsArray.indexOf(progID)
        switch (index){
            case -1:
                materialsEmbedFilterProgramsSelectedProgsArray.push(progID)
                this.classList.add("active")
                break
            default:
                materialsEmbedFilterProgramsSelectedProgsArray.splice(index, 1)
                this.classList.remove("active")
                break
        }
        materialsEmbedGetAll(currentType, 0)
        setPhases()
    }

    function phaseItemListener(){
        const phaseID = Number(this.attributes.getNamedItem("data-phase-id").value)
        const index = materialsEmbedFilterProgramsSelectedPhasesArray.indexOf(phaseID)
        switch (index){
            case -1:
                materialsEmbedFilterProgramsSelectedPhasesArray.push(phaseID)
                this.classList.add("active")
                break
            default:
                materialsEmbedFilterProgramsSelectedPhasesArray.splice(index, 1)
                this.classList.remove("active")
                break
        }
        materialsEmbedGetAll(currentType, 0)
        setLessons()
    }

    function lessonItemListener(){
        const lessonID = Number(this.attributes.getNamedItem("data-lesson-id").value)
        const index = materialsEmbedFilterProgramsSelectedLessonsArray.indexOf(lessonID)
        switch (index){
            case -1:
                materialsEmbedFilterProgramsSelectedLessonsArray.push(lessonID)
                this.classList.add("active")
                break
            default:
                materialsEmbedFilterProgramsSelectedLessonsArray.splice(index, 1)
                this.classList.remove("active")
                break
        }
        materialsEmbedGetAll(currentType, 0)
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
        materialsEmbedFilterProgramsSelectedProgsArray = []
        programsAPIProgramGetAll().then(request => {
            switch (request.status){
                case 200:
                    const list = materialEmbedTableFilterProgramsProglist.querySelector(".list-group")
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
        materialsEmbedFilterProgramsSelectedPhasesArray = []
        if (materialsEmbedFilterProgramsSelectedProgsArray.length !== 0){
            materialEmbedTableFilterProgramsPhaselist.classList.remove("d-none")
            programsAPIPhaseGetAll(materialsEmbedFilterProgramsSelectedProgsArray)
                .then(request => {
                    switch (request.status){
                        case 200:
                            const list = materialEmbedTableFilterProgramsPhaselist.querySelector(".list-group")
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
            materialEmbedTableFilterProgramsPhaselist.classList.add("d-none")
        }
    }

    function setLessons(){
        materialsEmbedFilterProgramsSelectedLessonsArray = []
        if (materialsEmbedFilterProgramsSelectedPhasesArray.length !== 0){
            materialEmbedTableFilterProgramsLessonslist.classList.remove("d-none")
            programsAPILessonGetAll(materialsEmbedFilterProgramsSelectedPhasesArray)
                .then(request => {
                    switch (request.status){
                        case 200:
                            const list = materialEmbedTableFilterProgramsLessonslist.querySelector(".list-group")
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
            materialEmbedTableFilterProgramsLessonslist.classList.add("d-none")
        }
    }

    function searchListeners(){
        materialEmbedTableFilterProgramsProglistSearchErase.addEventListener("click", function () {
            materialEmbedTableFilterProgramsProglistSearch.value = ""
            materialEmbedTableFilterProgramsProglist.querySelector(".list-group")
                .querySelectorAll("button").forEach(el => {
                el.classList.remove("d-none")
            })
        })
        materialEmbedTableFilterProgramsPhaselistSearchErase.addEventListener("click", function () {
            materialEmbedTableFilterProgramsPhaselistSearch.value = ""
            materialEmbedTableFilterProgramsPhaselist.querySelector(".list-group")
                .querySelectorAll("button").forEach(el => {
                el.classList.remove("d-none")
            })
        })
        materialEmbedTableFilterProgramsLessonlistSearchErase.addEventListener("click", function () {
            materialEmbedTableFilterProgramsLessonlistSearch.value = ""
            materialEmbedTableFilterProgramsLessonslist.querySelector(".list-group")
                .querySelectorAll("button").forEach(el => {
                el.classList.remove("d-none")
            })
        })
        materialEmbedTableFilterProgramsProglistSearch.addEventListener("input", function (){
            const query = new RegExp(materialEmbedTableFilterProgramsProglistSearch.value.trim().toLowerCase())
            materialEmbedTableFilterProgramsProglist.querySelector(".list-group")
                .querySelectorAll("button").forEach(elem => {
                query.test(elem.innerHTML.toLowerCase()) ? elem.classList.remove("d-none") : elem.classList.add("d-none")
            })
        })
        materialEmbedTableFilterProgramsPhaselistSearch.addEventListener("input", function (){
            const query = new RegExp(materialEmbedTableFilterProgramsPhaselistSearch.value.trim().toLowerCase())
            materialEmbedTableFilterProgramsPhaselist.querySelector(".list-group")
                .querySelectorAll("button").forEach(elem => {
                query.test(elem.innerHTML.toLowerCase()) ? elem.classList.remove("d-none") : elem.classList.add("d-none")
            })
        })
        materialEmbedTableFilterProgramsLessonlistSearch.addEventListener("input", function (){
            const query = new RegExp(materialEmbedTableFilterProgramsLessonlistSearch.value.trim().toLowerCase())
            materialEmbedTableFilterProgramsLessonslist.querySelector(".list-group")
                .querySelectorAll("button").forEach(elem => {
                query.test(elem.innerHTML.toLowerCase()) ? elem.classList.remove("d-none") : elem.classList.add("d-none")
            })
        })
        materialEmbedTableFilterProgramsProglistSearchCancel.addEventListener("click", function () {
            materialsEmbedFilterProgramsSelectedProgsArray = []
            materialEmbedTableFilterProgramsProglist.querySelector(".list-group")
                .querySelectorAll("button").forEach(elem => {
                elem.classList.remove("active")
            })
            materialEmbedTableFilterProgramsPhaselist.classList.add("d-none")
            materialEmbedTableFilterProgramsLessonslist.classList.add("d-none")
            materialsEmbedGetAll(currentType, 0)
        })
        materialEmbedTableFilterProgramsPhaselistSearchCancel.addEventListener("click", function () {
            materialsEmbedFilterProgramsSelectedPhasesArray = []
            materialEmbedTableFilterProgramsPhaselist.querySelector(".list-group")
                .querySelectorAll("button").forEach(elem => {
                elem.classList.remove("active")
            })
            materialEmbedTableFilterProgramsLessonslist.classList.add("d-none")
            materialsEmbedGetAll(currentType, 0)
        })
        materialEmbedTableFilterProgramsLessonlistSearchCancel.addEventListener("click", function () {
            materialsEmbedFilterProgramsSelectedLessonsArray = []
            materialEmbedTableFilterProgramsLessonslist.querySelector(".list-group")
                .querySelectorAll("button").forEach(elem => {
                elem.classList.remove("active")
            })
            materialsEmbedGetAll(currentType, 0)
        })
    }

    setPrograms()
    searchListeners()
}

async function materialEmbedChange(){
    function getElement(matID, matName){
        const elem = document.createElement("li")
        elem.classList.add("list-group-item")
        const elemA = document.createElement("a")
        elemA.href = `/materials/${matID}`
        elemA.target = "_blank"
        elemA.innerHTML = matName
        elem.insertAdjacentElement("beforeend", elemA)
        return elem
    }

    function addToProgHW(){
        modalLProgramHWMaterialsSet = materialsEmbedSelectedArray
        lProgramHWMaterialsList.innerHTML = ""
        materialsEmbedSelectedArray.forEach(matID => {
            materialsAPIGet(matID).then(request => {
                switch (request.status){
                    case 200:
                        lProgramHWMaterialsList.insertAdjacentElement("beforeend", getElement(request.response.id, request.response.name))
                        break
                    default:
                        showErrorToast()
                        break
                }
            })
        })
    }

    function addToProgLesson(){
        modalLProgramLessonMaterialsSet = materialsEmbedSelectedArray
        lProgramLessonMaterialsList.innerHTML = ""
        materialsEmbedSelectedArray.forEach(matID => {
            materialsAPIGet(matID).then(request => {
                switch (request.status){
                    case 200:
                        lProgramLessonMaterialsList.insertAdjacentElement("beforeend", getElement(request.response.id, request.response.name))
                        break
                    default:
                        showErrorToast()
                        break
                }
            })
        })
    }

    function addToLesson(){
        lessonsAPIAddMaterials(materialsEmbedSelectedArray, lessonID).then(request => {
            bsMaterialsEmbedModal.hide()
            switch (request.status) {
                case 200:
                    lessonItemMaterialsList.innerHTML = ""
                    materialsEmbedSelectedArray.forEach(matID => {
                        materialsAPIGet(matID).then(request => {
                            switch (request.status){
                                case 200:
                                    lessonItemMaterialsList.insertAdjacentElement("beforeend", getElement(request.response.id, request.response.name))
                                    break
                                default:
                                    showErrorToast()
                                    break
                            }
                        })
                    })
                    showSuccessToast("Материалы успешно прикреплены")
                    break
                default:
                    showErrorToast()
                    break
            }
        })
    }

    function addToHWFromLesson(){
        HWNewMaterialsSet = materialsEmbedSelectedArray
        HWNewMaterialsList.innerHTML = ""
        materialsEmbedSelectedArray.forEach(matID => {
            materialsAPIGet(matID).then(request => {
                switch (request.status){
                    case 200:
                        HWNewMaterialsList.insertAdjacentElement("beforeend", getElement(request.response.id, request.response.name))
                        break
                    default:
                        showErrorToast()
                        break
                }
            })
        })
        bsMaterialsEmbedModal.hide()
    }

    function addToHW(){
        HWAddMaterialsSet = materialsEmbedSelectedArray
        HWAddMaterialsList.innerHTML = ""
        bsMaterialsEmbedModal.hide()
        materialsEmbedSelectedArray.forEach(matID => {
            materialsAPIGet(matID).then(request => {
                switch (request.status){
                    case 200:
                        HWAddMaterialsList.insertAdjacentElement("beforeend", getElement(request.response.id, request.response.name))
                        break
                    default:
                        showErrorToast()
                        break
                }
            })
        })
    }


    switch (materialEmbedAction){
        case "addToLesson":
            addToLesson()
            break
        case "addToHW":
            addToHWFromLesson()
            break
        case "addToHW_":
            addToHW()
            break
        case "programHW":
            addToProgHW()
            break
        case "programLesson":
            addToProgLesson()
            break
    }
}


let currentType
let currentOffset = 0


//Bootstrap Elements
const materialsEmbedModal = document.querySelector("#MaterialsEmbedModal")
const bsMaterialsEmbedModal = new bootstrap.Modal(materialsEmbedModal)

//Tabs
const materialsEmbedTabGeneral = materialsEmbedModal.querySelector("#materialsEmbedTabGeneral")
const materialsEmbedTabMy = materialsEmbedModal.querySelector("#materialsEmbedTabMy")

//Filters
const materialsEmbedTableFilterNameField = materialsEmbedModal.querySelector("#materialsEmbedTableFilterNameField")
const materialsEmbedTableFilterCatList = materialsEmbedModal.querySelector("#materialsEmbedTableFilterCatList")
const materialsEmbedTableFilterLevelList = materialsEmbedModal.querySelector("#materialsEmbedTableFilterLevelList")
const materialsEmbedTableFilterTypeList = materialsEmbedModal.querySelector("#materialsEmbedTableFilterTypeList")
const materialsEmbedTableFilterCatSearchField = materialsEmbedModal.querySelector("#materialsEmbedTableFilterCatSearchField")
const materialsEmbedTableFilterLevelSearchField = materialsEmbedModal.querySelector("#materialsEmbedTableFilterLevelSearchField")
const materialsEmbedTableFilterTypeSearchField = materialsEmbedModal.querySelector("#materialsEmbedTableFilterTypeSearchField")
const materialsEmbedTableFilterNameFieldErase = materialsEmbedModal.querySelector("#materialsEmbedTableFilterNameFieldErase")
const materialsEmbedTableFilterCatSearchFieldErase = materialsEmbedModal.querySelector("#materialsEmbedTableFilterCatSearchFieldErase")
const materialsEmbedTableFilterLevelSearchFieldErase = materialsEmbedModal.querySelector("#materialsEmbedTableFilterLevelSearchFieldErase")
const materialsEmbedTableFilterTypeSearchFieldErase = materialsEmbedModal.querySelector("#materialsEmbedTableFilterTypeSearchFieldErase")
let materialsEmbedFilterCategoriesSelectedArray = []
let materialsEmbedFilterLevelsSelectedArray = []
let materialsEmbedFilterTypesSelectedArray = []

//FilterPrograms
const materialEmbedTableFilterProgramsProglist = materialsEmbedModal.querySelector("#materialEmbedTableFilterProgramsProglist")
const materialEmbedTableFilterProgramsProglistSearchCancel = materialEmbedTableFilterProgramsProglist.querySelector("#materialEmbedTableFilterProgramsProglistSearchCancel")
const materialEmbedTableFilterProgramsProglistSearch = materialEmbedTableFilterProgramsProglist.querySelector("#materialEmbedTableFilterProgramsProglistSearch")
const materialEmbedTableFilterProgramsProglistSearchErase = materialEmbedTableFilterProgramsProglist.querySelector("#materialEmbedTableFilterProgramsProglistSearchErase")
const materialEmbedTableFilterProgramsPhaselist = materialsEmbedModal.querySelector("#materialEmbedTableFilterProgramsPhaselist")
const materialEmbedTableFilterProgramsPhaselistSearchCancel = materialEmbedTableFilterProgramsPhaselist.querySelector("#materialEmbedTableFilterProgramsPhaselistSearchCancel")
const materialEmbedTableFilterProgramsPhaselistSearch = materialEmbedTableFilterProgramsPhaselist.querySelector("#materialEmbedTableFilterProgramsPhaselistSearch")
const materialEmbedTableFilterProgramsPhaselistSearchErase = materialEmbedTableFilterProgramsPhaselist.querySelector("#materialEmbedTableFilterProgramsPhaselistSearchErase")
const materialEmbedTableFilterProgramsLessonslist = materialsEmbedModal.querySelector("#materialEmbedTableFilterProgramsLessonslist")
const materialEmbedTableFilterProgramsLessonlistSearchCancel = materialEmbedTableFilterProgramsLessonslist.querySelector("#materialEmbedTableFilterProgramsLessonlistSearchCancel")
const materialEmbedTableFilterProgramsLessonlistSearch = materialEmbedTableFilterProgramsLessonslist.querySelector("#materialEmbedTableFilterProgramsLessonlistSearch")
const materialEmbedTableFilterProgramsLessonlistSearchErase = materialEmbedTableFilterProgramsLessonslist.querySelector("#materialEmbedTableFilterProgramsLessonlistSearchErase")
let materialsEmbedFilterProgramsSelectedProgsArray = []
let materialsEmbedFilterProgramsSelectedPhasesArray = []
let materialsEmbedFilterProgramsSelectedLessonsArray = []


//Table
const materialsEmbedModalTableBody = materialsEmbedModal.querySelector("#MaterialsEmbedModalTableBody")
const materialsEmbedTableSelectAll = materialsEmbedModal.querySelector("#materialsEmbedTableSelectAll")
let materialsEmbedSelectedArray = []

//Buttons
const materialsEmbedModalAddButton = materialsEmbedModal.querySelector("#MaterialsEmbedModalAddButton")
const materialsEmbedModalCloseButton = materialsEmbedModal.querySelector("#MaterialsEmbedModalCloseButton")
const materialsEmbedShowAllButton = materialsEmbedModal.querySelector("#materialsEmbedShowAllButton")
const materialEmbedTableFilterResetAll = materialsEmbedModal.querySelector("#materialEmbedTableFilterResetAll")
const materialEmbedTableEraseAll = materialsEmbedModal.querySelector("#materialEmbedTableEraseAll")

materialsEmbedMain()