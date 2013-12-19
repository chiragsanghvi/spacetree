var gpu = new (function() {

	var circles = [], lines = []
	var zoomX, zoomY
	var world
	var forceLayout
	var connections = { }

	this.boot = function() {
		connections = { }
		zoomX = zoomY = 1
		circles.length = 0
		lines.length = 0
	}

	// default configuration
	var config = {
		nodeRadius: 50,
		nodeColor: '#fff',
		nodeStrokeColor: 'rgb(220,220,220)',
		nodeStrokeWidth: '10',
		nodeSelectedFillStyle: 'rgb(94,212,255)',
		nodeSelectedStrokeColor: 'rgb(0,176,240)',
		nodeConnectedFillStyle: 'rgb(255,204,0)',
		nodeConnectedStrokeColor: 'rgb(255,174,0)',
		edgeStrokeColor: 'rgb(150,150,150)',
		edgeStrokeWidth: '3'
	}

	var defaultCircleAttributes = {
		fill: config.nodeColor,
		stroke: config.nodeStrokeColor,
		'stroke-width': config.nodeStrokeWidth,
		r: config.nodeRadius
	}

	var defaultLineAttributes = {
		stroke: config.edgeStrokeColor,
		'stroke-width': config.edgeStrokeWidth
	}

	var circleById = function(id) {
		return circles.filter(function (c) {
			return c.data('id') == id
		})[0]
	}

	var linesToSelf = function(id) {
		var result = []
		lines.forEach(function (line) {
			if (line.data('endpointa') == line.data('endpointb') && line.data('endpointb') == id)
				result.push(line.data('id'))
		})
		return result
	}

	this.linesToSelf = linesToSelf

	var lineById = function(id) {
		return lines.filter(function (l) {
			return l.data('id') == id
		})[0]
	}

	var lineByEndpointA = function(id) {
		return lines.filter(function (l) {
			return (l.data('endpointa') == id)
		})[0]
	}

	var lineByEndpointB = function(id) {
		return lines.filter(function (l) {
			return (l.data('endpointb') == id)
		})[0]
	}

	var lineByEndpoint = function(id) {
		return lineByEndpointA(id) || lineByEndpointB(id)
	}

	this.setWorld = function(w) {
		world = w
	}

	this.setZoom = function(x, y) { 
		zoomX = x, zoomY = y
	}
	this.setForceLayout = function(l) { forceLayout = l }

	this.addCircle = function(node) {
		// create a circle
		// with default attributes
		var c = world.circle(node.x, node.y, config.nodeRadius).attr(defaultCircleAttributes)

		// store required data
		c.data('id', node.id)
		c.data('edges', [])
		c.data('selected', false)
		c.data('state', defaultCircleAttributes)

		// generate label and store
		var label = world.text(node.x, node.y, node.label).attr({ 'font-size': '15pt', 'font-weight':'bold'})
		c.data('label', label)
		c.data('name', node.label)
		var onDragStart = function () {
		    this._x = this.attr("cx")
		    this._y = this.attr("cy")
		    this.data('clicked', true)
		    this.data('moved', false)
		}
		var onDragMove = function(dx, dy) {
			var nx = this._x + (dx / zoomX), ny = this._y + (dy / zoomY)
		    this.data('label').attr({ x: nx, y: ny })
		    this.attr({ cx: nx, cy: ny })
		    var that = this
		    forceLayout.eachNode(function(n, p) {
		    	if (n.data._id != that.data('id')) return
		    	p.p.x = nx / 75
		    	p.p.y = ny / 75
		    	p.p.m = 1000000
		    })
		    renderer.start()
		}
		c.drag(onDragMove, onDragStart)

		var _mouseMoved = false, _mouseDown = false
		c.mousedown(function() { 
			_mouseMoved = false
			_mouseDown = true
		}).mousemove(function() {
			if (_mouseDown == false) return
			_mouseMoved = true
		}).mouseup(function() {

			// reset the flag
			_mouseDown = false

			// only if a circle has just been clicked
			if (_mouseMoved == false) {
				this.data('selected', !this.data('selected'))
				var that = this//, myNode = nodes.filter(function(n) { return n.id == that.data('id') })[0]

				// reset all circles to initial state
				circles.forEach(function(c) {
					if (c.data('id') == that.data('id')) return
					c.attr(defaultCircleAttributes)
					c.data('selected', false)
				})

				var finalAttributes
				if (this.data('selected')) {
					finalAttributes = {
						'r': config.nodeRadius * 1.5,
						fill: config.nodeSelectedFillStyle,
						stroke: config.nodeSelectedStrokeColor
					}
				}
				else { 
					finalAttributes = { 
						'r': config.nodeRadius,
						fill: config.nodeColor,
						stroke: config.nodeStrokeColor
					}
				}

				// if it has been de-selected, skip
				// else, colors its neighbours
				if (this.data('selected') == true) {
					connections[this.data('id')].forEach(function (connectedId) {
						var neighbor = circles.filter(function(c) {
							return c.data('id') == connectedId
						})[0]
						setTimeout(function() {
							neighbor.attr({
								fill: config.nodeConnectedFillStyle,
								stroke: config.nodeConnectedStrokeColor
							})
						}, 0)
					})
				}

				this.animate(finalAttributes, 450, 'bounce')

				node.lastState = this.attrs
			}
		})


		circles.push(c)

		return c
	}

	this.getCircleById = function(id) {
		return circleById(id)
	}

	this.getLineById = function(id) {
		return lineById(id)
	}

	this.dump = function() {
		console.dir(circles)
		console.dir(lines)
	}

	this.addLine = function(edge) {
		// create a line
		// with default attributes

		// get the nodes at the ends
		var a = circleById(edge.endpointA)
		var b = circleById(edge.endpointB)

		// create the line and store le data
		var pathCommands = ['M',a.x,a.y,'L',b.x,b.y].join(' ')
		var l = world.path(pathCommands).attr(defaultLineAttributes)
		l.toBack()
		l.data('id', edge.id)
		l.data('endpointb', edge.endpointB)
		l.data('endpointa', edge.endpointA)
		lines.push(l)

		// create map of connections 
		if (!connections[edge.endpointA]) connections[edge.endpointA] = []
		if (!connections[edge.endpointB]) connections[edge.endpointB] = []
		connections[edge.endpointB].push(edge.endpointA)
		connections[edge.endpointA].push(edge.endpointB)

		return l
	}


})()