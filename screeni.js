"use strict";

const CSS_STYLE = `
@import url('http://fonts.cdnfonts.com/css/courier-10-pitch');

body {
	margin: 0;
	padding: 0;
	font-size: 12pt; /* if you divide by 72 then its in inch = 0.16666 */
	margin-top: 1em;
}

.paper {
	width: 51em; /* 8.5in */
	height: 66em; /* 11in */
	border: 1px solid black;
	font-family: 'Courier 10 Pitch', 'Courier New', monospace;
	line-height: 1;
	margin: auto;
	margin-bottom: 2em;

	background-color: #fefde6;

	box-sizing: border-box;
	padding: 3em 0;
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

@media screen and (max-width: 8.8in) {
	.paper {
		background-color: #fee;
	}
	
	body {
		font-size: 1.8vw;
	}
}
`;

// ####################################################################################

const DEBUG = true;

function debug(text) {
	if (DEBUG) {
		console.log(text);
	}
}

function parseElement(element) {

	let lines = element.innerHTML.split(/\r\n|\n\r|\n|\r/);

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
		
		transformedHTML += result;
	}

	element.innerHTML = transformedHTML;
}

let app;

class App {
	#paper;
	#pages;

	constructor() {
		debug("Initializing application...");
		this.#styleDocument();
		this.#initPaper();
		this.#splitPaper();
		this.#paper.remove();
	}

	#styleDocument() {
		let style = document.createElement("style");
		style.innerHTML = CSS_STYLE;
		document.head.appendChild(style);
	}

	#initPaper() {
		this.#paper = document.createElement("div");
		this.#paper.classList.add("paper");
		this.#paper.innerHTML = document.body.innerHTML;
		parseElement(this.#paper);
		document.body.innerHTML = "";
		document.body.appendChild(this.#paper);
	}

	#splitPaper() {
		this.#pages = [];
		let paragraphs = Array.from(this.#paper.getElementsByTagName("p"));
		let paperBottomline = this.#getPaperBottomline();

		while (paragraphs.length != 0)
		{
			debug(`Creating page ${this.#pages.length}`);
			let newPage = this.#newPage();
			
			debug(`Number or paragraphs remaining on paper = ${paragraphs.length}`);

			let nofitIndex = -1;
			for (let i = 0; i < paragraphs.length; i++)
			{
				let paragraphBottomline = paragraphs[i].getBoundingClientRect().bottom;

				if (paragraphBottomline > paperBottomline)
				{
					nofitIndex = i;
					break;
				}
			}

			debug(`Paragraph ${nofitIndex} does not fit.`);

			if (nofitIndex == 0)
			{
				debug("One paragraph is too large for one page");
				break;
			}

			if (nofitIndex == -1)
			{
				newPage.append(...paragraphs);
				break;
			}

			for (let i = 0; i < nofitIndex; i++)
			{
				newPage.appendChild(paragraphs[0]);
				paragraphs.shift();
			}

			this.#pages.push(newPage);
		}
	}

	#newPage() {
		let page = document.createElement("div");
		page.classList.add("paper");
		document.body.appendChild(page);
		return page;
	}

	#getPaperBottomline() {
		let paperRect = this.#paper.getBoundingClientRect();
		let paperStyle = window.getComputedStyle(this.#paper);
		let paperPadding = paperStyle.getPropertyValue("padding-bottom");
		let paperBorder = paperStyle.getPropertyValue("border-bottom-width");
		let paperBottom = paperRect.bottom - parseInt(paperPadding, 10) - parseInt(paperBorder, 10);
		return paperBottom;
	}
}

function init() {
	app = new App();
}

window.onload = init;