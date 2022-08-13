import { grabImage } from "./images.js"
import { getMoves, checkPos, movePiece, ifCheckmate, RecordMove } from "./pieceMoves.js"
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
canvas.height = window.document.defaultView.innerHeight-20
canvas.width = window.document.defaultView.innerWidth-20
const cooldown = 100
function size(){
    let length;
    if(canvas.width>canvas.height){
        length = canvas.height
        if(canvas.width-canvas.height<200){
            length = canvas.width-200
        }
    }
    else{
        length = canvas.width
        if(canvas.height-canvas.width<200){
            length = canvas.height-200
        }
    }
    if(length<400){
        length = 400
    }
    return length
}
const pieceValues = {
    'Pawn': 1,
    'Queen': 9,
    'King': 10,
    'Rook': 5,
    'Knight': 3,
    'Bishop': 3
}
class Piece{
    constructor(color,name,pos){
        this.color = color
        this.name = name
        this.pos = pos
        this.img = grabImage(color+name)
        this.value = pieceValues[name]
    }
    draw(x,y,w,h){
        ctx.drawImage(this.img,x+this.pos.col*w/8,y+this.pos.row*h/8,w/8,h/8)
    }
    updatePiece(name){
        this.img = grabImage(this.color+name)
        this.value = pieceValues[name]
    }
}
class ChessBoard{
    constructor(x,y,w,h){
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.turn = 'white'
        this.pieces = this.boardSetup()
        this.selectedPiece = undefined
        this.moveHistory = []
        //setTimeout(() => {bot2.play(this.pieces,this.moveHistory)},cooldown)
    }
    draw(){
        const oddNums = [1,3,5,7,9,11,13,15]
        for(let row=0; row<8; row++){
            for(let col=0; col<8; col++){
                if(oddNums.find(num => num == row+col) != undefined){
                    ctx.fillStyle = 'brown'
                }
                else{
                    ctx.fillStyle = 'beige'
                }
                ctx.fillRect(this.x+col*this.w/8,this.y+row*this.h/8,this.w/8,this.h/8)
            }
        }
        for(let i=0; i<this.pieces.length; i++){
            this.pieces[i].draw(this.x,this.y,this.w,this.h)
        }
        if(this.selectedPiece != undefined){
            const moves = getMoves(this.selectedPiece,this.pieces,this.moveHistory)
            for(let i=0; i<moves.length; i++){
                if(this.pieces.find(p => checkPos(p.pos,moves[i]) && p != this.selectedPiece) || (this.selectedPiece.name == 'Pawn' && moves[i].col != this.selectedPiece.pos.col)){
                    ctx.fillStyle = '#ff0000'
                }
                else{
                    ctx.fillStyle = '#00ff00'
                }
                ctx.beginPath()
                ctx.arc(this.x+moves[i].col*this.w/8+this.w/16,this.y+moves[i].row*this.h/8+this.h/16,this.w/64,0,Math.PI*2,false)
                ctx.fill()
            }
        }
    }
    boardSetup(){
        const pieces = []
        const colors = ['black','white']
        const pieceNames = ['Rook','Knight','Bishop']
        for(let color=0; color<2; color++){
            pieces.push(new Piece(colors[color],'Queen',{row: color*7, col: 3}))
            pieces.push(new Piece(colors[color],'King',{row: color*7, col: 4}))
            for(let col=0; col<2; col++){
                for(let name=0; name<pieceNames.length; name++){
                    pieces.push(new Piece(colors[color],pieceNames[name],{row: color*7, col: name+col*(7-name*2)}))
                }
            }
        }
        for(let col=0; col<8; col++){
            pieces.push(new Piece('black','Pawn',{row: 1, col: col}))
            pieces.push(new Piece('white','Pawn',{row: 6, col: col}))
        }
        pieces.push(new Piece('white','Bishop',{row:5,col:1}))
        pieces.push(new Piece('white','Queen',{row:5,col:5}))
        return pieces
    }
    update(){
        this.x = size()/16
        this.y = size()/16
        this.w = size()*0.875
        this.h = size()*0.875
    }
    getPos(x,y){
        for(let row=0; row<8; row++){
            for(let col=0; col<8; col++){
                if(x>=this.x+col*this.w/8 && x<=this.x+(col+1)*this.w/8 && y>=this.y+row*this.h/8 && y<=this.y+(row+1)*this.h/8){
                    return { row: row, col: col }
                }
            }
        }
        return { row: 100, col: 100 }
    }
    wasClicked(e){
        if(e.which == undefined || this.turn == 'white'){
            const x = e.pageX-10
            const y = e.pageY-10
            const pos = this.getPos(x,y)
            if(this.selectedPiece != undefined){
                const moves = getMoves(this.selectedPiece,this.pieces,this.moveHistory)
                if(moves.find(move => checkPos(move,pos))){
                    if(this.turn == 'black'){
                        this.turn = 'white'
                        //setTimeout(() => {bot2.play(this.pieces,this.moveHistory)},cooldown)
                    }
                    else{
                        this.turn = 'black'
                        setTimeout(() => {bot1.play(this.pieces,this.moveHistory)},cooldown)
                    }
                    movePiece(this.selectedPiece,pos,this.pieces,this.moveHistory)
                    this.selectedPiece = undefined
                    const checkmate = ifCheckmate(this.pieces,this.moveHistory,this.turn)
                    if(checkmate == true){
                        setTimeout(() => {alert(['white','black'].find(c => c != this.turn)+' wins!')},100)
                    }
                }
                else{
                    this.selectedPiece = this.pieces.find(p => checkPos(pos,p.pos) && p.color == this.turn)
                }
            }
            else{
                this.selectedPiece = this.pieces.find(p => p.color == this.turn && checkPos(pos,p.pos))
            }
        }
    }
}
class Bot{
    constructor(color){
        this.color = color
    }
    play(state,moveHistory){
        const {x:X,y:Y,w:w,h:h} = chessBoard
        const x = X+10+w/16
        const y = Y+10+h/16
        let move = this.findMateIn1(state,moveHistory,this.color)
        if(move != undefined){
            movePiece(move,move.moveTo,state,moveHistory)
            setTimeout(() => {alert(this.color+' wins!')},100)
        }
        else{
            const moves = this.eliminateBadMoves(state,moveHistory,this.color)
            const piece = moves[Math.round(Math.random()*(moves.length-1))]
            const move = piece.moves[Math.round(Math.random()*(piece.moves.length-1))]
            movePiece(piece,move,state,moveHistory)
        }
    }
    findMateIn1(state,moveHistory,turn){
        const opPieces = state.filter(p => p.color == turn)
        const move = opPieces.find(p => getMoves(p,state,moveHistory).find(m => {
            const copyState = JSON.parse(JSON.stringify(state))
            const index = copyState.findIndex(r => checkPos(m,r.pos))
            const copyMoveHistory = JSON.parse(JSON.stringify(moveHistory))
            copyMoveHistory.push(new RecordMove(p,m,state))
            if(index>=0){
                copyState.splice(index,1)
            }
            copyState.find(r => checkPos(r.pos,p.pos)).pos = m
            if(ifCheckmate(copyState,copyMoveHistory,['white','black'].find(c => c != turn))){
                p.moveTo = m
                return true
            }
        }))
        return move
    }
    findExchanges(state,moveHistory,turn){

    }
    eliminateBadMoves(state,moveHistory,turn){
        return state.filter(p => {
            if(p.color == turn){
                p.moves = getMoves(p,state,moveHistory)
                p.moves.filter(m => {
                    const copyState = JSON.parse(JSON.stringify(state))
                    const copyMoveHistory = JSON.parse(JSON.stringify(moveHistory))
                    const index = copyState.findIndex(r => checkPos(r.pos,m))
                    if(index>=0){
                        copyState.splice(index,1)
                    }
                    copyMoveHistory.push(new RecordMove(p,m,copyState))
                    copyState.find(r => checkPos(r.pos,p.pos)).pos = m
                    if(this.findMateIn1(copyState,copyMoveHistory,['white','black'].find(c => c != turn))){
                        p.moves = p.moves.filter(l => checkPos(l,m) == false)
                    }
                })
                if(p.moves.length>0){
                    return true
                }
            }
        })
    }
}
const chessBoard = new ChessBoard(size()/16,size()/16,size()*0.875,size()*0.875)
const bot1 = new Bot('black')
const bot2 = new Bot('white')
function mainLoop(){
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0,0,900,1200)
    chessBoard.draw()
    requestAnimationFrame(mainLoop)
}
mainLoop()
window.addEventListener('resize',function(e){
    canvas.height = e.currentTarget.innerHeight-20
    canvas.width = e.currentTarget.innerWidth-20
    chessBoard.update()
})
window.addEventListener('mousedown',function(e){
    chessBoard.wasClicked(e)
})
