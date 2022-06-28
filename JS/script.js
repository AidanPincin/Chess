import { grabImage } from "./images.js"
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
class Piece{
    constructor(pos,color){
        this.pos = pos
        this.color = color
        this.moved = false
    }
    draw(){
        const pos = chessBoard.convert(this.pos,0)
        const { x: x, width: w, y: y, height: h } = chessBoard
        ctx.drawImage(grabImage(this.color+this.name),x+pos.col*w/8,y+pos.row*h/8,w/8,h/8)
    }
    static K(piece){
        const vars = [[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]]
        const openSquares = []
        for(let i=0; i<vars.length; i++){
            const index = chessBoard.letters.findIndex(letter => letter == piece.pos.slice(0,1))
            const pos = chessBoard.letters[index+vars[i][0]]+JSON.stringify(JSON.parse(piece.pos.slice(1,2))+vars[i][1])
            if(chessBoard.squares.find(s => s == pos) != undefined){
                const p = chessBoard.pieces.find(p => p.pos == pos)
                if(p != undefined){
                    if(p.color != piece.color){
                        openSquares.push(pos)
                    }
                }
                else{
                    openSquares.push(pos)
                }
            }
        }
        const vs = [[3,1],[4,-1]]
        const index = chessBoard.letters.findIndex(l => l == piece.pos.slice(0,1))
        const num = piece.pos.slice(1,2)
        for(let l=0; l<2; l++){
            for(let i=1; i<=vs[l][0]; i++){
                if(piece.moved == false){
                    const p = chessBoard.pieces.find(p => p.pos == chessBoard.letters[index+i*vs[l][1]]+num)
                    const check = Piece.ifCheck(new King(chessBoard.letters[index+i*vs[l][1]]+num,piece.color),1,undefined,false)
                    if(i<vs[l][0]){
                        if(p != undefined || check != undefined){
                            i = 10
                        }
                    }
                    else{
                        if(p != undefined && p.moved == false && piece.color != chessBoard.check){
                            openSquares.push(chessBoard.letters[index+2*vs[l][1]]+num)
                        }
                    }
                }
            }
        }
        return openSquares
    }
    static P(piece){
        let l = 1
        const openSquares = []
        const colors = ['white','black']
        const pos = piece.pos.slice(0,1)+JSON.stringify(JSON.parse(piece.pos.slice(1,2))+1-colors.findIndex(c => c == piece.color)*2)
        if(chessBoard.squares.find(s => s == pos)){
            const p = chessBoard.pieces.find(p => p.pos == pos)
            if(p == undefined){
                openSquares.push(pos)
            }
        }
        if(piece.moved == false && openSquares.find(p => p == pos)){
            const pos1 = piece.pos.slice(0,1)+JSON.stringify(JSON.parse(piece.pos.slice(1,2))+2-colors.findIndex(c => c == piece.color)*4)
            if(chessBoard.squares.find(s => s == pos1)){
                const p1 = chessBoard.pieces.find(p => p.pos == pos1)
                if(p1 == undefined){
                    openSquares.push(pos1)
                }
            }
        }
        const vars = [-1,1]
        for(let i=0; i<vars.length; i++){
            const letter = chessBoard.letters[chessBoard.letters.findIndex(letter => letter == piece.pos.slice(0,1))+vars[i]]
            const pos = letter+JSON.stringify(JSON.parse(piece.pos.slice(1,2))+1-2*colors.findIndex(c => c == piece.color))
            const p = chessBoard.pieces.find(p => p.pos == pos)
            if(p != undefined && p.color != piece.color){
                openSquares.push(pos)
            }
        }
        const enPassants = chessBoard.pieces.filter(p => p.color != piece.color && p.enPassant == true)
        for(let i=0; i<enPassants.length; i++){
            const p = enPassants[i]
            const dif = chessBoard.letters.findIndex(l => l == p.pos.slice(0,1))-chessBoard.letters.findIndex(l => l == piece.pos.slice(0,1))
            if(piece.pos.slice(1,2) == p.pos.slice(1,2) && (dif == -1 || dif == 1)){
                const colors = ['black','white']
                const pos = p.pos.slice(0,1)+JSON.stringify(JSON.parse(p.pos.slice(1,2))+1-2*colors.findIndex(c => c == p.color))
                openSquares.push(pos)
            }
        }
        return openSquares
    }
    static N(piece){
        const openSquares = []
        const vars = [[2,1],[1,2],[-1,2],[-2,1],[-2,-1],[-1,-2],[1,-2],[2,-1]]
        for(let i=0; i<vars.length; i++){
            const letter = chessBoard.letters[chessBoard.letters.findIndex(letter => letter == piece.pos.slice(0,1))+vars[i][0]]
            const num = JSON.stringify(JSON.parse(piece.pos.slice(1,2))+vars[i][1])
            const pos = letter+num
            if(chessBoard.squares.find(s => s == pos)){
                const p = chessBoard.pieces.find(p => p.pos == pos)
                if(p != undefined){
                    if(p.color != piece.color){
                        openSquares.push(pos)
                    }
                }
                else{
                    openSquares.push(pos)
                }
            }
        }
        return openSquares
    }
    static D(piece){
        const openSquares = []
        const vars = [[1,1],[-1,-1],[-1,1],[1,-1]]
        for(let l=0; l<vars.length; l++){
            for(let i=1; i<8; i++){
                const letter = chessBoard.letters[chessBoard.letters.findIndex(letter => letter == piece.pos.slice(0,1))+i*vars[l][0]]
                const num = JSON.stringify(JSON.parse(piece.pos.slice(1,2))+i*vars[l][1])
                const pos = letter+num
                const square = chessBoard.squares.find(s => s == pos)
                if(square != undefined){
                    const p = chessBoard.pieces.find(p => p.pos == pos)
                    if(p != undefined){
                        if(p.color != piece.color){
                            openSquares.push(pos)
                        }
                        i=10
                    }
                    else{
                        openSquares.push(pos)
                    }
                }
            }
        }
        return openSquares
    }
    static VH(piece){
        const openSquares = []
        const vars = [[1,0],[-1,0],[0,1],[0,-1]]
        for(let l=0; l<vars.length; l++){
            for(let i=1; i<8; i++){
                const letter = chessBoard.letters[chessBoard.letters.findIndex(letter => letter == piece.pos.slice(0,1))+i*vars[l][1]]
                const number = JSON.stringify(JSON.parse(piece.pos.slice(1,2))+i*vars[l][0])
                const pos = letter+number
                if(chessBoard.squares.find(s => s == pos) != undefined){
                    const p = chessBoard.pieces.find(p => p.pos == pos)
                    if(p != undefined){
                        if(p.color != piece.color){
                            openSquares.push(pos)
                        }
                        i=10
                    }
                    else{
                        openSquares.push(pos)
                    }
                }
            }
        }
        return openSquares
    }
    static ifCheck(piece,which=1,openSquares=undefined,king=true){
        const c = piece.color
        if(which == 0){
            const os = openSquares
            const k = chessBoard.pieces.find(p => p.name == 'King' && p.color == piece.color)
            for(let i=0; i<os.length; i++){
                const savedPos = JSON.stringify(piece.pos)
                const p1 = chessBoard.pieces.find(p => p.pos == os[i])
                const savedPiece = JSON.stringify(p1)
                if(p1 != undefined){
                    chessBoard.pieces.splice(chessBoard.pieces.findIndex(p => p == p1),1)
                }
                piece.pos = os[i]
                const check = Piece.ifCheck(k)
                if(check != undefined){
                    os.splice(i,1)
                    i-=1
                }
                piece.pos = JSON.parse(savedPos)
                if(p1 != undefined){
                    const p2 = JSON.parse(savedPiece)
                    const { name: n, pos: pos, moved: m, color: c } = p2
                    const p3 = new Piece(pos,c)
                    p3.name = n
                    p3.moved = m
                    chessBoard.pieces.push(p3)
                }
            }
            return os
        }
        else{
            const opPieces = chessBoard.pieces.filter(p => p.color != c)
            const os = []
            for(let i=0; i<opPieces.length; i++){
                ChessBoard.getPossibilities(opPieces[i],king).filter(s => os.push(s))
            }
            for(let i=0; i<os.length; i++){
                if(os[i] == piece.pos){
                    return c
                }
            }
        }
        return undefined
    }
    static ifCheckmate(color){
        const pieces = chessBoard.pieces.filter(p => p.color == color)
        const openSquares = []
        for(let i=0; i<pieces.length; i++){
            Piece.ifCheck(pieces[i],0,ChessBoard.getPossibilities(pieces[i])).filter(s => openSquares.push(s))
        }
        if(openSquares.length == 0){
            return color
        }
        return undefined

    }
}
class Pawn extends Piece{
    constructor(pos,color){
        super(pos,color)
        this.name = 'Pawn'
        this.enPassant = false
    }
}
class Bishop extends Piece{
    constructor(pos,color){
        super(pos,color)
        this.name = 'Bishop'
    }
}
class Knight extends Piece{
    constructor(pos,color){
        super(pos,color)
        this.name = 'Knight'
    }
}
class Queen extends Piece{
    constructor(pos,color){
        super(pos,color)
        this.name = 'Queen'
    }
}
class King extends Piece{
    constructor(pos,color){
        super(pos,color)
        this.name = 'King'
    }
}
class Rook extends Piece{
    constructor(pos,color){
        super(pos,color)
        this.name = 'Rook'
    }
}
class ChessBoard{
    constructor(players=1){
        this.AIs = [new AI('white'), new AI('black')]
        this.players = players
        this.blackWins = 0
        this.whiteWins = 0
        this.stalemates = 0
        if(players == 0){
            setInterval(() => {
                if(chessBoard.checkmate == undefined){
                    try{
                        if(chessBoard.turn == 'white'){
                            chessBoard.AIs[0].play()
                        }
                        else{
                            chessBoard.AIs[1].play()
                        }
                    }
                    catch{
                        chessBoard.stalemates += 1
                        chessBoard.createPieces()
                    }
                    if(chessBoard.pieces.length == 2){
                        chessBoard.stalemates += 1
                        chessBoard.createPieces()
                    }
                }
                else{
                    if(chessBoard.check == 'white'){
                        chessBoard.whiteWins += 1
                    }
                    else{
                        chessBoard.blackWins += 1
                    }
                    chessBoard.createPieces()
                    chessBoard.checkmate = undefined
                    chessBoard.check = undefined
                }
            },150)
            setInterval(() => {
                console.log('Wins: '+Math.round(chessBoard.whiteWins+chessBoard.blackWins)+' -- Black: '+chessBoard.blackWins+'  White: '+chessBoard.whiteWins+'   Stalemates: '+chessBoard.stalemates)
            },5000)
        }
        this.check = undefined
        this.turn = 'white'
        this.possibilities = []
        this.checkmate = undefined
        ctx.lineWidth = 2
        this.x = 50
        this.y = 50
        this.width = 800
        this.height = 800
        this.oddNums = [1,3,5,7,9,11,13,15]
        this.letters = ['a','b','c','d','e','f','g','h']
        this.squares = []
        for(let i=0; i<8; i++){
            for(let r=1; r<9; r++){
                this.squares.push(this.letters[i]+JSON.stringify(r))
            }
        }
        this.numbers = [8,7,6,5,4,3,2,1]
        this.point = []
        this.selectedPiece = undefined
        this.createPieces()
    }
    draw(){
        for(let row=1; row<=8; row++){
            for(let col=1; col<=8; col++){
                if(this.oddNums.find(num => num == row+col)){
                    ctx.fillStyle = 'brown'
                }
                else{
                    ctx.fillStyle = 'beige'
                }
                ctx.fillRect(this.x+this.width/8*(row-1),this.y+this.height/8*(col-1),this.width/8,this.height/8)
            }
        }
        for(let i=0; i<8; i++){
            ctx.fillStyle = '#000000'
            ctx.font = '10px sans-serif'
            ctx.fillText(this.letters[i],this.x+(i+1)*this.width/8-10,this.y+this.height-5)
            ctx.fillText(this.numbers[i],this.x+5,this.y+10+i*this.height/8)
        }
        if(this.check != undefined){
            const piece = this.pieces.find(p => p.name == 'King' && p.color == this.check)
            const pos = this.convert(piece.pos,0)
            ctx.fillStyle = '#ff0000'
            const { x: x, y: y, width: w, height: h } = this
            ctx.fillRect(x+w/8*pos.col,y+h/8*pos.row,w/8,h/8)
        }
        ctx.beginPath()
        ctx.moveTo(this.x,this.y)
        ctx.lineTo(this.x+this.width,this.y)
        ctx.lineTo(this.x+this.width,this.y+this.height)
        ctx.lineTo(this.x,this.y+this.height)
        ctx.lineTo(this.x,this.y)
        ctx.stroke()
        for(let i=0; i<this.pieces.length; i++){
            this.pieces[i].draw()
        }
        if(this.point.length>0){
            const { 0: x, 1: y } = this.point
            const { width: w, height: h } = this
            ctx.beginPath()
            ctx.moveTo(x,y)
            ctx.lineTo(x+w/8,y)
            ctx.lineTo(x+w/8,y+h/8)
            ctx.lineTo(x,y+h/8)
            ctx.lineTo(x,y)
            ctx.stroke()
        }
        for(let i=0; i<this.possibilities.length; i++){
            const pos = this.convert(this.possibilities[i],0)
            ctx.beginPath()
            ctx.arc(this.x+(pos.col+0.5)*this.width/8,this.y+(pos.row+0.5)*this.height/8,10,0,Math.PI*2,false)
            ctx.fillStyle = '#00ff00'
            ctx.fill()
        }
        this.possibilities = []
        if(this.selectedPiece != undefined && this.turn == this.selectedPiece.color){
            this.possibilities = Piece.ifCheck(this.selectedPiece,0,ChessBoard.getPossibilities(this.selectedPiece))
        }
        if(this.checkmate != undefined){
            ctx.fillStyle = '#000000'
            ctx.font = '36px Arial'
            const colors = ['white','black']
            const width = ctx.measureText('Checkmate! '+colors.find(c => c != this.checkmate)+' wins!').width
            ctx.fillText('Checkmate! '+colors.find(c => c != this.checkmate)+' wins!',450-width/2,40)
        }
    }
    wasClicked(e){
        const x = e.pageX-10
        const y = e.pageY-10
        const row = Math.round((x-this.x-this.width/16)/(this.width/8))
        const col = Math.round((y-this.y-this.height/16)/(this.height/8))
        if(row>=0 && row<=7 && col>=0 && col<=7){
            this.point = [this.x+row*this.width/8,this.y+col*this.height/8]
        }
        if(this.selectedPiece == undefined){
            this.selectedPiece = this.pieces.find(p => p.pos == this.convert({ row: col, col: row },1))
        }
        else if(this.selectedPiece.color == this.turn){
            const pos = this.convert({ row: col, col: row },1)
            const ifMoved = this.possibilities.find(p => p == pos)
            if(ifMoved != undefined){
                this.selectedPiece.pos = ifMoved
                this.possibilities = []
                if(this.selectedPiece.name == 'King' && this.selectedPiece.moved == false){
                    const nums = [1,8]
                    for(let i=0; i<2; i++){
                        if(ifMoved == 'g'+JSON.stringify(nums[i])){
                            const piece = this.pieces.find(p => p.pos == 'h'+JSON.stringify(nums[i]))
                            piece.pos = 'f'+JSON.stringify(nums[i])
                            piece.moved = true
                        }
                        if(ifMoved == 'c'+JSON.stringify(nums[i])){
                            const piece = this.pieces.find(p => p.pos == 'a'+JSON.stringify(nums[i]))
                            piece.pos = 'd'+JSON.stringify(nums[i])
                            piece.moved = true
                        }
                    }
                }
                if(this.selectedPiece.name == 'Pawn'){
                    const colors = ['white','black']
                    const p1 = this.selectedPiece
                    const p = chessBoard.pieces.find(p => p.color != p1.color && p.pos == p1.pos.slice(0,1)+JSON.stringify(JSON.parse(p1.pos.slice(1,2))+1-2*colors.findIndex(c => c == p.color)))
                    if(p != undefined && p.enPassant == true){
                        chessBoard.pieces.splice(chessBoard.pieces.findIndex(p2 => p2 == p),1)
                    }
                    const num = JSON.parse(p1.pos.slice(1,2))-7*colors.findIndex(c => c == p1.color)
                    if(num == 8 || num == 1){
                        p1.name = 'Queen'
                    }
                }
                this.pieces.filter(p => p.name == 'Pawn').enPassant = false
                if(this.selectedPiece.name == 'Pawn' && this.selectedPiece.moved == false){
                    if((this.selectedPiece.color == 'white' && JSON.parse(this.selectedPiece.pos.slice(1,2)) == 4) || (this.selectedPiece.color == 'black' && JSON.parse(this.selectedPiece.pos.slice(1,2)) == 5)){
                        this.selectedPiece.enPassant = true
                    }
                    
                }
                this.selectedPiece.moved = true
                if(this.pieces.find(p => p.pos == this.selectedPiece.pos && p != this.selectedPiece)){
                    const index = this.pieces.findIndex(p => p.pos == this.selectedPiece.pos && p != this.selectedPiece)
                    this.pieces.splice(index,1)
                }
                if(this.turn == 'white'){
                    if(this.check == 'white'){
                        this.check = undefined
                    }
                    this.turn = 'black'
                }
                else{
                    if(this.check == 'black'){
                        this.check = undefined
                    }
                    this.turn = 'white'
                }
                this.check = Piece.ifCheck(this.pieces.find(p => p.name == 'King' && p.color == this.turn))
                if(this.check != undefined){
                    this.checkmate = Piece.ifCheckmate(this.check)
                }
                this.selectedPiece = undefined
                if(this.turn == this.Ais[1].color && this.checkmate == undefined && this.players == 1){
                    setTimeout(() => {
                        this.AIs[1].play()
                    },1000)
                }
            }
            else{
                this.selectedPiece = this.pieces.find(p => p.pos == this.convert({ row: col, col: row },1))
            }
        }
        else{
            this.selectedPiece = this.pieces.find(p => p.pos == this.convert({ row: col, col: row },1))
        }
    }
    convert(pos,which){
        if(which == 0){
            const col = this.letters.findIndex(letter => letter == pos.slice(0,1))
            const row = this.numbers.findIndex(number => number == JSON.parse(pos.slice(1,2)))
            return { row: row, col: col }
        }
        else if(which == 1){
            const letter = this.letters[pos.col]
            const number = JSON.stringify(this.numbers[pos.row])
            return letter+number
        }
    }
    static getPossibilities(piece,king=true){
        const possibilities = []
        if(piece.name == 'King' && king == true){
            Piece.K(piece).filter(s => possibilities.push(s))
        }
        if(piece.name == 'Pawn'){
            Piece.P(piece).filter(s => possibilities.push(s))
        }
        if(piece.name == 'Knight'){
            Piece.N(piece).filter(s => possibilities.push(s))
        }
        if(piece.name == 'Bishop' || piece.name == 'Queen'){
            Piece.D(piece).filter(s => possibilities.push(s))
        }
        if(piece.name == 'Rook' || piece.name == 'Queen'){
            Piece.VH(piece).filter(s => possibilities.push(s))
        }
        return possibilities
    }
    createPieces(){
        this.pieces = []
        for(let i=0; i<8; i++){
            this.pieces.push(new Pawn(this.letters[i]+JSON.stringify(2),'white'))
            this.pieces.push(new Pawn(this.letters[i]+JSON.stringify(7),'black'))
        }
        const colors = ['white','black']
        for(let i=0; i<2; i++){
            for(let c=0; c<2; c++){
                this.pieces.push(new Rook(this.letters[0+i*7]+JSON.stringify(1+c*7),colors[c]))
                this.pieces.push(new Knight(this.letters[1+i*5]+JSON.stringify(1+c*7),colors[c]))
                this.pieces.push(new Bishop(this.letters[2+i*3]+JSON.stringify(1+c*7),colors[c]))
            }
        }
        for(let i=0; i<2; i++){
            this.pieces.push(new King('e'+JSON.stringify(1+i*7),colors[i]))
            this.pieces.push(new Queen('d'+JSON.stringify(1+i*7),colors[i]))
        }
    }
}
class AI{
    constructor(color){
        this.color = color
    }
    play(){
        const pieces = chessBoard.pieces.filter(p => p.color == this.color)
        const movePieces = []
        for(let i=0; i<pieces.length; i++){
            const poss = Piece.ifCheck(pieces[i],0,ChessBoard.getPossibilities(pieces[i]))
            if(poss.length>0){
                movePieces.push(pieces[i])
            }
        }
        const chosenPiece = movePieces[Math.round(Math.random()*(movePieces.length-1))]
        const possibilities = Piece.ifCheck(chosenPiece,0,ChessBoard.getPossibilities(chosenPiece))
        const chosenMove = possibilities[Math.round(Math.random()*(possibilities.length-1))]
        chosenPiece.pos = chosenMove
        const colors = ['white','black']
        chessBoard.turn = colors.find(c => c != this.color)
        if(chessBoard.check == this.color){
            chessBoard.check = undefined
        }
        if(chosenPiece.name == 'Pawn' && chosenPiece.moved == false){
            if(JSON.parse(chosenPiece.pos.slice(1,2)) == 5 || JSON.parse(chosenPiece.pos.slice(1,2)) == 4){
                chosenPiece.enPassant = true
            }
        }
        const p = chessBoard.pieces.find(p => p.pos == chosenMove && p.color != this.color)
        if(p != undefined){
            chessBoard.pieces.splice(chessBoard.pieces.findIndex(p1 => p1 == p),1)
        }
        if(chosenPiece.name == 'Pawn' && JSON.parse(chosenPiece.pos.slice(1,2)) == 8-colors.findIndex(c => c == this.color)*7){
            chosenPiece.name = 'Queen'
        }
        if(chosenPiece.name == 'King' && chosenPiece.moved == false){
            const nums = [1,8]
            for(let i=0; i<2; i++){
                if(chosenPiece.pos == 'g'+JSON.stringify(nums[i])){
                    const piece = this.pieces.find(p => p.pos == 'h'+JSON.stringify(nums[i]))
                    piece.pos = 'f'+JSON.stringify(nums[i])
                    piece.moved = true
                }
                if(chosenPiece.pos == 'c'+JSON.stringify(nums[i])){
                    const piece = this.pieces.find(p => p.pos == 'a'+JSON.stringify(nums[i]))
                    piece.pos = 'd'+JSON.stringify(nums[i])
                    piece.moved = true
                }
            }
        }
        chosenPiece.moved = true
        chessBoard.check = Piece.ifCheck(chessBoard.pieces.find(pi => pi.name == 'King' && pi.color != this.color))
        if(chessBoard.check != undefined){
            chessBoard.checkmate = Piece.ifCheckmate(colors.find(c => c != this.color))
        }

    }
}
const chessBoard = new ChessBoard(1)
function mainLoop(){
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0,0,900,900)
    chessBoard.draw()
    requestAnimationFrame(mainLoop)
}
mainLoop()
window.addEventListener('mousedown', function(e){chessBoard.wasClicked(e)})
