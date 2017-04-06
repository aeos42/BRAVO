# BRAVO -- Testing

| Name         | Github Username |
|--------------|-----------------|
| Adam Siefkas | aeos42          |
| Julia Heil   | jheil           |
| Ryan Burt    | burt1215        |
|Matilda Whitemore | matilda-may |
|Austin Baysinger | a-baysinger |


**Title**
_**BRAVO** - **BR**owser **A**nalytics **V**isualizati**O**n_
___
**Description:**
We plan on building a Chrome Extension that visualizes interesting and usable data from one's browsing history. 
These visualizations can be interacted with based on user preference (i.e. bar graph, pie chart, etc.) 
and will constantly gain more data as long as the extension is enabled and the user is active.
D3.js is the visualization tool that will be used to produce the statistics and graphics needed.   
___
**Vision Statement:**
*Gain insights into your browsing habits.*
___
**Automated testing**

Our chrome extension relies on gathering data via the Chrome browser API to feed to our visualizations. 
Testing takes the role of ensuring that the data is complete and formatted correctly. Since our Chrome 
extension is based in Javascript, we used the Mocha testing framework. An example is pictured below, 
where we tested for domain strings to be formatted correctly.

![Imgur](http://i.imgur.com/bB0cY0u.png)
![Imgur](http://i.imgur.com/51WEulu.png)

Our user tests focused on usability of the visualizations and the correctness of the information.

___

**User Acceptance Test Plans**

**Test 001: User Setup**

Load BRAVO chrome extension into chrome browser

**Description:**

	Test the setup of the BRAVO chrome extension from provided files

**Pre-conditions:**

	User has current BRAVO files and is working in a google chrome browser

**Test Steps:**

1. Navigate to chrome://extensions/

2. Click box next to Developer Mode in the top right

3. Select "Load unpacked extension…" tab located at the top left

4. Select directory where BRAVO chrome extension files are located then press select

**Expected Result:**

User is returned to the extension page and the BRAVO extension should now be seen in the top right of google chrome browser.

**Actual Result:**

	User sees the BRAVO icon in the top right corner of their Google Chrome browser 

	BRAVO extension icon: ![Imgur](http://i.imgur.com/0TzHcFh.jpg)

**Status (Pass/Fail):**

	Pass

**Notes:**

	N/A

**Post-conditions: **

	User is now able to access the visualizations in the BRAVO extension

**Test 002: User Views Visualization 1**

Load and view BRAVO visualization 1 (bar chart)

**Description:**

Test that the extension pop-up opens when the icon is selected and that the correct bar chart visualization with domain names and site visit totals and the visualization is opened in a new tab. Also check test the bar chart for its user interactions.

**Pre-conditions:**

	User is using a Google Chrome browser and has correctly installed the extension.

**Test Steps:**

1. Select the blue BRAVO extension icon located in the top right hand corner of the browser window

2. From the pop-up menu that appears, select the "Visualization 1" button.

3. Hover over a bar within the chart.

4. Click x in the Visualization 1 tab in the tab bar.

**Expected Result:**

User should have a new tab opened in their current Chrome browser upon clicking the "Visualization 1" button, the user should then see a bar chart and be able to interact with the bars of the chart. When the user hits the x in tab bar for the visualization, the tab should be closed.

**Actual Result:**

User is navigates to the new visualization tab and can see and interact with the bar chart on the page. Upon hovering over a bar in the graph, the bar turns light grey.

**Status (Pass/Fail):**

	Pass

**Notes:**

![Imgur](http://i.imgur.com/MiSD1Lp.jpg)

Example of the bar chart visualization that contains the total visits to the user’s top 35 domains and their site visit counts ordered from highest to lowest.

**Post-conditions:**

User can now continue with their browsing on Google Chrome and the visualization will continue tracking their site visits and display an updated bar chart upon using the BRAVO extension again.	

**Test 003: User Views Visualization 3**

Load and view BRAVO visualization 2 (sunburst graph)

**Description:**

Test that the extension pop-up opens when the icon is selected and that the correct sunburst graph visualization is opened in a new tab. Also check test the sunburst for correctly working user interactions.

**Pre-conditions:**

	User is using a Google Chrome browser and has correctly installed the extension.

**Test Steps:**

1. Select the blue BRAVO extension icon.

2. Select Visualization 2 button in the pop-up window (example pop-up window seen in Test 002).

3. Hover over the center circle or a surrounding section in graph with cursor.

4. Select a surrounding section of graph.

5. Select the inner circle section of the current subgraph.

6. Click x in the Visualization 2 tab in the tab bar.

**Expected Result:**

User should have a new tab opened when they click the "Visualization 2" button. In the new tab should be a sunburst graph. The sunburst can be interacted with, when the user hovers the cursor over the center circle or a surrounding portion of the graph the section turns light grey and the domain name or subdomain and total visits will appear in a tooltip. When the user selects a surrounding portion of the graph, the graph should shift and make the selected portion of the graph the center. When the user selects the middle circle of the graph when not at the main graph state, the graph will move back through the selections until it returns to the main graph state. When the x button is clicked in the tab bar, the visualization closes.

**Actual Result:**

User has a new tab opened and is able to see the sunburst visualization. The user can interact with the sunburst and move through the levels to allow them to zoom in and out of certain sections. When the user hovers over sections the tooltip appears and the section color changes. Pressing the x button in the tab bar closes the visualization tab.

**Status (Pass/Fail):**

**	**Pass

**Notes:**

![Imgur](http://i.imgur.com/YKmjiYh.jpg)

Example of the sunburst graph visualization which contains the domains and subdomains visited by the user ordered by their hierarchy. The size of the surrounding section is equivalent to the total site visits and the tooltip can be seen along with the section color change caused by a user hovering over the section.

**Post-conditions:**

User can now continue with their browsing on Google Chrome and the visualization will continue tracking their site visits and display an updated sunburst graph upon using the BRAVO extension again.	
