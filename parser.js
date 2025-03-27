const PRECEDENCE = {
    "*": 4,
    "/": 4,
    "+": 3,
    "-": 3,
    "=": 2,
}

class Parser {
    constructor(tokens, toplevel, builtInVariables = new Map()) {
        this.tokens = tokens
        this.toplevel = toplevel
        this.position = 0
        this.variables = new Map(builtInVariables)
    }

    parse() {
        while (!this.isAtEnd()) {
            this.parseStatement()
        }
        return this.variables
    }

    parseStatement() {
        if (this.match("identifier")) {
            if (this.check("operator") && this.peek().value === "(") {
                this.parseFunctionCall()
            } else {
                this.parseAssignment()
            }
        } else if (this.fullMatch("keyword", "fun")) {
            this.parseFunctionInit()
        } else {
            throw this.error(`Expected variable assignment or function call`)
        }
    }

    parseFunctionCall() {
        const functionName = this.previous().value
        const func = this.variables.get(functionName)

        if (!func || func.type !== "function") {
            throw this.error(`${functionName} is not a function`)
        }

        this.consume("operator", "Expected '(' after function name")

        const params = []
        while (!this.check("operator") || this.peek().value !== ")") {
            if (this.isAtEnd()) {
                throw this.error("Unclosed function call, expected ')'")
            }

            const paramValue = this.parseExpression()
            params.push(this.evaluateExpression(paramValue))

            if (this.check("operator") && this.peek().value === ",") {
                this.advance()
            } else if (!(this.check("operator") && this.peek().value === ")")) {
                throw this.error("Expected ',' or ')' after parameter")
            }
        }

        this.consume("operator", "Expected ')' after function call")

        if (func.builtin && func.nativeCallback) {
            return func.nativeCallback(...params)
        } else if (!func.builtin && func.body) {
            func.body.push({ type: "eof", value: "EOF" })
            const funcVariables = new Map(this.variables)

            for (let i = 0; i < func.params.length; i++) {
                const paramName = func.params[i]
                const paramValue = params[i]
                funcVariables.set(paramName, {
                    value: paramValue,
                    type:
                        typeof paramValue === "number"
                            ? "number"
                            : typeof paramValue === "string"
                            ? "string"
                            : typeof paramValue === "boolean"
                            ? "boolean"
                            : "undefined",
                    builtin: false,
                })
            }

            const parser = new Parser(func.body, false, funcVariables)
            parser.parse()
        } else {
            this.error("Failed to execute function")
        }
    }

    parseFunctionInit() {
        if (!this.match("identifier")) {
            throw this.error("Expected function name after 'fun'")
        }
        const functionName = this.previous().value

        const params = []
        this.consume("operator", "Expected '(' after function name")

        if (!(this.check("operator") && this.peek().value === ")")) {
            while (true) {
                if (this.match("identifier")) {
                    params.push(this.previous().value)

                    if (this.check("operator") && this.peek().value === ",") {
                        this.advance()
                        continue
                    }
                    if (this.check("operator") && this.peek().value === ")") {
                        break
                    }
                    throw this.error("Expected ',' or ')' after parameter")
                } else {
                    throw this.error("Expected parameter name")
                }
            }
        }

        this.consume("operator", "Expected ')' after parameters")
        this.consume("operator", "Expected '{' before function body")

        const bodyTokens = []
        let braceCount = 1

        while (braceCount > 0 && !this.isAtEnd()) {
            const token = this.advance()
            if (token.type === "operator" && token.value === "{") {
                braceCount++
            } else if (token.type === "operator" && token.value === "}") {
                braceCount--
            }
            if (braceCount > 0) {
                bodyTokens.push(token)
            }
        }

        if (braceCount !== 0) {
            throw this.error("Unclosed function body")
        }

        this.variables.set(functionName, {
            type: "function",
            value: functionName,
            builtin: false,
            params: params,
            body: bodyTokens,
        })
    }

    parseAssignment() {
        const identifier = this.previous().value

        if (!this.match("operator") || this.previous().value !== "=") {
            throw this.error(`Expected = after variable name`)
        }

        const expr = this.parseExpression()
        const value = this.evaluateExpression(expr)

        if (this.variables.get(identifier)?.builtin) {
            throw this.error(
                `Cannot reassign built-in variable '${identifier}'`
            )
        }

        this.variables.set(identifier, {
            value: value,
            type:
                typeof value === "number"
                    ? "number"
                    : typeof value === "string"
                    ? "string"
                    : typeof value === "boolean"
                    ? "boolean"
                    : "undefined",
            builtin: false,
        })
    }

    parseExpression() {
        return this.parseBinaryExpression(0)
    }

    parseBinaryExpression(minPrecedence) {
        let left = this.parsePrimaryExpression()

        while (true) {
            const operator = this.peek()
            if (
                operator.type !== "operator" ||
                !(operator.value in PRECEDENCE) ||
                PRECEDENCE[operator.value] < minPrecedence
            ) {
                break
            }

            const precedence = PRECEDENCE[operator.value]
            this.advance()

            const right = this.parseBinaryExpression(precedence + 1)

            left = {
                type: "binary",
                operator: operator.value,
                left,
                right,
            }
        }

        return left
    }

    parsePrimaryExpression() {
        if (this.match("number")) {
            return { type: "number", value: this.previous().value }
        }
        if (this.match("string")) {
            return { type: "string", value: this.previous().value }
        }
        if (this.match("boolean")) {
            return { type: "boolean", value: this.previous().value }
        }
        if (this.match("identifier")) {
            const varName = this.previous().value
            if (!this.variables.has(varName)) {
                throw this.error(`Undefined variable: ${varName}`)
            }
            const varValue = this.variables.get(varName)
            return { type: varValue.type, value: varValue.value }
        }
        if (this.match("operator") && this.previous().value === "(") {
            const expr = this.parseExpression()
            this.consume("operator", ")")
            return expr
        }
        throw this.error("Expected primary expression")
    }

    evaluateExpression(expr) {
        switch (expr.type) {
            case "number":
            case "string":
            case "boolean":
                return expr.value
            case "binary":
                const left = this.evaluateExpression(expr.left)
                const right = this.evaluateExpression(expr.right)
                switch (expr.operator) {
                    case "+":
                        // String concatenation when either operand is a string
                        if (
                            typeof left === "string" ||
                            typeof right === "string"
                        ) {
                            return String(left) + String(right)
                        }
                        return left + right
                    case "-":
                        return left - right
                    case "*":
                        return left * right
                    case "/":
                        return left / right
                    default:
                        throw this.error(`Unknown operator: ${expr.operator}`)
                }
            default:
                throw this.error(`Unknown expression type: ${expr.type}`)
        }
    }

    // Helper methods
    consume(type, message) {
        if (
            this.check(type) && this.peek().value === message.includes("(")
                ? "("
                : ")"
        ) {
            return this.advance()
        }
        throw this.error(message)
    }

    error(message) {
        const token = this.peek()
        return new Error(
            `${message} at position ${this.position}. Current token is ${token.value} (${token.type})`
        )
    }

    match(type) {
        if (this.check(type)) {
            this.advance()
            return true
        }
        return false
    }

    fullMatch(type, value) {
        if (this.fullCheck(type, value)) {
            this.advance()
            return true
        }
        return false
    }

    check(type) {
        if (this.isAtEnd()) return false
        return this.peek().type === type
    }

    fullCheck(type, value) {
        if (this.isAtEnd()) return false
        const token = this.peek()
        return token.type === type && token.value === value
    }

    advance() {
        if (!this.isAtEnd()) this.position++
        return this.previous()
    }

    peek() {
        return this.tokens[this.position]
    }

    previous() {
        return this.tokens[this.position - 1]
    }

    isAtEnd() {
        return this.peek().type === "eof"
    }
}

module.exports = Parser
