const fd = new FormData()
fd.set("redirect_url", window.location.href)
console.log(tgUserdata)
if (tgUserdata.user){
    fd.set("tg_id", tgUserdata.user.id)
}
console.log(tgUserdata)
fetch('/ma/login/', {
    method: 'POST',
    credentials: 'same-origin',
    body: fd
}).then(request => {
    if (request.status === 302) {
        setTimeout(function () {
                    request.json().then(url => window.location.assign(url))
        }, 5000)
    }
})