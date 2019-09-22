"use strict";
function getNodeId(name) {
    return document.getElementById(name);
}
function checkPart1Validity() {
    let movieList = getNodeId('movieList');
    let nameList = getNodeId('nameList');
    let voteCountInput = getNodeId('voteCountInput');
    return nameList.children.length >= 2 && movieList.children.length >= 2 && voteCountInput.checkValidity();
}
function disablePart1SubmitIfInvalid() {
    let part1Submit = getNodeId('part1Submit');
    part1Submit.disabled = !checkPart1Validity();
}
function updateVoteCountInput() {
    let voteCountInput = getNodeId('voteCountInput');
    let movieList = getNodeId('movieList');
    let movieCount = movieList.children.length;
    voteCountInput.max = String((movieCount > 1) ? movieCount - 1 : 1);
    if (+voteCountInput.value > +voteCountInput.max) {
        voteCountInput.value = voteCountInput.max;
    }
}
function addToList(elementName, list) {
    elementName = elementName.trim();
    if (!elementName.length)
        return;
    let li = document.createElement('li');
    li.appendChild(document.createTextNode(elementName));
    list.appendChild(li);
}
function movieSubmit() {
    let movieTextArea = getNodeId('movieTextArea');
    let movieList = document.getElementById('movieList');
    for (let movieName of movieTextArea.value.trim().split('\n')) {
        addToList(movieName, movieList);
    }
    updateVoteCountInput();
    movieTextArea.value = '';
    movieTextArea.focus();
    disablePart1SubmitIfInvalid();
}
function nameSubmit() {
    let nameList = getNodeId('nameList');
    let nameInput = getNodeId('nameInput');
    addToList(nameInput.value, nameList);
    nameInput.value = '';
    disablePart1SubmitIfInvalid();
}
{
    let movieSubmitButton = getNodeId('movieSubmitButton');
    movieSubmitButton.onclick = movieSubmit;
}
{
    let nameSubmitButton = getNodeId('nameSubmitButton');
    nameSubmitButton.onclick = nameSubmit;
}
{
    let nameInput = getNodeId('nameInput');
    nameInput.onkeypress = (keyboardEvent) => {
        if (keyboardEvent.key === 'Enter') {
            nameSubmit();
        }
    };
}
{
    let voteCountInput = document.getElementById('voteCountInput');
    voteCountInput.oninput = disablePart1SubmitIfInvalid;
}
let gVoteList = [];
let gVotesLeft = 0;
let gCurrentNameIndex = 0;
let part1Submit = getNodeId('part1Submit');
part1Submit.onclick = () => {
    if (!checkPart1Validity())
        return;
    let part1 = getNodeId('part1');
    let part2 = getNodeId('part2');
    part1.hidden = true;
    part2.hidden = false;
    let movieList = getNodeId('movieList');
    let nameList = getNodeId('nameList');
    // setting up part 2
    let currentName = getNodeId('currentName');
    currentName.textContent = nameList.children[gCurrentNameIndex].textContent;
    let checkboxList = getNodeId('checkboxList');
    while (checkboxList.firstChild) {
        checkboxList.removeChild(checkboxList.firstChild);
    }
    for (let i = 0; i < movieList.children.length; ++i) {
        let movie = movieList.children[i];
        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'checkbox' + i;
        checkbox.className = 'checkboxes';
        checkbox.onchange = (event) => {
            let checkboxes = document.getElementsByClassName(checkbox.className);
            let target = event.target;
            if (target.checked) {
                --gVotesLeft;
                if (gVotesLeft === 0) {
                    for (let checkbox of checkboxes) {
                        if (!checkbox.checked) {
                            checkbox.disabled = true;
                        }
                    }
                    part2Submit.disabled = false;
                }
            }
            else {
                if (gVotesLeft === 0) {
                    for (let checkbox of checkboxes) {
                        checkbox.disabled = false;
                    }
                    part2Submit.disabled = true;
                }
                ++gVotesLeft;
            }
        };
        let label = document.createElement('label');
        label.textContent = movie.textContent;
        label.htmlFor = checkbox.id;
        let li = document.createElement('li');
        li.appendChild(checkbox);
        li.appendChild(label);
        checkboxList.appendChild(li);
    }
    gVoteList = new Array(movieList.children.length);
    gVoteList.fill(0);
    let voteCountInput = getNodeId('voteCountInput');
    gVotesLeft = +voteCountInput.value;
};
// part2
let part2Submit = getNodeId('part2Submit');
part2Submit.onclick = () => {
    if (gVotesLeft) {
        console.log('there are votes left');
        return;
    }
    let voteCountInput = getNodeId('voteCountInput');
    gVotesLeft = +voteCountInput.value;
    ++gCurrentNameIndex;
    let checkboxes = document.getElementsByClassName('checkboxes');
    for (let i = 0; i < checkboxes.length; ++i) {
        let checkbox = checkboxes[i];
        if (checkbox.checked) {
            ++gVoteList[i];
        }
        checkbox.checked = false;
        checkbox.disabled = false;
    }
    part2Submit.disabled = true;
    let nameList = getNodeId('nameList');
    if (gCurrentNameIndex < nameList.children.length) {
        let currentName = getNodeId('currentName');
        currentName.textContent = nameList.children[gCurrentNameIndex].textContent;
    }
    else {
        gCurrentNameIndex = 0;
        // set up part 3
        let part2 = getNodeId('part2');
        let part3 = getNodeId('part3');
        part2.hidden = true;
        part3.hidden = false;
        // sort results
        let sortedIndexList = new Array(gVoteList.length);
        for (let i = 0; i < sortedIndexList.length; ++i) {
            sortedIndexList[i] = i;
        }
        sortedIndexList.sort((a, b) => gVoteList[b] - gVoteList[a]);
        // show results
        let movieList = getNodeId('movieList');
        let tableBody = document.getElementById('resultTableBody');
        // clear results table body before adding to it
        while (tableBody.firstChild) {
            tableBody.removeChild(tableBody.firstChild);
        }
        for (let i of sortedIndexList) {
            let movieTd = document.createElement('td');
            movieTd.textContent = movieList.children[i].textContent;
            let voteTd = document.createElement('td');
            voteTd.textContent = String(gVoteList[i]);
            let checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            let tr = document.createElement('tr');
            tr.appendChild(checkbox);
            tr.appendChild(movieTd);
            tr.appendChild(voteTd);
            tableBody.appendChild(tr);
        }
        let restartButton = document.getElementById('restartButton');
        restartButton.onclick = () => {
            let part1 = getNodeId('part1');
            let part3 = getNodeId('part3');
            part1.hidden = false;
            part3.hidden = true;
            // clear movieList before re-adding the movies that are checked
            while (movieList.firstChild) {
                movieList.removeChild(movieList.firstChild);
            }
            for (let row of tableBody.children) {
                let checkbox = row.children[0];
                let movieName = row.children[1].textContent;
                if (checkbox.checked) {
                    addToList(movieName, movieList);
                }
            }
            updateVoteCountInput();
        };
    }
};
