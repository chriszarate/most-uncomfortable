import React from 'react';
import config from './config';
import { useSummary, terms } from './data';
import Loading from './Loading';
import './App.css';

export default function App() {
	const summary = useSummary();

	if ( ! summary ) {
		return <Loading />;
	}

	return (
		<main>
			<header>
				<h1 className={config.type}>{summary[0].name}</h1>
				<h2>{terms.emoji}</h2>
			</header>
			<article>
				{
					summary.map( ( item, i ) => (
						<div className="entry" key={i}>
							<div className="emoji">
								{item.emoji}
							</div>
							<div className="detail">
								<h3><strong>{item.name}</strong> {item.verb} in <a href={item.locationLink} target="_blank">{item.location}</a> where it’s <a href={item.weatherLink} target="_blank">{item.weather}</a>.</h3>
							</div>
						</div>
					) )
				}
			</article>
			<footer>
				<a href={terms.oppositeLink}>Who’s {terms.oppositeSuperlative}?</a>
			</footer>
		</main>
	);
}
