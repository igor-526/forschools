function chatShowMessagesGetAttachmentsElement(attachments = [], mobile=false){
    let images = []
    let audios = []
    let videos = []
    let files = []
    attachments.forEach(file => {
        console.log(file)
        switch (file.type){
            case "image_formats":
                const cardImg = document.createElement("div")
                const cardHeaderImg = document.createElement("div")
                const cardBodyImg = document.createElement("div")
                cardImg.classList.add("card", mobile? "col-9" : "col-5", "mb-3", "mx-1")
                cardHeaderImg.classList.add("card-header")
                cardHeaderImg.innerHTML = "Изображение"
                cardBodyImg.classList.add("card-body")
                const img = document.createElement("img")
                img.src = file.path
                img.alt = "Вложение"
                img.style = "object-fit: contain;"
                img.classList.add("img-fluid")
                const a = document.createElement("a")
                a.href = mobile ? "#" : file.path
                a.target = "_blank"
                a.insertAdjacentElement("beforeend", img)
                if (mobile){
                    cardImg.addEventListener("click", function (e){
                        e.preventDefault()
                        materialImageModalMobile(file.path)
                    })
                }
                cardBodyImg.insertAdjacentElement("beforeend", a)
                cardImg.insertAdjacentElement("beforeend", cardHeaderImg)
                cardImg.insertAdjacentElement("beforeend", cardBodyImg)
                if (file.caption){
                    const cardBodyImgCaption = document.createElement("span")
                    cardBodyImgCaption.innerHTML = file.caption
                    cardBodyImg.insertAdjacentElement("beforeend", cardBodyImgCaption)
                }
                images.push(cardImg)
                break
            case "animation_formats":
                const cardAnim = document.createElement("div")
                const cardHeaderAnim = document.createElement("div")
                const cardBodyAnim = document.createElement("div")
                cardAnim.classList.add("card", mobile? "col-9" : "col-5", "mb-3", "mx-1")
                cardHeaderAnim.classList.add("card-header")
                cardHeaderAnim.innerHTML = "Анимация"
                cardBodyAnim.classList.add("card-body")
                const aAnim = document.createElement("a")
                aAnim.href = mobile ? "#" : file.path
                aAnim.target = "_blank"
                if (mobile){
                    cardAnim.addEventListener("click", function (e){
                        e.preventDefault()
                        materialImageModalMobile(file.path)
                    })
                }
                const imgAnim = document.createElement("img")
                imgAnim.src = file.path
                imgAnim.alt = "Вложение"
                imgAnim.style = "object-fit: contain;"
                imgAnim.classList.add("img-fluid")
                cardAnim.insertAdjacentElement("beforeend", cardHeaderAnim)
                cardAnim.insertAdjacentElement("beforeend", cardBodyAnim)
                cardBodyAnim.insertAdjacentElement("beforeend", aAnim)
                aAnim.insertAdjacentElement("beforeend", imgAnim)
                if (file.caption){
                    const cardBodyAnimCaption = document.createElement("span")
                    cardBodyAnimCaption.innerHTML = file.caption
                    cardBodyAnim.insertAdjacentElement("beforeend", cardBodyAnimCaption)
                }
                images.push(cardAnim)
                break
            case "voice_formats" || "audio_formats":
                const cardAud = document.createElement("div")
                const cardHeaderAud = document.createElement("div")
                const cardBodyAud = document.createElement("div")
                cardAud.classList.add("card", "mb-3")
                cardHeaderAud.classList.add("card-header")
                cardHeaderAud.innerHTML = "Аудио"
                cardBodyAud.classList.add("card-body")
                const audio = document.createElement("audio")
                audio.controls = true
                audio.src = file.path
                cardAud.insertAdjacentElement("beforeend", cardHeaderAud)
                cardAud.insertAdjacentElement("beforeend", cardBodyAud)
                cardBodyAud.insertAdjacentElement("beforeend", audio)
                if (file.caption){
                    const cardBodyAudCaption = document.createElement("span")
                    cardBodyAudCaption.innerHTML = file.caption
                    cardBodyAud.insertAdjacentElement("beforeend", cardBodyAudCaption)
                }
                audios.push(cardAud)
                break
            case "video_formats":
                const cardVideo = document.createElement("div")
                const cardHeaderVideo = document.createElement("div")
                const cardBodyVideo = document.createElement("div")
                cardVideo.classList.add("card", "mb-3", mobile? "col-9" : "col-5", "mx-1")
                cardHeaderVideo.classList.add("card-header")
                cardHeaderVideo.innerHTML = "Видео"
                cardBodyVideo.classList.add("card-body")
                const video = document.createElement("video")
                video.controls = true
                video.src = file.path
                video.classList.add("img-fluid")
                cardVideo.insertAdjacentElement("beforeend", cardHeaderVideo)
                cardVideo.insertAdjacentElement("beforeend", cardBodyVideo)
                cardBodyVideo.insertAdjacentElement("beforeend", video)
                if (file.caption){
                    const cardBodyVideoCaption = document.createElement("span")
                    cardBodyVideoCaption.innerHTML = file.caption
                    cardBodyVideo.insertAdjacentElement("beforeend", cardBodyVideoCaption)
                }
                videos.push(cardVideo)
                break
            case "unsupported":
                break
            default:
                const card = document.createElement("div")
                card.classList.add("card", "mb-3")
                const cardHeader = document.createElement("div")
                const cardBody = document.createElement("div")
                cardHeader.classList.add("card-header")
                cardHeader.innerHTML = file.name
                cardBody.classList.add("card-body")
                const downloadButton = document.createElement("button")
                const downloadButtonA = document.createElement("a")
                downloadButtonA.href = file.path
                downloadButtonA.target = "_blank"
                downloadButton.type = "button"
                downloadButton.classList.add("btn", "btn-primary", "me-3")
                downloadButton.innerHTML = '<i class="bi bi-download"></i> Скачать'
                downloadButtonA.insertAdjacentElement("beforeend", downloadButton)
                cardBody.insertAdjacentElement("beforeend", downloadButtonA)
                card.insertAdjacentElement("beforeend", cardHeader)
                card.insertAdjacentElement("beforeend", cardBody)

                if (file.caption){
                    const cardBodyCaption = document.createElement("span")
                    cardBodyCaption.innerHTML = file.caption
                    cardBody.insertAdjacentElement("beforeend", cardBodyCaption)
                }

                files.push(card)
                break
        }
    })
    const attAll = document.createElement("div")
    const attImg = document.createElement("div")
    const attAud = document.createElement("div")
    attImg.classList.add("row")
    attAud.classList.add("row")
    attAll.classList.add("px-3")
    attAll.insertAdjacentElement("beforeend", attImg)
    attAll.insertAdjacentElement("beforeend", attAud)
    images.forEach(img => {
        attImg.insertAdjacentElement("beforeend", img)
    })
    videos.forEach(vid => {
        attImg.insertAdjacentElement("beforeend", vid)
    })
    audios.forEach(aud => {
        attAud.insertAdjacentElement("beforeend", aud)
    })
    files.forEach(file => {
        attAud.insertAdjacentElement("beforeend", file)
    })
    return attAll
}