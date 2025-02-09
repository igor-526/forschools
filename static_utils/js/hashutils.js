function getHashValue(key, loc=null) {
    if (!loc){
        loc = location.hash
    }
    const matches = loc.match(new RegExp(key + '=([^&]*)'))
    return matches ? matches[1] : null
}