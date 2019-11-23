"use strict";
let gVoteList = [];
let gVotesLeft = 0;
let gVoterIndex = 0;
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
        // setting up part 2
        Part2.voterName.textContent = Part1.nameList.children[gVoterIndex].childNodes[1].textContent;
        while (Part2.checkboxList.firstChild) {
            Part2.checkboxList.removeChild(Part2.checkboxList.firstChild);
        }
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
            const href = document.createElement('a');
            const movieName = Part1.movieList.children[i].childNodes[1].textContent;
            href.textContent = movieName;
            // TODO: maybe use imdb's api
            href.href = 'https://www.imdb.com/find?q=' + movieName.replace(' ', '+');
            href.target = '_blank';
            const li = document.createElement('li');
            li.appendChild(checkbox);
            li.appendChild(href);
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
Part1.submitButton = document.getElementById('part1Submit');
class Part2 {
    static submit() {
        if (gVotesLeft) {
            console.log('there are votes left');
            return;
        }
        gVotesLeft = +Part1.voteCountInput.value;
        ++gVoterIndex;
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
