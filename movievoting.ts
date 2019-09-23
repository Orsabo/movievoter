function getNodeId(name: string) {
    return document.getElementById(name)
}

function checkPart1Validity() {
    let movieList = getNodeId('movieList') as HTMLUListElement
    let nameList = getNodeId('nameList') as HTMLUListElement
    let voteCountInput = getNodeId('voteCountInput') as HTMLInputElement
    return nameList.children.length >= 2 && movieList.children.length >= 2 && voteCountInput.checkValidity()
}

function disablePart1SubmitIfInvalid() {
    let part1Submit = getNodeId('part1Submit') as HTMLButtonElement
    part1Submit.disabled = !checkPart1Validity()
}

function updateVoteCountInput() {
    let voteCountInput = getNodeId('voteCountInput') as HTMLInputElement
    let movieList = getNodeId('movieList') as HTMLUListElement
    let movieCount = movieList.children.length

    voteCountInput.max = String((movieCount > 1) ? movieCount - 1 : 1)
    if (+voteCountInput.value > +voteCountInput.max) {
        voteCountInput.value = voteCountInput.max
    }
}

function deleteFromList(event: MouseEvent) {
    let target = event.target as HTMLButtonElement
    let element = target.parentElement
    if (!element) {
        console.log('element is null aaaaa')
    }
    let list = element!.parentElement
    if (!list) {
        console.log('list is null aaaaa')
    }
    list!.removeChild(element!)
}

type StringOrHTMLElement = string | HTMLElement

function addElementsToList(list: HTMLUListElement, ...args: StringOrHTMLElement[]) {
    let li = document.createElement('li')
    for (let arg of args) {
        let foo
        if (typeof arg == 'string') {
            let str = arg.trim()
            if (!str.length) return
            foo = document.createTextNode(str)
        } else {
            foo = arg
        }
        li.appendChild(foo)
    }
    list.appendChild(li)
}

function movieSubmit() {
    let movieTextArea = getNodeId('movieTextArea') as HTMLTextAreaElement
    let movieList = document.getElementById('movieList') as HTMLUListElement

    for (let movieName of movieTextArea.value.trim().split('\n')) {
        let deleteButton = document.createElement('button')
        deleteButton.textContent = 'X'
        deleteButton.onclick = deleteFromList
        addElementsToList(movieList, deleteButton, movieName)
    }

    updateVoteCountInput()
    movieTextArea.value = ''
    movieTextArea.focus()
    disablePart1SubmitIfInvalid()
}

function nameSubmit() {
    let nameList = getNodeId('nameList') as HTMLUListElement
    let nameInput = getNodeId('nameInput') as HTMLInputElement

    let deleteButton = document.createElement('button')
    deleteButton.textContent = 'X'
    deleteButton.onclick = deleteFromList
    addElementsToList(nameList, deleteButton, nameInput.value)

    nameInput.value = ''
    disablePart1SubmitIfInvalid()
}

{
    let movieSubmitButton = getNodeId('movieSubmitButton') as HTMLButtonElement
    movieSubmitButton.onclick = movieSubmit
}

{
    let nameSubmitButton = getNodeId('nameSubmitButton') as HTMLButtonElement
    nameSubmitButton.onclick = nameSubmit
}

{
    let nameInput = getNodeId('nameInput') as HTMLInputElement
    nameInput.onkeypress = (keyboardEvent) => {
        if (keyboardEvent.key === 'Enter') {
            nameSubmit()
        }
    }
}

{
    let voteCountInput = document.getElementById('voteCountInput') as HTMLInputElement
    voteCountInput.oninput = disablePart1SubmitIfInvalid
}

let gVoteList: number[] = []
let gVotesLeft = 0

let gCurrentNameIndex = 0

let part1Submit = getNodeId('part1Submit') as HTMLButtonElement
part1Submit.onclick = () => {
    if (!checkPart1Validity()) return

    let part1 = getNodeId('part1') as HTMLSpanElement
    let part2 = getNodeId('part2') as HTMLSpanElement
    part1.hidden = true
    part2.hidden = false

    let movieList = getNodeId('movieList') as HTMLUListElement
    let nameList = getNodeId('nameList') as HTMLUListElement

    // setting up part 2
    let currentName = getNodeId('currentName') as HTMLHeadingElement
    currentName.textContent = nameList.children[gCurrentNameIndex].textContent

    let checkboxList = getNodeId('checkboxList') as HTMLUListElement
    while (checkboxList.firstChild) {
        checkboxList.removeChild(checkboxList.firstChild)
    }

    for (let i = 0; i < movieList.children.length; ++i) {
        let movie = movieList.children[i]
        let checkbox = document.createElement('input')
        checkbox.type = 'checkbox'
        checkbox.id = 'checkbox' + i
        checkbox.className = 'checkboxes'
        checkbox.onchange = (event) => {
            let checkboxes = document.getElementsByClassName(checkbox.className) as HTMLCollectionOf<HTMLInputElement>
            let target = event.target as HTMLInputElement
            if (target.checked) {
                --gVotesLeft
                if (gVotesLeft === 0) {
                    for (let checkbox of checkboxes) {
                        if (!checkbox.checked) {
                            checkbox.disabled = true
                        }
                    }
                    part2Submit.disabled = false
                }
            } else {
                if (gVotesLeft === 0) {
                    for (let checkbox of checkboxes) {
                        checkbox.disabled = false
                    }
                    part2Submit.disabled = true
                }
                ++gVotesLeft
            }
        }
        let label = document.createElement('label')
        label.textContent = movie.textContent
        label.htmlFor = checkbox.id
        let li = document.createElement('li')
        li.appendChild(checkbox)
        li.appendChild(label)
        checkboxList.appendChild(li)
    }

    gVoteList = new Array(movieList.children.length)
    gVoteList.fill(0)
    let voteCountInput = getNodeId('voteCountInput') as HTMLInputElement
    gVotesLeft = +voteCountInput.value
}

// part2
let part2Submit = getNodeId('part2Submit') as HTMLButtonElement
part2Submit.onclick = () => {
    if (gVotesLeft) { console.log('there are votes left'); return }
    let voteCountInput = getNodeId('voteCountInput') as HTMLInputElement
    gVotesLeft = +voteCountInput.value

    ++gCurrentNameIndex

    let checkboxes = document.getElementsByClassName('checkboxes') as HTMLCollectionOf<HTMLInputElement>
    for (let i = 0; i < checkboxes.length; ++i) {
        let checkbox = checkboxes[i]
        if (checkbox.checked) {
            ++gVoteList[i]
        }
        checkbox.checked = false
        checkbox.disabled = false
    }
    part2Submit.disabled = true

    let nameList = getNodeId('nameList') as HTMLUListElement
    if (gCurrentNameIndex < nameList.children.length) {
        let currentName = getNodeId('currentName') as HTMLHeadingElement
        currentName.textContent = nameList.children[gCurrentNameIndex].textContent
    } else {
        gCurrentNameIndex = 0

        // set up part 3
        let part2 = getNodeId('part2') as HTMLSpanElement
        let part3 = getNodeId('part3') as HTMLSpanElement
        part2.hidden = true
        part3.hidden = false

        // sort results
        let sortedIndexList = new Array(gVoteList.length)
        for (let i = 0; i < sortedIndexList.length; ++i) {
            sortedIndexList[i] = i
        }
        sortedIndexList.sort((a, b) => gVoteList[b] - gVoteList[a])

        // show results
        let movieList = getNodeId('movieList') as HTMLUListElement
        let tableBody = document.getElementById('resultTableBody') as HTMLTableSectionElement

        // clear results table body before adding to it
        while (tableBody.firstChild) {
            tableBody.removeChild(tableBody.firstChild)
        }

        for (let i of sortedIndexList)  {
            let movieTd = document.createElement('td')
            movieTd.textContent = movieList.children[i].textContent

            let voteTd = document.createElement('td')
            voteTd.textContent = String(gVoteList[i])

            let checkbox = document.createElement('input')
            checkbox.type = 'checkbox'

            let tr = document.createElement('tr')
            tr.appendChild(checkbox)
            tr.appendChild(movieTd)
            tr.appendChild(voteTd)
            tableBody.appendChild(tr)
        }

        let restartButton = document.getElementById('restartButton') as HTMLButtonElement
        restartButton.onclick = () => {
            let part1 = getNodeId('part1') as HTMLSpanElement
            let part3 = getNodeId('part3') as HTMLSpanElement
            part1.hidden = false
            part3.hidden = true

            // clear movieList before re-adding the movies that are checked
            while (movieList.firstChild) {
                movieList.removeChild(movieList.firstChild)
            }

            for (let row of tableBody.children) {
                let checkbox = row.children[0] as HTMLInputElement
                let movieName = row.children[1].textContent!
                if (checkbox.checked) {
                    let deleteButton = document.createElement('button')
                    deleteButton.textContent = 'X'
                    deleteButton.onclick = deleteFromList
                    addElementsToList(movieList, deleteButton, movieName)
                }
            }

            updateVoteCountInput()
        }
    }
}
