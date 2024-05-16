# User Manual

## Table of Contents

- [Link](#link)
- [Features](#features)
- [Installation](#installation)

## Link
<a href="[https://github.com/ncavestany/world-happiness-visualization">https://github.com/ncavestany/world-happiness-visualization</a>

## Features
### 1. World Choropleth
- Select a year in the dropdown menu.
- Hover over any colored region to see the happiness score for that country in that year.
- If you want to zoom in on a specific area, scroll the mouse wheel on that area. Double-click to reset the zoom and position.

### 2. Bar Chart
- Select a year in the dropdown menu. Select "Ascending" or "Descending" on the other dropdown menu to sort in that order.
- Hover over any bar to see the happiness score for that country in that year.

### 3. Bump Chart
- Hover over any region name on the legend to focus that region's data.
- Hover over a dot to see that region's average happiness score for that year.

### 4. Parallel Coordinates Plot
- Hover over any region name on the legend to focus that region's data. Click on a region to remove it from the chart.

## Installation
* Clone repository by using the ssh key:
```bash
git clone git@github.com:ncavestany/world-happiness-visualization.git
```
* Enter the project repository by using:
```bash
cd world-happiness-visualization
```
* Then run index.html locally. This can be done using an IDE such as VSCode Live Server.
* After making any desired changes, create a new branch and commit any changes.
```bash
git checkout -b <NEW_BRANCH_NAME>
git add <NEW FILES>
git commit -m "<COMMIT_MESSAGES>"
git push origin <NEW_BRANCH_NAME>
```

