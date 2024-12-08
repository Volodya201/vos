function isNumber(word) {
    return /^\d+$/.test(word)
}

function isString(word) {
    return /^".+"$/.test(word)
}

function isBoolean(word) {
    return /^(true|false)$/.test(word)
}

module.exports = {
    isNumber,
    isString,
    isBoolean,
    types: ["dynamic", "number", "string", "boolean", "auto"],
}
