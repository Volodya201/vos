const { types } = require("./typesDetecter")

module.exports = new Map(
    Object.entries({
        newVariable: {
            handler(word, whatHappening) {
                if (types.indexOf(whatHappening.previous) !== -1) {
                    if (!namingRegex.test(word)) {
                        return false
                    }

                    whatHappening.variableName = word

                    return true
                } else {
                    return false
                }
            },
        },
    })
)

const namingRegex = /^[a-zA-Z,_,]+$/
