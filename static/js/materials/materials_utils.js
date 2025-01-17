function materialsGetTableElementCategory(categories){
    const tdCategory = document.createElement("td")
    let categoryHTML = ''
    categories.forEach(category => {
        categoryHTML += `${category.name}<br>`
    })
    tdCategory.innerHTML = categoryHTML
    return tdCategory
}

function materialsGetTableElementLevel(levels){
    const tdLevel = document.createElement("td")
    let levelHTML = ''
    levels.forEach(level => {
        levelHTML += `${level.name}<br>`
    })
    tdLevel.innerHTML = levelHTML
    return tdLevel
}

function materialsGetType(fileName){
    const splittedName = fileName.split('.')
    const format = splittedName[splittedName.length - 1].toLowerCase()
    if (mediaFormats.imageFormats.includes(format)){
        return 'Изображение'
    } else if (mediaFormats.videoFormats.includes(format)) {
        return 'Видео'
    } else if (mediaFormats.animationFormats.includes(format)) {
        return 'Анимация'
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

async function materialsSetCollapsePreview(matID, element){
    materialsAPIGet(matID).then(async request => {
        switch (request.status) {
            case 200:
                const matType = materialsGetType(request.response.file)
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
                    case "Изображение":
                        element.innerHTML = `<a href="${request.response.file}"><img src="${request.response.file}" class="img-fluid" alt="Изображение" style="max-height: 150px;"></a>`
                        break
                    case "Анимация":
                        element.innerHTML = `<a href="${request.response.file}"><img src="${request.response.file}" class="img-fluid" alt="Изображение" style="max-height: 150px;"></a>`
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