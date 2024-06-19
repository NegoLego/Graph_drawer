"use strict";

let canvas = document.getElementById('myCanvas');
let ctx = canvas.getContext('2d');
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.lineWidth = 5;
let circles = [];

class Circle{
    constructor(x, y, rad, name){
        this.x = x;
        this.y = y;
        this.rad = rad;
        this.name = name;
    }

}

function drawAll(i){
    if(arguments.length == 1){
        ctx.beginPath();
        ctx.arc(circles[i].x, circles[i].y, circles[i].rad, 0, 2 * Math.PI);
    }
    else{
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for(let i of circles){
            ctx.beginPath();
            ctx.moveTo(i.x, i.y);
            ctx.arc(i.x, i.y, i.rad, 0, 2 * Math.PI);
        }
    }
    ctx.stroke();
    ctx.closePath();
}

function addCircle(){
    const rad = 35;
    const x = Math.random() * 1000;
    const y = Math.random() * 1000;
    const n = 'cv';
    circles.push(new Circle(x, y, rad, n));
    drawAll(circles.length - 1);
    console.log('u clicked me');
}

function removeCircle(){
    circles.pop();
    drawAll();
}

function main(){
    document.addEventListener('DOMContentLoaded', () => {
        let button1 = document.getElementById('button1');
        let button2 = document.getElementById('button2');
        button1.addEventListener('click', addCircle);
        console.log('Go!');
    });
}

main();