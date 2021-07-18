import React, { useState } from 'react';
import { useSummary } from './data';
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

function Entry ( { item } ) {
	return (
		<div className="entry">
			<div className="left">
				<div className="emoji">
					{item.emoji}
				</div>
			</div>
			<div className="detail">
				<h3>{item.name}</h3>
				<h4><a href={item.weatherLink} target="_blank">{item.weather}</a></h4>
				<h4 className="time">
					{`${item.localTime} `}
					in <a href={item.locationLink} target="_blank">{item.location}</a>
				</h4>
			</div>
		</div>
	);
}

export default function App() {
	const initialType = 'cold' === process.env.REACT_APP_TYPE ? 'cold' : 'hot';
	const [ type, setType ] = useState( initialType );
	const oppositeType = 'cold' === type ? 'hot' : 'cold';

	const { emoji, sortKey } = terms[ type ];
	const summary = useSummary( sortKey );

	function toggleType () {
		document.body.classList.add( oppositeType );
		document.body.classList.remove( type );

		setType( oppositeType );
	}

	if ( ! summary ) {
		return <Loading emoji={emoji} />;
	}

	return (
		<main>
			<article>
				{
					summary.map( ( item, i ) => <Entry item={item} key={i} /> )
				}
			</article>
			<footer onClick={toggleType}>🔀</footer>
		</main>
	);
}
