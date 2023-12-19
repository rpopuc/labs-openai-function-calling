const fs = require('fs')

/**
 * @name get_file_contents
 * @description Dá acesso à leitura do conteúdo de um arquivo. Obtém o conteúdo do arquivo indicado.
 * @params {
 *    "filename": {
 *        "type": "string",
 *        "description": "Caminho completo do arquivo"
 *    }
 * }
 * @required ["filename"]
 */
const getFileContentsFunction = (params) => {
    // Verifica se o arquivo existe
    if (!fs.existsSync(params.filename)) {
        Debug.dump('Arquivo inexistente: ' + params.filename)
        return 'O arquivo não existe'
    }

    try {
        return fs.readFileSync(params.filename, 'utf8')
    } catch (err) {
        console.error('Erro ao ler o arquivo:', err);
    }
}

module.exports = getFileContentsFunction;