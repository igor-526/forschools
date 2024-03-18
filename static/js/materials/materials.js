async function main(){
    if (!userPermissions.includes("material.see_all_general")){
        materialsTabGeneral.classList.remove("active")
        materialsTabGeneral.classList.add("disabled")
        materialsTabMy.classList.add("active")
        await getMaterials(1)
    } else {
        materialsTabGeneral.addEventListener('click', function () {
            getMaterials(2)
            this.classList.add('active')
            materialsTabMy.classList.remove('active')
        })
        await getMaterials(2)
    }

    materialsTabMy.addEventListener('click', function () {
        getMaterials(1)
        this.classList.add('active')
        materialsTabGeneral.classList.remove('active')
    })


    formMaterialNewFileField.addEventListener('change', function () {
        const filename = formMaterialNewFileField.value.split(/([\\./])/g)
        formMaterialNewNameField.value = filename[filename.length-3]
    })
    formMaterialNewSubmitButton.addEventListener('click', createMaterial)
}

async function getMaterials(type=2){
    let response = await fetch(`/api/v1/materials?type=${type}`)
    if (response.status === 200) {
        material_set = await response.json()
        showMaterials()
        await set_category()
    } else {
        showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
    }
}

function getMaterialType(format){
    format = format.toLowerCase()
    if (imageFormats.includes(format)){
        return 'Изображение'
    }
    if (videoFormats.includes(format)){
        return 'Видео'
    }
    if (archiveFormats.includes(format)){
        return 'Архив'
    }
    switch (format) {
        case 'gif':
            return 'Анимация'
        case 'pdf':
            return 'Документ PDF'
        default:
            return ''
    }
}

function showMaterials(list = material_set){
    tableBody.innerHTML = ''
    list.map(function (material) {
        let categoryHTML = ''
        material.category.map(function (category) {
            if (category.name === material.category[0].name){
                categoryHTML += `${category.name}`
            } else {
                categoryHTML += `<br>${category.name}`
            }
        })
        const splittedFile = material.file.split('.')
        tableBody.insertAdjacentHTML("beforeend", `
        <tr data-material-id="${material.id}">
            <td style="max-width: 300px;"><a href="/materials/${material.id}" style="color: #003366; text-decoration: none;"> ${material.name}</a></td>
            <td>${categoryHTML}</td>
            <td>${getMaterialType(splittedFile[splittedFile.length - 1])}</td>
            <td>${material.owner.first_name} ${material.owner.last_name}</td>
            <td>
                <a href="${material.file}" download=""><button type="button" class="btn btn-primary" id="TableButtonDownload">
                    <i class="fa-solid fa-download"></i></button></a>
                <button type="button" class="btn btn-primary" id="TableButtonTelegram" data-material-id="${material.id}">
                    <i class="fa-brands fa-telegram"></i></button>
            </td>
        </tr>`)
    })
    const tableButtonTelegram = tableBody.querySelectorAll("#TableButtonTelegram")
    tableButtonTelegram.forEach(button => {
        button.addEventListener('click', function () {
            bsModalTelegram.show()
            materialsTelegramMain()
        })
    })
}

async function set_category(){
    formMaterialNewCategorySelect.innerHTML = '<option value="new">Новая категория</option>'
    materialsCollapseSearchCategory.innerHTML = '<option selected value="none">Категория</option>'
    formMaterialNewCategorySelect.addEventListener('change', function () {
        if (formMaterialNewCategorySelect.value === 'new'){
            formMaterialNewCategoryField.classList.remove('d-none')
        } else {
            formMaterialNewCategoryField.classList.add('d-none')
        }
    })
    const response = await fetch('/api/v1/materials/category')
    await response.json().then(json => {json.map(function (category) {
        formMaterialNewCategorySelect.innerHTML += `<option value="${category.name}">${category.name}</option>`
        materialsCollapseSearchCategory.innerHTML += `<option value="${category.id}">${category.name}</option>`
    })})
}

//Bootstrap Elements
const bsOffcanvasNewMaterial = new bootstrap
    .Offcanvas(document.querySelector("#offcanvasNewMaterial"))

//Tabs
const materialsTabGeneral = document.querySelector("#MaterialsTabGeneral")
const materialsTabMy = document.querySelector("#MaterialsTabMy")

//Table
const tableBody = document.querySelector("#MaterialTableBody")

const imageFormats = ['bmp', 'jpg', 'jpeg', 'png']
const videoFormats = ['webm', 'mkv', 'avi', 'mov', 'wmv', 'mp4', 'm4p', 'mpg', 'mpeg', 'm4v']
const archiveFormats = ['rar', 'zip', '7z']

let material_set = []
main()