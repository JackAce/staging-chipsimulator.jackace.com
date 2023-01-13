const CHIP_COLOR_BLACK = 0;
const CHIP_COLOR_RED = 1;

const MAX_CHIPS_PER_STACK = 32;
const POWERS_OF_2 = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024];

var mainChipStacks = [[], []];
var currentShuffle = 0;

function performAnalysis() {
  var analysisData = [];
	$(".analysisDataTable tbody").empty();
  
  // What's the max chips per stack?
	for (var i = 0; i < MAX_CHIPS_PER_STACK; i++) {

    analysisData[i] = {
      chipsPerStack: i + 1,
      totalChips: 2 * i + 2,
      isPowerOf2: POWERS_OF_2.includes(i + 1),
      newChipOnTop: null,
      reunifiedMatchesOriginal: null,
      newChipSuperShuffle: null,
      sameChipOnTop: null,
    };

    // Loop through the two types of "chip on top" values
    for (var j = 0; j < 2; j++) {
      var newChipOnTop = (j === 1);
			initializeChipStacks(i + 1);
      
      // Try shuffling up to 1000 times
      // TODO: Create constant value for maxTries
      for (var k = 0; k < 999; k++) {
      	shuffleChipStacks(newChipOnTop);
        
        if (chipStacksAreUniform()) {
          if (newChipOnTop) {
	        	analysisData[i].newChipOnTop = k + 1;
            analysisData[i].reunifiedMatchesOriginal = mainChipStacks[0][0] === CHIP_COLOR_BLACK;
            analysisData[i].newChipSuperShuffle = (mainChipStacks[0][0] === CHIP_COLOR_BLACK) ? k + 1 : 2 * k + 2;
          } else {
            analysisData[i].sameChipOnTop = k + 1;
          }
          k = 999999;
        }
			}
    }
  }
  
	for (var i = 0; i < analysisData.length; i++) {
  
  	var cssClass = ((i % 2) === 0) ? 'data0' : 'data1'
  
  	var element = '<tr class="' + cssClass + '" id="chipRow' + analysisData[i].chipsPerStack + '" onclick="initializeChipStacks(' + analysisData[i].chipsPerStack + ')"><td>';
    element += analysisData[i].chipsPerStack;
    element += '</td><td>';
    element += analysisData[i].totalChips;
    element += '</td>';
    element += '<td class="' + (analysisData[i].isPowerOf2 ? 'dataTrue' : 'dataFalse') + '">';
    element += (analysisData[i].isPowerOf2 ? 'Y' : '');
    element += '</td><td>';
    element += analysisData[i].newChipOnTop;
    element += '</td>';
    element += '<td class="' + (analysisData[i].reunifiedMatchesOriginal ? 'dataTrue' : 'dataFalse') + '">';
    element += (analysisData[i].reunifiedMatchesOriginal ? 'Y' : '');
    element += '</td><td>';
    element += analysisData[i].newChipSuperShuffle;
    element += '</td><td>';
    element += analysisData[i].sameChipOnTop;
    element += '</td></tr>';
    
		$(".analysisDataTable tbody").append(element);  
  }
}

function initializeChipStacks(stackSize) {
	currentShuffle = 0;
	mainChipStacks = [[], []];
  
  $(".analysisDataTable tr:even").attr('class', 'data0');
  $(".analysisDataTable tr:odd").attr('class', 'data1');
  $("#chipRow" + stackSize).attr('class', 'dataSelected');

  // Initialize chipStacks
  for (var i = 0; i < 2; i++) {
    for (var j = 0; j < stackSize; j++) {
    	// Assume chipStacks[0] is on top
      // Assume chipStacks[1] is on bottom

			mainChipStacks[i][j] = i * stackSize + j;

		}
  }
  	
  $('#shuffleSameButton').prop('disabled', false);  
  $('#shuffleNewButton').prop('disabled', false);  
	drawChipStacks(mainChipStacks);
}

// Updates the chipStacks and stats
function drawChipStacks(chipStacks) {
	$(".chipStack0").empty();
	$(".chipStack1").empty();
  
	for (var i = 0; i < chipStacks[0].length; i++) {
    var class0 = "chipBlack";
    var class1 = "chipBlack";
    
    var chipValue0 = chipStacks[0][i];
    var chipValue1 = chipStacks[1][i];
    
    var chipStackSize = chipStacks[0].length;
    var color0 = getChipColor(chipValue0, chipStackSize);
    var color1 = getChipColor(chipValue1, chipStackSize);

    if (color0 == CHIP_COLOR_RED) {
    	var class0 = "chipRed";
    }
    if (color1 == CHIP_COLOR_RED) {
    	var class1 = "chipRed";
    }    
    
    $(".chipStack0").append('<div class="chip ' + class0 + '">chip ' + chipValue0 + '</div>')
    $(".chipStack1").append('<div class="chip ' + class1 + '">chip ' + chipValue1 + '</div>')
  }

  displayStats();
}

function displayStats() {
	var stackSize = mainChipStacks[0].length;
  var reunified = chipStacksAreUniform();
  var superUnified = chipStacksAreSuperUniform();
  $('.chipStackSizeSpan').empty();
  $('.chipStackSizeSpan').append('<span>' + stackSize + '</span>');
  $('.currentShuffleDiv').text(currentShuffle);
  $('.reunifiedDiv').text('');
  $('.superUnifiedDiv').text('')

	if (reunified) {
    $('.reunifiedDiv').append('<div class="dataTrue">YES</div>');
  }
  if (superUnified) {
    $('.superUnifiedDiv').append('<div class="dataTrue">YES</div>');
  }

	if (superUnified) {
  	// Update this stat after displaying it
  	currentShuffle = 0;
  }  
}

function shuffleChipStacks(newChipOnTop) {

  var mergedChips = [];
	var returnValue = [[], []];
  var chipStackSize = mainChipStacks[0].length;
  
  currentShuffle++;
	
  for (var i = 0; i < chipStackSize; i++) {
  	if (newChipOnTop) {
      mergedChips[i * 2] = mainChipStacks[1][i];
      mergedChips[i * 2 + 1] = mainChipStacks[0][i];
    } else {
      mergedChips[i * 2] = mainChipStacks[0][i];
      mergedChips[i * 2 + 1] = mainChipStacks[1][i];
    }
  }

  for (var i = 0; i < mergedChips.length; i++) {
  	if (i < chipStackSize) {
      returnValue[0][i] = mergedChips[i];
    } else {
      returnValue[1][i - chipStackSize] = mergedChips[i];
    }
  }

  mainChipStacks = returnValue;
  drawChipStacks(returnValue);
  
  if (chipStacksAreSuperUniform()) {
		$('#shuffleSameButton').prop('disabled', false);  
		$('#shuffleNewButton').prop('disabled', false);  
  } else {
    if (newChipOnTop) {
      $('#shuffleSameButton').prop('disabled', true);  
    } else {
      $('#shuffleNewButton').prop('disabled', true);  
    }
  }

	return returnValue;
}

function chipStacksAreSuperUniform() {
	var returnValue = chipStacksAreUniform();
  
  return returnValue && (mainChipStacks[0][0] === CHIP_COLOR_BLACK);
}

function chipStacksAreUniform() {
	// Get initial value
	var chipStack = mainChipStacks[0];
  var chipStackSize = chipStack.length;
  
  if (chipStackSize === 1) {
	  return true;
  }
  
  var firstChipColor = getChipColor(chipStack[0], chipStackSize);
	for (var i = 1; i < chipStackSize; i++) {
	  var currentChipColor = getChipColor(chipStack[i], chipStackSize);
  	if (currentChipColor !== firstChipColor) {
	    return false;
    }
  }
  
  return true;
}

function getChipColor(chipIndex, stackSize) {
	// First half is black, second half is red
	return Math.floor(chipIndex/stackSize);
}

$( document ).ready(function() {
    //initChipStackLinks();
    performAnalysis();
    initializeChipStacks(MAX_CHIPS_PER_STACK);
});
