"use strict";
let numbers = [], circles = [], edges = [], nameToIndex = [], occupied = [], BFSedges = [], nrPerLayer = [];
let canvas, ctx, gl, rect, userBox, BFS_button, startingNode, startingNodeBox, treeButton;
let clickedCircle, lastclX, lastclY, coef, radius = 35;
let radius2 = radius * radius, queue;
let t = [], t2 = [], sortedXes = [], indexInSorted = [], sorted = [];
let verzui = 'rgb(40, 175, 148)';

class Circle {
    constructor(x, y, radius, name) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.name = name;
        this.edgeWith = [];
        this.edgeAngle = [];
        this.put = false;
    }
    draw() {
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgb(110, 255, 255)';
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.fillText(this.name, this.x, this.y);
    }
    drawGreen() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 11;
        ctx.stroke();
        ctx.strokeStyle = verzui;
        ctx.lineWidth = 9;
        ctx.stroke();
        ctx.fillStyle = 'rgb(110, 255, 255)';
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.fillText(this.name, this.x, this.y);
    }
    delayedDraw() {
        setTimeout(() => {
            this.drawGreen();
        }, 400);
    }
}

class Edge {
    constructor(c1, c2) {
        this.c1 = c1;
        this.c2 = c2;
        circles[this.c1].edgeWith.push(this.c2);
        circles[this.c2].edgeWith.push(this.c1);
        let angle = Math.atan2((circles[this.c1].y - circles[this.c2].y), (circles[this.c2].x - circles[this.c1].x));
        let angle2 = angle + Math.PI;
        if (angle < 0) {
            angle = 2 * Math.PI + angle;
            angle2 = angle - Math.PI;
        }
        circles[this.c1].edgeAngle.push(angle);
        circles[this.c2].edgeAngle.push(angle2);
    }
    draw() {
        ctx.beginPath();
        ctx.moveTo(circles[this.c1].x, circles[this.c1].y);
        ctx.lineTo(circles[this.c2].x, circles[this.c2].y);
        ctx.stroke();
    }
}

function angleToOriginReversed(c){
    let angle = Math.atan2((500 - circles[c].y), (500 - circles[c].x));
    return angle + Math.PI;
}

function updateAngle(c1, c2) {
    let angle = Math.atan2((circles[c1].y - circles[c2].y), (circles[c2].x - circles[c1].x));
    let i = circles[c1].edgeWith.indexOf(c2);
    let angle2 = angle + Math.PI;
    if (angle < 0) {
        angle = 2 * Math.PI + angle;
    }
    circles[c1].edgeAngle[i] = angle;
    i = circles[c2].edgeWith.indexOf(c1);
    circles[c2].edgeAngle[i] = angle2;
}

function angleDist(a1, a2, trigPosOnly){
    if(trigPosOnly == true){
        if(a2 >= a1) return a2 - a1;
        else return 2*Math.PI + a2 - a1;
    }
    else return Math.min(abs(a2 - a1), 2 * Math.PI - abs(a2 - a1));
}

class Queue {
    constructor() {
        this.items = {};
        this.frontIndex = 0;
        this.backIndex = 0;
    }
    enqueue(item) {
        this.items[this.backIndex] = item;
        this.backIndex++;
    }
    dequeue() {
        const item = this.items[this.frontIndex];
        delete this.items[this.frontIndex];
        this.frontIndex++;
        return item;
    }
}

class Pair {
    constructor(c1, c2, layer) {
        this.c1 = c1;
        this.c2 = c2;
        this.layer = layer;
    }
}

class qElem {
    constructor(nr, layer) {
        this.nr = nr;
        this.layer = layer;
    }
}

function init() {
    canvas = document.getElementById("myCanvas");
    treeButton = document.getElementById("tree_button");
    ctx = canvas.getContext('2d', { willReadFrequently: true });
    gl = canvas.getContext('webgl2');
    startingNodeBox = document.getElementById('startingNode');
    rect = canvas.getBoundingClientRect();
    userBox = document.getElementById('userBox');
    BFS_button = document.getElementById('BFS_button');
    ctx.font = '19px Verdana';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    nameToIndex.length = 10000;
    occupied.length = 10000;
    nrPerLayer.length = 5000;
    getStartingNode();
}

function getStartingNode() {
    const text = startingNodeBox.innerHTML;
    startingNode = '';
    let i = 0;
    while (text.charCodeAt(i) >= 48 && text.charCodeAt(i) <= 57 && i < text.length) {
        startingNode += text[i];
        i++;
    }
}

function getNumbersFromUserBox() {
    let text = userBox.innerHTML;
    numbers = [];
    for (let i = 0; i < text.length; i++) {
        let nr = '';
        if (text.charCodeAt(i) >= 48 && text.charCodeAt(i) <= 57 && i < text.length) {
            while (text.charCodeAt(i) >= 48 && text.charCodeAt(i) <= 57 && i < text.length) {
                nr += text[i];
                i++;
            }
            numbers.push(nr);
        }
    }
}

function initPrimaryArrays() {
    circles = [];
    edges = [];
    nameToIndex.fill(-1, 0, 10000);

}

function addCircle(name, x, y) {
    if (arguments.length == 1) {
        x = 47 + Math.random() * (1000 - 94);
        y = 47 + Math.random() * (1000 - 94);
    }
    circles.push(new Circle(x, y, radius, name));
    nameToIndex[name] = circles.length - 1;
}

function createCirclesAndEdges() {
    let numbersLength = numbers.length;
    for (let i = 1; i < numbersLength; i += 2) {
        if (nameToIndex[numbers[i - 1]] == -1) {
            addCircle(numbers[i - 1]);
        }
        if (nameToIndex[numbers[i]] == -1) {
            addCircle(numbers[i]);
        }
        edges.push(new Edge(nameToIndex[numbers[i - 1]], nameToIndex[numbers[i]]));
    }
}

function drawAll() {
    clearCanvas();
    ctx.lineWidth = 2.5;
    edges.forEach(i => i.draw());
    ctx.lineWidth = 5;
    circles.forEach(i => i.draw());
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function resize() {
    coef = 20000 / (19 * window.innerHeight);
    rect = canvas.getBoundingClientRect();
}

function mousedown(e) {
    let clX = (e.clientX - rect.left) * coef;
    let clY = (e.clientY - rect.top) * coef;
    let i = 0;
    while (i < circles.length) {
        let dx = circles[i].x - clX;
        let dy = circles[i].y - clY;
        if (dx < radius && dy < radius) {
            if (dx * dx + dy * dy <= radius2) {
                clickedCircle = circles[i];
                lastclX = clX;
                lastclY = clY;
                canvas.addEventListener('mousemove', mousemove);
                break;
            }
        }
        i++;
    }
}

function mousemove(e) {
    let clX = (e.clientX - rect.left) * coef;
    let clY = (e.clientY - rect.top) * coef;
    clickedCircle.x += clX - lastclX;
    clickedCircle.y += clY - lastclY;
    drawAll();
    lastclX = clX;
    lastclY = clY;
}

function mouseup() {
    canvas.removeEventListener('mousemove', mousemove);
    updateAngle(1, 0);
    updateAngle(0, 2);
    compareAngles();
}

function putCircle(c) {
    let putArray = [];
    let notPutArray = [];
    let v = [];
    for (const i of circles[c].edgeWith) {
        let currentCircle = circles[i];
        if (currentCircle.put == true) {
            putArray.push(i);
        }
        else notPutArray.push(i);
    }
    let increment, startingAngle, arcLength;
    if (putArray.length == 1) {
        increment = Math.PI;
        startingAngle
    }
    else {
        for(j of circles)
        mergeSort(0, v.length - 1, v);
        let OriginToC = angleToOriginReversed(c);
        let maxAngleDist = 0;
        let minDist = 2*Math.PI + 1;
        v.push(v[0]);
        for(let i = 0; i < v.length - 1; i++){
            let outerArc = angleDist(v[i], v[i+1], true);
            let bisect = v[i] + outerArc/2;
            if(bisect >= 2 * Math.PI) bisect -= 2 * Math.PI;
            let dist = angleDist(bisect, OriginToC, false);
            if(dist < minDist){
                minDist = dist;
                startingAngle = v[i];
                arcLength = outerArc;
            }
        }
        increment = arcLength / (notPutArray.length + 1);
        v.pop();
    }
    for(let i = 0; i < notPutArray.length; i++){

    }
}

function mergeSort(st, dr, v){
    if(st == dr){
        return;
    }
    const t = [];
    const m = Math.floor((st + dr)/ 2);
    mergeSort(st, m, v);
    mergeSort(m + 1, dr, v);
    let i = st, j = m + 1, k = 0;
    while(i <= m && j <= dr){
        if(v[i] < v[j]){
            t[k++] = v[i++];
        }
        else{
            t[k++] = v[j++];
        }
    }
    while(i <= m){
        t[k++] = t[i++];
    }
    for(i = st, j = 0; i < k; i++, j++){
        v[i] = t[j];
    }
}

function OldMakePlanar() {
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
    function concurrent(a, b, c, d) {

    }
    function orientation(a, b, c) {

    }
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
    edges.forEach(e => {
        let circle1 = e.c1;
        let circle2 = e.c2;
        if (indexInSorted[circle2] > indexInSorted[circle1]) {
            aux = circle2;
            circle2 = circle1;
            circle1 = aux;
        }
        if (indexInSorted[circle1] != indexInSorted[circle2] - 1) {
            for (let i = indexInSorted[circle1] + 1; i < indexInSorted[circle2]; i++) {
                for (let j = 0; j < e.edgeWith.length; j++) {
                    if (indexInSorted[circles[sorted[i]].edgeWith[j]] < indexInSorted[circle2]) {

                    }
                }
            }
        }
    });
}
function makePlanar() {
    let startingNodeReal = nameToIndex[startingNode];
    circles[startingNodeReal].x = 500;
    circles[startingNodeReal].y = 500;
    circles[startingNodeReal].put = true;
    putCircle(startingNodeReal);
    BFSedges.forEach(i => putCircle(i.c2));
}

function animateLine(x1, y1, x2, y2, circle) {
    const nrFrames = 30;
    const dy = y2 - y1;
    const dx = x2 - x1;
    const incx = dx / nrFrames;
    const incy = dy / nrFrames;
    let tmpx = x1, tmpy = y1;
    for (let i = 0; i < nrFrames; i++) {
        setTimeout(() => {
            tmpx += incx;
            tmpy += incy;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(tmpx, tmpy);
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 8;
            ctx.stroke();
            ctx.strokeStyle = 'rgb(40, 175, 148)';
            ctx.lineWidth = 7;
            ctx.stroke();
            circle.drawGreen();
        }, i * 16);
    }
}

function animateLayer(BFSedgesIndex) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const c = BFSedges[BFSedgesIndex].layer;
            const BFSedgesLength = BFSedges.length;
            while (BFSedgesIndex < BFSedgesLength && BFSedges[BFSedgesIndex].layer == c) {
                let cirlce1 = circles[BFSedges[BFSedgesIndex].c1];
                let cirlce2 = circles[BFSedges[BFSedgesIndex].c2];
                animateLine(cirlce1.x, cirlce1.y, cirlce2.x, cirlce2.y, cirlce1);
                cirlce1.drawGreen();
                cirlce1.delayedDraw();
                cirlce2.delayedDraw();
                BFSedgesIndex++;
            }
            resolve();
        }, 2 / 3 * 1000);
    });
}

async function animateAll() {
    let i = 0;
    let crtLayer = 1;
    const BFSedgesLength = BFSedges.length;
    while (i < BFSedgesLength) {
        await animateLayer(i);
        while (i < BFSedgesLength && crtLayer == BFSedges[i].layer) {
            i++;
        }
        crtLayer++;
    }
}

function BFS() {
    while (Object.keys(queue.items).length != 0) {
        const crtElem = queue.dequeue();
        const crtCircleIndex = crtElem.nr;
        const crtLayer = crtElem.layer;
        const crtCircle = circles[crtCircleIndex];
        let nrNeighbours = crtCircle.edgeWith.length;
        for (let i = 0; i < nrNeighbours; i++) {
            if (occupied[crtCircle.edgeWith[i]] == false) {
                occupied[crtCircle.edgeWith[i]] = true;
                queue.enqueue(new qElem(crtCircle.edgeWith[i], crtLayer + 1));
                BFSedges.push(new Pair(crtCircleIndex, crtCircle.edgeWith[i], crtLayer + 1));
            }
        }
    }
    console.log(BFSedges);
    animateAll();
}

function animateBFS() {
    queue = new Queue;
    occupied.fill(false, 0, 10000);
    BFSedges = [];
    console.log(startingNode);
    occupied[nameToIndex[startingNode]] = 1;
    let elem = new qElem(nameToIndex[startingNode], 0);
    queue.enqueue(elem);
    BFS();
}

function makePink() {
    let roz = document.getElementById('Roz');
    let body = document.getElementById('body');
    roz.addEventListener('click', () => {
        body.style.background = 'rgb(241, 5, 123)';
    });
}

function makeTree() {
    getStartingNode();
    nrPerLayer.fill(0);
    circles[nameToIndex[startingNode]].x = 500;
    circles[nameToIndex[startingNode]].y = 50;
    let i = 0;
    let crtLayer = 1;
    let crtY = 150;
    while (i < BFSedges.length) {
        while (i < BFSedges.length && BFSedges[i].layer == crtLayer) {
            circles[BFSedges[i].c2].y = crtY;
            nrPerLayer[crtLayer]++;
            i++;
        }
        crtY += 100;
        crtLayer += 1;
    }
    i = 1;
    let crtInterval = 400;

    drawAll();
}

function compareAngles() {
    console.log(circles[0].edgeAngle[0] + ' ' + circles[0].edgeAngle[1]);
}

document.addEventListener('DOMContentLoaded', () => {
    main();
});

function main() {
    init();
    makePink();
    resize();
    canvas.addEventListener('mousedown', mousedown);
    canvas.addEventListener('mouseup', mouseup);
    BFS_button.addEventListener('click', animateBFS);
    treeButton.addEventListener('click', makeTree);
    window.addEventListener('resize', resize);
    userBox.addEventListener('input', () => {
        initPrimaryArrays();
        getNumbersFromUserBox();
        createCirclesAndEdges();
        drawAll();
    });
    startingNodeBox.addEventListener('input', () => {
        getStartingNode();
    });
}