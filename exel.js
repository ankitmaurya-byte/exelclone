let selectedCell = document.querySelector('.selected-cell')
let global = {}
// created number rows--------------------------------------------------------------------------
let numerRow = document.querySelector('.number-row')
for (let i = 1; i <= 100; i++) {
    let numberDiv = document.createElement('div')
    numberDiv.innerHTML = i
    numberDiv.classList.add('number')
    numerRow.append(numberDiv)
}

// created alphabets column--------------------------------------------------------------------------
let alphabetsColomn = document.querySelector('.alphabets-colomn')
for (let i = 0; i < 26; i++) {
    let alphabet = document.createElement('div')
    alphabet.classList.add('alphabets')
    alphabet.textContent = String.fromCharCode(65 + i)
    alphabetsColomn.append(alphabet)
}



// created 100 x 26 cells 
let lastCell

let gridBoxes = document.querySelector('.grid-boxes')
for (let i = 1; i <= 100; i++) {
    let row = document.createElement('div')
    row.classList.add('row')
    for (let j = 0; j < 26; j++) {
        let box = document.createElement('div')
        let adress = String.fromCharCode(65 + j)
        box.classList.add('row-box')
        box.setAttribute('data-adress', adress + i)
        box.contentEditable = true
        row.append(box)

        global[adress + i] = {
            value: undefined,
            formula: undefined,
            upstream: [],
            downstream: []
        }

        // do all acitviy when you change input--------------------------------------------------------

        box.addEventListener('input', function (e) {

            let currCellAdress = e.currentTarget.getAttribute('data-adress')
            let currCellObj = global[currCellAdress]
            global[currCellAdress].formula = undefined
            inputValue(currCellAdress)
            currCellObj.value = e.currentTarget.textContent
            for (let i = 0; i < currCellObj.upstream.length; i++) {
                removeDownStream(currCellObj.upstream[k], currCellObj)
            }
            for (let i = 0; i < currCellObj.downstream.length; i++) {
                update(currCellObj.downstream[i])
            }
            currCellObj.upstream = []


        })



        function removeDownStream(parentCell, childCell) {
            let parentDWN = global[parentCell].downstream
            let arr = []
            for (let i = 0; i < parentDWN.length; i++) {
                if (parentDWN[i] = childCell) {
                    continue
                }
                arr.push(parentDWN[i])
            }
            global[parentCell] = arr

        }


        function inputValue(adress) {
            if (global[adress].formula != undefined) {
                document.querySelector('.formula-input').value = global[adress].formula
            } else {
                document.querySelector('.formula-input').value = ""
            }
        }

        function changeCell(requiredLetter, requiredNumber, currtarget) {
            selectedCell.textContent = requiredLetter + requiredNumber;
            let nextCell = document.querySelector(`[data-adress=${requiredLetter + requiredNumber}]`)
            setTimeout(() => { nextCell.focus() }, 0)
            currtarget.classList.remove('click')
            nextCell.classList.add('click')
            lastCell = nextCell
            inputValue(requiredLetter + requiredNumber)
        }

        // teleport to next cell after key press Enter-------------------------------------
        box.addEventListener('keyup', function (e) {
            e.preventDefault()
            let location = e.currentTarget.getAttribute(`data-adress`)
            let letter = location.slice(0, 1)
            let requiredNumber = parseInt(location.slice(1, location.length));
            if (e.keyCode == '37') {
                let requiredLetter = String.fromCharCode(parseInt(letter.charCodeAt(0)) - 1);
                changeCell(requiredLetter, requiredNumber, this)
            }
            if (e.keyCode == '39') {
                let requiredLetter = String.fromCharCode(parseInt(letter.charCodeAt(0)) + 1);

                changeCell(requiredLetter, requiredNumber, this)
            }

            if (e.keyCode == '38') {
                changeCell(letter, requiredNumber - 1, this)
            }

            if (e.key == 'Enter' || e.keyCode == '40') {
                changeCell(letter, requiredNumber + 1, this)

            }
        })

        // removing previous clicked
        box.addEventListener('mousedown', function (e) {
            if (lastCell) {
                lastCell.classList.remove('click')
            };
            lastCell = e.currentTarget
            e.currentTarget.classList.add('click')
            selectedCell.textContent = e.currentTarget.getAttribute('data-adress')
            inputValue(selectedCell.textContent)
        })

    }
    gridBoxes.append(row)
}

// scroll part
document.querySelector('.grid-boxes').addEventListener('scroll', function (e) {
    alphabetsColomn.style.transform = `translateX(-${e.target.scrollLeft}px)`
    numerRow.style.transform = `translateY(-${e.target.scrollTop}px)`
})

// selectedCell.addEventListener('click',function(e){
//     eselectedCell.select()
//     eselectedCell.focus()
// })




// corner box management--------------------------------------------------------

selectedCell.addEventListener('keyup', function (e) {
    if (e.key == 'Enter') {
        let cellAdress = e.target.textContent.toUpperCase()
        e.target.textContent = cellAdress
        let thatCell = document.querySelector(`[data-adress=${cellAdress}]`)
        // thatCell.click()
        setTimeout(() => { thatCell.focus() }, 10)
        if (thatCell) {

            if (lastCell) {
                lastCell.classList.remove('click')
            }
            thatCell.classList.add('click')
            lastCell = thatCell
        } else {
            alert("no cell found")
        }
    }
})



function update(cell) {
    let currCell = global[cell]
    let upstream = currCell.upstream
    let formula = currCell.formula
    valueObj = {}
    for (let i = 0; i < upstream.length; i++) {
        valueObj[upstream[i]] = global[upstream[i]].value
    }
    for (x in valueObj) {
        formula = formula.replace(x, valueObj[x])
    }
    let newValue = eval(formula)
    global[cell].value = newValue

    document.querySelector(`[data-adress=${cell}]`).textContent = newValue
    let downstream = currCell.downstream
    for (let i = 0; i < downstream.length; i++) {
        update(downstream[i])
    }

}



document.querySelector('.formula-input').addEventListener('keydown', function (e) {
    if (e.key == 'Enter' && lastCell != undefined) {
        let inputFormula = e.currentTarget.value
        inputFormula = inputFormula.toUpperCase();
        let currCell = lastCell.getAttribute('data-adress')
        global[currCell].formula = inputFormula
        let upstream = global[currCell].upstream
        for (let i = 0; i < upstream.length; i++) {
            removeDownStream(upstream[i], currCell)
        }
        global[currCell].upstream = []
        let formulaArr = inputFormula.split(' ')
        for (let i = 0; i < formulaArr.length; i++) {
            if (
                formulaArr[i] !== '+' &&
                formulaArr[i] !== '-' &&
                formulaArr[i] !== '*' &&
                formulaArr[i] !== '/' &&
                isNaN(formulaArr[i])
            ) {
                global[currCell].upstream.push(formulaArr[i])
                addToDownStream(formulaArr[i], currCell)
            }
        }
        update(currCell)
        e.currentTarget.value = ""
    }
})


function addToDownStream(parentCell, childCell) {
    global[parentCell].downstream.push(childCell)
}