/* Linear graphing calculator and coordinate set plotter with adjustable window,
To modify the line, user changes a and b values, a changes the slope of the line and b changes the y intercept, input integers or floats and press the plus button to plot coordinate points
Press the trashcan button to clear the coordinates potted
Change the window to zoom in or out(Must be a multiple of 5)
*/
//cnvs is canvas start, cnvmp is canvas midpoint, cnvep is canvas endpoint, to avoid hardcode
var cnvs = 0;
var cnvmp = 160;
var cnvep = 320;
//How many dashes are on one axis
var windowVal = 10;
//How many dashes are on one side of the axis
var windowValSeg = 5;
//Unmodified quantity of windowValSeg when scalability function is being used
var acWindVal = 10;
//Variable used to draw dashes
var axisDistance = 0;
//Dropdown value of b input box
var bInputVal = 0;
//Tracks the pixels in between each dash
var axisDistanceTrack = cnvep/(windowVal);
//Dropdown value of a input box
var aInputVal = 1;
//Variables used to store values of endpoints of lines, which are the only points dependant on the a value
var a = 1;
var b = 0;
var c = 0;
//y and x intercept
var yInt = 0;
var xInt = 0;
//Hides error window
hideElement("equationBg");
//Variable that stores the value of each box that is displayed in the legend
var divisibility = 0;
//Variable used to track original windowVal when windowValSeg is being modified
var ogWindVal = 0;
//List that holds the current two items, x and y coord
var coordSet = [];
//List that holds all the coords entered, used for the clear function
var totalCoords = [];

//Circles for intercepts and points that scale based on the window value
var circles = 3/(windowValSeg/5);
//Draws the graph and pink bottom line, canvas 1
drawAxis();

//Draws boxes and legend, canvas 2 and 4
drawBoxLegend(axisDistanceTrack);

//Draws line y = x, canvas 3
drawDefLine();

//What happens when the window is changed
onEvent("windowInput","change", function(){
  updateLine();
});

//What happens when the b input dropdown box is changed
onEvent("bInput", "change", function(){
  updateLine();
});

//What happens when the a input dropdown box is changed
onEvent("aInput", "change", function(){
  updateLine();
});

//What happens when a new coordinate is added to the the graph
onEvent("addCoord", "click", function( ) {
  updateLine();
});

//What happens when the clear button is clicked 
onEvent("clearButton", "click", function( ) {
  setActiveCanvas("pointsCnv");
  clearCanvas();
  totalCoords = [];
});

//Function to update line for whenever a, b, or window value is changed 
function updateLine(){
  //Gets ready
  setActiveCanvas("windowBoxes");
  clearCanvas();
  windowValSeg = getNumber("windowInput");
  acWindVal = (getNumber("windowInput") * 2);
  
  //If the box isn't filled default as 5
  if(isNaN(windowValSeg)){
    windowValSeg = 5;
  }
  if(isNaN(acWindVal)){
    acWindVal = 10;
  }
  
  windowVal = windowValSeg *2;
  axisDistanceTrack = cnvep/(windowVal); //Updates the distance in between each box everytime a box is modified
  //Checks to see if the inputed windowVal is a multiple of five 
  if(windowValSeg % 5 == 0){
    windowValSeg = scalability(windowValSeg); //If the windowVal is greater than 20, modify legend
	  windowVal = windowValSeg * 2; //Updates the variable
	  axisDistanceTrack = cnvep/(windowVal); //Update distance between boxes
	  hideElement("equationBg"); //Don't show the error message
    drawBoxLegend(axisDistanceTrack); //Draw the boxes and legend based on the new windowVal
    drawAxis(); //Redraws the x and y axis if there was an error in the previous input
    setText("windowValSegLabel", windowValSeg);
  }else if(windowValSeg.toString().includes(".") || windowValSeg<1){ //If the number is a decimal or -
    
    showElement("equationBg");
    setText("equationBg","Error: Window must be positive integer");
    clearWholeCanvas();
    
  }else { //If the number isn't a multiple of five 
    
    showElement("equationBg");
    setText("equationBg", "Error: Window must be multiple of five");
    clearWholeCanvas();
    }
    
  if(!(isNaN(getNumber("xCordIn")) || isNaN(getNumber("yCordIn")))){ //If the input coord boxes are filled
    
    coordSet = []; //Clear the current coordinate set
    
    setActiveCanvas("pointsCnv"); /*Redraws all the points when a new one is added,
    for the case when the window is changed*/
    clearCanvas();
    //Adds the inputted coords to the current coordinate set list
    appendItem(coordSet, getNumber("xCordIn"));
    appendItem(coordSet, getNumber("yCordIn"));//
  
    appendItem(totalCoords, coordSet); /*Adds the current coordinate list to the total coordinates list, 
    which is a 2D array*/
    
    setStrokeColor("black");
    if(windowValSeg > 0){
      circles = 3/(windowValSeg/5);
    } else {
      circles = 0;
    }
    //Coordinate point plotting algorithm 
    for (var j = 0; j < totalCoords.length; j++) { //Plots every point in the total coordinates list
      circle(cnvmp + (totalCoords[j][0] * (cnvep/acWindVal)),
      cnvmp - (totalCoords[j][1] * (cnvep/acWindVal)), circles);
    }
   
   
  }


  //Gets the values to input into the algorithm
  aInputVal = getNumber("aInput");
  if(isNaN(aInputVal)){ //If the box isn't checked, default with slope of 1
    aInputVal = 1;
  } 
  
  bInputVal = getNumber("bInput");
  if(isNaN(bInputVal)){ //If the box isn't checked, default with y intercept of 0
    bInputVal = 0;
  }
  
  //Gets ready
  setActiveCanvas("lineCnv");
  clearCanvas();
  
  
  //Line equation algorithm
  if(acWindVal/2 > 20){ /*If the window is greater than 20,
  use the divisibility to modify how much the bInputVal is changed*/
    scalability(ogWindVal);
    a = divisibility; 
  }else {
    a = 1;
  }
  b = cnvmp + (aInputVal * windowValSeg - bInputVal/a) * axisDistanceTrack;
  c = cnvmp - (aInputVal * windowValSeg + bInputVal/a) * axisDistanceTrack;
  
  setStrokeColor("green");
  line(cnvs , b,cnvmp,cnvmp - (bInputVal/a * axisDistanceTrack));
  line(cnvmp , cnvmp - (bInputVal/a * axisDistanceTrack), cnvep, c);
  
  setText("interceptOutput", findInt(aInputVal,bInputVal)); //Calls the function that finds the intercepts
}

//Function to draw boxes and legend based on window value 
//p (integer) - The number of pixels in between each box 
function drawBoxLegend(p) {
  //Gets ready
  setText("equationBg",'');
  axisDistance = 0;
  setActiveCanvas("windowBoxes");
  setStrokeWidth(0.15);
  setStrokeColor("gray");
  
  
  for(var i = 0; i < windowVal + 1; i ++){
      line(axisDistance, cnvs, axisDistance, cnvep);
      line(cnvs,axisDistance, cnvep, axisDistance);
      axisDistance= axisDistance + cnvep/windowVal;
    }
  /*A windowValSeg of one is too big to be displayed, 
  it wouldn't be displayed anyway since all the acceptable inputs are divisible by 5 */
  if(windowValSeg != 1){
    setActiveCanvas("legendCnv");
    clearCanvas();
    setStrokeColor("gray");
    setStrokeWidth(0.5);
  
    //Draws the legend box, which is the same size of the boxes on the graph
    line(p+5,5,p+5,p+5);

    line(5, 5, p+5,5);

    line(5, p+5, p+5, p+5);

    line(5,5,5,p+5);
  } else { //If windowValSeg is 1
    setActiveCanvas("legendCnv");
    clearCanvas();
    
  }
  
}

//Function that finds the intercepts using algebra
//x (integer) - aInputValue
//y (integer) - bInputValue
//return (string) - The intercepts of the line
function findInt(x,y) {
  xInt = 0;
  yInt = (x * 0 ) + y;
  xInt = (xInt - y)/x;
  
  setStrokeColor("red");
  
  if(windowValSeg > 0){
      circles = 3/(windowValSeg/5);
    } else {
      circles = 0;
    }
    
  circle(cnvmp + ((axisDistanceTrack * xInt)/a), cnvmp, circles);
  circle(cnvmp, cnvmp - ((axisDistanceTrack * yInt)/a), circles);
  return "(" + xInt + ", 0)" + "(0, " + yInt + ")";
  
}

//Function that draws the x and y axis and seperating line at the bottom
function drawAxis(){
  setActiveCanvas("axisRedLine");
  setStrokeColor("black");
  setStrokeWidth(1.5);
  line(cnvs, cnvmp, cnvep, cnvmp);
  line(cnvmp,cnvs,cnvmp,cnvep);
  setStrokeColor("pink");
  setStrokeWidth(3);
  line(cnvs,cnvep-2,cnvep,cnvep-2);
}

//Draws the default line y=x
function drawDefLine() {
  setActiveCanvas("lineCnv");
  setStrokeWidth(3);
  setStrokeColor("green");
  line(cnvs,cnvep,cnvep,cnvs);
}

//Clears all of the canvases, axises and boxes included
function clearWholeCanvas() {
  setActiveCanvas("axisRedLine");
  clearCanvas();
  setActiveCanvas("windowBoxes");
  clearCanvas();
  setActiveCanvas("lineCnv");
  clearCanvas();
}

/*If windowValSeg is too big, find a number it is divisible by and set windowValSeg to that,
changes the label in the bottom right to show how many units each box is */
//windowValSeg (integer) - The desired value of the window
//return (integer) - Updates the window value
function scalability(windowValSeg){
  if(windowValSeg > 20){
    for(var i = 6; i <= 20; i++){
      if (windowValSeg % i == 0){        
        ogWindVal = windowValSeg;
        windowValSeg = i;
			  divisibility = ogWindVal/windowValSeg;
			  setText("legendLabel2", "= " + divisibility);
			  break;
      }else if (i == 20 && windowValSeg == 25){
      ogWindVal = 25;
        windowValSeg = 5;
			  divisibility = 5;
			  setText("legendLabel2", "= " + divisibility);
      
		  }
	  }
  }else {
    setText("legendLabel2", "= 1");
  }
  return windowValSeg;
}
