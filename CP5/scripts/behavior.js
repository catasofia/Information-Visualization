var map = "/data/countries50.json"
var stats = "/data/withcont_0.js"
var evolution = "/data/evolution_countries_new.js"
var topology;
var dataEvolution;
var selectedCountries = [];
var selectedCountriesNotHost = [];
var selectedGroup = "General";
var countriesHost = [];
var countriesNotHost = [];
var matrix = [];

function init() {
	Promise.all([d3.json(map), d3.json("data/newjson_0.js"), d3.json(stats), d3.json(evolution)]).then(function ([map, data, stats, evolution]) {
		topology = map;
		dataset = data;
		datastats = stats;
		dataEvolution = evolution;
		dataset.forEach(function (i) {
			countriesHost.push(i.Country);
		})
		datastats.forEach(function (j) {
			if (!countriesHost.includes(j))
				countriesNotHost.push(j.Country);
		})

		createChoroplethMap();
		createLineChart(data, "General", true);
		createClevelandMedalsPerPart(stats);
		createClevelandMedalsPerGender(stats);
		createListCountries();
		createProgressBar(stats);
		addZoom();
	});
}

function createListCountries() {

	var countries = [];
	datastats.forEach(function (i) {
		countries.push(i.Country);
	})
	// Initialize the button
	var dropdownButton = d3.select("#progressBar")
		.append('select')

	// add the options to the button
	dropdownButton // Add a button
		.selectAll('myOptions') // Next 4 lines add 6 options = 6 colors
		.data(countries)
		.enter()
		.append('option')
		.text(function (d) { return d; }) // text showed in the menu
		.attr("value", function (d) { return d; })
}

function createChoroplethMap() {
	var width = window.innerWidth * 0.52;
	var height = window.innerHeight * 0.46;
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

	svg.selectAll("path")
		.data(topojson.feature(topology, topology.objects.countries).features)
		.join("path")
		.attr("class", "country")
		.attr("d", path)
		.style("stroke", "#333333")
		.style("fill", (function (d) {
			var countries = [];
			dataset.forEach(function (i) {
				countries.push(i.Country);
			})
			for (const x of dataset) {
				if (!countries.includes(d.properties.name))
					return "#cccccc";
				if (d.properties.name === x.Country) {
					if ((x.MedalsHost - x.MedalAverage) < 0) return "#f5918c";
					return d3.interpolateRgb("white", "#3e5f85")((x.MedalsHost - x.MedalAverage) / 200);
				}
			}
		}))
		.on("mouseover", handleMouseOver)
		.on("mouseleave", handleMouseLeave)
		.on("click", handleMouseClick)
		.attr("id", function (d, i) {
			return d.properties.name;
		})
		.append("title")
		.text(function (d) {
			var countries = [];
			dataset.forEach(function (d) {
				countries.push(d.Country);
			})
			for (const x of dataset) {
				var output = "Country: " + d.properties.name;
				if (!countries.includes(d.properties.name)) {
					return output + "\nThis country was never host";
				}
				if (d.properties.name === x.Country) {
					years = [];
					for (const i of dataset) {
						if (i.Country == x.Country)
							years.push(i.Year);
					}
					var difference = x.MedalsHost - x.MedalAverage;
					return output + "\nDifference of Medals: " + difference + "\nHost in years: " + years;
				}
			}
		});

	svg.append('rect')
		.attr('x', 20)
		.attr('y', 225)
		.attr('width', 20)
		.attr('height', 20)
		.attr('stroke', '#333333')
		.attr('fill', '#f5918c');
	svg.append('text')
		.attr('x', 45)
		.attr('y', 238)
		.attr('stroke', '#333333')
		.style("font-size", "13px")
		.style("font-family", "sans-serif")
		.text("<0")

	svg.append('rect')
		.attr('x', 20)
		.attr('y', 247)
		.attr('width', 20)
		.attr('height', 20)
		.attr('stroke', "#333333")
		.attr('fill', d3.interpolateRgb("white", "#3e5f85")(15 / 200));
	svg.append('text')
		.attr('x', 45)
		.attr('y', 262)
		.attr('stroke', '#333333')
		.style("font-size", "13px")
		.style("font-family", "sans-serif")
		.text("0-29")

	svg.append('rect')
		.attr('x', 20)
		.attr('y', 269)
		.attr('width', 20)
		.attr('height', 20)
		.attr('stroke', "#333333")
		.attr('fill', d3.interpolateRgb("white", "#3e5f85")(45 / 200));
	svg.append('text')
		.attr('x', 45)
		.attr('y', 285)
		.attr('stroke', '#333333')
		.style("font-size", "13px")
		.style("font-family", "sans-serif")
		.text("30-60")

	svg.append('rect')
		.attr('x', 20)
		.attr('y', 291)
		.attr('width', 20)
		.attr('height', 20)
		.attr('stroke', "#333333")
		.attr('fill', d3.interpolateRgb("white", "#3e5f85")(80 / 200));
	svg.append('text')
		.attr('x', 45)
		.attr('y', 305)
		.attr('stroke', '#333333')
		.style("font-size", "13px")
		.style("font-family", "sans-serif")
		.text("61-100")

	svg.append('rect')
		.attr('x', 20)
		.attr('y', 313)
		.attr('width', 20)
		.attr('height', 20)
		.attr('stroke', "#333333")
		.attr('fill', d3.interpolateRgb("white", "#3e5f85")(135 / 200));
	svg.append('text')
		.attr('x', 45)
		.attr('y', 327)
		.attr('stroke', '#333333')
		.style("font-size", "13px")
		.style("font-family", "sans-serif")
		.text("101-151")

	svg.append('rect')
		.attr('x', 20)
		.attr('y', 335)
		.attr('width', 20)
		.attr('height', 20)
		.attr('stroke', "#333333")
		.attr('fill', d3.interpolateRgb("white", "#3e5f85")(160 / 200));
	svg.append('text')
		.attr('x', 45)
		.attr('y', 349)
		.attr('stroke', '#333333')
		.style("font-size", "13px")
		.style("font-family", "sans-serif")
		.text("152-199")

	svg.append('rect')
		.attr('x', 20)
		.attr('y', 357)
		.attr('width', 20)
		.attr('height', 20)
		.attr('stroke', "#333333")
		.attr('fill', d3.interpolateRgb("white", "#3e5f85")(200 / 200));
	svg.append('text')
		.attr('x', 45)
		.attr('y', 371)
		.attr('stroke', '#333333')
		.style("font-size", "13px")
		.style("font-family", "sans-serif")
		.text("200-250")

	svg.append('rect')
		.attr('x', 20)
		.attr('y', 379)
		.attr('width', 20)
		.attr('height', 20)
		.attr('stroke', "#333333")
		.attr('fill', d3.interpolateRgb("white", "#3e5f85")(300 / 200));
	svg.append('text')
		.attr('x', 45)
		.attr('y', 393)
		.attr('stroke', '#333333')
		.style("font-size", "13px")
		.style("font-family", "sans-serif")
		.text(">250")

	svg.append('rect')
		.attr('x', 20)
		.attr('y', 401)
		.attr('width', 20)
		.attr('height', 20)
		.attr('stroke', '#333333')
		.attr('fill', '#cccccc');
	svg.append('text')
		.attr('x', 45)
		.attr('y', 415)
		.attr('stroke', '#333333')
		.style("font-size", "13px")
		.style("font-family", "sans-serif")
		.text("Never host")
}

function triggerTransitionDelay() {
	if (selectedGroup === "General") {
		d3
			.select(".line")
			.selectAll("circle")
			.transition()
			.duration(3000)
			.attr("cy", (d) => y(d.ParticipantsEvolution))
			.style("fill", function (d) {
				if (!selectedCountries.includes(d.Country))
					return "#444444";
				else return "#6c9dc4";
			})
	}
	else {
		d3
			.select(".line")
			.selectAll("circle")
			.transition()
			.duration(3000)
			.attr("cy", (d) => y(d.WomenEvolution))
			.style("fill", function (d) {
				if (!selectedCountries.includes(d.Country))
					return "#ff1493";
				else
					return "#6c9dc4";
			})
	}
}

function createLineChart(data, group, value) {
	width = window.innerWidth / 2.1;

	height = window.innerHeight * 0.36;

	margin = { top: 20, right: 40, bottom: 31, left: 50 };

	line = d3
		.line()
		.x((d) => x(d.Year))
		.y((d) => y(d.ParticipantsEvolution))

	line2 = d3
		.line()
		.x((d) => x(d.Year))
		.y((d) => y(d.WomenEvolution))

	x = d3
		.scaleLinear()
		.domain(d3.extent(data, (d) => d.Year))
		.range([margin.left, width - 20]);

	y = d3
		.scaleLinear()
		.domain([0, d3.max(data, (d) => d.ParticipantsEvolution)])
		.range([height - margin.bottom, margin.top]);


	var years = [];
	data.forEach(function (d) {
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
			.attr("class", "line")
			.attr("fill", "#444444")
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

	svg
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", margin.left - 50)
		.attr("x", 0 - height / 10)
		.attr("dy", "1em")
		.attr("text-anchor", "end")
		.style("font-size", "10px")
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


	if (!value) sumstat = d3.group(data, d => d.NOC);
	else data1 = data;

	if (!value) {
		i = 0;
		sumstat.forEach(function (d) {
			matrix[0] = d.values();
		})
		data1 = matrix[0];
	}

	if (group === "General") {
		svg
			.select("path")
			.datum(data1)
			.transition()
			.duration(3000)
			.attr("stroke", "#444444")
			.attr("stroke-width", 2)
			.attr("fill", "none")
			.attr("d", line)
		selectedGroup = "General";
		svg
			.select("g.line")
			.selectAll("circle")
			.data(data1, function (d) {
				return d.Year;
			})

			.join(
				(enter) => {
					return enter
						.append("circle")
						.attr("cx", (d) => x(d.Year))
						.attr("cy", (d) => y(d.ParticipantsEvolution))
						.attr("r", 5)
						.style("fill", function (d) {
							if (selectedCountries.includes(d.Country))
								return "#6c9dc4";
							else return "#444444";
						})
						.on("click", handleClickLine)
						.append("title")
						.text(function (d) {
							return "Host: " + d.Country + "\nParticipants: " + d.ParticipantsEvolution + "\nWomen Participants: " + d.WomenEvolution;
						})
				},
				(update) => {
					update
						.transition()
						.duration(3000)
						.attr("cx", (d) => x(d.Year))
						.attr("cy", (d) => y(d.ParticipantsEvolution))
						.attr("r", 5)
						.style("fill", function (d) {
							if (selectedCountries.includes(d.Country))
								return "#6c9dc4";
							else return "#444444";
						})
				},
				(exit) => {
					exit.remove();
				}
			);
	}
	else {
		svg
			.select("path")
			.datum(sumstat)
			.transition()
			.duration(3000)
			.attr("stroke-width", 2)
			.attr("stroke", "#ff1493")
			.attr("fill", "none")
			.attr("d", line2)
		selectedGroup = "Women";
		svg
			.select("g.line")
			.selectAll("circle")
			.data(sumstat, function (d) {
				return d.Year;
			})

			.join(
				(enter) => {
					console.log("enter");
					return enter
						.append("circle")
						.attr("cx", (d) => x(d.Year))
						.attr("cy", (d) => y(d.WomenEvolution))
						.attr("r", 5)
						.style("fill", function (d) {
							if (selectedCountries.includes(d.Country))
								return "#6c9dc4";
							else return "#ff1493";
						})
						.on("click", handleClickLine)
				},
				(update) => {
					update
						.transition()
						.duration(3000)
						.attr("cx", (d) => x(d.Year))
						.attr("cy", (d) => y(d.WomenEvolution))
						.attr("r", 5)
						.style("fill", function (d) {
							if (selectedCountries.includes(d.Country))
								return "#6c9dc4";
							else return "#ff1493";
						})
				},
				(exit) => {
					exit.remove();
				}
			);
	}
}

function updateLineChart(group) {
	linechart = d3.select("div#secondLine").select("svg")

	dataEvolution1 = dataEvolution.filter(function (d) {
		if (selectedCountries.includes(d.Country) || selectedCountriesNotHost.includes(d.Country)) return d;
	})

	createLineChart(dataEvolution1, group, false)
}

function createClevelandMedalsPerPart(stats) {
	const margin = { top: 28, right: 30, bottom: 30, left: 55 },
		width = window.innerWidth / 4.5 - margin.left - margin.right,
		height = window.innerHeight * 0.298;

	/* var sumMedals;
	var sumPartic;
	
	sumstats = d3.group(stats, d => d.NOC)
	sumPartic = d3.rollup(stats, v => d3.sum(v , d => d.Participants), d => d.Continent);
	sumMedals = d3.rollup(stats, v => d3.sum(v , d => d.NrMedals), d => d.Continent);
 
	console.log(sumPartic);
	console.log(sumMedals) */

	d3.select("div#clevelandMedalsP")
		.append("svg")

	svg = d3.select("div#clevelandMedalsP")
		.select("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", `translate(${margin.left}, ${margin.top})`)

	datastats1 = datastats.filter(function (d) {
		if (selectedCountries.length == 0 && selectedCountriesNotHost.length == 0) {
			if (d.Participants > 5000)
				return d;
		}
		else if (selectedCountriesNotHost.includes(d.Country) || selectedCountries.includes(d.Country))
			return d;
	})

	x = d3.scaleLinear()
		.domain([0, d3.max(datastats1, (d) => d.Participants)])
		.range([0, width]);

	svg.append("g")
		.attr("transform", `translate(0, ${height})`)
		.call(d3.axisBottom(x))


	/* 	keys = sumPartic.keys();
		values = sumPartic.values();
	
		console.log(keys)
		console.log(values)
	*/

	y = d3.scaleBand()
		.range([0, height])
		.domain(datastats1.map(function (d) { return d.NOC; }))
		.padding(1);
	svg.append("g")
		.call(d3.axisLeft(y))

	svg.selectAll("myline")
		.data(datastats1)
		.join("line")
		.transition()
		.duration(1500)
		.attr("x1", function (d) { return x(d.NrMedals); })
		.attr("x2", function (d) { return x(d.Participants); })
		.attr("y1", function (d) { return y(d.NOC); })
		.attr("y2", function (d) { return y(d.NOC); })
		.attr("stroke", "grey")
		.attr("stroke-width", "1px")

	svg.selectAll("mycircle")
		.data(datastats1)
		.enter()
		.append("circle")
		.attr("cx", function (d) { return x(d.NrMedals); })
		.attr("cy", function (d) { return y(d.NOC); })
		.attr("r", "6")
		.style("fill", "#6c9dc4")
		.on("mouseover", function (d) {
			d3.select(this)
				.style("stroke", "black")
		})
		.on("mouseleave", function (d) {
			d3.select(this)
				.style("stroke", "none")
		})
		.on("click", handleClevelandClick)
		.append("title")
		.text(function (d) {
			return "Medalists: " + d.NrMedals;
		})

	svg.selectAll("mycircle")
		.data(datastats1)
		.enter()
		.append("circle")
		.attr("cx", function (d) { return x(d.Participants); })
		.attr("cy", function (d) { return y(d.NOC); })
		.attr("r", "6")
		.style("fill", "#444444")
		.on("mouseover", function (d) {
			d3.select(this)
				.style("stroke", "black")
		})
		.on("mouseleave", function (d) {
			d3.select(this)
				.style("stroke", "none")
		})
		.on("click", handleClevelandClick)
		.append("title")
		.text(function (d) {
			return "Participants: " + d.Participants;
		});
	//TODO A TOOLTIP

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
		.attr("y", -40)
		.attr("dy", ".75em")
		.attr("transform", "rotate(-90)")
		.style("font-family", "sans-serif")
		.text("NOC");
}

function createClevelandMedalsPerGender(stats) {
	const margin = { top: 28, right: 30, bottom: 30, left: 40 },
		width = window.innerWidth / 4.5 - margin.left - margin.right,
		height = window.innerHeight * 0.298;

	const svg = d3.select("#clevelandMedalsG")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", `translate(${margin.left}, ${margin.top})`);

	datastats1 = datastats.filter(function (d) {
		if (selectedCountries.length == 0 && selectedCountriesNotHost.length == 0) {
			if (d.Participants > 5000)
				return d;
		}
		else if (selectedCountriesNotHost.includes(d.Country) || selectedCountries.includes(d.Country))
			return d;
	})

	var Tooltip = d3.select("#clevelandMedalsG")
		.append("div")
		.style("opacity", 0)
		.attr("class", "tooltip")
		.style("background-color", "white")
		.style("border", "solid")
		.style("border-width", "2px")
		.style("border-radius", "5px")
		.style("padding", "5px")

	if (d3.max(datastats1, (d) => d.PercMenMedalists) > d3.max(datastats1, (d) => d.PercWomenMedalists))
		maxX = d3.max(datastats1, (d) => d.PercMenMedalists)
	else maxX = d3.max(datastats1, (d) => d.PercWomenMedalists)

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
		.transition()
		.duration(1000)
		.ease(d3.easeBounce)
		.attr("x1", function (d) { return x(d.PercWomenMedalists); })
		.attr("x2", function (d) { return x(d.PercMenMedalists); })
		.attr("y1", function (d) { return y(d.NOC); })
		.attr("y2", function (d) { return y(d.NOC); })
		.attr("stroke", "grey")
		.attr("stroke-width", "1px")

	svg.selectAll("mycircle")
		.data(datastats1)
		.enter()
		.append("circle")
		.attr("cx", function (d) { return x(d.PercWomenMedalists); })
		.attr("cy", function (d) { return y(d.NOC); })
		.attr("r", "6")
		.style("fill", "#ff1493")
		.on("mouseover", function (d) {
			Tooltip
				.style("opacity", 1)
				.style("left", (d3.pointer(this)[0] + 30) + "px")
				.style("top", (d3.pointer(this)[1] + 30) + "px")
			d3.select(this)
				.style("stroke", "black")
		})
		.on("mousemove", function (d, i) {
			Tooltip
				.html("Percentage of<br>Women Medalists: " + i.PercWomenMedalists + "%")
				.style("left", (d3.pointer(this)[0] + 30) + "px")
				.style("top", (d3.pointer(this)[1] + 30) + "px")
		})
		.on("mouseleave", function (d) {
			Tooltip
				.style("opacity", 0)
			d3.select(this)
				.style("stroke", "none")
		})
		.on("click", handleClevelandClick)

	svg.selectAll("mycircle")
		.data(datastats1)
		.enter()
		.append("circle")
		.attr("cx", function (d) { return x(d.PercMenMedalists); })
		.attr("cy", function (d) { return y(d.NOC); })
		.attr("r", "6")
		.style("fill", "#6c9dc4")
		.on("mouseover", function (d) {
			Tooltip
				.style("opacity", 1)
			d3.select(this)
				.style("stroke", "black")
		})
		.on("mousemove", function (d, i) {
			Tooltip
				.html("Percentage of<br>Men Medalists: " + i.PercMenMedalists + "%")
				.style("top", d3.select(this).attr("cy") + "px")
				.style("left", d3.select(this).attr("cx") + "px")
		})
		.on("mouseleave", function (d) {
			Tooltip
				.style("opacity", 0)
			d3.select(this)
				.style("stroke", "none")
		})
		.on("click", handleClevelandClick)
		.append("title")
		.text(function (d) {
			return "Men Percentage " + d.PercMenMedalists + "%";
		});

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
		.attr("y", -40)
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

	cleveland1.remove()
	cleveland2.remove()

	if (selectedCountries.includes(d.Country) || selectedCountriesNotHost.includes(d.Country)) {
		choropleth
			.selectAll("path")
			.filter(function (c) {
				if (d.Country == c.properties.name)
					return c;
			})
			.style("stroke-width", 1);
	}
	else if (!selectedCountries.includes(d.Country) && !selectedCountriesNotHost.includes(d.Country)) {
		choropleth
			.selectAll("path")
			.filter(function (c) {
				if (d.Country == c.properties.name)
					return c;
			})
			.style("stroke-width", 3);
	}

	if (countriesHost.includes(d.Country)) {
		if (selectedCountries.includes(d.Country)) {
			selectedCountries.forEach(function (c) {
				if (c == d.Country) {
					var newlist = [];
					newlist.push(d.Country);
					selectedCountries = selectedCountries.filter(function (el) {
						return !newlist.includes(el);
					});
				}
			})
		}
		else
			selectedCountries.push(d.Country);
	} else {
		if (selectedCountriesNotHost.includes(d.Country)) {
			selectedCountriesNotHost.forEach(function (c) {
				if (c == d.Country) {
					var newlist = [];
					newlist.push(d.Country);
					selectedCountriesNotHost = selectedCountriesNotHost.filter(function (el) {
						return !newlist.includes(el);
					});
				}
			})
		}
		else
			selectedCountriesNotHost.push(d.Country);
	}
	createClevelandMedalsPerPart(datastats);
	createClevelandMedalsPerGender(datastats);
}

function createProgressBar(stats) {
	const width = window.innerWidth * 0.445;
	height = window.innerHeight * 0.383;

	const radius = 50;

	const svg = d3.select("#progressBar")
		.append("svg")
		.attr("width", width)
		.attr("height", height)
		.append("g")
		.attr("transform", `translate(${width / 2},${height / 2})`);

	const pie = d3.pie()
		.value(d => d[1])

	const opacity = d3.scaleOrdinal()
		.range([1, 0])

	const data_ready = pie([['pais', 70], ['', 30]])

	svg
		.selectAll('whatever')
		.data(data_ready)
		.join('path')
		.attr('d', d3.arc()
			.innerRadius(30)
			.outerRadius(radius)
		)
		.attr('fill', "#ff1493")
		.style("opacity", d => opacity(d.data[0]))
		.style("stroke", "#b94366")
		.style("stroke-width", 3)

	svg.append("text")
		.attr("text-anchor", "middle")
		.text('70%')
		.attr("font-size", "15px");
}

function handleMouseOver(event, d) {
	choropleth = d3.select("div#choropleth").select("svg");

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

	cleveland1.remove()
	cleveland2.remove()

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
					else return "#444444";

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

	} else if (!selectedCountriesNotHost.includes(d.properties.name)) {
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

	if (selectedCountries.includes(d.properties.name) && countriesHost.includes(d.properties.name)) {
		for (i = 0; i < selectedCountries.length; i++) {
			if (selectedCountries[i] === d.properties.name) {

				var newlist = [];
				newlist.push(d.properties.name);

				selectedCountries = selectedCountries.filter(function (el) {
					return !newlist.includes(el);
				});
			}
		}
	} else if (!selectedCountries.includes(d.properties.name) && countriesHost.includes(d.properties.name)) {
		dataset1 = dataset.filter(function (c) {
			if (d.properties.name === c.Country) {
				if (!selectedCountries.includes(d.properties.name)) {
					selectedCountries.push(d.properties.name);
					return d.properties.name;
				}

			} else if (selectedCountries.includes(c.Country)) {
				selectedCountries.push(d.properties.name);
				return d.properties.name;
			}
		})

	}

	if (selectedCountriesNotHost.includes(d.properties.name) && !countriesHost.includes(d.properties.name)) {
		for (i = 0; i < selectedCountriesNotHost.length; i++) {
			if (selectedCountriesNotHost[i] === d.properties.name) {

				var newlist = [];
				newlist.push(d.properties.name);

				selectedCountriesNotHost = selectedCountriesNotHost.filter(function (el) {
					return !newlist.includes(el);
				});
			}
		}
	} else if (!selectedCountriesNotHost.includes(d.properties.name) && !countriesHost.includes(d.properties.name)) {
		dataset1 = datastats.filter(function (c) {
			console.log(datastats)
			if (d.properties.name === c.Country) {
				selectedCountriesNotHost.push(d.properties.name);
				return d.properties.name;

			} else if (selectedCountriesNotHost.includes(c.Country)) {
				selectedCountriesNotHost.push(d.properties.name);
				return d.properties.name;
			}
		})

	}

	/* dataset1 = dataset.filter(function (c) {
		if (selectedCountries.includes(c.Country)) {
			return c.Country;
		}
	}); */

	createClevelandMedalsPerPart(datastats);
	createClevelandMedalsPerGender(datastats);
	if (selectedCountries.length == 0 && selectedCountriesNotHost.length == 0)
		createLineChart(dataset, "General", false);
	else
		updateLineChart("General");
}

function handleClickLine(event, d) {
	choropleth = d3.select("div#choropleth").select("svg");
	linechart = d3.select("div#secondLine").select("svg");

	if (selectedCountries.includes(d.Country)) {
		choropleth
			.selectAll("path")
			.filter(function (c) {
				if (d.Country == c.properties.name) {
					return c;
				}
			})
			.style("stroke-width", 1);
	} else if (countriesHost.includes(d.Country) && !selectedCountries.includes(d.Country)) {
		choropleth
			.selectAll("path")
			.filter(function (c) {
				if (d.Country == c.properties.name) {
					return c;
				}
			})
			.style("stroke-width", 3);

	} else if (!selectedCountriesNotHost.includes(d.Country)) {
		choropleth
			.selectAll("path")
			.filter(function (c) {
				if (d.Country == c.properties.name) {
					selectedCountriesNotHost.push(d.Country)
					return c;
				}
			})
			.style("stroke-width", 3);
	} else {
		choropleth
			.selectAll("path")
			.filter(function (c) {
				if (d.Country == c.properties.name) {
					var newlist1 = [];
					newlist1.push(d.Country);

					selectedCountriesNotHost = selectedCountriesNotHost.filter(function (el) {
						return !newlist1.includes(el);
					});
					return c;
				}
			})
			.style("stroke-width", 1);
	}



	if (selectedCountries.includes(d.Country)) {
		for (i = 0; i < selectedCountries.length; i++) {
			if (selectedCountries[i] === d.Country) {

				var newlist = [];
				newlist.push(d.Country);

				selectedCountries = selectedCountries.filter(function (el) {
					return !newlist.includes(el);
				});

				//newlist = selectedCountries.remove(i);
			}
		}
	} else {
		dataset1 = dataset.filter(function (c) {
			if (d.Country === c.Country) {
				if (!selectedCountries.includes(d.Country)) {
					selectedCountries.push(d.Country);
					return d.Country;
				}

			} else if (selectedCountries.includes(c.Country)) {
				selectedCountries.push(d.Country);
				return d.Country;
			}
		})

	}

	dataset1 = dataset.filter(function (c) {
		if (selectedCountries.includes(c.Country)) {
			return c.Country;
		}
	});

	if (selectedGroup == "General") {
		linechart
			.select(".line")
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
							if (selectedCountries.includes(d.Country))
								return "#6c9dc4";
							else return "blue";
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


		if (selectedCountries.length == 0 && selectedCountriesNotHost.length == 0)
			createLineChart(dataset, "General", false);
		else
			updateLineChart("General");
		triggerTransitionDelay();
	}
	else {
		linechart
			.selectAll(".line")
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
							if (selectedCountries.includes(d.Country))
								return "#6c9dc4";
							else return "blue";
						})
				},
				(update) => {
					update
						.append("circle")
						.attr("cx", (d) => x(d.Year))
						.attr("cy", (d) => y(d.WomenEvolution))
						.attr("r", 5)
						.style("fill", function (d) {
							if (selectedCountries.includes(d.Country))
								return "#6c9dc4";
							else return "blue";
						})
				},
				(exit) => {
					exit.remove();
				});

		if (selectedCountries.length == 0 && selectedCountriesNotHost.length == 0)
			createLineChart(dataset, "Women", false);
		else
			updateLineChart("Women");
		triggerTransitionDelay();
	}
}

function update(selectedGroup) {
	switch (selectedGroup) {
		case "General":
			selectedGroup = "General";
			if (selectedCountries.length == 0 && selectedCountriesNotHost.length == 0)
				createLineChart(dataset, "General", false);
			else
				updateLineChart("General");
			triggerTransitionDelay();
			break;
		case "Women":
			selectedGroup = "Women";
			if (selectedCountries.length == 0 && selectedCountriesNotHost.length == 0)
				createLineChart(dataset, "Women", false);
			else
				updateLineChart("Women");
			triggerTransitionDelay();
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