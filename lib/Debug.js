class Debug {

    static dd(...args) {
        const stack = new Error().stack
        const caller = stack.split('\n')[2]
        const line = caller.split(':')[1]
        const file = caller.split(':')[0].split('/').pop()
        console.log(`\n[Debug.dd] ${file}:${line}`)
        console.log(...args)
        process.exit(0)
    }

    static dump(...args) {
        const stack = new Error().stack
        const caller = stack.split('\n')[2]
        const line = caller.split(':')[1]
        const file = caller.split(':')[0].split('/').pop()
        console.log(`\n[Debug.dump] ${file}:${line}`)
        console.log(...args)
    }
}

module.exports = Debug;