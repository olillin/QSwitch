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
    exportDialog.style.display = 'inherit'
    parseRules()
    exportOptions()
})
const hideExport = document.getElementById('hideExport')
hideExport?.addEventListener('click', () => {
    exportDialog.style.display = 'none'
})

const jsonInput = document.getElementById('json')
const exportButton = document.getElementById('export')
exportButton?.addEventListener('click', exportOptions)
const importButton = document.getElementById('import')
importButton?.addEventListener('click', importOptions)

function showRules() {
    const rules = options.rules ?? {}
    console.log(rules)
    const rulesUl = document.getElementById('rulesList')
    rulesUl.innerHTML = ''
    Array.from(Object.entries(rules)).forEach(([pattern, template]) => {
        const li = generateLi(pattern, template)
        rulesUl.appendChild(li)
    })
}

function generateLi(pattern, template) {
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

    const removeButton = document.createElement('button')
    removeButton.className = 'remove'
    removeButton.addEventListener('click', () => removeRule(pattern))
    removeButton.innerHTML = 'x'

    const li = document.createElement('li')
    li.appendChild(patternLabel)
    li.appendChild(patternInput)
    li.appendChild(templateLabel)
    li.appendChild(templateInput)
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
        let { pattern, template } = parseLi(li)
        newRules[pattern] = template
    })
    options.rules = newRules
}

function parseLi(li) {
    const pattern = li.querySelector('input.pattern').value
    const template = li.querySelector('input.template').value
    return {
        pattern: pattern,
        template: template,
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
