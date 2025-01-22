document.addEventListener('mousedown', function(event) {
        if (event.button === 2) {
            protectContentModal.show()
        }
    }
)
document.addEventListener('contextmenu', function(event) {
    event.preventDefault()
})
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.altKey && event.key === 'PrintScreen' ||
        event.key === 'Meta' && event.key === 'Shift') {
        protectContentModal.show()
    }
})


const protectContentModal = new bootstrap.Modal(document.querySelector("#protectContentModal"))