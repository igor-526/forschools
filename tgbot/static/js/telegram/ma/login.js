const fd = new FormData()
fd.set("redirect_url", window.location.href)
if (tgUserdata.user){
    fd.set("tg_id", tgUserdata.user.id)
}
fetch('/ma/login/', {
    method: 'POST',
    credentials: 'same-origin',
    body: fd
}).then(request => {
    if (request.status === 302) {
        request.json().then(url => window.location.assign(url))
    }
})