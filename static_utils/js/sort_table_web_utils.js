function sortButtonListener(button, variable){
    switch (variable){
        case null:
            button.classList.add("btn-primary")
            button.classList.remove("btn-outline-secondary")
            button.innerHTML = '<i class="bi bi-chevron-down"></i>'
            return "asc"
        case "asc":
            button.classList.add("btn-primary")
            button.classList.remove("btn-outline-secondary")
            button.innerHTML = '<i class="bi bi-chevron-up"></i>'
            return "desc"
        case "desc":
            button.classList.remove("btn-primary")
            button.classList.add("btn-outline-secondary")
            button.innerHTML = '<i class="bi bi-chevron-bar-expand"></i>'
            return null
        default:
            button.classList.remove("btn-primary")
            button.classList.add("btn-outline-secondary")
            button.innerHTML = '<i class="bi bi-chevron-bar-expand"></i>'
            return null
    }
}