const Parser = require('@postlight/parser')
const TurndownService = require('turndown')

/**
 * @name get_contents_from_url
 * @description Dá acesso à leitura do conteúdo de páginas na Web. Obtém o conteúdo da url indicada.
 * @params {
 *    "url": {
 *        "type": "string",
 *        "description": "url a ser acessada"
 *    }
 * }
 * @required ["url"]
 */
const getContentsFromUrlFunction = async (params) => {
    try {
        const service = new TurndownService()
        service.addRule('remove_links', {
            filter: 'a',
            replacement: function (content) {
                return content
            }
        })
        const response = await Parser.parse(params.url)
        response.markdown = service.turndown(response.content)
        return {
            author: response.author,
            title: response.title,
            content: response.markdown.substring(0, 5000)
        }
    } catch (error) {
        return {ok: false, error}
    }
}

module.exports = getContentsFromUrlFunction;