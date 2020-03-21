let gVoteList: number[] = []
let gVotesLeft = 0

let gVoterIndex = 0
let gApikey = ''

class Part1 {
    static readonly span = document.getElementById('part1') as HTMLSpanElement
           
    static readonly movieList = document.getElementById('movieList') as HTMLUListElement
    static readonly movieTextArea = document.getElementById('movieTextArea') as HTMLTextAreaElement
    static readonly movieSubmitButton = document.getElementById('movieSubmitButton') as HTMLButtonElement
           
    static readonly nameList = document.getElementById('nameList') as HTMLUListElement
    static readonly nameInput = document.getElementById('nameInput') as HTMLInputElement
    static readonly nameSubmitButton = document.getElementById('nameSubmitButton') as HTMLButtonElement
           
    static readonly voteCountInput = document.getElementById('voteCountInput') as HTMLInputElement
           
    static readonly votableMoviesCount = document.getElementById('votableMoviesCount') as HTMLInputElement

    static readonly apikeyInput = document.getElementById('apikeyInput') as HTMLInputElement

    static readonly submitButton = document.getElementById('part1Submit') as HTMLButtonElement

    static submitIsValid() {
        return Part1.nameList.children.length >= 2 &&
            Part1.movieList.children.length >= 2 &&
            Part1.voteCountInput.checkValidity() &&
            Part1.votableMoviesCount.checkValidity()
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

    static updateVotableMoviesCount() {
        const movieCount = Part1.movieList.children.length
        Part1.votableMoviesCount.max = String(movieCount)
        Part1.votableMoviesCount.value = Part1.votableMoviesCount.max
    }

    static movieSubmit() {
        for (const movieName of Part1.movieTextArea.value.trim().split('\n')) {
            const deleteButton = document.createElement('button')
            deleteButton.textContent = 'X'
            deleteButton.onclick = deleteFromList
            addElementsToList(Part1.movieList, deleteButton, movieName)
        }

        Part1.updateVotableMoviesCount()
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

        gApikey = Part1.apikeyInput.value.trim()

        // setting up part 2
        Part2.names = []
        for (const child of Part1.nameList.children) {
            Part2.names.push(child.childNodes[1].textContent!)
        }
        Part2.movies = []
        for (const child of Part1.movieList.children) {
            Part2.movies.push(child.childNodes[1].textContent!)
        }

        const shuffle = (arr: any[]) => {
            for (let i = arr.length - 1; i > 0; --i) {
                const rand = Math.floor(Math.random() * (i + 1))
                const tmp = arr[i];
                arr[i] = arr[rand];
                arr[rand] = tmp;
            }
        }

        shuffle(Part2.names)

        // only select votableMoviesCount amount of movies
        shuffle(Part2.movies)
        Part2.movies = Part2.movies.slice(0, +Part1.votableMoviesCount.value)
        Part2.movies.sort()

        Part2.voterName.textContent = Part2.names[gVoterIndex]

        while (Part2.checkboxList.firstChild) {
            Part2.checkboxList.removeChild(Part2.checkboxList.firstChild)
        }

        Part2.responses = new Array(Part2.movies.length)
        Part2.responses.fill(null)

        for (let i = 0; i < Part2.movies.length; ++i) {
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


            const movieName = Part2.movies[i]
            const movieNameSpan = document.createElement('span')
            if (gApikey) {
                movieNameSpan.textContent = movieName
                movieNameSpan.onclick = async () => {
                    while (Part2.searchResults.firstChild) {
                        Part2.searchResults.removeChild(Part2.searchResults.firstChild)
                    }

                    Part2.selectedMovie.hidden = true
                    Part2.selectedMovieImage.src = ''
                    Part2.searchResults.hidden = false

                    const movieObject = await (async () => {
                        if (Part2.responses[i] === null) {
                            // TODO: Detect if apikey is invalid (should return 401 if it is) and prevent further requests if so (i.e. set gApikey to '')
                            const requestUrl = `https://www.omdbapi.com/?s=${movieName.replace(' ', '+')}&apikey=${gApikey}`
                            const response = await fetch(requestUrl)
                            const jsonObject = await response!.json()
                            Part2.responses[i] = jsonObject
                        }
                        return Part2.responses[i]
                    })()

                    if (movieObject.Response === 'True') {
                        for (const movie of movieObject.Search) {
                            const li = document.createElement('li')
                            li.textContent = `(${movie.Type} - ${movie.Year}): ${movie.Title}`
                            li.onclick = () => {
                                Part2.selectedMovieImage.src = movie.Poster
                                Part2.selectedMovieTitle.textContent = movie.Title
                                Part2.selectedMovieTitle.href = `https://www.imdb.com/title/${movie.imdbID}`
                                Part2.selectedMovieYear.textContent = movie.Year
                                Part2.selectedMovie.hidden = false
                            }
                            Part2.searchResults.appendChild(li)
                        }
                    } else {
                        const li = document.createElement('li')
                        li.textContent = movieObject.Error
                        Part2.searchResults.appendChild(li)
                    }
                }
            } else {
                const link = document.createElement('a')
                link.href = `https://www.imdb.com/find?q=${movieName}`
                link.textContent = movieName
                link.target = '_blank'
                link.rel = 'noreferrer'
                movieNameSpan.appendChild(link)
            }

            const li = document.createElement('li')
            li.appendChild(checkbox)
            li.appendChild(movieNameSpan)
            Part2.checkboxList.appendChild(li)
        }

        gVoteList = new Array(Part2.movies.length)
        gVoteList.fill(0)
        gVotesLeft = +Part1.voteCountInput.value
    }
}

type Nullable<T> = T | null

class Part2 {
    static readonly span = document.getElementById('part2') as HTMLSpanElement
    static readonly voterName = document.getElementById('voterName') as HTMLHeadingElement
    static readonly checkboxList = document.getElementById('checkboxList') as HTMLUListElement
    static readonly submitButton = document.getElementById('part2Submit') as HTMLButtonElement

    static readonly searchResults = document.getElementById('searchResults') as HTMLUListElement

    static readonly selectedMovie = document.getElementById('selectedMovie') as HTMLSpanElement
    static readonly selectedMovieImage = document.getElementById('selectedMovieImage') as HTMLImageElement
    static readonly selectedMovieTitle = document.getElementById('selectedMovieTitle') as HTMLAnchorElement
    static readonly selectedMovieYear = document.getElementById('selectedMovieYear') as HTMLLIElement

    static responses: Nullable<any> []

    static movies: string []
    static names: string []

    static submit() {
        if (gVotesLeft) { console.log('there are votes left'); return }
        gVotesLeft = +Part1.voteCountInput.value

        ++gVoterIndex

        Part2.selectedMovie.hidden = true
        Part2.searchResults.hidden = true

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

        if (gVoterIndex < Part2.names.length) {
            Part2.voterName.textContent = Part2.names[gVoterIndex]
        } else {
            gVoterIndex = 0

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
                movieTd.textContent = Part2.movies[i]

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
        Part1.updateVotableMoviesCount()
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
Part1.votableMoviesCount.oninput = Part1.disableSubmitIfInvalid

Part1.submitButton.onclick = Part1.submit
Part2.submitButton.onclick = Part2.submit
Part3.restartButton.onclick = Part3.restart
