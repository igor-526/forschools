function getUsersString(users = []){
    let usersHTML = []
    users.forEach(user => {
        usersHTML.push(`<a target="_blank" href="/profile/${user.id}">${user.first_name} ${user.last_name}</a>`)
    })
    return usersHTML.join("<br>")
}

function getUsernameFromFirstLastName(first_name="", last_name=""){
    let fnTranslit = null
    let lnTranslit = null
    let un = ""
    let unReady = ""
    if (last_name.trim() !== ""){
        lnTranslit = transliterate(last_name)
    }
    if (first_name.trim() !== ""){
        fnTranslit = transliterate(first_name)
    }
    if (fnTranslit && lnTranslit){
        un = `${fnTranslit[0]}.${lnTranslit}`
    } else {
        if (fnTranslit){
            un = fnTranslit
        }
        if (lnTranslit){
            un = lnTranslit
        }
    }
    for (let i = 0; i < un.length; i++) {
        if ((un.charCodeAt(i) >= 'a'.charCodeAt(0) && un.charCodeAt(i) <= 'z'.charCodeAt(0)) ||
            (un.charCodeAt(i) >= 'A'.charCodeAt(0) && un.charCodeAt(i) <= 'Z'.charCodeAt(0))) {
            unReady += un[i];
        } else if (un[i] === '.') {
            unReady += '.';
        }
    }
    return unReady
}