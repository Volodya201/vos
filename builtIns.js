const builtIns = new Map()

builtIns.set("print", {
    type: "function",
    value: "print",
    builtin: true,
    nativeCallback: (text) => console.log(text !== undefined ? text : ""),
})

module.exports = builtIns
