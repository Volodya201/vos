const path = require("node:path")
const fs = require("node:fs")

const Lexer = require("./lexer")
const Parser = require("./parser.js")

let processLogs = false
if (process.argv[3] === "true") {
    processLogs = true
}

try {
    const vosFile = process.argv[2]
    let vosFilePath = vosFile
    if (!path.isAbsolute(vosFilePath)) {
        path.join(__dirname, vosFile)
    }

    const code = fs.readFileSync(vosFilePath, "utf-8")

    const lexer = new Lexer(code)
    const tokens = lexer.tokenize()

    processPrint("-------------------------------------\n")
    processPrint(tokens)
    processPrint("\n-------------------------------------\n")

    const parser = new Parser(tokens, true, require("./builtIns"))

    const variables = parser.parse()

    processPrint("\n-------------------------------------\n")

    processPrint(variables)

    processPrint("Parsing complete")

    processPrint("\n-------------------------------------")

    function processPrint(log) {
        if (!processLogs) return
        console.log(log)
    }
} catch (error) {
    if (processLogs) {
        console.error("❌ ", error)
    } else {
        console.error("❌ " + error.message)
    }

    exit()
}

function exit() {
    // Exist to not start infinite loop accidentally 👍
    console.log("🛑 Exit for safe")
    process.exit()
}
