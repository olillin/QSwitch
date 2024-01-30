var rules
chrome.storage.sync.get(values => {
    rules = values.rules ?? {}
    showRules()
})

const addButton = document.getElementById('add')
addButton?.addEventListener('click', addRule)
const saveButton = document.getElementById('save')
saveButton?.addEventListener('click', save)

function showRules() {
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
    rules[''] = ''
    showRules()
}

function removeRule(key) {
    parseRules()
    delete rules[key]
    showRules()
}

function save() {
    parseRules()
    showRules()
    chrome.storage.sync.set({
        rules: rules,
    })
    updateBackgroundScript()
    console.log('Saved!')
    saveButton.classList.add('saved')
    saveButton.innerHTML = 'Saved'
    setTimeout(() => {
        saveButton.classList.remove('saved')
        saveButton.innerHTML = 'Save'
    }, 1500)
}

function parseRules() {
    const newRules = {}
    const rulesUl = document.getElementById('rulesList')
    Array.from(rulesUl.childNodes).forEach(li => {
        let {pattern, template} = parseLi(li)
        newRules[pattern] = template
    })
    rules = newRules
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
    chrome.runtime.sendMessage({action: 'updateRules'})
}