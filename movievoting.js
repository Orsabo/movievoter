"use strict";
function getNodeId(name) {
    return document.getElementById(name);
}
function checkPart1Validity() {
    const movieList = getNodeId('movieList');
    const nameList = getNodeId('nameList');
    const voteCountInput = getNodeId('voteCountInput');
    return nameList.children.length >= 2 && movieList.children.length >= 2 && voteCountInput.checkValidity();
}
function disablePart1SubmitIfInvalid() {
    const part1Submit = getNodeId('part1Submit');
    part1Submit.disabled = !checkPart1Validity();
}
function updateVoteCountInput() {
    const voteCountInput = getNodeId('voteCountInput');
    const movieList = getNodeId('movieList');
    const movieCount = movieList.children.length;
    voteCountInput.max = String((movieCount > 1) ? movieCount - 1 : 1);
    if (+voteCountInput.value > +voteCountInput.max) {
        voteCountInput.value = voteCountInput.max;
    }
}
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
function movieSubmit() {
    const movieTextArea = getNodeId('movieTextArea');
    const movieList = document.getElementById('movieList');
    for (const movieName of movieTextArea.value.trim().split('\n')) {
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'X';
        deleteButton.onclick = deleteFromList;
        addElementsToList(movieList, deleteButton, movieName);
    }
    updateVoteCountInput();
    movieTextArea.value = '';
    movieTextArea.focus();
    disablePart1SubmitIfInvalid();
}
function nameSubmit() {
    const nameList = getNodeId('nameList');
    const nameInput = getNodeId('nameInput');
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'X';
    deleteButton.onclick = deleteFromList;
    addElementsToList(nameList, deleteButton, nameInput.value);
    nameInput.value = '';
    disablePart1SubmitIfInvalid();
}
{
    const movieSubmitButton = getNodeId('movieSubmitButton');
    movieSubmitButton.onclick = movieSubmit;
}
{
    const nameSubmitButton = getNodeId('nameSubmitButton');
    nameSubmitButton.onclick = nameSubmit;
}
{
    const nameInput = getNodeId('nameInput');
    nameInput.onkeypress = (keyboardEvent) => {
        if (keyboardEvent.key === 'Enter') {
            nameSubmit();
        }
    };
}
{
    const voteCountInput = document.getElementById('voteCountInput');
    voteCountInput.oninput = disablePart1SubmitIfInvalid;
}
let gVoteList = [];
let gVotesLeft = 0;
let gCurrentNameIndex = 0;
const part1Submit = getNodeId('part1Submit');
part1Submit.onclick = () => {
    if (!checkPart1Validity())
        return;
    const part1 = getNodeId('part1');
    const part2 = getNodeId('part2');
    part1.hidden = true;
    part2.hidden = false;
    const movieList = getNodeId('movieList');
    const nameList = getNodeId('nameList');
    // setting up part 2
    const currentName = getNodeId('currentName');
    currentName.textContent = nameList.children[gCurrentNameIndex].textContent;
    const checkboxList = getNodeId('checkboxList');
    while (checkboxList.firstChild) {
        checkboxList.removeChild(checkboxList.firstChild);
    }
    for (let i = 0; i < movieList.children.length; ++i) {
        const movie = movieList.children[i];
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
                    part2Submit.disabled = false;
                }
            }
            else {
                if (gVotesLeft === 0) {
                    for (const checkbox of checkboxes) {
                        checkbox.disabled = false;
                    }
                    part2Submit.disabled = true;
                }
                ++gVotesLeft;
            }
        };
        const label = document.createElement('label');
        label.textContent = movie.textContent;
        label.htmlFor = checkbox.id;
        const li = document.createElement('li');
        li.appendChild(checkbox);
        li.appendChild(label);
        checkboxList.appendChild(li);
    }
    gVoteList = new Array(movieList.children.length);
    gVoteList.fill(0);
    const voteCountInput = getNodeId('voteCountInput');
    gVotesLeft = +voteCountInput.value;
};
// part2
const part2Submit = getNodeId('part2Submit');
part2Submit.onclick = () => {
    if (gVotesLeft) {
        console.log('there are votes left');
        return;
    }
    const voteCountInput = getNodeId('voteCountInput');
    gVotesLeft = +voteCountInput.value;
    ++gCurrentNameIndex;
    const checkboxes = document.getElementsByClassName('checkboxes');
    for (let i = 0; i < checkboxes.length; ++i) {
        const checkbox = checkboxes[i];
        if (checkbox.checked) {
            ++gVoteList[i];
        }
        checkbox.checked = false;
        checkbox.disabled = false;
    }
    part2Submit.disabled = true;
    const nameList = getNodeId('nameList');
    if (gCurrentNameIndex < nameList.children.length) {
        const currentName = getNodeId('currentName');
        currentName.textContent = nameList.children[gCurrentNameIndex].textContent;
    }
    else {
        gCurrentNameIndex = 0;
        // set up part 3
        const part2 = getNodeId('part2');
        const part3 = getNodeId('part3');
        part2.hidden = true;
        part3.hidden = false;
        // sort results
        const sortedIndexList = new Array(gVoteList.length);
        for (let i = 0; i < sortedIndexList.length; ++i) {
            sortedIndexList[i] = i;
        }
        sortedIndexList.sort((a, b) => gVoteList[b] - gVoteList[a]);
        // show results
        const movieList = getNodeId('movieList');
        const tableBody = document.getElementById('resultTableBody');
        // clear results table body before adding to it
        while (tableBody.firstChild) {
            tableBody.removeChild(tableBody.firstChild);
        }
        for (const i of sortedIndexList) {
            const movieTd = document.createElement('td');
            movieTd.textContent = movieList.children[i].textContent;
            const voteTd = document.createElement('td');
            voteTd.textContent = String(gVoteList[i]);
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            const tr = document.createElement('tr');
            tr.appendChild(checkbox);
            tr.appendChild(movieTd);
            tr.appendChild(voteTd);
            tableBody.appendChild(tr);
        }
        const restartButton = document.getElementById('restartButton');
        restartButton.onclick = () => {
            const part1 = getNodeId('part1');
            const part3 = getNodeId('part3');
            part1.hidden = false;
            part3.hidden = true;
            // clear movieList before re-adding the movies that are checked
            while (movieList.firstChild) {
                movieList.removeChild(movieList.firstChild);
            }
            for (const row of tableBody.children) {
                const checkbox = row.children[0];
                const movieName = row.children[1].textContent;
                if (checkbox.checked) {
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'X';
                    deleteButton.onclick = deleteFromList;
                    addElementsToList(movieList, deleteButton, movieName);
                }
            }
            updateVoteCountInput();
        };
    }
};
