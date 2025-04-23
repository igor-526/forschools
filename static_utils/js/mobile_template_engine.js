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

}

const mobileTitleBlock = document.querySelector("#mobileTitle")
const mobileContent = document.querySelector("#mobileContent")
const mobileNavbar = document.querySelector("#mobileNavbar")
const mobileNavbarActiveButton = document.querySelector("#mobileNavbarActiveButton")
const mobileNavbarActiveButtonSrc = mobileNavbarActiveButton.src
const startMobileTitleBlockHeight = mobileTitleBlock.clientHeight
const mobileNavbarLessonsButton = document.querySelector("#mobileNavbarLessonsButton")
const mobileNavbarHomeworkButton = document.querySelector("#mobileNavbarHomeworkButton")
const mobileTitleH = document.querySelector("#mobileTitleH")

mobileTemplateEngine()