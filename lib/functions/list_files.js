const fs = require('fs')
const path = require('path')

/**
 * @name list_files
 * @description Dá acesso a leitura dos diretórios e lista os arquivos e diretórios de uma pasta
 * @params {
 *    "folder": {
 *          "type": "string",
 *          "description": "O caminho da pasta a ser listada"
 *    }
 * }
 * @required ["folder"]
 */
const listFilesFunction = (params) => {
    if (!params.folder) {
        return {ok: false, message: 'Parâmetro "folder" não informado'}
    }

    if (!fs.existsSync(params.folder)) {
        return {ok: false, message: `Pasta "${params.folder}" não encontrada`}
    }

    try {
        let fileList = []

        const listFiles = (folder) => {
            fileList.push(folder)

            fs.readdirSync(folder).forEach(file => {
                const fullPath = path.join(folder, file);
                if (fs.statSync(fullPath).isDirectory()) {
                    const pathContents = listFiles(fullPath);
                    if (pathContents && pathContents.length > 0) {
                        fileList = fileList.concat(pathContents);
                    }
                } else {
                    fileList.push(fullPath);
                }
            });
        }

        listFiles(params.folder)

        return fileList
    } catch (err) {
        console.error('Erro ao ler a pasta:', err);
    }
}

module.exports = listFilesFunction;