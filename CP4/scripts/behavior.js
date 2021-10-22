function init() {
	d3.json("data/newjson_0.js")
		.then((data) => {
			createLineChart(data);
		})
		.catch((error) => {
			console.log(error);
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



	d3.select("div#lineChart")
		.append("svg")
		.append("g")
		.attr("class", "line")
		.attr("fill", "#61300d")
		.append("path")


	const svg = d3
		.select("div#lineChart")
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
