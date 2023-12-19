const dotenv = require('dotenv');
const OpenAI = require('openai');
const Debug = require('./lib/Debug');

dotenv.config();

// Callbacks
const listFiles = (params) => {
    console.log('Function listFiles was called', {params})
    const folder = params.folder || '/home'
    return [
        `${folder}/.`,
        `${folder}/...`,
        `${folder}}/README.md`,
    ]
}

const getFileContents = (params) => {
    console.log('Function getFileContents was called', {params})
    return `This is the content of the ${params.file}.`
}

// Main function
const askToOpenAI = (openai, messages, tools, functions) => {
    return openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        // model: 'gpt-4',
        temperature: 0,
        max_tokens: 1000,
        tool_choice: "auto", // auto is default, but we'll be explicit
        messages,
        tools,
    }).then(async response => {
        const message = response.choices[0].message

        if (message.content) {
            messages.push({ content: message.content, role: message.role })
        }

        if (message.function_call) {
            messages.push({
                content: `call function: ${message.function_call.name}(${message.function_call.arguments})`,
                role: message.role
            })

            const callback = functions.find(f => f.name === message.function_call.name)
            const response = await callback(JSON.parse(message.function_call.arguments))
            messages.push({ content: response, role: 'user' })
            return askToOpenAI(openai, messages, tools, functions)
        }

        if (message.tool_calls) {
            messages.push(message)

            const toolCalls = message.tool_calls;
            for (const toolCall of toolCalls) {
                Debug.dump(toolCall)

                const functionName = toolCall.function.name;
                const functionToCall = functions.find(f => f.name === toolCall.function.name).callback
                const functionArgs = JSON.parse(toolCall.function.arguments);
                const functionResponse = await functionToCall(functionArgs);

                const newMessage = {
                    tool_call_id: toolCall.id,
                    role: "tool",
                    name: functionName,
                    content: typeof functionResponse == 'object' ? JSON.stringify(functionResponse) : functionResponse
                }
                messages.push(newMessage);

                Debug.dump(newMessage)
                return askToOpenAI(openai, messages, tools, functions)
            }

            messages.push({
                content: `call function: ${message.function_call.name}(${message.function_call.arguments})`,
                role: message.role
            })
            const callback = functions.find(f => f.name === message.function_call.name)
            const response = await callback(JSON.parse(message.function_call.arguments))
            messages.push({ content: response, role: 'user' })
            return askToOpenAI(openai, messages, tools, functions)
        }

        return messages[messages.length - 1].content
    }).catch(error => console.log(error));
}

// Function descriptions
const tools = [
    {
        type: 'function',
        function: {
            name: "listFiles",
            description: "List files in a folder",
            parameters: {
                type: 'object',
                properties: {
                    folder: {
                        type: 'string',
                        description: 'O caminho da pasta a ser listada'
                    }
                }
            },
            required: ['folder']
        }
    },
    {
        type: 'function',
        function: {
            name: "getFileContents",
            description: "Get file contents",
            parameters: {
                type: 'object',
                properties: {
                    file: {
                        type: 'string',
                        description: 'O caminho do arquivo a ser lido'
                    }
                }
            },
            required: ['file']
        }
    }
];


// Functions callback mapping
const functions = [
    { name: 'listFiles', callback: listFiles },
    { name: 'getFileContents', callback: getFileContents },
]

// OpenAI object
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// System message
const messages = [
    {
        content: "Você é um assistente virutal. Utilize as funções disponíveis para reponder da melhor maneira possível. Não é necessário pedir permissão para usar as funções, utilize-as livremente.",
        role: "system"
    },
]

// Chat interaction
messages.push({
    content: "Qual o conteúdo da pasta /home/?",
    role: 'user'
})
askToOpenAI(openai, messages, tools, functions).then(() => {
    messages.push({
        content: "E qual o conteúdo do arquivo /home/REAME.md?",
        role: 'user'
    })
    askToOpenAI(openai, messages, tools, functions)
})
