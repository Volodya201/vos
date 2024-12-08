const path = require("node:path")
const fs = require("node:fs")
const colors = require("colors/safe")

const keywordsHandlers = require("./keywordsHandlers")
const customWordsHandlers = require("./customWordsHandlers")
const specialHandlers = require("./specialHandlers")
const { isNumber, isString, isBoolean } = require("./typesDetecter")

let isPrintsAllowed = false
if (process.argv[3] === "true") {
    isPrintsAllowed = true
}

const vosFile = process.argv[2]
let vosFilePath = vosFile
if (!path.isAbsolute(vosFilePath)) {
    path.join(__dirname, vosFile)
}
const code = fs.readFileSync(vosFilePath, "utf-8")

const memory = new Map()

let whatHappening = {}

const codeLines = code.split("\n")

for (let index = 0; index < codeLines.length; index++) {
    const codeLine = codeLines[index]

    const words = codeLine.split(" ")

    for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
        const word = words[wordIndex]

        print(word)
        // print("number: " + isNumber(word.trim()))
        // print("string: " + isString(word.trim()))
        // print("boolean: " + isBoolean(word.trim()))

        const fixedWord = deleteRandomSymbols(word)

        if (
            isNumber(fixedWord) ||
            isString(fixedWord) ||
            isBoolean(fixedWord)
        ) {
            const specialHandler = specialHandlers.get(whatHappening.type)
            if (specialHandler) {
                const result = specialHandler.handler(fixedWord, whatHappening)
                if (!result) showError(`Failed on type - ${word}`, index + 1)
            }
            print(whatHappening)
            continue
        }

        if (whatHappening.next) {
            if (whatHappening.next.indexOf(word) === -1) {
                showError(`${word} is not allowed to be there`, index + 1)
            }
        }

        const keywordsHandler = keywordsHandlers.get(word)
        if (keywordsHandler) {
            const result = keywordsHandler.handler(whatHappening)
            if (!result) showError("Failed", index + 1)
        } else {
            const customWordsHandler = customWordsHandlers.get(
                whatHappening.type
            )
            if (customWordsHandler) {
                const result = customWordsHandler.handler(word, whatHappening)
                if (!result) showError("Failed on custom word", index + 1)
            }
        }

        whatHappening.previous = word

        // print(word)
        print(whatHappening)
    }

    if (whatHappening.type === "newVariable") {
        memory.set(whatHappening.variableName, {
            type: whatHappening.variableType,
            constant: whatHappening.constant,
            name: whatHappening.variableName,
            value: whatHappening.variableValue,
        })
    }

    whatHappening = {}
    print(memory)
}

// TODO: Improve this
function showError(message, line) {
    let errorMessage = "\n" + message.trim()

    if (line) {
        errorMessage += " in line " + line
    }

    errorMessage += "\n"

    console.error(colors.bold(colors.red(errorMessage)))
    process.exit()
}

function deleteRandomSymbols(word) {
    const symbols = word.trim().split("")
    let result = ""
    for (const symbol of symbols) {
        result += symbol
    }
    return result
}

function print(text) {
    if (isPrintsAllowed) {
        console.log(text)
    }
}
