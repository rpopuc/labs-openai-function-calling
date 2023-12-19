const fs = require('fs')

/**
 * @name make_dir
 * @description Cria uma pasta
 * @params {
 *    "folder": {
 *          "type": "string",
 *          "description": "O caminho da pasta a ser criado"
 *    }
 * }
 * @required ["folder"]
 */
const makeDirFunction = (params) => {
    if (!params.folder) {
        return {ok: false, message: 'Parâmetro "folder" não informado'}
    }

    if (fs.existsSync(params.folder)) {
        return {ok: false, message: `Pasta "${params.folder}" já existe`}
    }

    try {
        fs.mkdirSync(params.folder, { recursive: true })
        return {ok: true}
    } catch (err) {
        return {ok: false, err}
    }
}

module.exports = makeDirFunction;