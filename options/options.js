var options
chrome.storage.sync.get(values => {
    options = values ?? {}
    showRules()
})

const addButton = document.getElementById('add')
addButton?.addEventListener('click', addRule)
const saveButton = document.getElementById('save')
saveButton?.addEventListener('click', () => {
    parseRules()
    save()
    saveButton.classList.add('saved')
    saveButton.innerHTML = 'Saved'
    setTimeout(() => {
        saveButton.classList.remove('saved')
        saveButton.innerHTML = 'Save'
    }, 1500)
})

const exportDialog = document.getElementById('exportImport')
const showExport = document.getElementById('showExport')
showExport?.addEventListener('click', () => {
    exportDialog.style.display = 'block'
    parseRules()
    exportOptions()
})
const hideExport = document.getElementById('hideExport')
hideExport?.addEventListener('click', () => {
    exportDialog.style.display = 'none'
})

const exportButton = document.getElementById('export')
exportButton?.addEventListener('click', exportOptions)
const importButton = document.getElementById('import')
importButton?.addEventListener('click', importOptions)
const downloadButton = document.getElementById('download')
downloadButton?.addEventListener('click', downloadOptions)
const jsonInput = document.getElementById('json')

function showRules() {
    const rules = options.rules ?? {}
    console.log(rules)
    const rulesUl = document.getElementById('rulesList')
    rulesUl.innerHTML = ''
    Array.from(Object.entries(rules)).forEach(([pattern, { template, comment }]) => {
        const li = generateLi(pattern, template, comment)
        rulesUl.appendChild(li)
    })
}

function generateLi(pattern, template, comment) {
    const patternLabel = document.createElement('label')
    patternLabel.for = 'pattern'
    patternLabel.innerHTML = 'Pattern'
    const patternInput = document.createElement('input')
    patternInput.type = 'text'
    patternInput.className = 'pattern'
    patternInput.name = 'pattern'
    patternInput.value = pattern

    const templateLabel = document.createElement('label')
    templateLabel.for = 'template'
    templateLabel.innerHTML = 'Template'
    const templateInput = document.createElement('input')
    templateInput.type = 'text'
    templateInput.className = 'template'
    templateInput.name = 'template'
    templateInput.value = template

    const commentLabel = document.createElement('label')
    commentLabel.for = 'comment'
    commentLabel.innerHTML = 'Comment'
    const commentInput = document.createElement('input')
    commentInput.type = 'text'
    commentInput.className = 'comment'
    commentInput.name = 'comment'
    commentInput.value = comment ?? ''

    const removeButton = document.createElement('button')
    removeButton.className = 'remove'
    removeButton.addEventListener('click', () => removeRule(pattern))
    removeButton.innerHTML = 'x'

    const li = document.createElement('li')
    li.appendChild(patternLabel)
    li.appendChild(patternInput)
    li.appendChild(templateLabel)
    li.appendChild(templateInput)
    li.appendChild(commentLabel)
    li.appendChild(commentInput)
    li.appendChild(removeButton)
    return li
}

function addRule() {
    parseRules()
    options.rules[''] = ''
    showRules()
}

function removeRule(key) {
    parseRules()
    delete options.rules[key]
    showRules()
}

function save() {
    showRules()
    chrome.storage.sync.set({
        rules: options.rules,
    })
    updateBackgroundScript()
    console.log('Saved!')
}

function parseRules() {
    const newRules = {}
    const rulesUl = document.getElementById('rulesList')
    Array.from(rulesUl.childNodes).forEach(li => {
        let { pattern, template, comment } = parseLi(li)
        newRules[pattern] = {
            template: template,
            comment: comment,
        }
    })
    options.rules = newRules
}

function parseLi(li) {
    const pattern = li.querySelector('input.pattern').value
    const template = li.querySelector('input.template').value
    const comment = li.querySelector('input.comment').value
    return {
        pattern: pattern,
        template: template,
        comment: comment,
    }
}

function updateBackgroundScript() {
    chrome.runtime.sendMessage({ action: 'updateRules' })
}

function exportOptions() {
    jsonInput.value = JSON.stringify(options, null, 2)
}

function importOptions() {
    options = JSON.parse(jsonInput.value)
    save()
}

function downloadOptions(event) {
    // Create file
    const file = new File([jsonInput.value], 'qswitch-options.json', {
        type: 'application/json',
    })
    // Download file
    const link = document.createElement('a')
    const url = URL.createObjectURL(file)

    link.href = url
    link.download = file.name
    document.body.appendChild(link)
    link.click()

    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
}
