const translitTable = {
    "а": "a",
    "б": "b",
    "в": "v",
    "г": "g",
    "д": "d",
    "е": "e",
    "ё": "e",
    "ж": "j",
    "з": "z",
    "и": "i",
    "й": "y",
    "к": "k",
    "л": "l",
    "м": "m",
    "н": "n",
    "о": "o",
    "п": "p",
    "р": "r",
    "с": "s",
    "т": "t",
    "у": "u",
    "ф": "f",
    "х": "h",
    "ц": "c",
    "ч": "ch",
    "ш": "sh",
    "щ": "sch",
    "ъ": "",
    "ы": "y",
    "ь": "",
    "э": "e",
    "ю": "yu",
    "я": "ya",
}

const passwordChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

function transliterate(text) {
    let transliteration = ""
    const preparedText = text.trim().toLowerCase()
    for (let i = 0; i < preparedText.length; i++) {
        let charCode = preparedText.charCodeAt(i)
        if (charCode >= 1040 && charCode <= 1103) {
            transliteration += translitTable[preparedText[i]]
        } else {
            transliteration += preparedText[i];
        }
    }
    return transliteration
}

function generatePassword(length) {
  let password = ''
  for (let i = 0; i < length; i++) {
    password += passwordChars.charAt(Math.floor(Math.random() * passwordChars.length));
  }
  return password
}