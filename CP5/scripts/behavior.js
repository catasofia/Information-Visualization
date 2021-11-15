var map = "/data/countries50.json"
var stats = "/data/cldataset2_0_3.js"
var evolution = "/data/evolution_countries_new.js"
var after2 = "/data/afterand2000_0.js"
var before2 = "/data/bbbefore2000_0.js"
var afterline = "/data/lineafter2000.js"
var beforeline = "/data/linebefore2000.js"
var afterhosts = "/data/after2000hosts.js"
var beforehosts = "/data/before2000hosts.js"
var topology;
var dataEvolution;
var selectedCountries = [];
var legendselected_Countries = [];
var selectedGroup = "General";
var countriesHost = [];
var countriesNotHost = [];
var matrix = [];
var colorScaleMen;
var colorScaleWomen;
var nrCountries = 0;
var lineg;
var dataset;
var after2000;
var before2000;
var after2000h;
var before2000h;
var lineafter;
var lineall;
var all;
var data;
var linebefore;
var progress_w = ["#progressw_1", "#progressw_2", "#progressw_3", "#progressw_4"];
var progress_m = ["#progressm_1", "#progressm_2", "#progressm_3", "#progressm_4"];
var colorPosition = [false, false, false, false]
var nrNocsW = 0;
var nrNocsM = 0;
var progSvg = false;
var tooltip;
var tooltip_cl;
var tooltip_clg;
var tooltip_p;
var tooltip_lc;
var tooltip_l;
var yearsFilter = "default"

function init() {
	Promise.all([d3.json(map), d3.json("data/newjson_0.js"), d3.json(stats), d3.json(evolution), d3.json(after2), 
	d3.json(before2),d3.json(afterline), d3.json(beforeline),d3.json(afterhosts), 
	d3.json(beforehosts)]).then(function ([map, data, stats, evolution, after, before, afterL, beforeL, afterH, beforeH]) {
		topology = map;
		allhosts = data;
		dataset = data;
		all = stats
		datastats = stats;
		lineall = evolution;
		before2000 = before;
		lineafter = afterL;
		after2000h = afterH;
		before2000h = beforeH;
		linebefore = beforeL;
		dataEvolution = evolution;
		dataset.forEach(function (i) {
			countriesHost.push(i.Country);
		})
		evolution.forEach(function (j) {
			if (!countriesHost.includes(j))
				countriesNotHost.push(j.Country);
		})
		after2000 = after
		tooltip = d3.select("body")
			.append("div")
			.attr("class", "tooltip")
			.style("opacity", 0)

		colorScaleMen = d3.scaleThreshold()
			.domain([1, 2, 3, 4, 5])
			.range(d3.schemeBlues[6]);

		colorScaleWomen = d3.scaleThreshold()
			.domain([1, 2, 3, 4, 5])
			.range(["#facdd6", "#ffa3d2", "#ff69b4", "#ff1493", "#ff1493"])

		createChoroplethMap();
		createProgressBar("", "", true)
		createLineChart(data, "General", true, selectedCountries);
		createClevelandMedalsPerPart(stats, true);
		createClevelandMedalsPerGender(stats, true);
		createListCountries();
		addZoom();
	});
}

function createListCountries() {

	var countries = ["Select Country"];
	datastats.forEach(function (i) {
		countries.push(i.Country);
	})

	var dropdownButton = d3.select("#selectButton")
		.append('select')

	dropdownButton
		.selectAll('myOptions')
		.data(countries)
		.enter()
		.append('option')
		.attr("value", function (d) { return d; })
		.text(function (d) { return d; })

	d3.select("#selectButton").on("change", function (d) {
		var selectedOption = d3.select("#selectButton option:checked").property("value");
		handleSelectClick(selectedOption);
	})
}

function handleSelectClick(selectedOption) {

	choropleth = d3.select("div#choropleth").select("svg")
	linechart = d3.select("div#secondline").select("svg")
	cleveland1 = d3.select("div#clevelandMedalsP").select("svg")
	cleveland2 = d3.select("div#clevelandMedalsG").select("svg")
	progress = d3.select("div#progressBar").selectAll("svg")
	counter = 0;

	for (i = 0; i < datastats.length; i++) {
		if (selectedOption == datastats[i].Country && !selectedCountries.includes(selectedOption)) {
			if (nrCountries + 1 > 4) {
				window.alert("Impossible to select more than 4 NOCs")
				nrCountries -= counter;
				return;
			}
			else {
				counter++;
				nrCountries++;
			}
		}
	}

	cleveland1.remove()
	cleveland2.remove()
	progress.remove()
	nrNocsM = 0;
	nrNocsW = 0;
	progSvg = true;

	if (selectedCountries.includes(selectedOption)) {
		choropleth
			.selectAll("path")
			.filter(function (c) {
				if (selectedOption == c.properties.name)
					return c;
			})
			.style("stroke-width", 1);
	}
	else if (!selectedCountries.includes(selectedOption)) {
		choropleth
			.selectAll("path")
			.filter(function (c) {
				if (selectedOption == c.properties.name)
					return c;
			})
			.style("stroke-width", 3);
	}

	if (selectedCountries.includes(selectedOption)) {
		for (i = 0; i < selectedCountries.length; i++) {
			if (selectedCountries[i] === selectedOption) {
				colorPosition[i] = false
				deleteLine(selectedOption, false)
				datastats.forEach(function (i) {
					if (i.Country == selectedOption)
						nrCountries--
				})
				var newlist = [];
				newlist.push(selectedOption);

				selectedCountries = selectedCountries.filter(function (el) {
					return !newlist.includes(el);
				});
			}
		}
	} else if (!selectedCountries.includes(selectedOption)) {
		//linha problematica
		dataset1 = datastats.filter(function (c) {
			if (selectedOption === c.Country) {
				if (!selectedCountries.includes(selectedOption)) {
					selectedCountries.push(selectedOption);
					return selectedOption;
				}
			}
		})

	}

	if(yearsFilter == "default"){
		createClevelandMedalsPerPart(datastats, true);
		createClevelandMedalsPerGender(datastats, true);
	}
	else{
		createClevelandMedalsPerPart(datastats, false);
		createClevelandMedalsPerGender(datastats, false);
	}

	if (selectedCountries.length == 0) {
		createProgressBar("", "", true);
		if (selectedGroup == "General")
			createLineChart(dataset, "General", false, selectedCountries);
		else if (selectedGroup == "Women")
			createLineChart(dataset, "Women", false, selectedCountries);
	}
	else if (selectedCountries.includes(selectedOption)) {
		if (selectedGroup == "General")
			updateLineChart("General", selectedOption, selectedCountries);
		else if (selectedGroup == "Women")
			updateLineChart("Women", selectedOption, selectedCountries)
	}
	else {
		deleteLine(selectedOption, true)
	}

	data_aux = datastats.filter(function (d) {
		if (selectedCountries.includes(d.Country))
			return d;
	})

	data_aux.forEach(function (c) {
		aux = c;
		createProgressBar(aux, 1, false);
		createProgressBar(aux, 0, false);
		return c;
	})
	//tooltip_p.transition().duration(200).style("opacity", 0);
}

function createChoroplethMap() {
	var width = window.innerWidth * 0.546;
	var height = window.innerHeight * 0.48;
	var projection = d3
		.geoMercator()
		.scale(width / 6)
		.rotate([0, 0])
		.center([0, 0])
		.translate([width / 2, height / 1.3]);

	var path = d3.geoPath().projection(projection);

	const svg = d3.select("#choropleth")
		.append("svg")
		.attr("width", width)
		.attr("height", height)
	tooltip = d3
		.select("body")
		.append("div")
		.attr("class", "tooltip")
		.style("opacity", 0)


	svg.selectAll("path")
		.data(topojson.feature(topology, topology.objects.countries).features)
		.join("path")
		.attr("class", "country")
		.attr("d", path)
		.style("stroke", "#333333")
		.style("stroke-width", function (d){
			if(selectedCountries.includes(d.properties.name)) return "3";
		})
		.style("fill", (function (d) {
			var countriesHost = [];
			dataset.forEach(function (i) {
				countriesHost.push(i.Country);
			})
			var countriesPart = [];
			dataEvolution.forEach(function (j) {
				countriesPart.push(j.Country)
			})
			for (const x of dataset) {
				if (!countriesPart.includes(d.properties.name))
					return "white";
				else if (!countriesHost.includes(d.properties.name))
					return "#cccccc";
				else if (d.properties.name === x.Country) {
					if ((x.MedalsHost - x.MedalAverage) < 0) return "#f5918c";
					return d3.interpolateRgb("white", "#3e5f85")((x.MedalsHost - x.MedalAverage) / 200);
				}
			}
		}))
		.on("mouseover", handleMouseOver)
		.on("mouseleave", handleMouseLeave)
		.on("mousemove", function (event, d) {
			tooltip
				.style("left", event.pageX + "px")
				.style("top", event.pageY - 28 + "px");
		})
		.on("click", handleMouseClick)
		.attr("id", function (d, i) {
			return d.properties.name;
		})

	var defs = svg.append("defs");

	var linearGradient = defs.append("linearGradient")
		.attr("id", "linear-gradient");

	linearGradient
		.attr("x1", "0%")
		.attr("y1", "0%")
		.attr("x2", "0%")
		.attr("y2", "100%");

	linearGradient.append("stop")
		.attr("offset", "0%")
		.attr("stop-color", "#f5918c");

	linearGradient.append("stop")
		.attr("offset", "16.5%")
		.attr("stop-color", "white");

	linearGradient.append("stop")
		.attr("offset", "80%")
		.attr("stop-color", "#3e5f85");

	linearGradient.append("stop")
		.attr("offset", "100%")
		.attr("stop-color", "#000F48");


	svg.append('text')
		.attr('x', window.innerWidth * 0.001)
		.attr('y', window.innerHeight * 0.22)
		.style('color', 'black')
		.style("font-size", "13px")
		.style("font-family", "sans-serif")
		.text("Difference of medals")

	svg.append("rect")
		.attr("width", 20)
		.attr("height", 200)
		.attr("y", window.innerHeight * 0.23)
		.style("fill", "url(#linear-gradient)");

	svg.append('text')
		.attr('x', window.innerWidth * 0.015)
		.attr('y', window.innerHeight * 0.24)
		.style('color', 'black')
		.style("font-size", "13px")
		.style("font-family", "sans-serif")
		.text("<0")

	svg.append('text')
		.attr('x', window.innerWidth * 0.015)
		.attr('y', window.innerHeight * 0.27)
		.style('color', 'black')
		.style("font-size", "13px")
		.style("font-family", "sans-serif")
		.text("Never in the Olympics")

	svg.append('text')
		.attr('x', window.innerWidth * 0.015)
		.attr('y', window.innerHeight * 0.30)
		.style('color', 'black')
		.style("font-size", "13px")
		.style("font-family", "sans-serif")
		.text("Never host")

	svg.append('text')
		.attr('x', window.innerWidth * 0.015)
		.attr('y', window.innerHeight * 0.325)
		.style('color', 'black')
		.style("font-size", "13px")
		.style("font-family", "sans-serif")
		.text("50")

	svg.append('text')
		.attr('x', window.innerWidth * 0.015)
		.attr('y', window.innerHeight * 0.35)
		.style('color', 'black')
		.style("font-size", "13px")
		.style("font-family", "sans-serif")
		.text("100")

	svg.append('text')
		.attr('x', window.innerWidth * 0.015)
		.attr('y', window.innerHeight * 0.375)
		.style('color', 'black')
		.style("font-size", "13px")
		.style("font-family", "sans-serif")
		.text("150")

	svg.append('text')
		.attr('x', window.innerWidth * 0.015)
		.attr('y', window.innerHeight * 0.405)
		.style('color', 'black')
		.style("font-size", "13px")
		.style("font-family", "sans-serif")
		.text("200")

	svg.append('text')
		.attr('x', window.innerWidth * 0.015)
		.attr('y', window.innerHeight * 0.43)
		.style('color', 'black')
		.style("font-size", "13px")
		.style("font-family", "sans-serif")
		.text("250")

	svg.append('text')
		.attr('x', window.innerWidth * 0.015)
		.attr('y', window.innerHeight * 0.455)
		.style('color', 'black')
		.style("font-size", "13px")
		.style("font-family", "sans-serif")
		.text("300")
}

function createLineChart(data, group, value, local_Countries) {
	var color = null
	var nameOfLine;
	selectedGroup = group;

	width = window.innerWidth / 2.35;
	height = window.innerHeight * 0.39;

	margin = { top: 23, right: 40, bottom: 31, left: 50 };

	tooltip_lc = d3.select("body")
		.append("div")
		.attr("class", "tooltip_lc")
		.style("opacity", 0)

	tooltip_l = d3.select("body")
		.append("div")
		.attr("class", "tooltip_l")
		.style("opacity", 0)

	line = d3
		.line()
		.defined(function (d) {
			return d.Participants !== null;
		})
		.x((d) => x(d.Year))
		.y((d) => y(d.Participants))


	if (value || nrCountries == 0) {
		lineg = d3
			.line()
			.defined(function (d) {
				return d.Participants !== null;
			})
			.x((d) => x(d.Year))
			.y((d) => y(d.Participants))
	}

	line2 = d3
		.line()
		.defined(function (d) {
			return d.Participants !== null;
		})
		.x((d) => x(d.Year))
		.y((d) => y(d.WomenParticipants))

	if(yearsFilter == "default"){
		x = d3
			.scaleLinear()
			.domain([1896, 2016])
			.range([margin.left, width - 20]);
	}
	else if(yearsFilter == "after"){
		x = d3
			.scaleLinear()
			.domain([2000, 2016])
			.range([margin.left, width - 20]);
	}
	else{
		x = d3
			.scaleLinear()
			.domain([1896, 1996])
			.range([margin.left, width - 20]);
	}

	if (value && nrCountries == 0) {
		y = d3
			.scaleLinear()
			.domain([0, 13000])
			.range([height - margin.bottom, margin.top]);
	}
	else if(yearsFilter == "default" && nrCountries == 0){
		y = d3
			.scaleLinear()
			.domain([0, 13000])
			.range([height - margin.bottom, margin.top]);
	}
	else if(yearsFilter == "after" && nrCountries == 0){
		y = d3
			.scaleLinear()
			.domain([12000, 14000])
			.range([height - margin.bottom, margin.top]);
	}

	else if(yearsFilter == "before" && nrCountries == 0){
		y = d3
			.scaleLinear()
			.domain([0, 13000])
			.range([height - margin.bottom, margin.top]);
	}
	
	else if (group == "General") {
		y = d3
			.scaleLinear()
			.domain([0, 1500])
			.range([height - margin.bottom, margin.top]);
	}
	else if (group == "Women" && yearsFilter == "default") {
		y = d3
			.scaleLinear()
			.domain([0, 350])
			.range([height - margin.bottom, margin.top]);
	}

	else if (group == "Women" && yearsFilter == "before") {
		y = d3
			.scaleLinear()
			.domain([0, 350])
			.range([height - margin.bottom, margin.top]);
	}
	else if (group == "Women" && yearsFilter == "after") {
		y = d3
			.scaleLinear()
			.domain([0, 500])
			.range([height - margin.bottom, margin.top]);
	}

	
	var years = [];
	dataset.forEach(function (d) {
		years.push(d.Year);
	})

	xAxis = (g) =>
		g.attr("transform", `translate(0, ${height - margin.bottom})`).call(
			d3
				.axisBottom(x)
				.tickValues(years)
				.tickFormat((x) => x)
				.tickSizeOuter(0)
		);

	yAxis = (g) =>
		g
			.attr("transform", `translate(${margin.left}, 0)`)
			.call(d3.axisLeft(y).tickFormat((x) => x))
			.call((g) => g.select(".domain").remove());


	if (value) {
		d3.select("div#secondLine")
			.append("svg")
			.append("g")
			.attr("fill", "#767676")
			.append("path")
	}

	const svg = d3
		.select("div#secondLine")
		.select("svg")
		.attr("width", width)
		.attr("height", height)

	svg.append("g").attr("class", "lineXAxis");
	svg.append("g").attr("class", "lineYAxis");

	svg.select("g.lineXAxis").call(xAxis);
	svg.select("g.lineYAxis").call(yAxis);

	if (selectedCountries.length != 0 && !value) {
		d3.selectAll("#general").remove()
		d3.selectAll("#women").remove()
	}

	svg
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", margin.left - 50)
		.attr("x", 0 - height / 10)
		.attr("dy", "1em")
		.attr("text-anchor", "end")
		.style("font-size", "11px")
		.style("text-color", "black")
		.style("font-family", "sans-serif")
		.text("Nr of participants");

	svg.append("text")
		.style("font-size", "10px")
		.attr("class", "x label")
		.attr("text-anchor", "end")
		.attr("x", width - 40)
		.attr("y", height - 2)
		.style("font-family", "sans-serif")
		.text("Year");

	if (group === "General") {
		svg
			.append("svg:path")
			.datum(data)
			/* .transition()
			.duration(3000) */
			.attr("stroke", function (d) {
				if (value || (selectedCountries.length == 0 && selectedCountries.length == 0)) {
					color = "#767676"
					return color
				}
				else {
					for (i = 0; i < colorPosition.length; i++) {
						if (!colorPosition[i] && color == null) {
							colorPosition[i] = true
							color = colorScaleMen(i + 1)
							break;
						}
					}
					return color
				}
			})
			.on("click", handleClickLine)
			.on("mouseover", function (event, d) {
				if (nrCountries != 0) {
					tooltip_l.transition().duration(200).style("opacity", 0.9);
					tooltip_l
						.html(function () {
							for (i = 0; i < data.length; i++)
								if (data[i].Country)
									return "Country:<br>" + data[i].Country;
						})
						.style("left", event.pageX + "px")
						.style("top", event.pageY - 28 + "px");
				}
			})
			.on("mouseleave", function (d) {
				tooltip_l.transition().duration(200).style("opacity", 0);
			})
			.on("mousemove", function (event, d) {
				tooltip_l
					.style("left", event.pageX + "px")
					.style("top", event.pageY - 28 + "px");
			})
			.attr("stroke-width", 2)
			.attr("id", function (d) {
				if (nrCountries == 0) {
					nameOfLine = "general"
					return "general"
				}
				else {
					for (i = 0; i < data.length; i++) {
						if (data[i].NOC) {
							nameOfLine = data[i].NOC
							return data[i].NOC
						}
					}
				}
			})
			.attr("class", "line")
			.attr("fill", "none")
			.attr("d", line)


		var xCPosition;
		var yCPosition;
		var xTPosition;
		var yTPosition;

		if (value || local_Countries.length == 0) {
			xCPosition = 0.055
			yCPosition = 0.02
			xTPosition = 0.06
			yTPosition = 0.025
		}

		else {
			xCPosition = 0.055;
			for (let i = 0; i < local_Countries.length - 1; i++) {
				if (local_Countries[i].length > 10)
					xCPosition = xCPosition + 0.0075 * local_Countries[i].length;
				else
					xCPosition = xCPosition + 0.013 * local_Countries[i].length;
			}
			yCPosition = 0.02
			xTPosition = 3
			yTPosition = 0.025
		}
		counter = 0;
		data1 = data.filter(function (c) {
			for (i = 0; i < data.length; i++) {
				if (data[i].NOC && counter == 0) {
					if (c.NOC == data[i].NOC) {
						return c;
					}
				}
			}
		})

		svg.selectAll("mydots")
			.data(data1)
			.enter()
			.append("circle")
			.attr("id", nameOfLine)
			.attr("cx", window.innerWidth * xCPosition)
			.attr("cy", window.innerHeight * yCPosition)
			.attr("r", 7)
			.style("fill", function (d) { return color })

		if (selectedCountries.length == 0) {
			svg
				.selectAll("myLegend")
				.data(data1)
				.enter()
				.append('g')
				.append("text")
				.attr('x', window.innerWidth * xTPosition + 10)
				.attr('y', window.innerHeight * yTPosition)
				.text(function (d) { return "General" })
				.attr("id", "general")
				.style("fill", function (d) { return color; })
				.style("font-size", "15px")
				.style("font-family", "sans-serif")

		}
		else {

			svg
				.selectAll("myLegend")
				.data(data1)
				.enter()
				.append('g')
				.append("text")
				.attr('x', window.innerWidth * xCPosition + 10)
				.attr('y', window.innerHeight * 0.025)
				.text(function (d) { return d.Country; })
				.attr("id", function (d) {
					for (i = 0; i < data.length; i++) {
						if (data[i].NOC) {
							return data[i].NOC;
						}
					}
				})
				.style("fill", function (d) { return color; })
				.style("font-size", 15)
		}

		dataCircles = data.filter(function (d) {
			if (d.Year !== 1916 && d.Year !== 1940 && d.Year !== 1944)
				return d;
		})

		var selectCircle =
			svg
				.selectAll(".circle")
				.data(dataCircles)

		selectCircle.enter().append("circle")
			.attr("r", 3.5)
			.attr("id", nameOfLine)
			.attr("cx", (d) => x(d.Year))
			.attr("cy", (d) => y(d.Participants))
			.style("fill", color)
			.on("mouseover", function (event, d) {
				tooltip_lc.transition().duration(200).style("opacity", 0.9);
				tooltip_lc
					.html(function () {
						return "Participants: " + d.Participants;
					})
					.style("left", event.pageX + "px")
					.style("top", event.pageY - 28 + "px");
			})
			.on("mouseleave", function (d) {
				d3.select(this)
					.style("stroke", "none")
				tooltip_lc.transition().duration(200).style("opacity", 0);
			})
	}
	else {
		var colorWomen = null
		svg
			.append("svg:path")
			.datum(data)
			/* .transition()
			.duration(3000) */
			.attr("stroke", function (d) {
				if (value || (selectedCountries.length == 0 && selectedCountries.length == 0)) {
					colorWomen = "#ff1493"
					return colorWomen
				}
				else {
					for (i = 0; i < colorPosition.length; i++) {
						if (!colorPosition[i] && colorWomen == null) {
							colorPosition[i] = true
							colorWomen = colorScaleWomen(i)
						}
					}
					return colorWomen
				}
			})
			.attr("stroke-width", 2)
			.attr("id", function (d) {
				if (nrCountries == 0) {
					nameOfLine = "women"
					return "women"
				}
				else {
					for (i = 0; i < data.length; i++) {
						if (data[i].NOC) {
							nameOfLine = data[i].NOC
							return data[i].NOC
						}
					}
				}
			})
			.attr("class", "line")
			.attr("fill", "none")
			.attr("d", line2)
			.on("click", handleClickLine)
			.on("mouseover", function (event, d) {
				if (nrCountries != 0) {
					tooltip_l.transition().duration(200).style("opacity", 0.9);
					tooltip_l
						.html(function () {
							for (i = 0; i < data.length; i++)
								if (data[i].Country)
									return "Country:<br>" + data[i].Country;
						})
						.style("left", event.pageX + "px")
						.style("top", event.pageY - 28 + "px");
				}
			})
			.on("mouseleave", function (d) {
				tooltip_l.transition().duration(200).style("opacity", 0);
			})
			.on("mousemove", function (event, d) {
				tooltip_l
					.style("left", event.pageX + "px")
					.style("top", event.pageY - 28 + "px");
			})

		var xCPosition;
		var yCPosition;
		var xTPosition;
		var yTPosition;


		if (value || local_Countries.length == 0) {
			xCPosition = 0.055
			yCPosition = 0.02
			xTPosition = 0.06
			yTPosition = 0.025
		}

		else {
			xCPosition = 0.055;
			for (let i = 0; i < local_Countries.length - 1; i++) {
				if (local_Countries[i].length > 10)
					xCPosition = xCPosition + 0.0075 * local_Countries[i].length;
				else
					xCPosition = xCPosition + 0.013 * local_Countries[i].length;
			}
			yCPosition = 0.02
			xTPosition = 3
			xTPosition = 3
			xTPosition = 3
			xTPosition = 3
			xTPosition = 3
			xTPosition = 3
			xTPosition = 3
			yTPosition = 0.025
		}

		counter = 0;
		data1 = data.filter(function (c) {
			for (i = 0; i < data.length; i++) {
				if (data[i].NOC && counter == 0) {
					if (c.NOC == data[i].NOC)
						return c;
				}
			}
		})

		svg.selectAll("mydots")
			.data(data1)
			.enter()
			.append("circle")
			.attr("id", nameOfLine)
			.attr("cx", window.innerWidth * xCPosition)
			.attr("cy", window.innerHeight * yCPosition)
			.attr("r", 7)
			.style("fill", function (d) { return colorWomen })

		if (selectedCountries.length == 0) {
			svg
				.selectAll("myLegend")
				.data(data1)
				.enter()
				.append('g')
				.append("text")
				.attr('x', window.innerWidth * xTPosition)
				.attr('y', window.innerHeight * yTPosition)
				.text(function (d) { return "Women" })
				.attr("id", "women")
				.style("fill", function (d) { return colorWomen; })
				.style("font-size", "15px")
				.style("font-family", "sans-serif")
		}
		else {
			svg
				.selectAll("myLegend")
				.data(data1)
				.enter()
				.append('g')
				.append("text")
				.attr('x', window.innerWidth * xCPosition + 10)
				.attr('y', window.innerHeight * 0.025)
				.text(function (d) { return d.Country; })
				.attr("id", function (d) {
					for (i = 0; i < data.length; i++) {
						if (data[i].NOC) {
							return data[i].NOC;
						}
					}
				})
				.style("fill", function (d) { return colorWomen; })
				.style("font-size", 15)
		}

		dataCircles = data.filter(function (d) {
			if (d.Year !== 1916 && d.Year !== 1940 && d.Year !== 1944)
				return d;
		})

		var selectCircle =
			svg
				.selectAll(".circle")
				.data(dataCircles)

		selectCircle.enter().append("circle")
			.attr("r", 3.5)
			.attr("id", nameOfLine)
			.attr("cx", (d) => x(d.Year))
			.attr("cy", (d) => y(d.WomenParticipants))
			.style("fill", colorWomen)
			.on("mouseover", function (event, d) {
				tooltip_lc.transition().duration(200).style("opacity", 0.9);
				tooltip_lc
					.html(function () {
						return "Participants: " + d.WomenParticipants;
					})
					.style("left", event.pageX + "px")
					.style("top", event.pageY - 28 + "px");
			})
			.on("mouseleave", function (d) {
				d3.select(this)
					.style("stroke", "none")
				tooltip_lc.transition().duration(200).style("opacity", 0);
			})
	}
}

function updateLineChart(group, country, aux_countries) {
	linechart = d3.select("div#secondLine").select("svg")

	dataEvolution1 = dataEvolution.filter(function (d) {
		if (selectedCountries.includes(d.Country) || d.Year == "1916" || d.Year == "1944" || d.Year == "1948") {
			if (d.Country == country || d.Year == "1916" || d.Year == "1940" || d.Year == "1944")
				return d;
		}
	})
	createLineChart(dataEvolution1, group, false, aux_countries)
}

function createClevelandMedalsPerPart(stats, flag) {
	const margin = { top: 28, right: 15, bottom: 30, left: 40 },
		width = window.innerWidth / 5 - margin.left - margin.right,
		height = window.innerHeight * 0.3535;

	d3.select("div#clevelandMedalsP")
		.append("svg")

	svg = d3.select("div#clevelandMedalsP")
		.select("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", `translate(${margin.left}, ${margin.top})`)


	datastats1 = datastats.filter(function (d) {
		if (selectedCountries.length == 0) {
			if(flag){
				if (d.Participants > 5000)
					return d;}
				else if(yearsFilter == "after"){
					if (d.Participants > 1000)
						return d;}
				else{
					if (d.Participants > 3000)
						return d;
				}
		}
		else if (selectedCountries.includes(d.Country))
			return d;
	}) 

	x = d3.scaleLinear()
		.domain([0, d3.max(datastats1, (d) => d.Participants)])
		.range([0, width]);

	svg.append("g")
		.attr("transform", `translate(0, ${height})`)
		.call(d3.axisBottom(x))

	y = d3.scaleBand()
		.range([0, height])
		.domain(datastats1.map(function (d) { return d.NOC; }))
		.padding(1);
	svg.append("g")
		.call(d3.axisLeft(y))

	svg.selectAll("myline")
		.data(datastats1)
		.join("line")
		.attr("class", "line")
		.attr("x1", function (d) { return x(0); })
		.attr("x2", function (d) { return x(0); })
		.attr("y1", function (d) { return y(d.NOC); })
		.attr("y2", function (d) { return y(d.NOC); })
		.attr("stroke", "grey")
		.attr("stroke-width", "1px")

	svg.selectAll(".line")
		.transition()
		.duration(2000)
		.attr("x1", function (d) { return x(d.Medalists); })
		.attr("x2", function (d) { return x(d.Participants); })

	tooltip_cl = d3.select("body")
		.append("div")
		.attr("class", "tooltip_cl")
		.style("opacity", 0)

	svg.selectAll("mycircle")
		.data(datastats1)
		.enter()
		.append("circle")
		.attr("class", "circle1")
		.attr("cx", x(0))
		.attr("cy", function (d) { return y(d.NOC); })
		.attr("r", "6")
		.style("fill", "#c39fd9")
		.on("mouseover", function (event, d) {
			d3.select(this)
				.style("stroke", "black")

			tooltip_cl.transition().duration(200).style("opacity", 0.9);
			tooltip_cl
				.html(function () {
					return "Medalists: " + d.Medalists;
				})
				.style("left", event.pageX + "px")
				.style("top", event.pageY - 28 + "px");
		})
		.on("mouseleave", function (d) {
			d3.select(this)
				.style("stroke", "none")
			tooltip_cl.transition().duration(200).style("opacity", 0);
		})
		.on("click", handleClevelandClick)


	svg.selectAll(".circle1")
		.transition()
		.duration(2000)
		.attr("cx", function (d) { return x(d.Medalists); })

	svg.selectAll("mycircle")
		.data(datastats1)
		.enter()
		.append("circle")
		.attr("class", "circle2")
		.attr("cx", x(0))
		.attr("cy", function (d) { return y(d.NOC); })
		.attr("r", "6")
		.style("fill", "#767676")
		.on("mouseover", function (event, d) {
			d3.select(this)
				.style("stroke", "black")

			tooltip_cl.transition().duration(200).style("opacity", 0.9);
			tooltip_cl
				.html(function () {
					return "Participants: " + d.Participants;
				})
				.style("left", event.pageX + "px")
				.style("top", event.pageY - 28 + "px");
		})
		.on("mouseleave", function (d) {
			d3.select(this)
				.style("stroke", "none")

			tooltip_cl.transition().duration(200).style("opacity", 0);
		})
		.on("click", handleClevelandClick)


	svg.append("circle").attr("cx", window.innerWidth * 0.01).attr("cy", window.innerHeight * 0.0000001).attr("r", 6).style("fill", "#c39fd9")
	svg.append("circle").attr("cx", window.innerWidth * 0.11).attr("cy", window.innerHeight * 0.0000001).attr("r", 6).style("fill", "#767676")
	svg.append("text").attr("x", window.innerWidth * 0.015).attr("y", window.innerHeight * 0.004).text("Nr of medalists")
		.style("font-size", "13px").attr("alignment-baseline", "middle").style("font-family", "sans-serif")
	svg.append("text").attr("x", window.innerWidth * 0.115).attr("y", window.innerHeight * 0.004).text("Nr of participants")
		.style("font-size", "13px").attr("alignment-baseline", "middle").style("font-family", "sans-serif")

	svg.selectAll(".circle2")
		.transition()
		.duration(2000)
		.attr("cx", function (d) { return x(d.Participants); })

	svg.append("text")
		.style("font-size", "10px")
		.attr("class", "x label")
		.attr("text-anchor", "end")
		.attr("x", width)
		.attr("y", height + 28)
		.style("font-family", "sans-serif")
		.text("Nr of participants");

	svg.append("text")
		.style("font-size", "10px")
		.attr("class", "y label")
		.attr("text-anchor", "end")
		.attr("y", -width/9)
		.attr("dy", ".75em")
		.attr("transform", "rotate(-90)")
		.style("font-family", "sans-serif")
		.text("NOC");
}

function createClevelandMedalsPerGender(stats, flag) {
	const margin = { top: 28, right: 30, bottom: 30, left: 40 },
		width = window.innerWidth / 4.7 - margin.left - margin.right,
		height = window.innerHeight * 0.3535;


	const svg = d3.select("#clevelandMedalsG")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", `translate(${margin.left}, ${margin.top})`);

	datastats1 = datastats.filter(function (d) {
		if (selectedCountries.length == 0) {
			if(flag){
				if (d.Participants > 5000)
					return d;}
			else if(yearsFilter == "after"){
				if (d.Participants > 1000)
					return d;}
			else{
				if (d.Participants > 3000)
					return d;
			}
		}
		else if (selectedCountries.includes(d.Country))
			return d;
	})

	if (d3.max(datastats1, (d) => d.MenPerc) > d3.max(datastats1, (d) => d.WomenPerc))
		maxX = d3.max(datastats1, (d) => d.MenPerc)
	else maxX = d3.max(datastats1, (d) => d.WomenPerc)

	const x = d3.scaleLinear()
		.domain([0, maxX])
		.range([0, width]);

	svg.append("g")
		.attr("transform", `translate(0, ${height})`)
		.call(d3.axisBottom(x))


	const y = d3.scaleBand()
		.range([0, height])
		.domain(datastats1.map(function (d) { return d.NOC; }))
		.padding(1);
	svg.append("g")
		.call(d3.axisLeft(y))

	svg.selectAll("myline")
		.data(datastats1)
		.join("line")
		.attr("class", "line")
		.attr("x1", function (d) { return x(0); })
		.attr("x2", function (d) { return x(0); })
		.attr("y1", function (d) { return y(d.NOC); })
		.attr("y2", function (d) { return y(d.NOC); })
		.attr("stroke", "grey")
		.attr("stroke-width", "1px")

	svg.selectAll(".line")
		.transition()
		.duration(2000)
		.attr("x1", function (d) { return x(d.WomenPerc); })
		.attr("x2", function (d) { return x(d.MenPerc); })

	tooltip_clg = d3.select("body")
		.append("div")
		.attr("class", "tooltip_clg")
		.style("opacity", 0)

	svg.selectAll("mycircle")
		.data(datastats1)
		.enter()
		.append("circle")
		.attr("class", "circle1")
		.attr("cx", function (d) { return x(0); })
		.attr("cy", function (d) { return y(d.NOC); })
		.attr("r", "6")
		.style("fill", "#ff1493")
		.on("mouseover", function (event, d) {
			d3.select(this)
				.style("stroke", "black")

			tooltip_clg.transition().duration(200).style("opacity", 0.9);
			tooltip_clg
				.html(function () {
					return "Women Percentage: " + d.WomenPerc + "%";
				})
				.style("left", event.pageX - 120 +"px")
				.style("top", event.pageY - 28 + "px");
		})
		.on("mouseleave", function (d) {
			d3.select(this)
				.style("stroke", "none")

			tooltip_clg.transition().duration(200).style("opacity", 0);
		})
		.on("click", handleClevelandClick)


	svg.selectAll(".circle1")
		.transition()
		.duration(2000)
		.attr("cx", function (d) { return x(d.WomenPerc); })

	svg.selectAll("mycircle")
		.data(datastats1)
		.enter()
		.append("circle")
		.attr("class", "circle2")
		.attr("cx", function (d) { return x(0); })
		.attr("cy", function (d) { return y(d.NOC); })
		.attr("r", "6")
		.style("fill", "#6c9dc4")
		.on("mouseover", function (event, d) {
			d3.select(this)
				.style("stroke", "black")

			tooltip_clg.transition().duration(200).style("opacity", 0.9);
			tooltip_clg
				.html(function () {
					return "Men Percentage " + d.MenPerc + "%";
				})
				.style("left", event.pageX - 120 + "px")
				.style("top", event.pageY - 28 + "px");
		})
		.on("mouseleave", function (d) {
			d3.select(this)
				.style("stroke", "none")

			tooltip_clg.transition().duration(200).style("opacity", 0);
		})
		.on("click", handleClevelandClick)

	svg.selectAll(".circle2")
		.transition()
		.duration(2000)
		.attr("cx", function (d) { return x(d.MenPerc); })

	svg.append("circle").attr("cx", window.innerWidth * 0.01).attr("cy", window.innerHeight * 0.0000001).attr("r", 6).style("fill", "#ff1493")
	svg.append("circle").attr("cx", window.innerWidth * 0.11).attr("cy", window.innerHeight * 0.0000001).attr("r", 6).style("fill", "#6c9dc4")
	svg.append("text").attr("x", window.innerWidth * 0.015).attr("y", window.innerHeight * 0.000001).text("Women % of")
		.style("font-size", "13px").attr("alignment-baseline", "middle").style("font-family", "sans-serif")
	svg.append("text").attr("x", window.innerWidth * 0.015).attr("y", window.innerHeight * 0.013).text("medalists")
		.style("font-size", "13px").attr("alignment-baseline", "middle").style("font-family", "sans-serif")
	svg.append("text").attr("x", window.innerWidth * 0.115).attr("y", window.innerHeight * 0.0000001).text("Men % of")
		.style("font-size", "13px").attr("alignment-baseline", "middle").style("font-family", "sans-serif")
	svg.append("text").attr("x", window.innerWidth * 0.115).attr("y", window.innerHeight * 0.013).text("medalists")
		.style("font-size", "13px").attr("alignment-baseline", "middle").style("font-family", "sans-serif")

	svg.append("text")
		.style("font-size", "10px")
		.attr("class", "x label")
		.attr("text-anchor", "end")
		.attr("x", width)
		.attr("y", height + 28)
		.style("font-family", "sans-serif")
		.text("Percentage of medalists");

	svg.append("text")
		.style("font-size", "10px")
		.attr("class", "y label")
		.attr("text-anchor", "end")
		.attr("y", -width/9)
		.attr("dy", ".75em")
		.attr("transform", "rotate(-90)")
		.style("font-family", "sans-serif")
		.text("NOC");
}

function handleClevelandClick(event, d) {
	choropleth = d3.select("div#choropleth").select("svg")
	linechart = d3.select("div#secondline").select("svg")
	cleveland1 = d3.select("div#clevelandMedalsP").select("svg")
	cleveland2 = d3.select("div#clevelandMedalsG").select("svg")
	progress = d3.select("div#progressBar").selectAll("svg")

	tooltip_cl.transition().duration(200).style("opacity", 0);
	tooltip_clg.transition().duration(200).style("opacity", 0);

	for (i = 0; i < datastats.length; i++) {
		if (d.Country == datastats[i].Country && !selectedCountries.includes(d.Country)) {
			if (nrCountries + 1 > 4) {
				window.alert("Impossible to select more than 4 NOCs")
				nrCountries -= counter;
				return;
			}
			else {
				counter++;
				nrCountries++
			}
		}
	}

	cleveland1.remove()
	cleveland2.remove()
	progress.remove()
	nrNocsM = 0;
	nrNocsW = 0;
	progSvg = true;

	if (selectedCountries.includes(d.Country)) {
		choropleth
			.selectAll("path")
			.filter(function (c) {
				if (d.Country == c.properties.name)
					return c;
			})
			.style("stroke-width", 1);
	}
	else if (!selectedCountries.includes(d.Country)) {
		choropleth
			.selectAll("path")
			.filter(function (c) {
				if (d.Country == c.properties.name)
					return c;
			})
			.style("stroke-width", 3);
	}

	if (selectedCountries.includes(d.Country)) {
		for (i = 0; i < selectedCountries.length; i++) {
			if (selectedCountries[i] === d.Country) {
				colorPosition[i] = false
				deleteLine(d.Country, false)
				datastats.forEach(function (i) {
					if (i.Country == d.Country)
						nrCountries--
				})
				var newlist = [];
				newlist.push(d.Country);

				selectedCountries = selectedCountries.filter(function (el) {
					return !newlist.includes(el);
				});
			}
		}
	} else if (!selectedCountries.includes(d.Country)) {
		dataset1 = datastats.filter(function (c) {
			if (d.Country === c.Country) {
				if (!selectedCountries.includes(d.Country)) {
					selectedCountries.push(d.Country);
					return d.Country;
				}
			}
		})

	}

	/* if (selectedCountries.includes(d.Country) && !countriesHost.includes(d.Country)) {
		for (i = 0; i < selectedCountries.length; i++) {
			if (selectedCountries[i] === d.Country) {
				colorPosition[i] = false
				deleteLine(d.Country, true)
				datastats.forEach(function (i) {
					if (i.Country == d.Country)
						nrCountries--
				})
				var newlist = [];
				newlist.push(d.Country);

				selectedCountries = selectedCountries.filter(function (el) {
					return !newlist.includes(el);
				});
			}
		}
	} else if (!selectedCountries.includes(d.Country) && !countriesHost.includes(d.Country)) {
		dataset1 = dataEvolution.filter(function (c) {
			if (d.Country === c.Country) {
				if (!selectedCountries.includes(d.Country)) {
					selectedCountries.push(d.Country);
					return d.Country;
				}
			}
		})

	} */

	if(yearsFilter == "default"){
		createClevelandMedalsPerPart(datastats, true);
		createClevelandMedalsPerGender(datastats, true);
	}
	else{
		createClevelandMedalsPerPart(datastats, false);
		createClevelandMedalsPerGender(datastats, false);
	}

	if (selectedCountries.length == 0) {
		createProgressBar("", "", true);
		if (selectedGroup == "General")
			createLineChart(dataset, "General", false, selectedCountries);
		else if (selectedGroup == "Women")
			createLineChart(dataset, "Women", false, selectedCountries);
	}
	else if (selectedCountries.includes(d.Country)) {
		if (selectedGroup == "General")
			updateLineChart("General", d.Country, selectedCountries);
		else if (selectedGroup == "Women")
			updateLineChart("Women", d.Country, selectedCountries)
	}
	else {
		deleteLine(d.Country, true)
	}

	data_aux = datastats.filter(function (d) {
		if (selectedCountries.includes(d.Country))
			return d;
	})

	data_aux.forEach(function (c) {
		aux = c;
		createProgressBar(aux, 1, false);
		createProgressBar(aux, 0, false);
		return c;
	})
}

function createBigProgress(value, women) {

	const width = window.innerWidth * 0.42;
	height = window.innerHeight * 0.383;

	if (women) {

		svg = d3.select("div#progressBar")
			.select("#progressw_1")
			.select("svg")


		const pie = d3.pie()
			.value(d => d[1])

		const stroke = d3.scaleOrdinal()
			.range(["#b94366", "#ffe6ee"])

		const fill = d3.scaleOrdinal()
			.range(["#ff1493", "white"])

		const data_aux = pie([['pais', value], ['', 100 - value]])

		svg.append("text")
			.text("Women")
			.attr("font-size", "14px")
			.attr("transform", `translate(${width / 8},${height / 14})`);

		svg
			.selectAll('progress')
			.data(data_aux)
			.join('path')
			.attr('d', d3.arc()
				.innerRadius(width/12)
				.outerRadius(width/7)
			)
			.attr('fill', d => fill(d.data))
			.style("opacity", 1)
			.style("stroke", d => stroke(d.data))
			.style("stroke-width", 2)


		svg.selectAll('path')
			.attr("transform", `translate(${width / 6.3},${height / 2})`);

		svg.append("text")
			.attr("text-anchor", "middle")
			.transition()
			.duration(200)
			.text(value + "%")
			.attr("font-size", "20px")
			.attr("transform", `translate(${width / 6.3},${height / 2})`);
	} else {

		svg = d3.select("div#progressBar")
			.select("#progressw_3")
			.select("svg")

		const pie = d3.pie()
			.value(d => d[1])

		const stroke = d3.scaleOrdinal()
			.range(["#23395d", "#b1f2ff"])

		const fill = d3.scaleOrdinal()
			.range(["steelblue", "white"])

		const data_aux = pie([['pais', value], ['', 100 - value]])

		svg.append("text")
			.text("Men")
			.attr("font-size", "14px")
			.attr("transform", `translate(${width / 2.8},${height / 14})`);

		svg
			.selectAll('progress')
			.data(data_aux)
			.join('path')
			.attr('d', d3.arc()
				//.startAngle(0)
				//.endAngle(Math.PI * 2)
				.innerRadius(width/12)
				.outerRadius(width/7)
			)
			.attr('fill', d => fill(d.data))
			.style("opacity", 1)
			.style("stroke", d => stroke(d.data))
			.style("stroke-width", 2)
			.attr("transform", `translate(${width / 2.6},${height / 2})`);

		svg.append("text")
			.attr("text-anchor", "middle")
			.transition()
			.duration(200)
			.text(value + "%")
			.attr("font-size", "20px")
			.attr("transform", `translate(${width / 2.6},${height / 2})`);
	}

}

function createProgressBar(country, women, flag) {

	const width = window.innerWidth * 0.449;
	height = window.innerHeight * 0.428;

	const radius = 30;

	if (flag) {

		svg = d3.select("div#progressBar")
			.select("#progressw_1")
			.append("svg")
			.attr("width", width / 1.75)
			.attr("height", height)

		svg = d3.select("div#progressBar")
			.select("#progressw_3")
			.append("svg")
			.attr("width", width / 1.75)
			.attr("height", height)

		avgW = 0;
		avgM = 0;
		count = 0;
		womenMedl = 0
		menMedl = 0
		womenPart = 0
		menPart = 0
		datastats.forEach(function(c){
			womenMedl = womenMedl + c.WomenMedalists;
			womenPart = womenPart + c.WomenParticipants;
			menMedl = menMedl + c.MenMedalists;
			menPart = menPart + c.MenParticipants;
		})

		avgW = womenMedl / womenPart * 100;
		avgM = menMedl / menPart * 100;

		createBigProgress(avgW.toFixed(2), true);
		createBigProgress(avgM.toFixed(2), false);
	} else {

		if (progSvg) {
			svg = d3.select("div#progressBar")
				.select("#progressw_1")
				.append("svg")
				.attr("width", width / 8)
				.attr("height", height / 2.02)

			svg = d3.select("div#progressBar")
				.select("#progressw_2")
				.append("svg")
				.attr("width", width / 8)
				.attr("height", height / 2.02)
				.append("g")

			svg = d3.select("div#progressBar")
				.select("#progressw_3")
				.append("svg")
				.attr("width", width / 8)
				.attr("height", height / 2.02)
				.append("g")

			svg = d3.select("div#progressBar")
				.select("#progressw_4")
				.append("svg")
				.attr("width", width / 8)
				.attr("height", height / 2.02)
				.append("g")

			svg = d3.select("div#progressBar")
				.select("#progressm_1")
				.append("svg")
				.attr("width", width / 8)
				.attr("height", height / 2.02)

			svg = d3.select("div#progressBar")
				.select("#progressm_2")
				.append("svg")
				.attr("width", width / 8)
				.attr("height", height / 2.02)
				.append("g")

			svg = d3.select("div#progressBar")
				.select("#progressm_3")
				.append("svg")
				.attr("width", width / 8)
				.attr("height", height / 2.02)
				.append("g")

			svg = d3.select("div#progressBar")
				.select("#progressm_4")
				.append("svg")
				.attr("width", width / 8)
				.attr("height", height / 2.02)
				.append("g")
		}

		tooltip_p = d3.select("body")
			.append("div")
			.attr("class", "tooltip_p")
			.style("opacity", 0)

		if (women == 1) {

			svg = d3.select("div#progressBar")
				.select(progress_w[nrNocsW])
				.select("svg")
				.on("mouseover", function (event, d) {

					tooltip_p.transition().duration(200).style("opacity", 0.9);
					tooltip_p
						.html(function () {
							return "Country:<br>" + country.Country;
						})
						.style("left", event.pageX - 130 + "px")
						.style("top", event.pageY - 28 + "px");
				})
				.on("mouseleave", function (d) {
					tooltip_p.transition().duration(200).style("opacity", 0);
				}).on("click", function () {
					tooltip_p.transition().duration(200).style("opacity", 0);
					handleSelectClick(country.Country);
				})

			const pie = d3.pie()
				.value(d => d[1])

			const stroke = d3.scaleOrdinal()
				.range(["#b94366", "#ffe6ee"])

			const fill = d3.scaleOrdinal()
				.range(["#ff1493", "white"])

			const data_aux = pie([['pais', country.WomenPerc], ['', 100 - country.WomenPerc]])

			svg.append("text")
				.text(country.NOC)
				.attr("font-size", "10px")
				.attr("transform", `translate(${width / 23},${height / 14})`);

			svg
				.selectAll('progress')
				.data(data_aux)
				.join('path')
				.attr('d', d3.arc()
					//.startAngle(0)
					//.endAngle(Math.PI * 2)
					.innerRadius(width/30)
					.outerRadius(width/17)
				)
				.attr('fill', d => fill(d.data))
				.style("opacity", 1)
				.style("stroke", d => stroke(d.data))
				.style("stroke-width", 2)



			svg.selectAll('path')
				.attr("transform", `translate(${width / 16},${height / 4})`);

			svg.append("text")
				.attr("text-anchor", "middle")
				.transition()
				.duration(200)
				.text(country.WomenPerc + "%")
				.attr("font-size", "14px")
				.attr("transform", `translate(${width / 16},${height / 4})`);

			nrNocsW++;
			progSvg = false;

		} else if (women == 0) {

			svg = d3.select("div#progressBar")
				.select(progress_m[nrNocsM])
				.select("svg")
				.on("mouseover", function (event, d) {

					tooltip_p.transition().duration(200).style("opacity", 0.9);
					tooltip_p
						.html(function () {
							return "Country:<br>" + country.Country;
						})
						.style("left", event.pageX - 130 + "px")
						.style("top", event.pageY - 28 + "px");
				})
				.on("mouseleave", function (d) {
					d3.select(this)
						.style("stroke", "none")

					tooltip_p.transition().duration(200).style("opacity", 0);
				}).on("click", function () {
					tooltip_p.transition().duration(200).style("opacity", 0);
					handleSelectClick(country.Country);
				})

			const pie = d3.pie()
				.value(d => d[1])

			const stroke = d3.scaleOrdinal()
				.range(["#23395d", "#b1f2ff"])

			const fill = d3.scaleOrdinal()
				.range(["steelblue", "white"])

			const data_aux = pie([['pais', country.MenPerc], ['', 100 - country.MenPerc]])

			svg
				.selectAll('progress')
				.data(data_aux)
				.join('path')
				.attr('d', d3.arc()
					.innerRadius(width/30)
					.outerRadius(width/17)
				)
				.attr('fill', d => fill(d.data))
				.style("opacity", 1)
				.style("stroke", d => stroke(d.data))
				.style("stroke-width", 2)

			svg.selectAll('path')
				.transition()
				.duration(200)
				.attr("transform", `translate(${width / 16},${height / 6})`);

			svg.append("text")
				.transition()
				.duration(200)
				.attr("text-anchor", "middle")
				.text(country.MenPerc + "%")
				.attr("font-size", "14px")
				.attr("transform", `translate(${width / 16},${height / 6})`);

			nrNocsM++;
			progSvg = false;
		}
	}
}

function handleMouseOver(event, d) {
	choropleth = d3.select("div#choropleth").select("svg");

	tooltip.transition().duration(200).style("opacity", 0.9);
	tooltip
		.html(
			(function () {
				var countries = [];
				dataset.forEach(function (c) {
					countries.push(c.Country);
				})
				var countriesPart = [];
					dataEvolution.forEach(function (j) {
						countriesPart.push(j.Country)
					})
				for (const x of dataset) {
					var output = "Country: " + d.properties.name + "<br>";
					if (!countriesPart.includes(d.properties.name)){
						return output + "This country was never in the Olympics in the interval chosen";
					}
					if (!countries.includes(d.properties.name)) {
						return output + "This country was never host in the interval chosen";
					}
					if (d.properties.name === x.Country) {
						years = [];
						for (const i of dataset) {
							if (i.Country == x.Country)
								years.push(i.Year);
						}
						var difference = x.MedalsHost - x.MedalAverage;
						return output + "Difference of Medals: " + difference + "<br>Host in years: " + years;
					}
				}
			})
		)
		.style("left", event.pageX + "px")
		.style("top", event.pageY - 28 + "px");

	choropleth
		.selectAll("path")
		.transition()
		.duration(200)
		.style("opacity", 0.5)
		.filter(function (c) {
			if (d.id == c.id) {
				return c;
			}
		})
		.transition()
		.duration(200)
		.style("opacity", 1)
		.style("stroke", "black")
}

function handleMouseLeave(event, d) {
	choropleth = d3.select("div#choropleth").select("svg");

	tooltip.transition().duration(200).style("opacity", 0);

	choropleth
		.selectAll("path")
		.transition()
		.duration(200)
		.style("opacity", 1)
		.filter(function (c) {
			if (d.id == c.id) return c;
		})
		.transition()
		.duration(200)
		.style("stroke", "#333333")
}

function handleMouseClick(event, d) {

	choropleth = d3.select("div#choropleth").select("svg");
	linechart = d3.select("div#secondLine").select("svg");
	cleveland1 = d3.select("div#clevelandMedalsP").select("svg");
	cleveland2 = d3.select("div#clevelandMedalsG").select("svg");
	progress = d3.select("div#progressBar").selectAll("svg")
	counter = 0;

	for (i = 0; i < datastats.length; i++) {
		if (d.properties.name == datastats[i].Country && !selectedCountries.includes(d.properties.name)) {
			if (nrCountries + 1 > 4) {
				window.alert("Impossible to select more than 4 NOCs")
				nrCountries -= counter;
				return;
			}
			else {
				counter++;
				nrCountries++
			}
		}
	}

	if (!countriesNotHost.includes(d.properties.name) && !countriesHost.includes(d.properties.name)) {
		return;
	}

	cleveland1.remove()
	cleveland2.remove()
	progress.remove()
	nrNocsM = 0;
	nrNocsW = 0;
	progSvg = true;

	if (selectedGroup === "Women") {
		if (!selectedCountries.includes(d.properties.name)) {
			linechart
				.selectAll("circle")
				.filter(function (b) {
					if (d.properties.name == b.Country) {
						return b;
					}
				})
				.style("fill", "#6c9dc4");
		}

		else {
			linechart
				.selectAll("circle")
				.filter(function (b) {
					if (d.properties.name == b.Country) {
						return b;
					}
				})
				.style("fill", function (d) {
					if (selectedCountries.includes(d))
						return "#6c9dc4";
					else return "#ff1493";

				})
		}
	}
	else {
		if (!selectedCountries.includes(d.properties.name)) {
			linechart
				.selectAll("circle")
				.filter(function (b) {
					if (d.properties.name == b.Country) {
						return b;
					}
				})
				.style("fill", "#6c9dc4");
		}

		else {
			linechart
				.selectAll("circle")
				.filter(function (b) {
					if (d.properties.name == b.Country) {
						return b;
					}
				})
				.style("fill", function (d) {
					if (selectedCountries.includes(d))
						return "#6c9dc4";
					else return "#767676";

				})
		}
	}


	if (selectedCountries.includes(d.properties.name)) {
		choropleth
			.selectAll("path")
			.filter(function (c) {
				if (d.properties.name == c.properties.name) {
					return c;
				}
			})
			.style("stroke-width", 1);
	} else if (countriesHost.includes(d.properties.name) && !selectedCountries.includes(d.properties.name)) {
		choropleth
			.selectAll("path")
			.filter(function (c) {
				if (d.properties.name == c.properties.name) {
					return c;
				}
			})
			.style("stroke-width", 3);

	} else if (!selectedCountries.includes(d.properties.name)) {
		choropleth
			.selectAll("path")
			.filter(function (c) {
				if (d.properties.name == c.properties.name) {
					return c;
				}
			})
			.style("stroke-width", 3);
	} else {
		choropleth
			.selectAll("path")
			.filter(function (c) {
				if (d.properties.name == c.properties.name) {
					return c;
				}
			})
			.style("stroke-width", 1);
	}

	if (selectedCountries.includes(d.properties.name)) {
		for (i = 0; i < selectedCountries.length; i++) {
			if (selectedCountries[i] === d.properties.name) {
				colorPosition[i] = false
				deleteLine(d.properties.name, false)
				datastats.forEach(function (i) {
					if (i.Country == d.properties.name)
						nrCountries--
				})
				var newlist = [];
				newlist.push(d.properties.name);

				selectedCountries = selectedCountries.filter(function (el) {
					return !newlist.includes(el);
				});
			}
		}
	} else if (!selectedCountries.includes(d.properties.name)) {
		dataset1 = datastats.filter(function (c) {
			if (d.properties.name === c.Country) {
				if (!selectedCountries.includes(d.properties.name)) {
					selectedCountries.push(d.properties.name);
					return d.properties.name;
				}
			}
		})

	}
	
	if(yearsFilter == "default"){
		createClevelandMedalsPerPart(datastats, true);
		createClevelandMedalsPerGender(datastats, true);
	}
	else{
		createClevelandMedalsPerPart(datastats, false);
		createClevelandMedalsPerGender(datastats, false);
	}

	if (selectedCountries.length == 0) {
		createProgressBar("", "", true);
		if (selectedGroup == "General")
			createLineChart(dataset, "General", false, selectedCountries);
		else if (selectedGroup == "Women")
			createLineChart(dataset, "Women", false, selectedCountries);
	}
	else if (selectedCountries.includes(d.properties.name)) {
		if (selectedGroup == "General")
			updateLineChart("General", d.properties.name, selectedCountries);
		else if (selectedGroup == "Women")
			updateLineChart("Women", d.properties.name, selectedCountries)
	}
	else {
		deleteLine(d.properties.name, true)
	}

	data_aux = datastats.filter(function (d) {
		if (selectedCountries.includes(d.Country))
			return d;
	})

	data_aux.forEach(function (c) {
		aux = c;
		createProgressBar(aux, 1, false);
		createProgressBar(aux, 0, false);
		return c;
	})
}

function deleteLine(country, flag) {
	var newlist = [];
	newlist.push(country);

	legendselected_Countries = legendselected_Countries.filter(function (el) {
		return !newlist.includes(el);
	});

	data1 = dataEvolution.filter(function (d) {
		if (d.Country == country) {
			return d;
		}
	})

	var path;
	for (i = 0; i < data1.length; i++) {
		if (data1[i].NOC) {
			path = "#" + data1[i].NOC;
			break;
		}
	}

	d3.select("div#secondLine").selectAll(path).remove()

	if (flag) {
		update(selectedGroup)
	}


}

function handleClickLine(event, d) {
	choropleth = d3.select("div#choropleth").select("svg");
	linechart = d3.select("div#secondLine").select("svg");
	progress = d3.select("div#progressBar").selectAll("svg");
	cleveland1 = d3.select("div#clevelandMedalsP").select("svg");
	cleveland2 = d3.select("div#clevelandMedalsG").select("svg");

	tooltip_l.transition().duration(200).style("opacity", 0);

	for (i = 0; i < datastats.length; i++) {
		if (i == d.length) break;
		if (d[i].Country == datastats[i].Country && !selectedCountries.includes(d[i].Country)) {
			if (nrCountries + 1 > 4) {
				window.alert("Impossible to select more than 4 NOCs")
				nrCountries -= counter;
				return;
			}
			else {
				counter++;
				nrCountries++
			}
		}
	}

	cleveland1.remove()
	cleveland2.remove()

	for (i = 0; i < d.length; i++) {
		if (d[i].Country) {
			if (selectedCountries.includes(d[i].Country)) {
				choropleth
					.selectAll("path")
					.filter(function (c) {
						if (d[i].Country == c.properties.name) {
							return c;
						}
					})
					.style("stroke-width", 1);
			}
		}
	}

	for (j = 0; j < d.length; j++) {
		if (d[j].Country) {
			if (selectedCountries.includes(d[j].Country)) {
				for (i = 0; i < selectedCountries.length; i++) {
					if (selectedCountries[i] === d[j].Country) {
						colorPosition[i] = false
						deleteLine(d[j].Country)
						var newlist = [];
						newlist.push(d[j].Country);
						datastats.forEach(function (i) {
							if (i.Country == d[j].Country)
								nrCountries--
						})
						selectedCountries = selectedCountries.filter(function (el) {
							return !newlist.includes(el);
						});
					}
				}
			} else {
				dataset1 = dataset.filter(function (c) {
					if (d[j].Country === c.Country) {
						if (!selectedCountries.includes(d[j].Country)) {
							selectedCountries.push(d[j].Country);
							return d[j].Country;
						}
					}
				})
			}
			break;
		}
	}

	dataset1 = dataset.filter(function (c) {
		if (selectedCountries.includes(c.Country)) {
			return c.Country;
		}
	});

	if (selectedGroup == "General") {
		linechart
			.select("line")
			.selectAll("circle")
			.data(dataset1, function (i) {
				return i.Year;
			})
			.join(
				(enter) => {
					return enter
						.append("circle")
						.attr("cx", (d) => x(d.Year))
						.attr("cy", (d) => y(d.ParticipantsEvolution))
						.attr("r", 5)
						.style("fill", function (d) {
							return "blue"
						})
				},
				(update) => {
					update
						.append("circle")
						.attr("cx", (d) => x(d.Year))
						.attr("cy", (d) => y(d.ParticipantsEvolution))
						.attr("r", 5)
				},
				(exit) => {
					exit.remove();
				});


		if (selectedCountries.length == 0) {
			progress.remove()
			nrNocsM = 0;
			nrNocsW = 0;
			progSvg = true;
			createProgressBar("", "", true);
			createLineChart(dataset, "General", false, selectedCountries);
		}
	}
	else {
		linechart
			.select("line")
			.selectAll("circle")
			.data(dataset1, function (i) {
				return i.Year;
			})
			.join(
				(enter) => {
					return enter
						.append("circle")
						.attr("cx", (d) => x(d.Year))
						.attr("cy", (d) => y(d.WomenEvolution))
						.attr("r", 5)
						.style("fill", function (d) {
							return "blue"
						})
				},
				(update) => {
					update
						.append("circle")
						.attr("cx", (d) => x(d.Year))
						.attr("cy", (d) => y(d.WomenEvolution))
						.attr("r", 5)
				},
				(exit) => {
					exit.remove();
				});


		if (selectedCountries.length == 0) {
			progress.remove()
			nrNocsM = 0;
			nrNocsW = 0;
			progSvg = true;
			createProgressBar("", "", true);
			createLineChart(dataset, "Women", false, selectedCountries);
		}
	}

	if(yearsFilter == "default"){
		createClevelandMedalsPerPart(datastats, true);
		createClevelandMedalsPerGender(datastats, true);
	}
	else{
		createClevelandMedalsPerPart(datastats, false);
		createClevelandMedalsPerGender(datastats, false);
	}

	data_aux = datastats.filter(function (d) {
		if (selectedCountries.includes(d.Country))
			return d;
	})

	progress.remove()
	nrNocsM = 0;
	nrNocsW = 0;
	progSvg = true;

	data_aux.forEach(function (c) {
		aux = c;
		createProgressBar(aux, 1, false);
		createProgressBar(aux, 0, false);
		return c;
	})

}

function update(selectedGroup) {
	for (let i = 0; i < legendselected_Countries.length; i++) {
		legendselected_Countries.pop();
	}
	switch (selectedGroup) {
		case "General":
			colorPosition = [false, false, false, false]
			selectedGroup = "General";
			d3.selectAll("#women").remove()
			if (selectedCountries.length == 0) {
				createLineChart(dataset, "General", false, selectedCountries);
			}
			else {
				for (const iter of selectedCountries) {
					deleteLine(iter, false)
				}
				for (const iter of selectedCountries) {
					legendselected_Countries.push(iter);
					updateLineChart("General", iter, legendselected_Countries);
				}
			}
			break;
		case "Women":
			colorPosition = [false, false, false, false]
			selectedGroup = "Women";
			d3.selectAll("#general").remove()
			if (selectedCountries.length == 0 && selectedCountries.length == 0) {
				createLineChart(dataset, "Women", false, selectedCountries);
			}
			else {
				for (const iter of selectedCountries) {
					deleteLine(iter, false)
				}
				for (const iter of selectedCountries) {
					legendselected_Countries.push(iter);
					updateLineChart("Women", iter, legendselected_Countries);
				}
			}
			break;
	}
}

function filterYears(years) {
	cleveland1 = d3.select("div#clevelandMedalsP").select("svg")
	cleveland2 = d3.select("div#clevelandMedalsG").select("svg")
	progress = d3.select("div#progressBar").selectAll("svg")
	choropleth = d3.select("div#choropleth").select("svg")
	flag1 = false;

	switch (years) {
		case "After":
			auxCountries = nrCountries;
			nrCountries = 0;
			for(j = 0; j < selectedCountries.length; j++){
				for(i = 0; i < after2000.length; i++){
					if (selectedCountries[j] == after2000[i].Country) {
						if (nrCountries + 1 > 4) {
							window.alert("Impossible to move to another filter. The countries selected are going to have more than 4 NOCs in total.")
							nrCountries -= auxCountries;
							return;
						}
						else {
							flag1 = true;
							nrCountries++
						}
					}
				}
				if(!flag1) return;
			}

			cleveland1.remove()
			cleveland2.remove()
			progress.remove()
			choropleth.remove()
			
			datastats = after2000;
			dataEvolution = lineafter;
			dataset = after2000h;
			yearsFilter = "after"
			colorPosition = [false, false, false, false]
			
			createClevelandMedalsPerGender(datastats, false)
			createClevelandMedalsPerPart(datastats, false)
			createChoroplethMap()
			addZoom();
			if(selectedCountries.length == 0){
				d3.selectAll("#general").remove()
				d3.selectAll("#women").remove()
				createLineChart(dataset, selectedGroup, false, selectedCountries)
				createProgressBar("","", true)
			}
			else{
				data_aux = datastats.filter(function (d) {
					if (selectedCountries.includes(d.Country))
					return d;
				})
				progress.remove()
				nrNocsM = 0;
				nrNocsW = 0;
				progSvg = true;
			
				data_aux.forEach(function (c) {
					aux = c;
					createProgressBar(aux, 1, false);
					createProgressBar(aux, 0, false);
					return c;
				})
			}

			for (const iter of selectedCountries) {
				deleteLine(iter, false)
			}
			for (const iter of selectedCountries) {
				legendselected_Countries.push(iter);
				updateLineChart(selectedGroup, iter, legendselected_Countries);
			}
			
			break;
		case "Before":
			auxCountries = nrCountries;
			nrCountries = 0;
			for(j = 0; j < selectedCountries.length; j++){
				for(i = 0; i < before2000.length; i++){
					if (selectedCountries[j] == before2000[i].Country) {
						if (nrCountries + 1 > 4) {
							window.alert("Impossible to move to another filter. The countries selected are going to have more than 4 NOCs in total.")
							nrCountries -= auxCountries;
							return;
						}
						else {
							flag1 = true;
							nrCountries++
						}
					}
				}
				if(!flag1) return;
			}

			cleveland1.remove()
			cleveland2.remove()
			progress.remove()
			choropleth.remove()
			
			datastats = before2000;
			dataEvolution = linebefore;
			dataset = before2000h;
			yearsFilter = "before";
			createClevelandMedalsPerGender(datastats, false)
			createClevelandMedalsPerPart(datastats, false)
			createChoroplethMap()
			addZoom();
			colorPosition = [false, false, false, false]

			for (const iter of selectedCountries) {
				deleteLine(iter, false)
			}
			for (const iter of selectedCountries) {
				legendselected_Countries.push(iter);
				updateLineChart(selectedGroup, iter, legendselected_Countries);
			}


			if(selectedCountries.length == 0){
				d3.selectAll("#general").remove()
				d3.selectAll("#women").remove()
				createLineChart(dataset, selectedGroup, false, selectedCountries)
				createProgressBar("","", true)
			}	
			else{
				data_aux = datastats.filter(function (d) {
					if (selectedCountries.includes(d.Country))
					return d;
				})
				progress.remove()
				nrNocsM = 0;
				nrNocsW = 0;
				progSvg = true;
			
				data_aux.forEach(function (c) {
					aux = c;
					createProgressBar(aux, 1, false);
					createProgressBar(aux, 0, false);
					return c;
				})
			}
			break;
		case "All":
			auxCountries = nrCountries;
			nrCountries = 0;
			cleveland1.remove()
			cleveland2.remove()
			progress.remove()
			choropleth.remove()
			datastats = all;
			yearsFilter = "default"
			dataset = allhosts;
			dataEvolution = lineall;
			createClevelandMedalsPerGender(datastats, true)
			createClevelandMedalsPerPart(datastats, true)
			createChoroplethMap()
			addZoom();
			colorPosition = [false, false, false, false]
			
			for (const iter of selectedCountries) {
				deleteLine(iter, false)
			}
			for (const iter of selectedCountries) {
				legendselected_Countries.push(iter);
				updateLineChart(selectedGroup, iter, legendselected_Countries);
			}

			if(selectedCountries.length == 0){
				d3.selectAll("#general").remove()
				d3.selectAll("#women").remove()
				createLineChart(dataset, selectedGroup, false, selectedCountries)
				createProgressBar("","", true)
			}	
			else{
				data_aux = datastats.filter(function (d) {
					if (selectedCountries.includes(d.Country))
						return d;
				})
			
				progress.remove()
				nrNocsM = 0;
				nrNocsW = 0;
				progSvg = true;
			
				data_aux.forEach(function (c) {
					aux = c;
					createProgressBar(aux, 1, false);
					createProgressBar(aux, 0, false);
					return c;
				})
			}
			break;
	}
}

function addZoom() {
	var width = 1000;
	var height = 400;
	d3.select("#choropleth")
		.selectAll("svg")
		.call(d3.zoom().scaleExtent([1, 8]).extent([[0, 0], [width, height]]).on("zoom", zoomed));
}

function zoomed({ transform }) {
	d3.select("#choropleth")
		.selectAll("svg")
		.selectAll("path")
		.attr("transform", transform);
}
