import { grabImage } from "./images.js"
import { getMoves, comparePos, check, checkmate, saveState } from "./chessMoves.js"
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
const inverses = [7,6,5,4,3,2,1,0]
class Piece{
    constructor(name,color,pos){
        this.name = name
        this.color = color
        this.pos = pos
    }
    draw(margin,size,inverse){
        ctx.drawImage(grabImage(this.color+this.name),margin+this.pos.col*size*(inverse-1)*(-1)+inverses[this.pos.col]*size*inverse,margin+this.pos.row*size*(inverse-1)*(-1)+inverses[this.pos.row]*size*inverse,size,size)
    }
    wasClicked(e,margin,size,inverse){
        const x = e.pageX-10
        const y = e.pageY-10
        if(x>=margin+this.pos.col*size*(inverse-1)*(-1)+inverses[this.pos.col]*size*inverse && x<=margin+this.pos.col*size*(inverse-1)*(-1)+inverses[this.pos.col]*size*inverse+size && y>=margin+this.pos.row*size*(inverse-1)*(-1)+inverses[this.pos.row]*size*inverse && y<=margin+this.pos.row*size*(inverse-1)*(-1)+inverses[this.pos.row]*size*inverse+size){
            return true
        }
    }
    move(margin,size,inverse,state,e){
        const x = e.pageX-10
        const y = e.pageY-10
        for(let i=0; i<this.legalMoves.length; i++){
            const m = this.legalMoves[i]
            if(x>=margin+m.col*size*(inverse-1)*(-1)+inverses[m.col]*size*inverse && x<= margin+m.col*size*(inverse-1)*(-1)+inverses[m.col]*size*inverse+size && y>=margin+m.row*size*(inverse-1)*(-1)+inverses[m.row]*size*inverse && y<=margin+m.row*size*(inverse-1)*(-1)+inverses[m.row]*size*inverse+size){
                const occupyingPiece = state.find(p => comparePos(p.pos,m))
                if(occupyingPiece != undefined){
                    state.splice(state.findIndex(p => comparePos(p.pos,m)),1)
                }
                if(this.enpessant != undefined){
                    if(comparePos(m,this.enpessant)){
                        state.splice(state.findIndex(p => p.pos.col == m.col && p.pos.row == m.row-1+2*['white','black'].findIndex(c => this.color == c)),1)
                    }
                }
                state.forEach(p => p.enpessant = undefined)
                this.legalMoves = []
                if(this.name == 'Pawn'){
                    if(m.row == 0 || m.row == 7){
                        this.name = 'Queen'
                    }
                    if(Math.abs(this.pos.row-m.row) == 2){
                        const enpessants = state.filter(p => p.name == 'Pawn' && p.color != this.color && Math.abs(this.pos.col-p.pos.col) == 1 && m.row == p.pos.row)
                        for(let i=0; i<enpessants.length; i++){
                            enpessants[i].enpessant = {
                                col: this.pos.col,
                                row: m.row+1-['black','white'].findIndex(c => c == this.color)*2
                            }
                        }
                    }
                }
                if(this.name == 'King' && this.moved != true){
                    if(this.pos.col-m.col == 2){
                        state.find(p => comparePos({row:this.pos.row,col:0},p.pos)).pos = {row:this.pos.row,col:2}
                    }
                    if(this.pos.col-m.col == -2){
                        state.find(p => comparePos({row:this.pos.row,col:7},p.pos)).pos = {row:this.pos.row,col:4}
                    }
                }
                this.pos = m
                this.moved = true
                return true
            }
        }
        return false
    }
}
class Chessboard{
    constructor(){
        this.setupBoard()
        this.selectedPiece = undefined
        this.bot = new Bot('black')
    }
    draw(){
        ctx.lineWidth = 2
        for(let row=0; row<8; row++){
            for(let col=0; col<8; col++){
                if(Math.round((row+col)/2) != (row+col)/2){
                    ctx.fillStyle = 'brown'
                }
                else{
                    ctx.fillStyle = 'beige'
                }
                ctx.fillRect(this.margin+col*this.size/8,this.margin+row*this.size/8,this.size/8,this.size/8)
            }
        }
        if(check(this.turn,this.pieces)){
            const pos = this.pieces.find(p => p.name == 'King' && p.color == this.turn).pos
            ctx.fillStyle = '#ff0000'
            ctx.fillRect(this.margin+this.size/8*pos.col*(this.inverse-1)*(-1)+inverses[pos.col]*this.inverse*this.size/8,this.margin+this.size/8*pos.row*(this.inverse-1)*(-1)+inverses[pos.row]*this.inverse*this.size/8,this.size/8,this.size/8)
        }
        this.pieces.forEach(p => p.draw(this.margin,this.size/8,this.inverse))
        if(this.selectedPiece != undefined){
            const moves = this.selectedPiece.legalMoves
            for(let i=0; i<this.selectedPiece.legalMoves.length; i++){
                ctx.fillStyle = '#00ff00'
                ctx.beginPath()
                ctx.arc(this.margin+moves[i].col*this.size/8*(this.inverse-1)*(-1)+inverses[moves[i].col]*this.inverse*this.size/8+this.size/16,this.margin+moves[i].row*this.size/8*(this.inverse-1)*(-1)+inverses[moves[i].row]*this.inverse*this.size/8+this.size/16,+this.size/64,0,Math.PI*2,false)
                ctx.fill()
            }
        }
        ctx.strokeRect(this.margin,this.margin,this.size,this.size)
    }
    setupBoard(){
        this.turn = 'white'
        this.pieces = []
        /*for(let i=0; i<8; i++){
            this.pieces.push(new Piece('Pawn','white',{row:1,col:i}))
            this.pieces.push(new Piece('Pawn','black',{row:6,col:i}))
        }
        const names = ['Rook','Knight','Bishop']
        for(let r=0; r<2; r++){
            this.pieces.push(new Piece('King',['white','black'][r],{row:r*7,col:3}))
            this.pieces.push(new Piece('Queen',['white','black'][r],{row:r*7,col:4}))
            for(let i=0; i<names.length; i++){
                for(let c=0; c<2; c++){
                    this.pieces.push(new Piece(names[i],['white','black'][c],{row:c*7,col:i+r*(7-i*2)}))
                }
            }
        }*/
        this.pieces.push(new Piece('King','white',{row:0,col:7}))
        this.pieces.push(new Piece('King','black',{row:7,col:7}))
        this.pieces.push(new Piece('Queen','black',{row:5,col:1}))
        this.pieces.push(new Piece('Rook','white',{row:0,col:0}))
        this.pieces.push(new Piece('Knight','white',{row:1,col:4}))
        this.pieces.push(new Piece('Knight','black',{row:2,col:7}))
        this.pieces.push(new Piece('Pawn','white',{row:1,col:6}))
        this.pieces.push(new Piece('Pawn','white',{row:1,col:7}))
        this.pieces.push(new Piece('Bishop','white',{row:0,col:6}))
        this.pieces.push(new Piece('Rook','black',{row:6,col:0}))
        this.pieces.push(new Piece('Bishop','black',{row:6,col:1}))
        this.pieces.push(new Piece('Pawn','black',{row:1,col:5}))
        this.inverse = 1
        this.turn = 'white'
    }
    resize(){
        this.size = Math.min(...[canvas.width,canvas.height])*(8/9)
        if(this.size<430){
            this.size=430
        }
        this.margin = this.size/16
    }
    wasClicked(e){
        if(this.selectedPiece == undefined){
            this.selectedPiece = this.pieces.find(p => p.color == this.turn && p.wasClicked(e,this.margin,this.size/8,this.inverse))
            if(this.selectedPiece != undefined){
                this.selectedPiece.legalMoves = getMoves(this.selectedPiece,this.pieces)
            }
        }
        else{
            const isMoving = this.selectedPiece.move(this.margin,this.size/8,this.inverse,this.pieces,e)
            if(isMoving == false){
                this.selectedPiece.legalMoves = []
                this.selectedPiece = this.pieces.find(p => p.color == this.turn && p.wasClicked(e,this.margin,this.size/8,this.inverse))
                if(this.selectedPiece != undefined){
                    this.selectedPiece.legalMoves = getMoves(this.selectedPiece,this.pieces)
                }
            }
            else{
                this.turn = ['white','black'].find(c => c != this.turn)
                if(checkmate(this.turn,this.pieces)){
                    setTimeout(() => {alert('checkmate!')},100)
                }
                else if(this.turn == 'black'){
                    this.bot.play(this.pieces,this.margin,this.size/8,this.inverse)
                }
            }
        }
    }
}
class Bot{
    constructor(color){
        this.color = color
        this.enemyColor = ['white','black'].find(c => c!=color)
    }
    play(state,margin,size,inverse){
        const mateIn1 = this.findMateIn1(state)
        let mateIn2 = undefined
        let mateIn3 = undefined
        if(mateIn1.piece == undefined){
            mateIn2 = this.findMateIn2(state)
            if(mateIn2.piece == undefined){
                mateIn3 = this.findMateIn3(state)
            }
        }
        let move = undefined
        let chosenPiece = undefined
        if(mateIn1.piece != undefined){
            chosenPiece = mateIn1.piece
            move = mateIn1.move
            setTimeout(() => {
                alert('checkmate!')
            },250)
        }
        else if(mateIn2.piece != undefined){
            chosenPiece = mateIn2.piece
            move = mateIn2.move
        }
        else if(mateIn3.piece != undefined){
            chosenPiece = mateIn3.piece
            move = mateIn3.move
        }
        else{
            const movablePieces = state.filter(p => getMoves(p,state).length>0 && p.color == this.color)
            chosenPiece = movablePieces[Math.round(Math.random()*(movablePieces.length-1))]
            chosenPiece.legalMoves = getMoves(chosenPiece,state)
            move = chosenPiece.legalMoves[Math.round(Math.random()*(chosenPiece.legalMoves.length-1))]
        }
        const e = {
            pageX: margin+(move.col*(inverse-1)*(-1)+inverses[move.col]*inverse)*size+size/2,
            pageY: margin+(move.row*(inverse-1)*(-1)+inverses[move.row]*inverse)*size+size/2
        }
        chosenPiece.move(margin,size,inverse,state,e)
        chessboard.turn = 'white'
    }
    findMateIn1(state){
        let m=0
        const movablePieces = state.filter(p => getMoves(p,state).length>0 && p.color == this.color)
        for(let i=0; i<movablePieces.length; i++){
            const moves = getMoves(movablePieces[i],state)
            for(let p=0; p<moves.length; p++){
                m+=1
                if(checkmate(this.enemyColor,saveState(state,[[movablePieces[i],moves[p]]]))){
                    movablePieces[i].legalMoves = getMoves(movablePieces[i],state)
                    return {piece: movablePieces[i], move: moves[p], m:m}
                }
            }
        }
        return {m:m}
    }
    findMateIn2(state){
        let m=0
        const pieces = state.filter(p => p.color == this.color && getMoves(p,state).find(m => check(this.enemyColor,saveState(state,[[p,m]]))))
        loop:for(let i=0; i<pieces.length; i++){
            const moves = getMoves(pieces[i],state).filter(m => check(this.enemyColor,saveState(state,[[pieces[i],m]])))
            for(let p=0; p<moves.length; p++){
                const copy = saveState(state,[[pieces[i],moves[p]]])
                const movablePieces = copy.filter(p => p.color != this.color && getMoves(p,copy).length>0)
                let mateCounter = 0
                for(let i1=0; i1<movablePieces.length; i1++){
                    const moves1 = getMoves(movablePieces[i1],copy)
                    for(let p1=0; p1<moves1.length; p1++){
                        mateCounter -= 1
                        m+=1
                        const copy1 = saveState(copy,[[movablePieces[i1],moves1[p1]]])
                        const mateIn1 = this.findMateIn1(copy1)
                        m+=mateIn1.m
                        if(mateIn1.piece != undefined){
                            mateCounter += 1
                        }
                        if(m>=1000000){
                            break loop
                        }
                    }
                }
                if(mateCounter == 0){
                    pieces[i].legalMoves = getMoves(pieces[i],state)
                    return {piece: pieces[i], move: moves[p], m:m}
                }
            }
        }
        return {m:m}
    }
    findMateIn3(state){
        let m=0
        const pieces = state.filter(p => p.color == this.color && getMoves(p,state).find(m => check(this.enemyColor,saveState(state,[[p,m]]))))
        loop:for(let i=0; i<pieces.length; i++){
            const moves = getMoves(pieces[i],state).filter(m => check(this.enemyColor,saveState(state,[[pieces[i],m]])))
            for(let p=0; p<moves.length; p++){
                const copy = saveState(state,[[pieces[i],moves[p]]])
                const movablePieces = copy.filter(p => p.color != this.color && getMoves(p,copy).length>0)
                let mateCounter = 0
                for(let i1=0; i1<movablePieces.length; i1++){
                    const moves1 = getMoves(movablePieces[i1],copy)
                    for(let p1=0; p1<moves1.length; p1++){
                        mateCounter -= 1
                        m+=1
                        const copy1 = saveState(copy,[[movablePieces[i1],moves1[p1]]])
                        const mateIn2 = this.findMateIn2(copy1)
                        const mateIn1 = this.findMateIn1(copy1)
                        m+=mateIn2.m
                        m+=mateIn1.m
                        if(mateIn2.piece != undefined || mateIn1.piece != undefined){
                            mateCounter += 1
                        }
                        if(m>=10000){
                            break loop
                        }
                    }
                }
                if(mateCounter == 0){
                    pieces[i].legalMoves = getMoves(pieces[i],state)
                    return {piece: pieces[i], move: moves[p]}
                }
            }
        }
        return {m:m}
    }
}
const chessboard = new Chessboard()
function mainLoop(){
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0,0,canvas.width,canvas.height)
    chessboard.draw()
    requestAnimationFrame(mainLoop)
}
function resize(){
    canvas.width = window.document.defaultView.innerWidth-20
    canvas.height = window.document.defaultView.innerHeight-20
    chessboard.resize()
}
resize()
mainLoop()
window.addEventListener('resize',resize)
window.addEventListener('click',function(e){chessboard.wasClicked(e)})
