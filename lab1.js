// Global variables
var canvas;
var context;
var startingDots = [];
var curvatureCoeff = 1; // Default
var helpingLinesIsVisible = false;

// For handling Dnd
var dragTimer;
var mouseCoords;

class Dot
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }

    drawCircle()
    {
        context.beginPath();
		context.arc(this.x, this.y, 5, 0, 2 * Math.PI);
		context.strokeStyle = "black";
		context.stroke();
		context.closePath();
    }
}

function launchPage()
{

	canvas = document.getElementById("canvas");
	context = canvas.getContext("2d");
	context.lineWidth = 2;

    canvas.addEventListener("click", addNewDot);

    let drawButton = document.getElementById("drawButton");
    drawButton.addEventListener("click", draw);

    let changeCurvatureButton = document.getElementById("changeCurvatureButton");
	changeCurvatureButton.addEventListener("click", changecurvatureCoeff);
	
	let showHelpingLinesButton = document.getElementById("showHelpingLinesButton");
	showHelpingLinesButton.addEventListener("click", function(){
		if (helpingLinesIsVisible == false) 
		{
			helpingLinesIsVisible = true;
			drawSpline();
		}
		else 
		{
			helpingLinesIsVisible = false;
			drawSpline();
		}
	});
}

function addNewDot(event)
{
    let newDot = getCursorPosition(event);
    startingDots.push(newDot);
    newDot.drawCircle();
}

function getCursorPosition(event) {
	let boundingClientRect = canvas.getBoundingClientRect();
	let cursorX = event.clientX - boundingClientRect.left;
	let cursorY = event.clientY - boundingClientRect.top;
    
    return new Dot(cursorX, cursorY);
}

function changecurvatureCoeff(){
	let changeCurvatureInput = document.getElementById("changeCurvatureInput");
	if (changeCurvatureInput.value)
	{
		curvatureCoeff = changeCurvatureInput.value;
	}
	drawSpline();
	launchDnD();	
}

function draw()
{
    drawSpline();
    launchDnD();	
}

function launchDnD()
{
    canvas.removeEventListener("click", addNewDot);
	canvas.addEventListener("mousedown", mouseDownListener);
	canvas.addEventListener("mousemove", mouseMoveListener);
	canvas.addEventListener("mouseup", mouseUpListener);

	mouseCoords = new Dot(0, 0);
}

function mouseDownListener()
{
	let pointIndex = -1;
	
	for (let i = 0; i < startingDots.length; i++)
	{
		if ((mouseCoords.x < startingDots[i].x + 5) && (mouseCoords.x > startingDots[i].x - 5) && (mouseCoords.y < startingDots[i].y + 5) && (mouseCoords.y > startingDots[i].y - 5))
		{
			pointIndex = i;
			moveDot(pointIndex);
			break;
		}
	}
}

function moveDot(pointIndex)
{
	dragTimer = setInterval(function()
	{
		startingDots[pointIndex].x = mouseCoords.x;
		startingDots[pointIndex].y = mouseCoords.y;
		drawSpline();		
	}, 10);
}

function mouseMoveListener(event) 
{
	let rect = canvas.getBoundingClientRect()
	mouseCoords.x = event.clientX - rect.left;
	mouseCoords.y = event.clientY - rect.top;
}

function mouseUpListener()
{
	clearInterval(dragTimer);
}

function drawBezier(context, dots)
{
	let step = 0.05;

	for (let t = 0; t < 1; t += step) 
	{
		let curDot = calcBezierCoords(dots, t);
		let nextDot = calcBezierCoords(dots, t + step);
		context.beginPath();
		context.moveTo(curDot.x, curDot.y);
		context.lineTo(nextDot.x, nextDot.y);
		context.strokeStyle = "black";
		context.stroke();
	}
}

function calcBezierCoords(dots, t) 
{
	let xCoord = Math.pow(t, 3) * (dots[3].x - 3 * dots[2].x + 3 * dots[1].x - dots[0].x) 
					+ Math.pow(t, 2) * (3 * dots[0].x - 6 * dots[1].x + 3 * dots[2].x) + t * (3 * dots[1].x - 3 * dots[0].x) + dots[0].x;

	let yCoord = Math.pow(t, 3) * (dots[3].y - 3 * dots[2].y + 3 * dots[1].y - dots[0].y) 
					+ Math.pow(t, 2) * (3 * dots[0].y - 6 * dots[1].y + 3 * dots[2].y) + t * (3 * dots[1].y - 3 * dots[0].y) + dots[0].y;
	
	return new Dot(xCoord, yCoord);
}

function drawSpline()
{
	// Clear canvas and setup line width
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.lineWidth = 2;
	
	// Redraw dots if they were moved
	for (let i = 0; i < startingDots.length; i++) 
	{
		startingDots[i].drawCircle();
	}

	let drawingDots = [];

	//here
	let pFirst = new Dot(0, 0);
	let pLast = new Dot(0, 0);
	//here

	// For first dot
	let p0 = new Dot(startingDots[0].x, startingDots[0].y);

	drawingDots.push(p0);
	drawingDots.push(p0);

	// For other dots
	for (let i = 0; i < startingDots.length - 2; i++) 
	{
		let p0 = new Dot(startingDots[i].x, startingDots[i].y);
		let p1 = new Dot(startingDots[i + 1].x, startingDots[i + 1].y);
		let p2 = new Dot(startingDots[i + 2].x, startingDots[i + 2].y);
		
		let a0 = new Dot((p0.x + p1.x) / 2, (p0.y + p1.y) / 2);
		let a1 = new Dot((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);

		// l = sqrt((x2-x1)^2 + (y2-y1)^2)

		// p0p1
		let firstLineLength = Math.sqrt(Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2));

		// p1p2
		let secondLineLength = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p2.y, 2));

		// b0x = a0x + (a1x - a0x) * l1 / l1 + l2

		// b0, b1, b2 etc. coords
		//              a0       a1 - a0          l1                 l1                l2                          
		let midlineX = a0.x + (a1.x - a0.x) * firstLineLength / (firstLineLength + secondLineLength);
		let midlineY = a0.y + (a1.y - a0.y) * firstLineLength / (firstLineLength + secondLineLength);

		// offsetDistance
		let offsetDistanceX = midlineX - p1.x;
		let offsetDistanceY = midlineY - p1.y;
	
		let p11 = new Dot(a0.x - offsetDistanceX, a0.y - offsetDistanceY);
		let p12 = new Dot(a1.x - offsetDistanceX, a1.y - offsetDistanceY);

		// Curvature coefficient
		// x2 = x2 + (x2 - x1) * (n - 1) / 2

		let vector = new Dot(p12.x - p11.x, p12.y - p11.y);

		let coeff = (curvatureCoeff - 1) / 2;

		p12.x = p12.x + vector.x * coeff;
		p12.y = p12.y + vector.y * coeff;

		p11.x = p11.x - vector.x * coeff;
		p11.y = p11.y - vector.y * coeff;

		drawingDots.push(p11);
		drawingDots.push(p1);
		drawingDots.push(p12);

		//test
		// if (i == 0)
		// {
		// 	pFirst.x = Math.abs(p1.x - 2 * p11.x);
		// 	pFirst.y = Math.abs(p1.y - 2 * p11.y);
		// }

		// if (i == (startingDots.length - 3))
		// {
		// 	pLast.x = Math.abs((p2.x + p12.x) / 2);
		// 	pLast.y = Math.abs((p2.y + p12.y)) / 2;
		// }
		//test
	}

	//test
	// drawingDots[1] = pFirst;
	//test

	// For last dot
	let pN = new Dot(startingDots[startingDots.length - 1].x, startingDots[startingDots.length - 1].y);

	//test
	// drawingDots.push(pLast);
	//test

	drawingDots.push(pN);
	drawingDots.push(pN);

	// Draw beziers
	for (let i = 0; i < drawingDots.length - 1; i += 3) 
	{
		let curDots = [drawingDots[i], drawingDots[i + 1], drawingDots[i + 2], drawingDots[i + 3]];
		drawBezier(context, curDots);
	}

	// Drawing dots for plotting
	if (helpingLinesIsVisible == true)
	{
		context.lineWidth = 1;

		// First line
		context.beginPath();
		context.moveTo(drawingDots[0].x, drawingDots[0].y);
		context.lineTo(drawingDots[1].x, drawingDots[1].y);
		context.strokeStyle = "red";
		context.stroke();

		// Last line
		context.beginPath();
		context.moveTo(drawingDots[drawingDots.length - 1].x, drawingDots[drawingDots.length - 1].y);
		context.lineTo(drawingDots[drawingDots.length - 2].x, drawingDots[drawingDots.length - 2].y);
		context.strokeStyle = "red";
		context.stroke();

		// Other lines
		for (let i = 2; i < drawingDots.length - 2; i += 3)
		{
			context.beginPath();
			context.moveTo(drawingDots[i].x, drawingDots[i].y);
			context.lineTo(drawingDots[i + 2].x, drawingDots[i + 2].y);
			context.strokeStyle = "red";
			context.stroke();
		}

		// Circles
		for (let i = 0; i < drawingDots.length - 2; i += 3) 
		{
			context.strokeStyle = "blue";

			context.beginPath();
			context.arc(drawingDots[i + 1].x, drawingDots[i + 1].y, 3, 0, 2 * Math.PI);
			context.stroke();

			context.beginPath();
			context.arc(drawingDots[i + 2].x, drawingDots[i + 2].y, 3, 0, 2 * Math.PI);
			context.stroke();
		}
	}
}