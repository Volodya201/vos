const { types } = require("./typesDetecter")

module.exports = new Map(
    Object.entries({
        const: {
            handler(whatHappening) {
                if (whatHappening.type) {
                    return false
                }

                whatHappening.type = "newVariable"
                whatHappening.constant = true
                whatHappening.next = types

                return true
            },
        },
        dynamic: {
            handler(whatHappening) {
                if (
                    whatHappening.type === "newVariable" ||
                    !whatHappening.type
                ) {
                    whatHappening.type = "newVariable"
                    whatHappening.variableType = "dynamic"
                    whatHappening.next = null
                    return true
                } else {
                    return false
                }
            },
        },

        number: {
            handler(whatHappening) {
                if (
                    whatHappening.type === "newVariable" ||
                    !whatHappening.type
                ) {
                    whatHappening.type = "newVariable"
                    whatHappening.variableType = "number"
                    whatHappening.next = null
                    return true
                } else {
                    return false
                }
            },
        },

        string: {
            handler(whatHappening) {
                if (
                    whatHappening.type === "newVariable" ||
                    !whatHappening.type
                ) {
                    whatHappening.type = "newVariable"
                    whatHappening.variableType = "string"
                    whatHappening.next = null
                    return true
                } else {
                    return false
                }
            },
        },

        boolean: {
            handler(whatHappening) {
                if (
                    whatHappening.type === "newVariable" ||
                    !whatHappening.type
                ) {
                    whatHappening.type = "newVariable"
                    whatHappening.variableType = "boolean"
                    whatHappening.next = null
                    return true
                } else {
                    return false
                }
            },
        },

        auto: {
            handler(whatHappening) {
                if (
                    whatHappening.type === "newVariable" ||
                    !whatHappening.type
                ) {
                    whatHappening.type = "newVariable"
                    whatHappening.variableType = "auto"
                    whatHappening.next = null
                    return true
                } else {
                    return false
                }
            },
        },

        "=": {
            handler(whatHappening) {
                return whatHappening.type === "newVariable"
            },
        },
    })
)
