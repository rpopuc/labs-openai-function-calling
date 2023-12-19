const Agent = require('@/lib/Agent')
const FunctionLoader = require('@/lib/FunctionLoader')
const Debug = require('@/lib/Debug')
const fs = require('fs')
const path = require('path')

class Processor {

    constructor(functionsPath) {
        this.functionsPath = functionsPath;
    }

    appendFunctions(agent) {
        const functionLoader = new FunctionLoader()
        const functions = functionLoader.loadFromPath(this.functionsPath)
        functions.forEach(f => agent.addFunction(f.definition, f.callback))
    }

    async executeFromFile(scriptFile) {
        const script = JSON.parse(fs.readFileSync(scriptFile, 'utf8'))
        return this.execute(script)
    }

    copyDirectory(src, dest) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }

        let entries = fs.readdirSync(src, { withFileTypes: true });

        for (let entry of entries) {
            let srcPath = path.join(src, entry.name);
            let destPath = path.join(dest, entry.name);

            entry.isDirectory() ? this.copyDirectory(srcPath, destPath) : fs.copyFileSync(srcPath, destPath);
        }
    }

    async execute(script) {
        if (fs.existsSync(script.workspacePath)) {
            fs.rmSync(script.workspacePath, { recursive: true })
        }
        fs.mkdirSync(script.workspacePath, { recursive: true })

        const resourcePath = script.resourcePath
        if (resourcePath) {
            this.copyDirectory(resourcePath, script.workspacePath)
        }

        const agent = new Agent()
        this.appendFunctions(agent)
        agent.addMessage(script.system, 'system')
        while (script.messages.length > 0) {
            const message = script.messages.shift()
            await agent.ask(message)
        }
    }
}

module.exports = Processor;