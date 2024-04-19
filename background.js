var rules = {}
function updateRules() {
    chrome.storage.sync.get(values => {
        rules = values.rules
        console.log('Updated rules')
        console.log(rules)
    })
}
updateRules()
chrome.runtime.onMessage.addListener((req, sender) => {
    if (req.action === 'updateRules') {
        updateRules()
    }
})

chrome.action.onClicked.addListener((tab) => {
    const url = tab.url
    console.log('url:', url)
    for (const [pattern, { template }] of Object.entries(rules)) {
        console.log(pattern)
        const regex = new RegExp(pattern + '$')
        if (regex.test(url)) {
            let newUrl = urlFromTemplate(url, regex, template)
            console.log('newUrl:' + newUrl)
            chrome.tabs.update(undefined, { url: newUrl })
            break
        }
    }
})


function urlFromTemplate(url, pattern, template) {
    const parameters = url.match(pattern)
    const templateMatches = Array.from(template.matchAll(/(?<!\\)\$(\d+)/g))
    console.log(parameters)
    let newUrl = ''
    if (templateMatches.length > 0) {
        let i = 0
        templateMatches.forEach(match => {
            let parameterIndex = parseInt(match[1])
            template.substr(i, match.index) + parameters[parameterIndex]
            newUrl += template.substr(i, match.index - i) + parameters[parameterIndex]
            i = match.index + match[0].length
        })
    } else {
        newUrl = template
    }
    // Remove backslash from escaped template parameters
    newUrl = newUrl.replace(/\\(?=\$\d+)/g, '')

    return newUrl
}

// chrome.declarativeContent.onPageChanged.addRules([{
//     'action': (tab) => {
//     console.log('Tab changed:' + tab)
// }}])