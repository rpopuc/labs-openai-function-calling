const Debug = require('@/lib/Debug');
const { OpenAI } = require("openai");

class Agent {

    constructor() {
        this.messages = []
        this.functions = []
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    addMessage(content, role = 'user') {
        Debug.dump({content, role})
        this.messages.push({ role, content })
    }

    addFunction(definition, callback) {
        this.functions.push({ definition: {type: "function", 'function': definition }, callback })
    }

    getFunctionDefinitions() {
        return this.functions.map(functionDefinition => functionDefinition.definition)
    }

    getFunctionDeclarations() {
        return this.functions.map(functionDefinition => '- ' + functionDefinition.definition.function.name + ': ' + functionDefinition.definition.function.description).join("\n")
    }

    getCallback(name) {
        return this.functions.find(functionDefinition => functionDefinition.definition.function.name == name).callback
    }

    async ask(question = null) {

        if (question != null) {
            this.addMessage(question, 'user')
        }

        return this.openai.chat.completions.create({
            // model: "gpt-3.5-turbo",
            // model: "gpt-3.5-turbo-0613",
            model: 'gpt-4',
            temperature: 0,
            max_tokens: 1000,
            // stop: [" H:", " AI:"],
            messages: this.messages,
            tools: this.getFunctionDefinitions(),
            tool_choice: "auto", // auto is default, but we'll be explicit
        }).then(async response => {
            const message = response.choices[0].message

            if (message.content) {
                this.addMessage(message.content, message.role)
            }

            if (message.function_call) {
                this.addMessage('call function: ' + message.function_call.name + '(' + message.function_call.arguments + ')' , message.role)
                const callback = this.getCallback(message.function_call.name)
                const response = await callback(JSON.parse(message.function_call.arguments))
                return this.ask(response)
            }

            if (message.tool_calls) {
                this.messages.push(message)
                const toolCalls = message.tool_calls;
                for (const toolCall of toolCalls) {

                    Debug.dump(toolCall)

                    const functionName = toolCall.function.name;
                    const functionToCall = this.getCallback(functionName)
                    const functionArgs = JSON.parse(toolCall.function.arguments);
                    const functionResponse = await functionToCall(functionArgs);

                    const newMessage = {
                        tool_call_id: toolCall.id,
                        role: "tool",
                        name: functionName,
                        content: typeof functionResponse == 'object' ? JSON.stringify(functionResponse) : functionResponse
                    }
                    this.messages.push(newMessage);

                    Debug.dump(newMessage)
                    return this.ask()
                }
                this.addMessage('call function: ' + message.function_call.name + '(' + message.function_call.arguments + ')' , message.role)
                const callback = this.getCallback(message.function_call.name)
                const response = await callback(JSON.parse(message.function_call.arguments))
                return this.ask(response)
            }

            return this.getLastMessage()
        }).catch(error => console.log(error));
    }

    getLastMessage() {
        return this.messages[this.messages.length - 1].content
    }
}

module.exports = Agent