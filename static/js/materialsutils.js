function materialImageModalMobile(href, alt = "Изображение"){
    baseImageModalMAImage.src = href
    baseImageModalMAImage.alt = href
    bsBaseImageModalMA.show()
}

function materialToHTMLMobile(href=null, type=null) {
    function getCard(body=null) {
        const card = document.createElement("div")
        const cardBody = document.createElement("div")
        card.classList.add("card", "mb-3", "mx-1")
        cardBody.classList.add("card-body")
        card.insertAdjacentElement("beforeend", cardBody)
        if (body){
            cardBody.insertAdjacentElement("beforeend", body)
        }
        return card
    }

    function getImg(){
        const img = document.createElement("img")
        img.src = href
        img.alt = "Изображение"
        img.classList.add("img-fluid")
        img.addEventListener("click", function (){
            materialImageModalMobile(href)
        })
        return img
    }

    if (href && type) {
        switch (type) {
            case "image_formats":
                return getCard(getImg(href))
            case "animation_formats":
                return getCard(getImg(href))
            case "voice_formats":
                const voice = document.createElement("audio")
                voice.controls = true
                voice.src = href
                voice.style = "width: 100%;"
                return getCard(voice)
            case "audio_formats":
                const audio = document.createElement("audio")
                audio.controls = true
                audio.src = href
                return getCard(audio)
            case "video_formats":
                const video = document.createElement("video")
                video.controls = true
                video.src = href
                video.classList.add("img-fluid")
                return getCard(video)
            case "text_formats":
                const p = document.createElement("p")
                fetch(href).then(async request => {
                    if (request.status === 200) {
                        p.innerHTML = await request.text()
                    } else {
                        p.innerHTML = "Произошла ошибка при загрузке материала"
                    }
                })
                return getCard(p)
            case "unsupported":
                const uns = document.createElement("p")
                uns.innerHTML = "Материал не поддерживается"
                return getCard(uns)
        }
    }
}

const baseImageModalMA = document.querySelector("#baseImageModalMA")
const bsBaseImageModalMA = new bootstrap.Modal(baseImageModalMA)
const baseImageModalMAImage = baseImageModalMA.querySelector("#baseImageModalMAImage")