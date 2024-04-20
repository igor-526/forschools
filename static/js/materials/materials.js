async function materialsMain(){
    if (see_general){
        materialsTabGeneral.addEventListener('click', function () {
            getMaterials(1)
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
}

async function getMaterials(type=2){
    const request = await materialsAPIGetAll(type)
    if (request.status === 200) {
        material_set = request.response
        showMaterials()
        await materialsSetCategories()
        await materialsSetLevels()
    } else {
        showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
    }
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

function materialsShowCategoryHTML(categories){
    let categoryHTML = ''
    categories.map(category => {
        categoryHTML += `${category.name}<br>`
    })
    return categoryHTML
}

function materialsShowLevelHTML(levels){
    let levelHTML = ''
    levels.map(level => {
        levelHTML += `${level.name}<br>`
    })
    return levelHTML
}

function showMaterials(list = material_set){
    tableBody.innerHTML = ''
    list.map(function (material) {
        const categoryHTML = materialsShowCategoryHTML(material.category)
        let levelHTML = materialsShowLevelHTML(material.level)
        const splittedFile = material.file.split('.')
        if (send_tg){
            tableBody.insertAdjacentHTML("beforeend", `
        <tr data-material-id="${material.id}">
            <td style="max-width: 300px;"><a href="/materials/${material.id}" style="color: #003366; text-decoration: none;"> ${material.name}</a></td>
            <td>${categoryHTML}</td>
            <td>${levelHTML}</td>
            <td>${getMaterialType(splittedFile[splittedFile.length - 1])}</td>
            <td><a href="/profile/${material.owner.id}">${material.owner.first_name} ${material.owner.last_name}</a></td>
            <td>
                <a href="${material.file}" download=""><button type="button" class="btn btn-primary" id="TableButtonDownload">
                    <i class="fa-solid fa-download"></i></button></a>
                <button type="button" class="btn btn-primary" id="TableButtonTelegram" data-material-id="${material.id}">
                    <i class="fa-brands fa-telegram"></i></button>
            </td>
        </tr>`)
            tableBody.querySelectorAll("#TableButtonTelegram")
                .forEach(button => {
                    button.addEventListener('click', function (material_item) {
                        material_id = this.attributes.getNamedItem("data-material-id").value
                        materialsTelegramMain()
                    })
                })
        } else {
            tableBody.insertAdjacentHTML("beforeend", `
        <tr data-material-id="${material.id}">
            <td style="max-width: 300px;"><a href="/materials/${material.id}" style="color: #003366; text-decoration: none;"> ${material.name}</a></td>
            <td>${categoryHTML}</td>
            <td>${levelHTML}</td>
            <td>${getMaterialType(splittedFile[splittedFile.length - 1])}</td>
            <td><a href="/profile/${material.owner.id}">${material.owner.first_name} ${material.owner.last_name}</a></td>
            <td>
                <a href="${material.file}" download=""><button type="button" class="btn btn-primary" id="TableButtonDownload">
                    <i class="fa-solid fa-download"></i></button></a>
            </td>
        </tr>`)
        }
    })
}

async function materialsSetCategories(){
    if (new_lvl_cat){
        formMaterialNewCategorySelect.innerHTML = '<option value="new">Новая категория</option>'
        formMaterialNewCategorySelect.addEventListener('change', function () {
            if (formMaterialNewCategorySelect.value === 'new'){
                formMaterialNewCategoryField.classList.remove('d-none')
            } else {
                formMaterialNewCategoryField.classList.add('d-none')
            }
        })
    } else {
        formMaterialNewCategorySelect.innerHTML = ''
    }
    materialsCollapseSearchCategory.innerHTML = '<option selected value="none">Категория</option>'

    const request = await collectionsGetMatCats()
    if (request.status === 200){
        request.response.map(category => {
            formMaterialNewCategorySelect.innerHTML += `<option value="${category.name}">${category.name}</option>`
            materialsCollapseSearchCategory.innerHTML += `<option value="${category.id}">${category.name}</option>`
        })
    }
}

async function materialsSetLevels(){
    if (new_lvl_cat){
        formMaterialNewLvlSelect.innerHTML = '<option value="new">Новый уровень</option>'
        formMaterialNewLvlSelect.addEventListener('change', function () {
            if (formMaterialNewLvlSelect.value === 'new'){
                formMaterialNewLvlNewInput.classList.remove('d-none')
            } else {
                formMaterialNewLvlNewInput.classList.add('d-none')
            }
        })
    } else {
        formMaterialNewLvlSelect.innerHTML = ''
    }
    materialsCollapseSearchLevel.innerHTML = '<option selected value="none">Уровень</option>'
    const request = await collectionsGetMatLevels()
    if (request.status === 200){
        request.response.map(level => {
            formMaterialNewLvlSelect.innerHTML += `<option value="${level.name}">${level.name}</option>`
            materialsCollapseSearchLevel.innerHTML += `<option value="${level.id}">${level.name}</option>`
        })
    }
}

//Tabs
const materialsTabGeneral = document.querySelector("#MaterialsTabGeneral")
const materialsTabMy = document.querySelector("#MaterialsTabMy")

//Table
const tableBody = document.querySelector("#MaterialTableBody")

let material_set = []
materialsMain()