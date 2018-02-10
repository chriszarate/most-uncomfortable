import React, { Component } from 'react';
import Skycons from 'react-skycons'
import darksky from 'dark-sky-api';
import sortBy from 'sort-by';
import config from './config';
import './App.css';

darksky.apiKey = config.apiKey;

const handleError = err => {
	console.error(err);
	return {};
}

const getWeather = config.places.map(place => darksky.loadCurrent(place.position));
const oneDecimalPlace = num => Math.round(num * 10) / 10;

const getSummary = results => {
	if (results.length !== config.places.length) {
		return null;
	}

	const summary = results.map((result, i) => ({
		...config.places[i],
		desc: result.summary,
		icon: result.icon.toUpperCase().replace(/-/g, '_'),
		temp: result.temperature,
	}));

	summary.sort(sortBy(config.sortBy));

	return summary;
};

class App extends Component {
	constructor() {
		super();

		this.state = {};
	}

	getWeather() {
		Promise.all(getWeather).then(getSummary).catch(handleError).then(summary => {
			this.setState({ summary });
		});
	}

	componentDidMount() {
		this.getWeather();
	}

	render() {
		const { summary } = this.state;

		if (!summary) {
			return null;
		}

		return (
			<div className="App">
				<header className="header">
					<h1 className="name">{summary[0].name}</h1>
				</header>
				<div className="summary">
					{
						summary.map((place, i) => (
							<div className="entry" key={`place_${i}`}>
								<div className="entry-skycon">
									<Skycons 
										color="#333"
										icon={place.icon}
										autoplay={true}
									/>
								</div>
								<div className="entry-detail">
									<h3>{place.name}</h3>
									<h4>{oneDecimalPlace(place.temp)}° in {place.where}</h4>
								</div>
							</div>
						))
					}
				</div>
			</div>
		);
	}
}

export default App;
