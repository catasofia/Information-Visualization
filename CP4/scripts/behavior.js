var map = "/data/countries50.json"
var stats = "/data/withcont_0.js"
var topology;
var selectedCountries = [];
var selectedCountriesNotHost = [];
var selectedGroup = "General";
var countriesHost = [];
var countriesNotHost = [];
function init() {
	Promise.all([d3.json(map), d3.json("data/newjson_0.js"), d3.json(stats)]).then(function ([map, data, stats]) {
		topology = map;
		dataset = data;
		datastats = stats;
		dataset.forEach(function (i) {
			countriesHost.push(i.Country);
		})
		datastats.forEach(function (j) {
			if (!countriesHost.includes(j))
				countriesNotHost.push(j.Country);
		})

		createChoroplethMap();
		createLineChart(data, "General");
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
	var width = window.innerWidth * 0.505;
	var height = window.innerHeight / 2;
	var projection = d3
		.geoMercator()
		.scale(height / 2.9)
		.rotate([0, 0])
		.center([0, 0])
		.translate([width / 2, height / 1.5]);

	var path = d3.geoPath().projection(projection);

	d3.select("#choropleth")
		.append("svg")
		.attr("width", width)
		.attr("height", height)
		.selectAll("path")
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
					if ((x.MedalsHost - x.MedalAverage) < 0) return "#f62217";
					return d3.interpolateRgb("white", "green")((x.MedalsHost - x.MedalAverage) / 200);
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
					return output;
				}
				if (d.properties.name === x.Country) {
					var difference = x.MedalsHost - x.MedalAverage;
					return output + "\nDifference of Medals: " + difference + "\nHost in years: " + x.Year;
				}
			}
		});
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
				else return "#64dd17";
			})
	}
	else {
		console.log(selectedCountries);
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
					return "#64dd17";
			})
	}
}

function createLineChart(data, group) {
	width = window.innerWidth / 2.1;

	height = window.innerHeight / 2.3;

	margin = { top: 20, right: 40, bottom: 20, left: 40 };

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



	d3.select("div#secondLine")
		.append("svg")
		.append("g")
		.attr("class", "line")
		.attr("fill", "#444444")
		.append("path")


	const svg = d3
		.select("div#secondLine")
		.select("svg")
		.attr("width", width)
		.attr("height", height);

	svg.append("g").attr("class", "lineXAxis");
	svg.append("g").attr("class", "lineYAxis");


	svg.select("g.lineXAxis").call(xAxis);
	svg.select("g.lineYAxis").call(yAxis);

	if (group === "General") {
		svg
			.select("path")
			.datum(data)
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
			.data(data, function (d) {
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
								return "#64dd17";
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
						.duration(2000)
						.attr("cx", (d) => x(d.Year))
						.attr("cy", (d) => y(d.ParticipantsEvolution))
						.attr("r", 5)
						.style("fill", function (d) {
							if (selectedCountries.includes(d.Country))
								return "#64dd17";
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
			.datum(data)
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
			.data(data, function (d) {
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
								return "#64dd17";
							else return "#ff1493";
						})
						.on("click", handleClickLine)
				},
				(update) => {
					update
						.transition()
						.duration(2000)
						.attr("cx", (d) => x(d.Year))
						.attr("cy", (d) => y(d.WomenEvolution))
						.attr("r", 5)
						.style("fill", function (d) {
							if (selectedCountries.includes(d.Country))
								return "#64dd17";
							else return "#ff1493";
						})
				},
				(exit) => {
					exit.remove();
				}
			);

	}
}

function createClevelandMedalsPerPart(stats) {
	const margin = { top: 10, right: 30, bottom: 30, left: 40 },
		width = window.innerWidth / 4.5 - margin.left - margin.right,
		height = window.innerHeight / 2.60;

	/* var sumMedals = 0;
	var sumPartic = 0
	
	d3.nest().key(function(d){
		return d.Continent;
	}).rollup(function(leaves){
		sumMedals = d3.sum(leaves,function(d){
			return d.NrMedals;
		})
		sumPartic = d3.sum(leaves, function(d){
			return d.Participants;
		})
	});
 */

	const svg = d3.select("#clevelandMedalsP")

		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", `translate(${margin.left}, ${margin.top})`);

	const x = d3.scaleLinear()
		.domain([0, 20000])
		.range([0, width]);

	svg.append("g")
		.attr("transform", `translate(0, ${height})`)
		.call(d3.axisBottom(x))

	const y = d3.scaleBand()
		.range([0, height])
		.domain(stats.map(function (d) { return d.NOC; }))
		.padding(1);
	svg.append("g")
		.call(d3.axisLeft(y))

	svg.selectAll("myline")
		.data(stats)
		.join("line")
		.attr("x1", function (d) { return x(d.NrMedals); })
		.attr("x2", function (d) { return x(d.Participants); })
		.attr("y1", function (d) { return y(d.NOC); })
		.attr("y2", function (d) { return y(d.NOC); })
		.attr("stroke", "grey")
		.attr("stroke-width", "1px")

	svg.selectAll("mycircle")
		.data(stats)
		.join("circle")
		.attr("cx", function (d) { return x(d.NrMedals); })
		.attr("cy", function (d) { return y(d.NOC); })
		.attr("r", "6")
		.style("fill", "brown")
		.append("title")
		.text(function (d) {
			return d.NrMedals;
		});

	svg.selectAll("mycircle")
		.data(stats)
		.join("circle")
		.attr("cx", function (d) { return x(d.Participants); })
		.attr("cy", function (d) { return y(d.NOC); })
		.attr("r", "6")
		.style("fill", "yellow")
		.append("title")
		.text(function (d) {
			return d.Participants;
		});
}

function createClevelandMedalsPerGender(stats) {
	const margin = { top: 10, right: 30, bottom: 30, left: 40 },
		width = window.innerWidth / 4.5 - margin.left - margin.right,
		height = window.innerHeight / 2.60;

	const svg = d3.select("#clevelandMedalsG")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", `translate(${margin.left}, ${margin.top})`);

	const x = d3.scaleLinear()
		.domain([0, 100])
		.range([0, width]);

	svg.append("g")
		.attr("transform", `translate(0, ${height})`)
		.call(d3.axisBottom(x))

	const y = d3.scaleBand()
		.range([0, height])
		.domain(stats.map(function (d) { return d.NOC; }))
		.padding(1);
	svg.append("g")
		.call(d3.axisLeft(y))

	svg.selectAll("myline")
		.data(stats)
		.join("line")
		.attr("x1", function (d) { return x(d.PercWomenMedalists); })
		.attr("x2", function (d) { return x(d.PercMenMedalists); })
		.attr("y1", function (d) { return y(d.NOC); })
		.attr("y2", function (d) { return y(d.NOC); })
		.attr("stroke", "grey")
		.attr("stroke-width", "1px")

	svg.selectAll("mycircle")
		.data(stats)
		.join("circle")
		.attr("cx", function (d) { return x(d.PercWomenMedalists); })
		.attr("cy", function (d) { return y(d.NOC); })
		.attr("r", "6")
		.style("fill", "#ff1493")
		.append("title")

	svg.selectAll("mycircle")
		.data(stats)
		.join("circle")
		.attr("cx", function (d) { return x(d.PercMenMedalists); })
		.attr("cy", function (d) { return y(d.NOC); })
		.attr("r", "6")
		.style("fill", "blue")
		.append("title")
}

function createProgressBar(stats) {
	const width = window.innerWidth * 0.48;
	height = window.innerHeight / 2;

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

	svg.append("rect")
		.attr("x", -width / 2.14)
		.attr("y", -height / 2.2)
		.attr("height", height / 1.1)
		.attr("width", width / 1.07)
		.attr("rx", 20)
		//.style("stroke-dasharray", ("10,3"))
		.style("stroke-width", 2)
		.style("stroke", "#3e5f85")
		.style("fill", "#ffffff");

	svg
		.selectAll('whatever')
		.data(data_ready)
		.join('path')
		.attr('d', d3.arc()
			.innerRadius(30)         // This is the size of the donut hole
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
		.style("opacity", 0.8)
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
	if (selectedGroup === "Women") {
		if (!selectedCountries.includes(d.properties.name)) {
			linechart
				.selectAll("circle")
				.filter(function (b) {
					if (d.properties.name == b.Country) {
						return b;
					}
				})
				.style("fill", "#64dd17");
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
						return "#64dd17";
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
				.style("fill", "#64dd17");
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
						return "#64dd17";
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
					selectedCountriesNotHost.push(d.properties.name)
					return c;
				}
			})
			.style("stroke-width", 3);
	} else {
		choropleth
			.selectAll("path")
			.filter(function (c) {
				if (d.properties.name == c.properties.name) {
					var newlist1 = [];
					newlist1.push(d.properties.name);

					selectedCountriesNotHost = selectedCountriesNotHost.filter(function (el) {
						return !newlist1.includes(el);
					});
					return c;
				}
			})
			.style("stroke-width", 1);
	}



	if (selectedCountries.includes(d.properties.name)) {
		for (i = 0; i < selectedCountries.length; i++) {
			if (selectedCountries[i] === d.properties.name) {

				var newlist = [];
				newlist.push(d.properties.name);

				selectedCountries = selectedCountries.filter(function (el) {
					return !newlist.includes(el);
				});
			}
		}
	} else {
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

	dataset1 = dataset.filter(function (c) {
		if (selectedCountries.includes(c.Country)) {
			return c.Country;
		}
	});

	/*
	
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
	
			createLineChart(dataset, "General");
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
							.style("fill", "#ff1493")
					},
					(update) => {
						update
							.append("circle")
							.attr("cx", (d) => x(d.Year))
							.attr("cy", (d) => y(d.WomenEvolution))
							.attr("r", 5)
							.style("fill", "#ff1493")
					},
					(exit) => {
						exit.remove();
					});
			createLineChart(dataset, "Women");
			triggerTransitionDelay();
		}
	*/


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
								return "#64dd17";
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

		createLineChart(dataset, "General");
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
								return "#64dd17";
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
								return "#64dd17";
							else return "blue";
						})
				},
				(exit) => {
					exit.remove();
				});
		createLineChart(dataset, "Women");
		triggerTransitionDelay();
	}
}

function update(selectedGroup) {
	switch (selectedGroup) {
		case "General":
			createLineChart(dataset, "General");
			selectedGroup = "General";
			triggerTransitionDelay();
			break;
		case "Women":
			createLineChart(dataset, "Women");
			selectedGroup = "Women";
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