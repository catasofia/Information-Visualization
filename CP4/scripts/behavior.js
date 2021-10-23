var map = "/data/countries50.json"
var stats = "/data/participants_stats.js"
var topology;
function init() {
	Promise.all([d3.json(map), d3.json("data/newjson_0.js"), d3.json(stats)]).then(function ([map, data, stats]) {
		topology = map;
		dataset = data;
		createChoroplethMap();
		createLineChart(data);
		createClevelandMedalsPerPart(stats);
		createClevelandMedalsPerGender(stats);
		addZoom();
	});
}

function createChoroplethMap() {
	var width = 1000;
	var height = 400;
	var projection = d3
		.geoMercator()
		.scale(height / 3)
		.rotate([0, 0])
		.center([0, 20])
		.translate([width / 2, height / 2]);

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
		.style("fill", function (d) {
			if (d.properties.name == "Russia")
				return "green";
			if (d.properties.name == "Portugal")
				return "red";
		})
		.on("mouseover", handleMouseOver)
		.on("mouseleave", handleMouseLeave)
		.attr("id", function (d, i) {
			return d.properties.name;
		})
		.append("title")
		.text(function (d) {
			return d.properties.name;
		});
}

function createLineChart(data) {
	width = 600;

	height = 400;

	margin = { top: 20, right: 20, bottom: 20, left: 40 };

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
		.range([margin.left, width]);

	y = d3
		.scaleLinear()
		.domain([0, d3.max(data, (d) => d.ParticipantsEvolution)])
		.range([height - margin.bottom, margin.top]);

	xAxis = (g) =>
		g.attr("transform", `translate(0, ${height - margin.bottom})`).call(
			d3
				.axisBottom(x)
				.ticks(28)
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
		.attr("fill", "#61300d")
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

	svg
		.select("path")
		.datum(data)
		.attr("fill", "none")
		.attr("stroke", "#61300d")
		.attr("stroke-width", 1.5)
		.attr("d", line)

	svg
		.append("svg:path")
		.datum(data)
		.attr("fill", "none")
		.attr("stroke", "#ff1493")
		.attr("stroke-width", 1.5)
		.attr("d", line2)
}

function createClevelandMedalsPerPart(stats) {
	const margin = { top: 10, right: 30, bottom: 30, left: 30 },
		width = 460 - margin.left - margin.right,
		height = 1000;

	const svg = d3.select("#secondLine")
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
	const margin = { top: 10, right: 30, bottom: 30, left: 30 },
		width = 460 - margin.left - margin.right,
		height = 1000;

	const svg = d3.select("#secondLine")
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

function handleMouseOver(event, d) {
	choropleth = d3.select("div#choropleth").select("svg");

	choropleth
		.selectAll("path")
		.filter(function (c) {
			if (d.id == c.id) return c;
		})
		.style("opacity", 0.5);
}

function handleMouseLeave(event, d) {
	choropleth = d3.select("div#choropleth").select("svg");

	choropleth
		.selectAll("path")
		.filter(function (c) {
			if (d.id == c.id) return c;
		})
		.style("opacity", 1);
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