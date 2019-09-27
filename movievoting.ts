let gVoteList: number[] = []
let gVotesLeft = 0

let gCurrentNameIndex = 0

class Part1 {
    static readonly span = document.getElementById('part1') as HTMLSpanElement
           
    static readonly movieList = document.getElementById('movieList') as HTMLUListElement
    static readonly movieTextArea = document.getElementById('movieTextArea') as HTMLTextAreaElement
    static readonly movieSubmitButton = document.getElementById('movieSubmitButton') as HTMLButtonElement
           
    static readonly nameList = document.getElementById('nameList') as HTMLUListElement
    static readonly nameInput = document.getElementById('nameInput') as HTMLInputElement
    static readonly nameSubmitButton = document.getElementById('nameSubmitButton') as HTMLButtonElement
           
    static readonly voteCountInput = document.getElementById('voteCountInput') as HTMLInputElement
           
    static readonly submitButton = document.getElementById('part1Submit') as HTMLButtonElement

    static submitIsValid() {
        return Part1.nameList.children.length >= 2 &&
            Part1.movieList.children.length >= 2 &&
            Part1.voteCountInput.checkValidity()
    }

    static disableSubmitIfInvalid() {
        Part1.submitButton.disabled = !Part1.submitIsValid()
    }

    static updateVoteCountInput() {
        const movieCount = Part1.movieList.children.length

        Part1.voteCountInput.max = String((movieCount > 1) ? movieCount - 1 : 1)
        if (+Part1.voteCountInput.value > +Part1.voteCountInput.max) {
            Part1.voteCountInput.value = Part1.voteCountInput.max
        }
    }

    static movieSubmit() {
        for (const movieName of Part1.movieTextArea.value.trim().split('\n')) {
            const deleteButton = document.createElement('button')
            deleteButton.textContent = 'X'
            deleteButton.onclick = deleteFromList
            addElementsToList(Part1.movieList, deleteButton, movieName)
        }

        Part1.updateVoteCountInput()
        Part1.movieTextArea.value = ''
        Part1.movieTextArea.focus()
        Part1.disableSubmitIfInvalid()
    }

    static nameSubmit() {
        const deleteButton = document.createElement('button')
        deleteButton.textContent = 'X'
        deleteButton.onclick = deleteFromList
        addElementsToList(Part1.nameList, deleteButton, Part1.nameInput.value)

        Part1.nameInput.value = ''
        Part1.disableSubmitIfInvalid()
    }

    static submit() {
        if (!Part1.submitIsValid()) return

        Part1.span.hidden = true
        Part2.span.hidden = false

        // setting up part 2
        Part2.voterName.textContent = Part1.nameList.children[gCurrentNameIndex].childNodes[1].textContent

        while (Part2.checkboxList.firstChild) {
            Part2.checkboxList.removeChild(Part2.checkboxList.firstChild)
        }

        for (let i = 0; i < Part1.movieList.children.length; ++i) {
            const checkbox = document.createElement('input')
            checkbox.type = 'checkbox'
            checkbox.id = 'checkbox' + i
            checkbox.className = 'checkboxes'
            checkbox.onchange = (event) => {
                const checkboxes = document.getElementsByClassName(checkbox.className) as HTMLCollectionOf<HTMLInputElement>
                    const target = event.target as HTMLInputElement
                if (target.checked) {
                    --gVotesLeft
                    if (gVotesLeft === 0) {
                        for (const checkbox of checkboxes) {
                            if (!checkbox.checked) {
                                checkbox.disabled = true
                            }
                        }
                        Part2.submitButton.disabled = false
                    }
                } else {
                    if (gVotesLeft === 0) {
                        for (const checkbox of checkboxes) {
                            checkbox.disabled = false
                        }
                        Part2.submitButton.disabled = true
                    }
                    ++gVotesLeft
                }
            }

            const label = document.createElement('label')
            const movieName = Part1.movieList.children[i].childNodes[1].textContent
            label.textContent = movieName
            label.htmlFor = checkbox.id
            const li = document.createElement('li')
            li.appendChild(checkbox)
            li.appendChild(label)
            Part2.checkboxList.appendChild(li)
        }

        gVoteList = new Array(Part1.movieList.children.length)
        gVoteList.fill(0)
        gVotesLeft = +Part1.voteCountInput.value
    }
}

class Part2 {
    static readonly span = document.getElementById('part2') as HTMLSpanElement
    static readonly voterName = document.getElementById('voterName') as HTMLHeadingElement
    static readonly checkboxList = document.getElementById('checkboxList') as HTMLUListElement
    static readonly submitButton = document.getElementById('part2Submit') as HTMLButtonElement

    static submit() {
        if (gVotesLeft) { console.log('there are votes left'); return }
        gVotesLeft = +Part1.voteCountInput.value

        ++gCurrentNameIndex

        const checkboxes = document.getElementsByClassName('checkboxes') as HTMLCollectionOf<HTMLInputElement>
            for (let i = 0; i < checkboxes.length; ++i) {
                const checkbox = checkboxes[i]
                if (checkbox.checked) {
                    ++gVoteList[i]
                }
                checkbox.checked = false
                checkbox.disabled = false
            }
        Part2.submitButton.disabled = true

        if (gCurrentNameIndex < Part1.nameList.children.length) {
            Part2.voterName.textContent = Part1.nameList.children[gCurrentNameIndex].childNodes[1].textContent
        } else {
            gCurrentNameIndex = 0

            // set up part 3
            Part2.span.hidden = true
            Part3.span.hidden = false

            // sort results
            const sortedIndexList = new Array(gVoteList.length)
            for (let i = 0; i < sortedIndexList.length; ++i) {
                sortedIndexList[i] = i
            }
            sortedIndexList.sort((a, b) => gVoteList[b] - gVoteList[a])

            // show results
            // clear results table body before adding to it
            while (Part3.tableBody.firstChild) {
                Part3.tableBody.removeChild(Part3.tableBody.firstChild)
            }

            for (const i of sortedIndexList)  {
                const movieTd = document.createElement('td')
                movieTd.textContent = Part1.movieList.children[i].childNodes[1].textContent

                const voteTd = document.createElement('td')
                voteTd.textContent = String(gVoteList[i])

                const checkbox = document.createElement('input')
                checkbox.type = 'checkbox'

                const tr = document.createElement('tr')
                tr.appendChild(checkbox)
                tr.appendChild(movieTd)
                tr.appendChild(voteTd)
                Part3.tableBody.appendChild(tr)
            }
        }
    }
}

class Part3 {
    static readonly span = document.getElementById('part3') as HTMLSpanElement
    static readonly tableBody = document.getElementById('resultTableBody') as HTMLTableSectionElement
    static readonly restartButton = document.getElementById('restartButton') as HTMLButtonElement

    static restart() {
        Part1.span.hidden = false
        Part3.span.hidden = true

        // clear movieList before re-adding the movies that are checked
        while (Part1.movieList.firstChild) {
            Part1.movieList.removeChild(Part1.movieList.firstChild)
        }

        for (const row of Part3.tableBody.children) {
            const checkbox = row.children[0] as HTMLInputElement
            const movieName = row.children[1].textContent!
                if (checkbox.checked) {
                    const deleteButton = document.createElement('button')
                    deleteButton.textContent = 'X'
                    deleteButton.onclick = deleteFromList
                    addElementsToList(Part1.movieList, deleteButton, movieName)
                }
        }

        Part1.updateVoteCountInput()
        Part1.disableSubmitIfInvalid()
    }
}

function deleteFromList(event: MouseEvent) {
    const target = event.target as HTMLButtonElement
    const element = target.parentElement
    if (!element) {
        console.log('element is null aaaaa')
    }
    const list = element!.parentElement
    if (!list) {
        console.log('list is null aaaaa')
    }
    list!.removeChild(element!)

    if (list == Part1.movieList) {
        Part1.updateVoteCountInput()
    }
}

type StringOrHTMLElement = string | HTMLElement

function addElementsToList(list: HTMLUListElement, ...args: StringOrHTMLElement[]) {
    const li = document.createElement('li')
    for (const arg of args) {
        let foo
        if (typeof arg == 'string') {
            const str = arg.trim()
            if (!str.length) return
            foo = document.createTextNode(str)
        } else {
            foo = arg
        }
        li.appendChild(foo)
    }
    list.appendChild(li)
}

Part1.movieSubmitButton.onclick = Part1.movieSubmit
Part1.nameSubmitButton.onclick = Part1.nameSubmit
Part1.nameInput.onkeypress = (keyboardEvent) => {
    if (keyboardEvent.key === 'Enter') {
        Part1.nameSubmit()
    }
}
Part1.voteCountInput.oninput = Part1.disableSubmitIfInvalid

Part1.submitButton.onclick = Part1.submit
Part2.submitButton.onclick = Part2.submit
Part3.restartButton.onclick = Part3.restart
