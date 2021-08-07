import React, { useState } from 'react';
import { useAqi, usePeople } from './data';
import Loading from './Loading';
import './App.css';

const terms = {
	cold: {
			emoji: '🥶',
			sortKey: 'temp',
		},
	hot: {
		emoji: '🥵',
		sortKey: '-temp',
	},
};

function AQI ( { lat, long } ) {
	const aqi = useAqi( lat, long );

	if ( ! aqi ) {
		return <span className="flag unknown">AQI ▒</span>;
	}

	let level = 'low';
	if ( aqi > 200 ) {
		level = 'ohno';
	} else if ( aqi > 150 ) {
		level = 'awful';
	} else if ( aqi > 100 ) {
		level = 'high';
	} else if ( aqi > 50 ) {
		level = 'medium';
	}

	return <span className={`flag ${level}`}>AQI {aqi}</span>
}

function UV ( { uv } ) {
	if ( ! uv ) {
		return <span className="flag unknown">UV ▒</span>;
	}

	let level = 'low';
	if ( uv > 10 ) {
		level = 'ohno';
	} else if ( uv > 7 ) {
		level = 'awful';
	} else if ( uv > 5 ) {
		level = 'high';
	} else if ( uv > 2 ) {
		level = 'medium';
	}

	return <span className={`flag ${level}`}>UV {uv}</span>;
}

function Weather( { weather } ) {
	return (
		<div>
			<h4>
				<a href={weather.weatherLink} target="_blank">{weather.weather}</a>
				<AQI lat={weather.lat} long={weather.long} />
				<UV uv={weather.uv} />
			</h4>
			<h4 className="time">
				{`${weather.localTime} `}
				in <a href={weather.locationLink} target="_blank">{weather.shortLocation}</a>
			</h4>
		</div>
	);
}

function Person ( { emoji, location, name, weather } ) {
	return (
		<div className="entry">
			<div className="left">
				<div className="emoji">
					{emoji}
				</div>
			</div>
			<div className="detail">
				<h3>{name}</h3>
				<Weather weather={weather} />
			</div>
		</div>
	);
}

export default function App() {
	const initialType = 'cold' === process.env.REACT_APP_TYPE ? 'cold' : 'hot';
	const [ type, setType ] = useState( initialType );
	const oppositeType = 'cold' === type ? 'hot' : 'cold';

	const { emoji, sortKey } = terms[ type ];
	const people = usePeople( sortKey );

	function toggleType () {
		document.body.classList.add( oppositeType );
		document.body.classList.remove( type );

		setType( oppositeType );
	}

	if ( ! people ) {
		return <Loading emoji={emoji} />;
	}

	return (
		<main>
			<article>
				{
					people.map( ( person, i ) => (
						<Person
							emoji={person.emoji}
							location={person.location}
							key={person.name}
							name={person.name}
							weather={person}
						/>
					) )
				}
			</article>
			<footer onClick={toggleType}>🔀</footer>
		</main>
	);
}
