"use strict";
let circles = [], edges = [], nameToIndex = [];
let canvas, ctx, gl, rect;
const radius = 35;
initNameToIndex();

class Circle {
    constructor(x, y, radius, name) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.name = name;
        this.egdeWith = [];
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.fillText(this.name, this.x, this.y);
    }
}

class Edge {
    constructor(c1, c2) {
        this.c1 = c1;
        this.c2 = c2;
        if (nameToIndex[this.c1] < 0) {
            addCircle(this.c1);
            nameToIndex[this.c1] = circles.length - 1;
        }
        if (nameToIndex[this.c2] < 0) {
            addCircle(this.c2);
            nameToIndex[this.c2] = circles.length - 1;
        }
        circles[nameToIndex[this.c1]].egdeWith.push(nameToIndex[this.c2]);
        circles[nameToIndex[this.c2]].egdeWith.push(nameToIndex[this.c1]);
    }
    draw() {
        ctx.beginPath();
        ctx.moveTo(circles[nameToIndex[this.c1]].x, circles[nameToIndex[this.c1]].y);
        ctx.lineTo(circles[nameToIndex[this.c2]].x, circles[nameToIndex[this.c2]].y);
        ctx.stroke();
    }
}

function initNameToIndex() {
    nameToIndex.length = 10000;
    nameToIndex.fill(-1, 0, 10000);
}

function addCircle(name, x, y, radius) {
    if (arguments.length == 1) {
        x = 47 + Math.random() * (1000 - 94);
        y = 47 + Math.random() * (1000 - 94);
        radius = 35;
    }
    circles.push(new Circle(x, y, radius, name));
}

function removeCircle() {
    circles.pop();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    circles.forEach(i => i.draw());
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

let clickedCircle, lastclX, lastclY, coef = 10 / 6;
function mousedown(e) {
    let clX = (e.clientX - rect.left) * coef;
    let clY = (e.clientY - rect.top) * coef;
    let i = 0;
    while (i < circles.length) {
        if ((circles[i].x - clX) * (circles[i].x - clX) + (circles[i].y - clY) * (circles[i].y - clY) <= radius * radius) {
            console.log('Gotcha ', i);
            clickedCircle = circles[i];
            lastclX = clX;
            lastclY = clY;
            canvas.addEventListener('mousemove', mousemove);
            break;
        }
        i++;
    }
}
function mouseup() {
    canvas.removeEventListener('mousemove', mousemove);
}
function mousemove(e) {
    let clX = (e.clientX - rect.left) * coef;
    let clY = (e.clientY - rect.top) * coef;
    clickedCircle.x += clX - lastclX;
    clickedCircle.y += clY - lastclY;
    clearCanvas();
    edges.forEach(i => i.draw());
    circles.forEach(i => i.draw());
    lastclX = clX;
    lastclY = clY;
}

function init() {
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext('2d');
    gl = canvas.getContext('webgl2');
    rect = canvas.getBoundingClientRect()
    ctx.lineWidth = 4;
    ctx.font = '19px Verdana';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
}
let t = [], t2 = [], sortedXes = [], indexInSorted = [], sorted = [];
function mergeSort(st, dr) {
    if (st == dr) {
        return;
    }
    const m = Math.floor((st + dr) / 2);
    mergeSort(st, m);
    mergeSort(m + 1, dr);
    let i = st, j = m + 1, k = 0;
    while (i <= m && j <= dr) {
        if (sortedXes[i] < sortedXes[j]) {
            t2[i] = indexInSorted[k];
            t[k++] = sortedXes[i++];
        }
        else {
            t2[j] = indexInSorted[k];
            t[k++] = sortedXes[j++];
        }
    }
    while (i <= m) {
        t2[i] = indexInSorted[k];
        t[k++] = sortedXes[i++];
    }
    while (j <= dr) {
        t2[j] = indexInSorted[k];
        t[k++] = sortedXes[j++];
    }
    for (i = st, j = 0; j < k; i++, j++) {
        sortedXes[i] = t[j];
        indexInSorted[j] = t2[i];
    }
}
function makePlanar() {
    sortedXes = [];
    circles.forEach(i => sortedXes.push(i.x));
    for (let i = 0; i < circles.length; i++) {
        indexInSorted[i] = i;
    }
    mergeSort(0, sortedXes.length - 1);
    let indexInSortedLength = indexInSorted.length
    for (let i = 0; i < indexInSortedLength; i++) {
        sorted[indexInSorted[i]] = i;
    }
    console.log(indexInSorted);
    edges.forEach(i => {
        let circle1 = nameToIndex[i.c1];
        let circle2 = nameToIndex[i.c2];
        if (indexInSorted[circle2] > indexInSorted[circle1]) {
            aux = circle2;
            circle2 = circle1;
            circle1 = aux;
        }
        if (indexInSorted[circle1] != indexInSorted[circle2] - 1) {
            for (let i = indexInSorted[circle1] + 1; i < indexInSorted[circle2]; i++) {
                for (let j = 0; j < egdeWith.length; j++) {
                    if (indexInSorted[circles[sorted[i]].egdeWith[j]] < indexInSorted[circle1]) {

                    }
                }
            }
        }
    });
}

function main() {
    document.addEventListener('DOMContentLoaded', () => {
        init();
        const myPre = document.getElementById('userBox');
        myPre.addEventListener('input', () => {
            let text = myPre.innerHTML;
            let splitText = [];
            for (let i = 0; i < text.length; i++) {
                let nr = '';
                if (text.charCodeAt(i) >= 48 && text.charCodeAt(i) <= 57 && i < text.length) {
                    while (text.charCodeAt(i) >= 48 && text.charCodeAt(i) <= 57 && i < text.length) {
                        nr += text[i];
                        i++;
                    }
                    splitText.push(nr);
                }
            }
            circles = [];
            edges = [];
            initNameToIndex();
            clearCanvas();
            let splitTextLength = splitText.length;
            for (let i = 1; i < splitTextLength; i += 2) {
                edges.push(new Edge(splitText[i - 1], splitText[i]));
            }
            edges.forEach(i => i.draw());
            circles.forEach(i => i.draw());
        });
        canvas.addEventListener('mousedown', mousedown);
        canvas.addEventListener('mouseup', mouseup);
    });
}

main();
