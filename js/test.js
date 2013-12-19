$(function() {
	graph.initialize({
		width: $(window).innerWidth(),
		height: $(window).innerHeight(),
		container: '#holder',
		backgroundColor: 'red',
		alive: false
	}).addNode({
		id: 100,
		label: 'Mia'
	}).addNode({
		id: 200,
		label: 'Baccha'
	}).addNode({
		id: 300,
		label: 'Bibi'
	}).addEdge({
		endpointA: 100,
		endpointB: 200
	}).addEdge({
		endpointA: 200,
		endpointB: 300
	})

	var number = 20
	var labels = ['Jack','Jill','Mark','Dinosaur','Barfi','Chocolate Milkshake','Yellow','LotR','Appacitive','Ram','Krishna','Profits','Loss','Sadness','Towel','Pink!','CradleOfFilth','Bombay','se','Baroda','Tak']
	for (var x = 1; x < number; x = x + 1) {
		graph.addNode({
			id: x - 1,
			label: labels[x % (labels.length - 1)]
		})
	}

	graph.addEdge({
		endpointA: 1,
		endpointB: 1
	}).addEdge({
		endpointA: 1,
		endpointB: 1
	}).addEdge({
		endpointA: 1,
		endpointB: 1
	}).addEdge({
		endpointA: 1,
		endpointB: 1
	})

	for (var x = 1; x < number - 2; x = x + 1) {
		graph.addEdge({
			endpointA: parseInt(Math.random() * (number - 2)) + 1,
			endpointB: parseInt(Math.random() * (number - 2)) + 1
		})
	}

	graph.go()

})
