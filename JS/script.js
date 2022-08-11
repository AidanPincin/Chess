import { grabImage } from "./images.js"
import { getMoves, checkPos, movePiece } from "./pieceMoves.js"
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
canvas.height = window.document.defaultView.innerHeight-20
canvas.width = window.document.defaultView.innerWidth-20
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
class Piece{
    constructor(color,name,pos){
        this.color = color
        this.name = name
        this.pos = pos
        this.img = grabImage(color+name)
    }
    draw(x,y,w,h){
        ctx.drawImage(this.img,x+this.pos.col*w/8,y+this.pos.row*h/8,w/8,h/8)
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
        for(let col=0; col<8; col++){
            pieces.push(new Piece('black','Pawn',{row: 1, col: col}))
            pieces.push(new Piece('white','Pawn',{row: 6, col: col}))
        }
        for(let color=0; color<2; color++){
            pieces.push(new Piece(colors[color],'Queen',{row: color*7, col: 3}))
            pieces.push(new Piece(colors[color],'King',{row: color*7, col: 4}))
            for(let col=0; col<2; col++){
                for(let name=0; name<pieceNames.length; name++){
                    pieces.push(new Piece(colors[color],pieceNames[name],{row: color*7, col: name+col*(7-name*2)}))
                }
            }
        }
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
        const x = e.pageX-10
        const y = e.pageY-10
        const pos = this.getPos(x,y)
        if(this.selectedPiece != undefined){
            const moves = getMoves(this.selectedPiece,this.pieces,this.moveHistory)
            if(moves.find(move => checkPos(move,pos))){
                if(this.turn == 'black'){
                    this.turn = 'white'
                }
                else{
                    this.turn = 'black'
                }
                movePiece(this.selectedPiece,pos,this.pieces,this.moveHistory)
                this.selectedPiece = undefined
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
const chessBoard = new ChessBoard(size()/16,size()/16,size()*0.875,size()*0.875)
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