"use strict";

// ####################################################################################
// CSS
// ####################################################################################

/** Variable that contains the whole CSS.
 * @type {string}
*/
const CSS_STYLE = `
@import url('http://fonts.cdnfonts.com/css/courier-10-pitch');

body {
	margin: 0;
	padding: 0;
	font-size: 12pt; /* if you divide by 72 then its in inch = 0.16666 */
	margin-top: 1em;
}

p {
	margin: 0;
	padding: 0;
}

.page {
	width: 51em; /* 8.5in */
	height: 66em; /* 11in */

	border: 1px solid black;
	box-sizing: border-box; /* So the border does not affect size. */

	font-family: 'Courier 10 Pitch', 'Courier New', monospace;
	line-height: 1;
	margin: auto;

	background-color: #fefde6;

	padding: 3em 0;
}

/* Rules for main content. */
.main-content {
	
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

/* If the screen is so small that it cannot display real sized pages. */
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
// JAVASCRIPT
// ####################################################################################

/** Variable if debug mode.
 * @type {boolean}
*/
const DEBUG = true;

/** Function that outputs to console only if DEBUG vatiable is true.
 * @param {*} obj Object converted to string and output to console.
*/
function debug(obj) {
	if (DEBUG) {
		console.log(obj.toString());
	}
}

/** Function that takes a string and parses it with screenplay markdown into a div.
 * @param {string} text Text to be parsed.
 * @returns {Element} Parsed output div.
*/
function parseText(text) {
	let lines = text.split(/\r\n|\n\r|\n|\r/);
	let div = document.createElement("div");

	for (const line of lines) {
		let trimmed = line.trim();
		
		if (trimmed == "" || trimmed == "#") {
			continue;
		}

		let p = document.createElement("p");
		
		if (trimmed.length >= 2 && trimmed.substring(0, 2) == "# ") {
			p.classList.add("scene");
			p.innerHTML = trimmed.substring(2);
		}
		
		else if (trimmed.length >= 2 && trimmed.substring(0, 2) == "- ") {
			p.classList.add("dialogue");
			p.innerHTML = trimmed.substring(2);
		}
		
		else if (trimmed.length >= 1 && trimmed.substring(0, 1) == "(") {
			p.classList.add("paren");
			p.innerHTML = trimmed.substring(0);
		}
		
		else if (trimmed.length >= 3 && trimmed.substring(0, 3) == "-- ") {
			p.classList.add("char")
			p.innerHTML = trimmed.substring(3);
		}
		
		else if (trimmed.charAt(0) == "#") {
			
			let spaceIndex = trimmed.indexOf(" ");
			
			if (spaceIndex == "-1") {
				continue;
			}
			
			p.classList.add(trimmed.substring(1, spaceIndex));
			p.innerHTML = trimmed.substring(spaceIndex + 1);
		}
		
		else {
			p.classList.add("action");
			p.innerHTML = trimmed;
		}
		
		div.appendChild(p);
	}

	debug(`Parsed ${div.getElementsByTagName("p").length} paragraphs.`)

	return div;
}

/** Evaluates rendered bottom location of element.
 * @param {Element} element Evaluated element.
 * @param {boolean} [subtract = false] Whether subtract padding and border from result.
 * @returns {number} Rendered bottom location.
*/
function GetElementBottomline(element, subtract = false) {
	let rect = element.getBoundingClientRect();
	let bottom = rect.bottom;
	
	if (subtract) {
		let style = window.getComputedStyle(element);
		let padding = style.getPropertyValue("padding-bottom");
		let border = style.getPropertyValue("border-bottom-width");
		bottom -= (parseInt(padding, 10) + parseInt(border, 10));
	}

	return bottom;
}

/** Class representing one page of a script. */
class Page {

	/** Base parent DOM element reference. 
	 * @type {HTMLDivElement}
	*/
	#parent;

	/** The main content element of the screenplay page.
	 * @type {HTMLDivElement}
	*/
	#mainContent;

	/** Create a new page of the screenplay. */
	constructor() {
		this.#parent = document.createElement("div");
		this.#parent.classList.add("page");

		this.#mainContent = document.createElement("div");
		this.#mainContent.classList.add("main-content");
		this.#parent.appendChild(this.#mainContent);
	}

	/** Sets page main content.
	 * @param {HTMLDivElement} element Div content element.
	*/
	setContent(element) {
		this.#mainContent.replaceWith(element);
		this.#mainContent = element;
		this.#mainContent.classList.add("main-content");
	}

	/** Adds a paragraph element to page.
	 * @param {HTMLParagraphElement} paragraph Paragraph to be added.
	*/
	#addParagraph(paragraph) {
		this.#mainContent.appendChild(paragraph);
	}

	/** Appends page to DOM. */
	display() {
		document.body.appendChild(this.#parent);
	}

	/** Removes page from DOM. */
	remove() {
		this.#parent.remove();
	}

	/** Checks if page is visible in DOM.
	 * @returns {boolean} True if page is in DOM.
	*/
	#isVisible() {
		return document.body.contains(this.#parent);
	}

	/** Returns main content paragraphs.
	 * @returns {HTMLParagraphElement[]} Array of paragraph elements.
	*/
	#getParagraphs() {
		return Array.from(this.#mainContent.getElementsByTagName("p"));
	}

	/** Get page bottom line.
	 * @return {number} Rendered bottom line.
	 */
	#getBottomline() {
		return GetElementBottomline(this.#parent, true);
	}

	/** Splits page into valid pages.
	 * @returns {Page[]} Valid array of pages.
	*/
	splitPage() {
		/** @type {Page[]} */
		let pages = [];

		let paragraphs = this.#getParagraphs();
		debug(`Number or paragraphs on page before splitting = ${paragraphs.length}`);
		let paperBottomline = this.#getBottomline();

		debug("Paper bottom line = " + paperBottomline);

		while (paragraphs.length != 0)
		{
			debug(`Creating page...`);
			let newPage = new Page();
			
			debug(`Number or paragraphs remaining on page = ${paragraphs.length}`);

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
				paragraphs.forEach((paragraph) => {
					newPage.#addParagraph(paragraph);
				});
				pages.push(newPage);
				break;
			}

			for (let i = 0; i < nofitIndex; i++)
			{
				newPage.#addParagraph(paragraphs[0]);
				paragraphs.shift();
			}

			pages.push(newPage);
		}

		return pages;
	}
}

/** Class representing the whole running application. */
class App {

	/** Keeps original body innerHTML.
	 * @type {string}
	*/
	#originalBody;

	/** Array of screenplay pages.
	 * @type {Page[]}
	*/
	#pages;

	/** Start the application. */
	constructor() {
		debug("Initializing application...");

		debug("Moving body into variable...");
		this.#originalBody = this.#removeBody();

		debug("Styling document...");
		this.#styleDocument();

		debug("Creating work page...");
		let workPage = this.#createWorkPage(parseText(this.#originalBody));

		debug("Splitting into pages...");
		this.#pages = workPage.splitPage();
		debug(`Number of pages = ${this.#pages.length}`);

		debug("Removing work page...");
		workPage.remove();

		debug("Displaying pages...");
		this.#displayPages();

		debug("Finished initialization.");
	}

	/** Removes body innerHTML.
	 * @returns {string} Removed body innerHTML.
	*/
	#removeBody() {
		let bodyText = document.body.innerHTML;
		document.body.innerHTML = "";
		return bodyText;
	}

	/** Applies CSS_STYLE string to the document as CSS. */
	#styleDocument() {
		let style = document.createElement("style");
		style.innerHTML = CSS_STYLE;
		document.head.appendChild(style);
	}

	/** Creates a page for splitting whole text into pages and displays it.
	 * @param {Element} content Content of the work page.
	 * @returns {Page} Created work page.
	*/
	#createWorkPage(content) {
		let workPage = new Page();
		workPage.setContent(content);
		workPage.display();
		return workPage;
	}

	/** Displays all pages in DOM. */
	#displayPages() {
		this.#pages.forEach((page) => {
			page.display();
		});
	}
}

let app;

function init() {
	app = new App();
}

window.onload = init;