const fs = require('fs')

/**
 * @name write_contents_to_file
 * @description Dá acesso à escrita de arquivos. Escreve o conteúdo no arquivo indicado.
 * @params {
 *    "filename": {
 *      "type": "string",
 *      "description": "Caminho completo do arquivo"
 *    },
 *    "contents": {
 *      "type": "string",
 *      "description": "Conteúdo a ser escrito no arquivo"
 *    }
 * }
 * @required ["filename", "contents"]
 */
const writeContentsToFile = ({filename, contents}) => {
    const err = fs.writeFileSync(filename, contents, function (err) {
        return err
    })
    return { ok: !err, err }
}

module.exports = writeContentsToFile