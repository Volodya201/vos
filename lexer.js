class Lexer {
    constructor(code) {
        this.code = code
        this.position = 0
        this.tokens = []
        this.operators = [
            // ! Multi-character first
            "=",
            "+",
            "-",
            "*",
            "/",
            "(",
            ")",
            "{",
            "}",
            ",",
        ]

        this.keywords = ["fun"]

        this.nwords = ["singer", "digger", "trigger", "nokia"]
    }

    tokenize() {
        while (this.position < this.code.length) {
            const char = this.code[this.position]

            // Skip whitespace
            if (/\s/.test(char)) {
                this.position++
                continue
            }

            // Check for multi-character operators first
            const twoChar = this.code.substr(this.position, 2)
            if (this.operators.includes(twoChar)) {
                this.tokens.push({ type: "operator", value: twoChar })
                this.position += 2
                continue
            }

            // Check for single-character operators
            if (this.operators.includes(char)) {
                this.tokens.push({ type: "operator", value: char })
                this.position++
                continue
            }

            // Handle numbers
            if (/\d/.test(char)) {
                this.tokenizeNumber()
                continue
            }

            // Handle strings
            if (char === '"' || char === "'") {
                this.tokenizeString()
                continue
            }

            // Handle booleans
            if (char === "t" || char === "f") {
                if (this.tryTokenizeBoolean()) continue
            }

            if (char.match(/[a-z]/i)) {
                if (this.tryTokenizeKeyword()) continue
            }

            // Handle identifier
            // ! Always put in the end
            if (char.match(/[a-z]/i)) {
                this.tokenizeIdentifier()
                continue
            }

            // If we get here, it's an unrecognized character
            throw new Error(
                `Unexpected character '${char}' at position ${this.position}`
            )
        }

        this.tokens.push({
            type: "eof",
            value: "EOF",
        })

        return this.tokens
    }

    tokenizeNumber() {
        let value = ""
        let isFloat = false

        while (this.position < this.code.length) {
            const char = this.code[this.position]
            if (/\d/.test(char) || (char === "." && !isFloat)) {
                if (char === ".") isFloat = true
                value += char
                this.position++
            } else {
                break
            }
        }

        this.tokens.push({
            type: "number",
            value: isFloat ? parseFloat(value) : parseInt(value, 10),
        })
    }

    tokenizeString() {
        const quote = this.code[this.position]
        let value = ""
        this.position++ // skip opening quote

        while (
            this.position < this.code.length &&
            this.code[this.position] !== quote
        ) {
            value += this.code[this.position]
            this.position++
        }

        if (this.position >= this.code.length) {
            throw new Error("Unterminated string literal")
        }

        this.position++ // skip closing quote

        this.tokens.push({
            type: "string",
            value: value,
        })
    }

    tryTokenizeBoolean() {
        if (this.code.slice(this.position, this.position + 4) === "true") {
            this.tokens.push({
                type: "boolean",
                value: true,
            })
            this.position += 4
            return true
        } else if (
            this.code.slice(this.position, this.position + 5) === "false"
        ) {
            this.tokens.push({
                type: "boolean",
                value: false,
            })
            this.position += 5
            return true
        }
        return false
    }

    tryTokenizeKeyword() {
        for (const keyword of this.keywords) {
            const length = keyword.length

            if (
                this.code.slice(this.position, this.position + length) ===
                keyword
            ) {
                this.tokens.push({
                    type: "keyword",
                    value: keyword,
                })
                this.position += length
                return true
            }
        }
        return false
    }

    tokenizeIdentifier() {
        let identifier = this.code[this.position]
        this.position++

        while (
            this.position < this.code.length &&
            this.code[this.position].match(/[a-z]/i)
        ) {
            identifier += this.code[this.position]
            this.position++
        }

        this.tokens.push({
            type: "identifier",
            value: identifier,
        })
    }
}

module.exports = Lexer
