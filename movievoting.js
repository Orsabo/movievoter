"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let gVoteList = [];
let gVotesLeft = 0;
let gVoterIndex = 0;
let gApikey = '';
class Part1 {
    static submitIsValid() {
        return Part1.nameList.children.length >= 2 &&
            Part1.movieList.children.length >= 2 &&
            Part1.voteCountInput.checkValidity();
    }
    static disableSubmitIfInvalid() {
        Part1.submitButton.disabled = !Part1.submitIsValid();
    }
    static updateVoteCountInput() {
        const movieCount = Part1.movieList.children.length;
        Part1.voteCountInput.max = String((movieCount > 1) ? movieCount - 1 : 1);
        if (+Part1.voteCountInput.value > +Part1.voteCountInput.max) {
            Part1.voteCountInput.value = Part1.voteCountInput.max;
        }
    }
    static movieSubmit() {
        for (const movieName of Part1.movieTextArea.value.trim().split('\n')) {
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'X';
            deleteButton.onclick = deleteFromList;
            addElementsToList(Part1.movieList, deleteButton, movieName);
        }
        Part1.updateVoteCountInput();
        Part1.movieTextArea.value = '';
        Part1.movieTextArea.focus();
        Part1.disableSubmitIfInvalid();
    }
    static nameSubmit() {
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'X';
        deleteButton.onclick = deleteFromList;
        addElementsToList(Part1.nameList, deleteButton, Part1.nameInput.value);
        Part1.nameInput.value = '';
        Part1.disableSubmitIfInvalid();
    }
    static submit() {
        if (!Part1.submitIsValid())
            return;
        Part1.span.hidden = true;
        Part2.span.hidden = false;
        gApikey = Part1.apikeyInput.value.trim();
        // setting up part 2
        Part2.voterName.textContent = Part1.nameList.children[gVoterIndex].childNodes[1].textContent;
        while (Part2.checkboxList.firstChild) {
            Part2.checkboxList.removeChild(Part2.checkboxList.firstChild);
        }
        Part2.responses = new Array(Part1.movieList.children.length);
        Part2.responses.fill(null);
        for (let i = 0; i < Part1.movieList.children.length; ++i) {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = 'checkbox' + i;
            checkbox.className = 'checkboxes';
            checkbox.onchange = (event) => {
                const checkboxes = document.getElementsByClassName(checkbox.className);
                const target = event.target;
                if (target.checked) {
                    --gVotesLeft;
                    if (gVotesLeft === 0) {
                        for (const checkbox of checkboxes) {
                            if (!checkbox.checked) {
                                checkbox.disabled = true;
                            }
                        }
                        Part2.submitButton.disabled = false;
                    }
                }
                else {
                    if (gVotesLeft === 0) {
                        for (const checkbox of checkboxes) {
                            checkbox.disabled = false;
                        }
                        Part2.submitButton.disabled = true;
                    }
                    ++gVotesLeft;
                }
            };
            const movieName = Part1.movieList.children[i].childNodes[1].textContent;
            const movieNameSpan = document.createElement('span');
            movieNameSpan.textContent = movieName;
            if (gApikey) {
                movieNameSpan.onclick = () => __awaiter(this, void 0, void 0, function* () {
                    while (Part2.searchResults.firstChild) {
                        Part2.searchResults.removeChild(Part2.searchResults.firstChild);
                    }
                    Part2.selectedMovie.hidden = true;
                    Part2.selectedMovieImage.src = '';
                    Part2.searchResults.hidden = false;
                    const movieObject = yield (() => __awaiter(this, void 0, void 0, function* () {
                        if (Part2.responses[i] === null) {
                            const requestUrl = `https://www.omdbapi.com/?s=${movieName.replace(' ', '+')}&apikey=${gApikey}`;
                            const response = yield fetch(requestUrl);
                            const jsonObject = yield response.json();
                            Part2.responses[i] = jsonObject;
                        }
                        return Part2.responses[i];
                    }))();
                    if (movieObject.Response === 'True') {
                        for (const movie of movieObject.Search) {
                            const li = document.createElement('li');
                            li.textContent = `(${movie.Type} - ${movie.Year}): ${movie.Title}`;
                            li.onclick = () => {
                                Part2.selectedMovieImage.src = movie.Poster;
                                Part2.selectedMovieTitle.textContent = movie.Title;
                                Part2.selectedMovieTitle.href = `https://www.imdb.com/title/${movie.imdbID}`;
                                Part2.selectedMovieYear.textContent = movie.Year;
                                Part2.selectedMovie.hidden = false;
                            };
                            Part2.searchResults.appendChild(li);
                        }
                    }
                    else {
                        const li = document.createElement('li');
                        li.textContent = movieObject.Error;
                        Part2.searchResults.appendChild(li);
                    }
                });
            }
            const li = document.createElement('li');
            li.appendChild(checkbox);
            li.appendChild(movieNameSpan);
            Part2.checkboxList.appendChild(li);
        }
        gVoteList = new Array(Part1.movieList.children.length);
        gVoteList.fill(0);
        gVotesLeft = +Part1.voteCountInput.value;
    }
}
Part1.span = document.getElementById('part1');
Part1.movieList = document.getElementById('movieList');
Part1.movieTextArea = document.getElementById('movieTextArea');
Part1.movieSubmitButton = document.getElementById('movieSubmitButton');
Part1.nameList = document.getElementById('nameList');
Part1.nameInput = document.getElementById('nameInput');
Part1.nameSubmitButton = document.getElementById('nameSubmitButton');
Part1.voteCountInput = document.getElementById('voteCountInput');
Part1.apikeyInput = document.getElementById('apikeyInput');
Part1.submitButton = document.getElementById('part1Submit');
class Part2 {
    static submit() {
        if (gVotesLeft) {
            console.log('there are votes left');
            return;
        }
        gVotesLeft = +Part1.voteCountInput.value;
        ++gVoterIndex;
        Part2.selectedMovie.hidden = true;
        Part2.searchResults.hidden = true;
        const checkboxes = document.getElementsByClassName('checkboxes');
        for (let i = 0; i < checkboxes.length; ++i) {
            const checkbox = checkboxes[i];
            if (checkbox.checked) {
                ++gVoteList[i];
            }
            checkbox.checked = false;
            checkbox.disabled = false;
        }
        Part2.submitButton.disabled = true;
        if (gVoterIndex < Part1.nameList.children.length) {
            Part2.voterName.textContent = Part1.nameList.children[gVoterIndex].childNodes[1].textContent;
        }
        else {
            gVoterIndex = 0;
            // set up part 3
            Part2.span.hidden = true;
            Part3.span.hidden = false;
            // sort results
            const sortedIndexList = new Array(gVoteList.length);
            for (let i = 0; i < sortedIndexList.length; ++i) {
                sortedIndexList[i] = i;
            }
            sortedIndexList.sort((a, b) => gVoteList[b] - gVoteList[a]);
            // show results
            // clear results table body before adding to it
            while (Part3.tableBody.firstChild) {
                Part3.tableBody.removeChild(Part3.tableBody.firstChild);
            }
            for (const i of sortedIndexList) {
                const movieTd = document.createElement('td');
                movieTd.textContent = Part1.movieList.children[i].childNodes[1].textContent;
                const voteTd = document.createElement('td');
                voteTd.textContent = String(gVoteList[i]);
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                const tr = document.createElement('tr');
                tr.appendChild(checkbox);
                tr.appendChild(movieTd);
                tr.appendChild(voteTd);
                Part3.tableBody.appendChild(tr);
            }
        }
    }
}
Part2.span = document.getElementById('part2');
Part2.voterName = document.getElementById('voterName');
Part2.checkboxList = document.getElementById('checkboxList');
Part2.submitButton = document.getElementById('part2Submit');
Part2.searchResults = document.getElementById('searchResults');
Part2.selectedMovie = document.getElementById('selectedMovie');
Part2.selectedMovieImage = document.getElementById('selectedMovieImage');
Part2.selectedMovieTitle = document.getElementById('selectedMovieTitle');
Part2.selectedMovieYear = document.getElementById('selectedMovieYear');
class Part3 {
    static restart() {
        Part1.span.hidden = false;
        Part3.span.hidden = true;
        // clear movieList before re-adding the movies that are checked
        while (Part1.movieList.firstChild) {
            Part1.movieList.removeChild(Part1.movieList.firstChild);
        }
        for (const row of Part3.tableBody.children) {
            const checkbox = row.children[0];
            const movieName = row.children[1].textContent;
            if (checkbox.checked) {
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'X';
                deleteButton.onclick = deleteFromList;
                addElementsToList(Part1.movieList, deleteButton, movieName);
            }
        }
        Part1.updateVoteCountInput();
        Part1.disableSubmitIfInvalid();
    }
}
Part3.span = document.getElementById('part3');
Part3.tableBody = document.getElementById('resultTableBody');
Part3.restartButton = document.getElementById('restartButton');
function deleteFromList(event) {
    const target = event.target;
    const element = target.parentElement;
    if (!element) {
        console.log('element is null aaaaa');
    }
    const list = element.parentElement;
    if (!list) {
        console.log('list is null aaaaa');
    }
    list.removeChild(element);
    if (list == Part1.movieList) {
        Part1.updateVoteCountInput();
    }
}
function addElementsToList(list, ...args) {
    const li = document.createElement('li');
    for (const arg of args) {
        let foo;
        if (typeof arg == 'string') {
            const str = arg.trim();
            if (!str.length)
                return;
            foo = document.createTextNode(str);
        }
        else {
            foo = arg;
        }
        li.appendChild(foo);
    }
    list.appendChild(li);
}
Part1.movieSubmitButton.onclick = Part1.movieSubmit;
Part1.nameSubmitButton.onclick = Part1.nameSubmit;
Part1.nameInput.onkeypress = (keyboardEvent) => {
    if (keyboardEvent.key === 'Enter') {
        Part1.nameSubmit();
    }
};
Part1.voteCountInput.oninput = Part1.disableSubmitIfInvalid;
Part1.submitButton.onclick = Part1.submit;
Part2.submitButton.onclick = Part2.submit;
Part3.restartButton.onclick = Part3.restart;
