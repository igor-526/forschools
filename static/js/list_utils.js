function getListElement(name=null, value= null){
    const li = document.createElement("li")
    li.classList.add("list-group-item")
    li.innerHTML = `<b>${name}:</b> ${value}`
    return li
}