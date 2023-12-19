require('module-alias/register')
const path = require('path')
const Debug = require('@/lib/Debug')

const scriptFile = path.resolve(process.argv[2])
const Processor = require('@/lib/Processor')
const processor = new Processor(__dirname + '/lib/functions')
processor.executeFromFile(scriptFile)