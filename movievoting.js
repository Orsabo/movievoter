"use strict";
class Part1 {
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
function getNodeId(name) {
    return document.getElementById(name);
}
function checkPart1Validity() {
    return Part1.nameList.children.length >= 2 && Part1.movieList.children.length >= 2 && Part1.voteCountInput.checkValidity();
}
function disablePart1SubmitIfInvalid() {
    Part1.submitButton.disabled = !checkPart1Validity();
}
function updateVoteCountInput() {
    const movieCount = Part1.movieList.children.length;
    Part1.voteCountInput.max = String((movieCount > 1) ? movieCount - 1 : 1);
    if (+Part1.voteCountInput.value > +Part1.voteCountInput.max) {
        Part1.voteCountInput.value = Part1.voteCountInput.max;
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
    for (const movieName of Part1.movieTextArea.value.trim().split('\n')) {
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'X';
        deleteButton.onclick = deleteFromList;
        addElementsToList(Part1.movieList, deleteButton, movieName);
    }
    updateVoteCountInput();
    Part1.movieTextArea.value = '';
    Part1.movieTextArea.focus();
    disablePart1SubmitIfInvalid();
}
function nameSubmit() {
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'X';
    deleteButton.onclick = deleteFromList;
    addElementsToList(Part1.nameList, deleteButton, Part1.nameInput.value);
    Part1.nameInput.value = '';
    disablePart1SubmitIfInvalid();
}
{
    Part1.movieSubmitButton.onclick = movieSubmit;
}
{
    Part1.nameSubmitButton.onclick = nameSubmit;
}
{
    Part1.nameInput.onkeypress = (keyboardEvent) => {
        if (keyboardEvent.key === 'Enter') {
            nameSubmit();
        }
    };
}
{
    Part1.voteCountInput.oninput = disablePart1SubmitIfInvalid;
}
let gVoteList = [];
let gVotesLeft = 0;
let gCurrentNameIndex = 0;
Part1.submitButton.onclick = () => {
    if (!checkPart1Validity())
        return;
    const part2 = getNodeId('part2');
    Part1.span.hidden = true;
    part2.hidden = false;
    // setting up part 2
    const currentName = getNodeId('currentName');
    currentName.textContent = Part1.nameList.children[gCurrentNameIndex].childNodes[1].textContent;
    const checkboxList = getNodeId('checkboxList');
    while (checkboxList.firstChild) {
        checkboxList.removeChild(checkboxList.firstChild);
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
        const movieName = Part1.movieList.children[i].childNodes[1].textContent;
        label.textContent = movieName;
        label.htmlFor = checkbox.id;
        const li = document.createElement('li');
        li.appendChild(checkbox);
        li.appendChild(label);
        checkboxList.appendChild(li);
    }
    gVoteList = new Array(Part1.movieList.children.length);
    gVoteList.fill(0);
    gVotesLeft = +Part1.voteCountInput.value;
};
// part2
const part2Submit = getNodeId('part2Submit');
part2Submit.onclick = () => {
    if (gVotesLeft) {
        console.log('there are votes left');
        return;
    }
    gVotesLeft = +Part1.voteCountInput.value;
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
    if (gCurrentNameIndex < Part1.nameList.children.length) {
        const currentName = getNodeId('currentName');
        currentName.textContent = Part1.nameList.children[gCurrentNameIndex].childNodes[1].textContent;
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
        const tableBody = document.getElementById('resultTableBody');
        // clear results table body before adding to it
        while (tableBody.firstChild) {
            tableBody.removeChild(tableBody.firstChild);
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
            tableBody.appendChild(tr);
        }
        const restartButton = document.getElementById('restartButton');
        restartButton.onclick = () => {
            const part3 = getNodeId('part3');
            Part1.span.hidden = false;
            part3.hidden = true;
            // clear movieList before re-adding the movies that are checked
            while (Part1.movieList.firstChild) {
                Part1.movieList.removeChild(Part1.movieList.firstChild);
            }
            for (const row of tableBody.children) {
                const checkbox = row.children[0];
                const movieName = row.children[1].textContent;
                if (checkbox.checked) {
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'X';
                    deleteButton.onclick = deleteFromList;
                    addElementsToList(Part1.movieList, deleteButton, movieName);
                }
            }
            updateVoteCountInput();
        };
    }
};
