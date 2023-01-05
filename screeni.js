cssStyle = `
@import url('http://fonts.cdnfonts.com/css/courier-10-pitch');

body {
	margin: 0;
	padding: 0;
	font-size: 12pt; /* if you multiply by 72 then its in inch */
	margin-top: 1em;
}

strong {
	background-color: #ccc;
	font-weight: normal;
	border-radius: 0.2em;
	margin: -0.2em;
	line-height: 1.2;
	position: relative;
	print-color-adjust: exact !important;
	-webkit-print-color-adjust: exact !important;
}

#paper {
	width: 51em; /* 8.5in */
	border: 1px solid black;
	font-family: 'Courier 10 Pitch', 'Courier New', monospace;
	line-height: 1;
	margin: auto;
	
	
	margin-right: 1em;
	
	margin-bottom: 6em;
	padding: 0;
	padding-bottom: 6em;
}

#inputForm {
	position: fixed;
	margin-left: 1em;
	width: calc(100% - 51em - 2em - 1em);
	height: calc(100% - 0.2in);
}

#inputTextarea {
	width: 100%;
	max-width: 100%;
	height: 100%;
	resize: none;

	box-sizing: border-box;
	border: 2px solid #ccc;
	border-radius: 4px;
	background-color: #f8f8f8;

	padding: 1em;

	font-family: 'Courier 10 Pitch', 'Courier New', monospace;
	font-size: 12pt;
}

#fileInput {
	display: none !important;
}

p {
	margin: 0;
	padding: 0;
}

.title {
	text-transform: uppercase;
	text-align: center;
	margin-top: 10em;
	margin-bottom: 1em;
	
	page-break-before: always;
	
	text-decoration: underline;
}

.center {
	text-align: center;
	
	margin-top: 1em;
}

.scene {
	margin-left: 9em; /* 1.5in */
	margin-right: 6em; /* 1in */ 
	
	margin-top: 1em;
	
	text-transform: uppercase;
}

.action {
	margin-left: 9em; /* 1.5in */
	margin-right: 6em; /* 1in */ 
	
	margin-top: 1em;
}

.char {
	margin-left: 25.2em; /* 4.2in */ 
	margin-right: 6em; /* 1in */ 
	
	margin-top: 1em;
	
	text-transform: uppercase;
}

.paren {
	margin-left: 21.6em; /* 3.6in */ 
	margin-right: 17.4em; /* 2.9in */ 
}

.dialogue {
	margin-left: 17.4em; /* 2.9in */ 
	margin-right: 13.8em; /* 2.3in */ 
}

.transition {
	margin-left: 9em; /* 1.5in */
	margin-right: 6em; /* 1in */
	
	margin-top: 1em;
	
	text-align: right;
	text-transform: uppercase;
}

@media print {
	#paper {
		border: 0;
	}
	
	strong {
		background-color: #ddd;
	}

	.title {
		margin-top: 0;
	}

	#inputForm {
		display: none !important;
	}
}

@media screen and (max-width: 14in) {
	#paper {
		background-color: #fee;
	}
	
	body {
		font-size: 1vw;
	}
	
	#inputTextarea {
		font-size: 1vw;
	}
}
`

// ####################################################################################

function processPaper() {

	let paper = document.getElementById("paper");
	let lines = paper.innerHTML.split(/\r\n|\n\r|\n|\r/);

	let transformedHTML = "";

	for (const line of lines) {
		let trimmed = line.trim();
		
		if (trimmed == "" || trimmed == "#") {
			continue;
		}
		
		let result = "";
		
		if (trimmed.length >= 2 && trimmed.substring(0, 2) == "# ") {
			result += "<p class=\"scene\">";
			result += trimmed.substring(2);
			result += "</p>";
		}
		
		else if (trimmed.length >= 2 && trimmed.substring(0, 2) == "- ") {
			result += "<p class=\"dialogue\">";
			result += trimmed.substring(2);
			result += "</p>";
		}
		
		else if (trimmed.length >= 1 && trimmed.substring(0, 1) == "(") {
			result += "<p class=\"paren\">";
			result += trimmed.substring(0);
			result += "</p>";
		}
		
		else if (trimmed.length >= 3 && trimmed.substring(0, 3) == "-- ") {
			result += "<p class=\"char\">";
			result += trimmed.substring(3);
			result += "</p>";
		}
		
		else if (trimmed.charAt(0) == "#") {
			
			let spaceIndex = trimmed.indexOf(" ");
			
			if (spaceIndex == "-1") {
				continue;
			}
			
			result += "<p class=\"";
			result += trimmed.substring(1, spaceIndex);
			result += "\">";
			result += trimmed.substring(spaceIndex + 1);
			result += "</p>";
		}
		
		else {
			result += "<p class=\"action\">";
			result += trimmed;
			result += "</p>";
		}
		
		let indexStarLeft = -1;
		let indexStarRight = -1;
		while ((indexStarLeft = result.indexOf("*")) != -1) {
		
			if ((indexStarRight = result.indexOf("*", indexStarLeft + 1)) == -1) {
				break;
			}
			
			result = result.substring(0, indexStarLeft) + "<strong>" + result.substring(indexStarLeft + 1, indexStarRight) + "</strong>" + result.substring(indexStarRight + 1);
		}
		
		transformedHTML += result;
	}

	paper.innerHTML = transformedHTML;
}

function onInput() {

	let paper = document.getElementById("paper");
	let inputTextarea = document.getElementById("inputTextarea");

	paper.innerHTML = inputTextarea.value;

	processPaper();

	//console.log("Changed.");
}

function onSelect() {
	//console.log("Selected.");
}

function start() {
    let style = document.createElement("style");
    style.innerHTML = cssStyle;
    document.head.appendChild(style);

	let paper = document.getElementById("paper");
	let inputTextarea = document.getElementById("inputTextarea");


	inputTextarea.value = paper.innerHTML.trim();
	//console.log("Started");
	processPaper();
}

function saveSource() {

	let text = document.getElementById("inputTextarea").value;
	let file = new Blob([text], {type: "text/plain;charset=utf-8"});

	let element = document.createElement("a");
	element.href = URL.createObjectURL(file);
	element.download =  "script-source.txt";
	element.style.display = "none";

	document.body.appendChild(element);
	element.click();
	//console.log("Clicked.");
	document.body.removeChild(element);
}

function onFileInputChange() {
	let fileReader = new FileReader();
	
	fileReader.onload = function() {
		let paper = document.getElementById("paper");
		paper.innerHTML = fileReader.result;
		start();
	}
	
	let fileInput = document.getElementById("fileInput");
	
	fileReader.readAsText(fileInput.files[0]);
}

function openSource() {
	document.getElementById("fileInput").click();
}

document.onkeydown = (e) => {
	if (e.ctrlKey && e.key === 's') {
		e.preventDefault();
		saveSource();
	}
	
	if (e.ctrlKey && e.key === 'o') {
		e.preventDefault();
		openSource();
	}
}

window.onload = start;