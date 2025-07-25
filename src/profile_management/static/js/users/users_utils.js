class userUtils {
    data = null
    offcanvas = null
    page = null
    desktopTableElement = null

    constructor(data) {
        this.data = data
    }

    showOffcanvas(resetData = false) {
        if (!this.offcanvas) {
            this.offcanvas = new offcanvasEngine()
        }
        this.offcanvas.header = `<a target="_blank" href="/profile/${this.data.id}/" 
        class="btn btn-sm btn-primary me-2">
        <i class="bi bi-globe"></i></a>Профиль`
        this.offcanvas.addData("", this._getProfileMainInfoContent())
        this.offcanvas.addData("Действия", this._getActionsContent())
        if (!this.offcanvas.offcanvasElement.classList.contains("showing")) {
            this.offcanvas.show()
        }
        if (resetData) {
            this.resetContent()
        }
    }

    generateOnPage(contentBody) {
        this.contentBody = contentBody
        this.page = new pageEngine(this.contentBody)
        this.page.addData("Основные данные", this._getMainInfoContent())
    }

    getAdminTableElement() {
        const tr = document.createElement("tr")
        if (!this.data.is_active){
            tr.classList.add("table-danger")
        }
        const tdId = document.createElement("td")
        const tdIdA = document.createElement("a")
        tdId.insertAdjacentElement("beforeend", tdIdA)
        tdIdA.innerHTML = this.data.id
        tdIdA.innerHTML += this.data.tg?' <i class="bi bi-telegram" style="color: #1A01CC"></i>':' <i class="bi bi-telegram" style="color: grey"></i>'
        tdIdA.href = "#"
        tdIdA.addEventListener("click", () => {
            usersAdminTelegramSet(this.data.id)
        })
        const tdUsername = document.createElement("td")
        tdUsername.innerHTML = this.data.username
        const tdName = document.createElement("td")
        tdName.innerHTML = `${this.data.last_name} ${this.data.first_name}${this.data.patronymic?" "+this.data.patronymic:""}`
        const tdRole = document.createElement("td")
        const roles = this.getRoles()
        tdRole.innerHTML = roles.str
        const tdActivity = document.createElement("td")
        switch (this.data.last_activity_type){
            case 0:
                tdActivity.innerHTML = '<i class="bi bi-telegram me-1"></i>'
                break
            case 1:
                tdActivity.innerHTML = '<i class="bi bi-globe2 me-1"></i>'
                break
            case 2:
                tdActivity.innerHTML = '<i class="bi bi-person-plus me-1"></i>'
                break
        }
        tdActivity.insertAdjacentHTML("beforeend", timeUtilsDateTimeToStr(this.data.last_activity))

        tr.addEventListener("click", (e) => {
            if (!e.target.matches('a') && !e.target.matches('i')){
                this.showOffcanvas(true)
            }
        })

        tr.insertAdjacentElement("beforeend", tdId)
        tr.insertAdjacentElement("beforeend", tdUsername)
        tr.insertAdjacentElement("beforeend", tdName)
        tr.insertAdjacentElement("beforeend", tdRole)
        tr.insertAdjacentElement("beforeend", tdActivity)
        return tr
    }

    resetContent(newData = null) {
        if (newData) {
            this.data = newData
            if (this.offcanvas) {
                this.offcanvas.resetContent()
                this.showOffcanvas(false)
            }
            if (this.page) {
                this.page.resetContent()
                this.generateOnPage(this.contentBody)
            }
            if (this.desktopTableElement) {
                this.desktopTableElement.replaceWith(this.getAdminTableElement())
            }
        } else {
            usersAPIGetUser(this.data.id).then(request => {
                switch (request.status) {
                    case 200:
                        this.data = request.response
                        if (this.offcanvas) {
                            this.offcanvas.resetContent()
                            this.showOffcanvas()
                        }
                        if (this.page) {
                            this.page.resetContent()
                            this.generateOnPage(this.contentBody)
                        }
                        if (this.desktopTableElement) {
                            this.desktopTableElement.replaceWith(this.getAdminTableElement())
                        }
                        break
                    default:
                        const toast = new toastEngine()
                        toast.setError()
                        toast.show()
                        break
                }
            })
        }
    }

    getRoles(){
        let ruRoles = []
        let learninginfo = null
        this.data.groups.forEach(role => {
            switch (role.name){
                case "Listener":
                    ruRoles.push("Ученик")
                    learninginfo = "Listener"
                    break
                case "Teacher":
                    ruRoles.push("Преподаватель")
                    learninginfo = "Teacher"
                    break
                case "Metodist":
                    ruRoles.push("Методист")
                    break
                case "Curator":
                    ruRoles.push("Куратор")
                    break
                case "Admin":
                    ruRoles.push("Администратор")
                    break
            }
        })
        return {
            "str": ruRoles.join("<br>"),
            "learninginfo": learninginfo
        }
    }

    _getProfileMainInfoContent(){
        console.log(this.data)
        const elements = []

        if (this.data.hasOwnProperty("photo") && this.data.photo){
            const photoDiv = document.createElement("div")
            const photoDivImg = document.createElement("img")
            photoDiv.classList.add("w-100", "text-center", "mb-2")
            photoDiv.style.height = "150px"
            photoDiv.insertAdjacentElement("beforeend", photoDivImg)
            photoDivImg.src = this.data.photo
            photoDivImg.style.objectFit = "cover"
            photoDivImg.style.height = "100%"
            photoDivImg.style.width = "150px"
            photoDivImg.style.borderRadius = "75px"
            elements.push(photoDiv)
        }

        const fullNameSpanDiv = document.createElement("div")
        fullNameSpanDiv.classList.add("w-100", "text-center")
        const fullNameSpan = document.createElement("span")
        fullNameSpan.style.color = "grey"
        fullNameSpan.style.fontWeight = "600"
        fullNameSpan.style.fontSize = "24px"
        if (this.data.hasOwnProperty("last_name") && this.data.last_name){
            fullNameSpan.insertAdjacentHTML("beforeend", this.data.last_name)
        }
        if (this.data.hasOwnProperty("first_name") && this.data.first_name){
            fullNameSpan.insertAdjacentHTML("beforeend", ` ${this.data.first_name}`)
        }
        if (this.data.hasOwnProperty("patronymic") && this.data.patronymic){
            fullNameSpan.insertAdjacentHTML("beforeend", ` ${this.data.patronymic}`)
        }
        fullNameSpanDiv.insertAdjacentElement("beforeend", fullNameSpan)
        elements.push(fullNameSpanDiv)


        return elements
    }

    _getActionsContent(){
        const buttons = []

        const editButton = document.createElement("button")
        editButton.classList.add("btn", "btn-primary", "w-100", "mb-2")
        editButton.innerHTML = 'Редактировать профиль'
        editButton.addEventListener("click", () => {
            usersEditSetOffcanvas(this.data.id)
            this.offcanvas.close()
        })
        buttons.push(editButton)

        const welcomeUrlButton = document.createElement("button")
        welcomeUrlButton.classList.add("btn", "btn-primary", "w-100", "mb-2")
        welcomeUrlButton.innerHTML = 'Пригласительная ссылка'
        welcomeUrlButton.addEventListener("click", () => {
            this._setWelcomeUrlModal()
        })
        buttons.push(welcomeUrlButton)

        return buttons
    }

    _getWelcomeUrlModalContent(welcomeUrlData){
        function copyButtonEffect(button){
            button.classList.remove("btn-primary")
            button.classList.add("btn-success")
            setTimeout(() => {
                button.classList.add("btn-primary")
                button.classList.remove("btn-success")
            }, 500)
        }

        const urlDiv = document.createElement("div")
        urlDiv.innerHTML = `<b>Ссылка:</b> <a href="/${location.host}${welcomeUrlData.url}">https://${location.host}${welcomeUrlData.url}</a>`
        const expiresDiv = document.createElement("div")
        expiresDiv.innerHTML = `<b>Действует до:</b> ${timeUtilsDateTimeToStr(welcomeUrlData.expires)}`

        const buttonsDiv = document.createElement("div")
        const copyUrlButton = document.createElement("button")
        copyUrlButton.classList.add("btn", "btn-primary", "mb-2", "w-100")
        copyUrlButton.innerHTML = "<i class='bi bi-copy me-1'></i>Скопировать ссылку"
        copyUrlButton.type = "button"
        copyUrlButton.addEventListener("click", () => {
            navigator.clipboard.writeText(`https://${location.host}${welcomeUrlData.url}`)
            copyButtonEffect(copyUrlButton)
        })
        const copyInviteButton = document.createElement("button")
        copyInviteButton.classList.add("btn", "btn-primary", "mb-2", "w-100")
        copyInviteButton.innerHTML = "<i class='bi bi-copy me-1'></i>Скопировать приглашение"
        copyInviteButton.type = "button"
        copyInviteButton.addEventListener("click", () => {
            navigator.clipboard.writeText(`Приглашаем вас подключиться в нашу платформу-бот для оптимальной организации образовательного процесса и отслеживания прогресса ученика. Перейдите по ссылке и прочитайте инструкцию:
https://${location.host}${welcomeUrlData.url}`)
            copyButtonEffect(copyInviteButton)
        })
        buttonsDiv.insertAdjacentElement("beforeend", copyUrlButton)
        buttonsDiv.insertAdjacentElement("beforeend", copyInviteButton)


        return {content: [urlDiv, expiresDiv, buttonsDiv], buttons: []}
    }

    _setWelcomeUrlModal(){
        console.log("a")
        const usersAPI = new UsersAPI(this.data.id)
        usersAPI.getWelcomeUrl().then(request => {
            const toast = new toastEngine()
            switch (request.status){
                case 200:
                    const welcomeUrlModal = new modalEngine()
                    welcomeUrlModal.title = "Пригласительная ссылка"
                    welcomeUrlModal.setClasses(["modal-lg"])
                    const content = this._getWelcomeUrlModalContent(request.response)
                    welcomeUrlModal.addContent(content.content)
                    welcomeUrlModal.addButtons(content.buttons)
                    welcomeUrlModal.show()
                    break
                case 403:
                    toast.setError("Нет прав для приглашения пользователя")
                    toast.show()
                    break
                case 404:
                    toast.setError("Пользователь не найден")
                    toast.show()
                    break
                default:
                    toast.setError()
                    toast.show()
            }
        })
    }
}