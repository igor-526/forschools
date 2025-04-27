function iconUtilsGetIcon(src, alt="Иконка", height=20){
    const img = document.createElement("img")
    img.classList.add("me-1")
    img.src = `/static/icons/${src}`
    img.alt = alt
    img.style.height = `${height}px`
    return img
}
