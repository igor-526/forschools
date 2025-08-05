function mobileTemplateEngine(){
    mobileContent.style.marginTop = `${startMobileTitleBlockHeight}px`
    mobileContent.style.marginBottom = `${mobileNavbar.clientHeight}px`

    window.addEventListener("scroll", function () {
        if (window.scrollY <= startMobileTitleBlockHeight && mobileTitleBlock.clientHeight >= 60){
            const new_size = startMobileTitleBlockHeight - window.scrollY
            mobileTitleBlock.style.height = `${new_size < 60 ? 60 : new_size}px`
        }
        if (mobileTitleBlock.clientHeight > 60){
            const new_bc = 225 + (1 - ((startMobileTitleBlockHeight - 60 - window.scrollY) / (startMobileTitleBlockHeight - 50))) * 30
            document.body.style.backgroundColor = `rgba(${new_bc}, ${new_bc}, ${new_bc})`
            mobileTitleBlock.style.backgroundColor = `rgba(${new_bc}, ${new_bc}, ${new_bc})`
        }
        if (mobileNavbarActiveButton){
            mobileNavbarActiveButton.src = window.scrollY === 0 ? mobileNavbarActiveButtonSrc : "/static/icons/up_white.svg"
        }
    })

    mobileNavbarLessonsButton.addEventListener("click", function () {
        if (mobileNavbarLessonsButton.classList.contains("active") && window.scrollY > 0){
            window.scrollTo(0, 0)
        } else {
            location.assign("/lessons")
        }
    })
    mobileNavbarHomeworkButton.addEventListener("click", function () {
        if (mobileNavbarHomeworkButton.classList.contains("active") && window.scrollY > 0){
            window.scrollTo(0, 0)
        } else {
            location.assign("/homeworks")
        }
    })
    mobileNavbarChatButton.addEventListener("click", function () {
        if (mobileNavbarChatButton.classList.contains("active") && window.scrollY > 0){
            window.scrollTo(0, 0)
        } else {
            location.assign("/messages")
        }
    })

    mobileTemplateEngineSetDropdownMenu()
}

function mobileTemplateEngineSetDropdownMenu(){
    function logout(){
        location.assign("/logout")
    }

    function schedule(){
        location.assign("/lessons/schedule/")
    }

    function setDropdownElement(name="", listenerFunction = null){
        const a = document.createElement("a")
        a.innerHTML = name
        a.href = "#"
        a.classList.add("mobile-nav-dropdown-element")
        mobileNavbarDropdown.insertAdjacentElement("beforeend", a)
        if (listenerFunction){
            a.addEventListener("click", (e) => {
                e.preventDefault()
                listenerFunction()
            })
        }
    }

    mobileNavbarMenuButton.addEventListener("click", function () {
        if (mobileNavbarDropdown.classList.contains("d-none")){
            mobileNavbarDropdown.classList.add("d-block")
            mobileNavbarDropdown.classList.remove("d-none")
        } else {
            mobileNavbarDropdown.classList.remove("d-block")
            mobileNavbarDropdown.classList.add("d-none")
        }
    })
    window.addEventListener("click", (e) => {
        if (!e.target.matches('.mobile-nav-dropdown-element')){
            if (mobileNavbarDropdown.classList.contains("d-block")){
                mobileNavbarDropdown.classList.remove("d-block")
                mobileNavbarDropdown.classList.add("d-none")
            }
        }
    })

    setDropdownElement('<i class="bi bi-box-arrow-left me-2"></i>Выход', logout)
    setDropdownElement('<i class="bi bi-border-width"></i>Расписание', schedule)
}

const mobileTitleBlock = document.querySelector("#mobileTitle")
const mobileContent = document.querySelector("#mobileContent")
const mobileNavbar = document.querySelector("#mobileNavbar")
const mobileNavbarActiveButton = document.querySelector("#mobileNavbarActiveButton")
const mobileNavbarActiveButtonSrc = mobileNavbarActiveButton ? mobileNavbarActiveButton.src : null
const startMobileTitleBlockHeight = mobileTitleBlock.clientHeight
const mobileNavbarLessonsButton = document.querySelector("#mobileNavbarLessonsButton")
const mobileNavbarHomeworkButton = document.querySelector("#mobileNavbarHomeworkButton")
const mobileNavbarChatButton = document.querySelector("#mobileNavbarChatButton")
const mobileNavbarMenuButton = document.querySelector("#mobileNavbarMenuButton")
const mobileNavbarDropdown = document.querySelector("#mobileNavbarDropdown")
const mobileTitleH = document.querySelector("#mobileTitleH")

mobileTemplateEngine()