function getHashValue(key) {
    const matches = location.hash.match(new RegExp(key + '=([^&]*)'))
    return matches ? matches[1] : null
}