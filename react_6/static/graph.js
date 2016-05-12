var Chart = React.createClass({
	getInitialState: function() {
		return {x_scale: d3.time.scale()
	                .range([0, this.props.width])
	                .domain([0, 100]),
	           	y_scale:d3.scale.linear()
			        	.range([0 , +this.props.height])
						.domain([0,1]),
				data: []
				}
	},
	getData: function(params) {
		$.ajax({
			method:'GET',
			url: 	this.props.url,
			//data: params,

		}).success(function(data) {
				// pre-processing data to transform complicated data structure to the plain list
				var totally = data.data.map(function(d){return d.values})
									 .reduce(function(a,b) {return a.concat(b);}, [])

				// getting array of dates for x scale
				var dates = totally.map(function(b) {return b.x});
				// getting array of values for y scale
				var values = totally.map(function(b) {return b.y});

				var x_scale = d3.time.scale()
	                .range([0, this.props.width])
	                // d3.extent returns min and max values
	                .domain(d3.extent(dates, function(d) {
	                	return d3.time.format('%Y-%m-%d').parse(d).getTime()
	                }))

		        var y_scale = d3.scale.linear()
			        	.range([0 , +this.props.height])
						.domain(d3.extent(values, function(d) {return -d;}));
				data.x_scale = x_scale;
				data.y_scale = y_scale;

				this.setState(data);
			}.bind(this))
	},
	componentWillMount: function() {
		this.getData()
	},
	render: function () {
		var color = d3.scale.category20();
		return (
			<svg width='100%' height={this.props.height}
				 viewBox={'0 0 '+this.props.width + ' '+this.props.height}
				 preserveAspectRatio='xMidYMid'>
				{
					this.state.data.map(function(d,i) {
						return (
							<ChartLine ref={d.name} name={d.name} color={color(i)} scale_x={this.state.x_scale} scale_y={this.state.y_scale} height={this.props.height} data={d} />
						)
					}.bind(this))
				}
				<AxisX ref='xaxis' scale_x={this.state.x_scale} height={this.props.height} />
				<AxisY ref='yaxis' scale_y={this.state.y_scale} width={this.props.width} />
			</svg>
		)
	}
})

var AxisX = React.createClass({
	render: function() {
		return (
			<g className='x-axis'></g>
		)
	},
	componentWillReceiveProps: function(props) {
		var self = this;
		var xAxis = d3.svg.axis()
            .scale(props.scale_x)
            .orient("bottom")
            .ticks(10);
		
        d3.select(ReactDOM.findDOMNode(this))
        	.attr('transform', 'translate(30 '+(props.height-20)+')')
        	.transition()
        	.duration(1000)
        	.call(xAxis)
	}
})


var AxisY = React.createClass({
	render: function() {
		return (
			<g className='y-axis'></g>
		)
	},
	componentWillReceiveProps: function(props) {
		var self = this;
		var yAxis = d3.svg.axis()
            .scale(props.scale_y)
            .tickFormat(function(d) {return -d})
            .orient("left")
            .ticks(10);
		
        d3.select(ReactDOM.findDOMNode(this))
        	.attr('transform','translate(30 -20)')
        	.transition()
        	.duration(1000)
        	.call(yAxis)

       // this.yaxis = yAxis;
        //console.log('x axis changed')
	}
})

var ChartLine = React.createClass({
	render: function() {
		return <g ></g>
	},
	componentWillReceiveProps: function(props) {
		var line = d3.svg.line()
              .y(function(d) { return props.scale_y(-d.y); })
              .x(function(d) { return props.scale_x(d3.time.format('%Y-%m-%d').parse(d.x).getTime()); });
        console.log('lol')
        d3.select(this.getDOMNode()).select('path')
        	.attr('d', this.prevData ? this.line(this.prevData): [])
        	.transition()
        	.duration(1000)
        	.attr('d', line(props.data.values));
        this.line = line;
        this.prevData = props.data.values;
	},
	componentDidMount: function () {
		var self = this;
		var line = d3.svg.line()
              .y(function(d) { return self.props.scale_y(-d.y); })
              .x(function(d) { return self.props.scale_x(d3.time.format('%Y-%m-%d').parse(d.x).getTime()); });
        this.line = line;
        d3.select(this.getDOMNode())
        	.attr('transform', 'translate(30 -20)')
        	.append('path')
        		.attr('d', line(this.props.data.values))
        		.style('stroke-width',3)
        		.style('stroke',this.props.color)
        		.style('fill','transparent')

    },
})

window.Chart = Chart;