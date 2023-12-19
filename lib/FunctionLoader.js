const fs = require('fs')
const path = require('path')
const Debug = require('./Debug')

class FunctionLoader {
    constructor() {
        this.functions = {}
    }

    loadFromPath(path) {
        this.functions = []

        const files = fs.readdirSync(path)
        files.forEach(file => {
            const filename = path + '/' + file
            const stat = fs.statSync(filename)
            if (stat.isDirectory()) {
                this.loadFromPath(filename)
            } else {
                this.functions.push(this.loadFromFile(filename))
            }
        })

        return this.functions
    }

    loadFromFile(filename) {
        const content = fs.readFileSync(filename, 'utf8')
        const jsdocRegex = /\/\*\*(.*?)\*\//sg
        const jsdocMatches = content.match(jsdocRegex)
        const jsdoc = jsdocMatches[0]
        const name = jsdoc.match(/@name\s+(.*)/)[1].trim()
        const description = jsdoc.match(/@description\s+(.*)/)[1].trim()
        const required = JSON.parse(jsdoc.match(/@required\s+(.*)/)[1].trim())
        const params = JSON.parse(jsdoc.match(/@params\s+(\{[\s\S]*?\*\s\})/)[1].replace(/\*/g, ' ').trim())

        // import file and get callback
        const callback = require(filename)

        return {
            definition: {
                name,
                description,
                parameters: {
                    type: "object",
                    properties: params,
                    required
                }
            },
            callback: require(filename)
        }
    }
}

module.exports = FunctionLoader;