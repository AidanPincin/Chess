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
    static D(piece){
        const openSquares = []
        const index = chessBoard.letters.findIndex(letter => piece.pos.slice(0,1) == letter)
        const num = JSON.parse(piece.pos.slice(1,2))
        const vars = [[1,1],[1,-1],[-1,-1],[-1,1]]
        for(let r=0; r<4; r++){
            for(let i=1; i<8; i++){
                const pos = chessBoard.letters[index+i*vars[r][0]]+JSON.stringify(num+i*vars[r][1])
                if(chessBoard.squares.find(s => s == pos)){
                    const square = chessBoard.pieces.find(p => p.pos == pos)
                    if(square != undefined){
                        if(square.color != piece.color){
                            openSquares.push(pos)
                        }
                        i = 10
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
        const index = chessBoard.letters.findIndex(letter => piece.pos.slice(0,1) == letter)
        for(let i=1; i<chessBoard.letters.length-index; i++){
            const pos = chessBoard.letters[index+i]+piece.pos.slice(1,2)
            const square = chessBoard.pieces.find(p => p.pos == pos)
            if(square != undefined){
                if(square.color != piece.color){
                    openSquares.push(pos)
                }
                i = 10
            }
            else{
                openSquares.push(pos)
            }
        }
        for(let i=1; i<=index; i++){
            const pos = chessBoard.letters[index-i]+piece.pos.slice(1,2)
            const square = chessBoard.pieces.find(p => p.pos == pos)
            if(square != undefined){
                if(square.color != piece.color){
                    openSquares.push(pos)
                }
                i = 10
            }
            else{
                openSquares.push(pos)
            }
        }
        for(let i=1; i<=8-JSON.parse(piece.pos.slice(1,2)); i++){
            const pos = piece.pos.slice(0,1)+JSON.stringify(JSON.parse(piece.pos.slice(1,2))+i)
            const square = chessBoard.pieces.find(p => p.pos == pos)
            if(square != undefined){
                if(square.color != piece.color){
                    openSquares.push(pos)
                }
                i = 10
            }
            else{
                openSquares.push(pos)
            }
        }
        for(let i=1; i<JSON.parse(piece.pos.slice(1,2)); i++){
            const pos = piece.pos.slice(0,1)+JSON.stringify(JSON.parse(piece.pos.slice(1,2))-i)
            const square = chessBoard.pieces.find(p => p.pos == pos)
            if(square != undefined){
                if(square.color != piece.color){
                    openSquares.push(pos)
                }
                i = 10
            }
            else{
                openSquares.push(pos)
            }
        }
        return openSquares
    }
    static K(piece){
        const index = chessBoard.letters.findIndex(letter => piece.pos.slice(0,1) == letter)
        const openSquares = []
        const vars = [[0,1],[0,-1],[-1,0],[1,0],[1,1],[-1,-1],[-1,1],[1,-1]]
        for(let i=0; i<vars.length; i++){
            const pos = chessBoard.letters[index+vars[i][0]]+JSON.stringify(JSON.parse(piece.pos.slice(1,2))+vars[i][1])
            const square = chessBoard.pieces.find(p => p.pos == pos)
            if(square == undefined && chessBoard.squares.find(s => s == pos)){
                openSquares.push(pos)
            }
            else if(chessBoard.squares.find(s => s == pos) && square.color != piece.color){
                openSquares.push(pos)
            }
        }
        if(piece.moved == false){
            const nums = [1,8]
            for(let i=0; i<2; i++){
                if(openSquares.find(s => s == 'f'+JSON.stringify(nums[i]))){
                    const pos = chessBoard.letters[index+2]+piece.pos.slice(1,2)
                    const square = chessBoard.pieces.find(p => p.pos == pos)
                    if(square == undefined){
                        const pos1 = chessBoard.letters[index+3]+piece.pos.slice(1,2)
                        const square1 = chessBoard.pieces.find(p => p.pos == pos1)
                        if(square1 != undefined && square1.name == 'Rook' && square1.moved == false){
                            openSquares.push(pos)
                        }
                    }
                }
                if(openSquares.find(s => s == 'd'+JSON.stringify(nums[i]))){
                    const pos = chessBoard.letters[index-2]+piece.pos.slice(1,2)
                    const square = chessBoard.pieces.find(p => p.pos == pos)
                    if(square == undefined){
                        const pos1 = chessBoard.letters[index-3]+piece.pos.slice(1,2)
                        const square1 = chessBoard.pieces.find(p => p.pos == pos1)
                        if(square1 == undefined){
                            const pos2 = chessBoard.letters[index-4]+piece.pos.slice(1,2)
                            const square2 = chessBoard.pieces.find(p => p.pos == pos2)
                            if(square2 != undefined && square2.name == 'Rook' && square2.moved == false){
                                openSquares.push(pos)
                            }
                        }
                    }
                }
            }
        }
        for(let i=0; i<openSquares.length; i++){
            const s = openSquares[i]
            const found = chessBoard.pieces.find(p => p.pos == s && p != piece)
            if(found != undefined){
                chessBoard.pieces.splice(chessBoard.pieces.findIndex(p => p == found),1)
            }
            for(let l=0; l<chessBoard.pieces.length; l++){
                const p = chessBoard.pieces[l]
                if(p.color != piece.color){
                    const os = []
                    if(p.name == 'Rook' || p.name == 'Queen'){
                        Piece.VH(p).filter(square => os.push(square))
                    }
                    if(p.name == 'Bishop' || p.name == 'Queen'){
                        Piece.D(p).filter(square => os.push(square))
                    }
                    if(p.name == 'Pawn'){
                        Piece.P(p).filter(square => os.push(square))
                    }
                    if(p.name == 'Knight'){
                        Piece.N(p).filter(square => os.push(square))
                    }
                    if(p.name == 'Pawn'){
                        for(let r=0; r<os.length; r++){
                            if(os[r].slice(0,1) == p.pos.slice(0,1)){
                                os.splice(r,1)
                                r-=1
                            }
                        }
                        for(let r=0; r<2; r++){
                            const index = chessBoard.letters.findIndex(letter => letter == p.pos.slice(0,1))
                            const colors = ['white','black']
                            const pos = chessBoard.letters[index+1-r*2]+JSON.stringify(JSON.parse(p.pos.slice(1,2))+1-(2*colors.findIndex(c => c == p.color)))
                            if(chessBoard.squares.find(sq => sq == pos)){
                                os.push(pos)
                            }
                        }
                    }
                    for(let r=0; r<os.length; r++){
                        if(os[r] == s){
                            openSquares.splice(i,1)
                        }
                    }
                }
            }
            if(found != undefined){
                chessBoard.pieces.push(found)
            }
        }
        return openSquares
    }
    static P(piece){
        const openSquares = []
        let moves = 1
        if(piece.moved == false){
            moves = 2
        }
        let mult = 1
        if(piece.color == 'black'){
            mult = -1
        }
        for(let i=1; i<1+moves; i++){
            const pos = piece.pos.slice(0,1)+JSON.stringify(JSON.parse(piece.pos.slice(1,2))+i*mult)
            const p = chessBoard.pieces.find(pi => pi.pos == pos)
            if(p == undefined){
                openSquares.push(pos)
            }
        }
        for(let i=0; i<2; i++){
            const pos = chessBoard.letters[chessBoard.letters.findIndex(p => p == piece.pos.slice(0,1))-1+i*2]+JSON.stringify(JSON.parse(piece.pos.slice(1,2))+1*mult)
            const square = chessBoard.pieces.find(p => p.pos == pos)
            if(square != undefined && square.color != piece.color){
                openSquares.push(pos)
            }
        }
        return openSquares
    }
    static N(piece){
        const vars = [[2,1],[1,2],[-1,2],[-2,1],[-2,-1],[-1,-2],[1,-2],[2,-1]]
        const openSquares = []
        for(let i=0; i<vars.length; i++){
            const pos = chessBoard.letters[chessBoard.letters.findIndex(l => l == piece.pos.slice(0,1))+vars[i][0]]+JSON.stringify(JSON.parse(piece.pos.slice(1,2))+vars[i][1])
            const square = chessBoard.pieces.find(p => p.pos == pos)
            if((square == undefined || square.color != piece.color) && chessBoard.squares.find(s => s == pos)){
                openSquares.push(pos)
            }
        }
        return openSquares
    }
    static ifCheck(piece){
        let poss = undefined
        if(piece.name == 'King'){
            const openSquares = Piece.K(piece)
            for(let i=0; i<openSquares.length; i++){
                const savedPos = JSON.stringify(piece.pos)
                piece.pos = openSquares[i]
                const found = chessBoard.pieces.find(p => p.pos == piece.pos && p != piece)
                let savedPiece = undefined
                if(found != undefined){
                    savedPiece = JSON.stringify(found)
                    chessBoard.pieces.splice(chessBoard.pieces.findIndex(p => p == found),1)
                }
                for(let l=0; l<chessBoard.pieces.length; l++){
                    const p = chessBoard.pieces[l]
                    if(p.color != chessBoard.check){
                        const os = []
                        if(p.name == 'Rook' || p.name == 'Queen'){
                            Piece.VH(p).filter(square => os.push(square))
                        }
                        if(p.name == 'Bishop' || p.name == 'Queen'){
                            Piece.D(p).filter(square => os.push(square))
                        }
                        if(p.name == 'King'){
                            Piece.K(p).filter(square => os.push(square))
                        }
                        if(p.name == 'Pawn'){
                            Piece.P(p).filter(square => os.push(square))
                        }
                        if(p.name == 'Knight'){
                            Piece.N(p).filter(square => os.push(square))
                        }
                        for(let r=0; r<os.length; r++){
                            if(os[r] == piece.pos){
                                openSquares.splice(i,1)
                                i-=1
                            }
                        }
                    }
                }
                piece.pos = JSON.parse(savedPos)
                if(savedPiece != undefined){
                    const s = JSON.parse(savedPiece)
                    if(s.name == 'Bishop'){
                        const n = new Bishop(s.pos,s.color)
                        n.moved = s.moved
                        chessBoard.pieces.push(n)
                    }
                    if(s.name == 'Pawn'){
                        const n = new Pawn(s.pos,s.color)
                        n.moved = s.moved
                        chessBoard.pieces.push(n)
                    }
                    if(s.name == 'Rook'){
                        const n = new Rook(s.pos,s.color)
                        n.moved = s.moved
                        chessBoard.pieces.push(n)
                    }
                    if(s.name == 'Queen'){
                        const n = new Queen(s.pos,s.color)
                        n.moved = s.moved
                        chessBoard.pieces.push(n)
                    }
                    if(s.name == 'Knight'){
                        const n = new Knight(s.pos,s.color)
                        n.moved = s.moved
                        chessBoard.pieces.push(n)
                    }
                }
            }
            return openSquares
        }
        for(let i=0; i<chessBoard.pieces.length; i++){
            if(chessBoard.pieces[i].color == chessBoard.check){
                const p = chessBoard.pieces[i]
                const openSquares = []
                if(p.name == 'Rook' || p.name == 'Queen'){
                    Piece.VH(p).filter(square => openSquares.push(square))
                }
                if(p.name == 'Bishop' || p.name == 'Queen'){
                    Piece.D(p).filter(square => openSquares.push(square))
                }
                if(p.name == 'King'){
                    Piece.K(p).filter(square => openSquares.push(square))
                }
                if(p.name == 'Pawn'){
                    Piece.P(p).filter(square => openSquares.push(square))
                }
                if(p.name == 'Knight'){
                    Piece.N(p).filter(square => openSquares.push(square))
                }
                const k = chessBoard.pieces.find(ki => ki.color == chessBoard.check && ki.name == 'King')
                for(let r=0; r<openSquares.length; r++){
                    const savedPos = JSON.stringify(p.pos)
                    const savedPiece = chessBoard.pieces.find(pie => pie.pos == openSquares[r])
                    if(savedPiece != undefined){
                        chessBoard.pieces.splice(chessBoard.pieces.findIndex(pi => pi == savedPiece),1)
                    }
                    p.pos = openSquares[r]
                    for(let l=0; l<chessBoard.pieces.length; l++){
                        if(chessBoard.pieces[l].color != chessBoard.check){
                            const p1 = chessBoard.pieces[l]
                            const openSquares1 = []
                            if(p1.name == 'Rook' || p1.name == 'Queen'){
                                Piece.VH(p1).filter(square => openSquares1.push(square))
                            }
                            if(p1.name == 'Bishop' || p1.name == 'Queen'){
                                Piece.D(p1).filter(square => openSquares1.push(square))
                            }
                            if(p1.name == 'King'){
                                Piece.K(p1).filter(square => openSquares1.push(square))
                            }
                            if(p1.name == 'Pawn'){
                                Piece.P(p1).filter(square => openSquares1.push(square))
                            }
                            if(p1.name == 'Knight'){
                                Piece.N(p1).filter(square => openSquares1.push(square))
                            }
                            for(let y=0; y<openSquares1.length; y++){
                                if(openSquares1[y] == k.pos){
                                    openSquares.splice(r,1)
                                    r-=1
                                }
                            }
                        }
                    }
                    if(savedPiece != undefined){
                        chessBoard.pieces.push(savedPiece)
                    }
                    p.pos = JSON.parse(savedPos)

                }
                if(p == piece){
                    poss = openSquares
                }
            }
        }
        return poss
    }
}
class Pawn extends Piece{
    constructor(pos,color){
        super(pos,color)
        this.name = 'Pawn'
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
    constructor(){
        this.check = undefined
        this.turn = 'white'
        this.possibilities = []
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
        if(this.selectedPiece != undefined && this.selectedPiece.color == this.turn){
            if(this.check == undefined){
                const piece = this.selectedPiece
                const openSquares = []
                if(piece.name == 'Rook' || piece.name == 'Queen'){
                    Piece.VH(piece).filter(square => openSquares.push(square))
                }
                if(piece.name == 'Bishop' || piece.name == 'Queen'){
                    Piece.D(piece).filter(square => openSquares.push(square))
                }
                if(piece.name == 'King'){
                    Piece.K(piece).filter(square => openSquares.push(square))
                }
                if(piece.name == 'Pawn'){
                    Piece.P(piece).filter(square => openSquares.push(square))
                }
                if(piece.name == 'Knight'){
                    Piece.N(piece).filter(square => openSquares.push(square))
                }
                this.possibilities = openSquares
            }
            else{
                this.possibilities = Piece.ifCheck(this.selectedPiece)
            }
        }
        for(let i=0; i<this.possibilities.length; i++){
            const pos = this.convert(this.possibilities[i],0)
            ctx.beginPath()
            ctx.arc(this.x+(pos.col+0.5)*this.width/8,this.y+(pos.row+0.5)*this.height/8,10,0,Math.PI*2,false)
            ctx.fillStyle = '#00ff00'
            ctx.fill()
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
                for(let i=0; i<this.pieces.length; i++){
                    const p = this.pieces[i]
                    if(p.color != this.turn){
                        const openSquares = []
                        if(p.name == 'Rook' || p.name == 'Queen'){
                            Piece.VH(p).filter(square => openSquares.push(square))
                        }
                        if(p.name == 'Bishop' || p.name == 'Queen'){
                            Piece.D(p).filter(square => openSquares.push(square))
                        }
                        if(p.name == 'King'){
                            Piece.K(p).filter(square => openSquares.push(square))
                        }
                        if(p.name == 'Pawn'){
                            Piece.P(p).filter(square => openSquares.push(square))
                        }
                        if(p.name == 'Knight'){
                            Piece.N(p).filter(square => openSquares.push(square))
                        }
                        for(let r=0; r<openSquares.length; r++){
                            const k = this.pieces.find(pie => pie.pos == openSquares[r])
                            if(k != undefined && k.name == 'King'){
                                this.check = k.color
                                i=1000
                                r=1000
                            }
                            else{
                                this.check = undefined
                            }
                        }
                    }
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
}
const chessBoard = new ChessBoard()
function mainLoop(){
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0,0,900,900)
    chessBoard.draw()
    requestAnimationFrame(mainLoop)
}
mainLoop()
window.addEventListener('mousedown', function(e){chessBoard.wasClicked(e)})
