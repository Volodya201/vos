const { isNumber, isString, isBoolean, types } = require("./typesDetecter")

module.exports = new Map(
    Object.entries({
        newVariable: {
            handler(word, whatHappening) {
                if (whatHappening.previous === "=") {
                    if (whatHappening.variableType === "auto") {
                        if (isNumber(word)) {
                            whatHappening.variableType = "number"
                        } else if (isString(word)) {
                            whatHappening.variableType = "string"
                        } else if (isBoolean(word)) {
                            whatHappening.variableType = "boolean"
                        }
                    } else if (
                        whatHappening.variableType === "number" &&
                        !isNumber(word)
                    ) {
                        return false
                    } else if (
                        whatHappening.variableType === "string" &&
                        !isString(word)
                    ) {
                        return false
                    } else if (
                        whatHappening.variableType === "boolean" &&
                        !isBoolean(word)
                    ) {
                        return false
                    }

                    whatHappening.variableValue = word
                    return true
                } else {
                    return false
                }
            },
        },
    })
)

const namingRegex = /^[a-zA-Z,_,]+$/
