import React from 'react';
import config from './config';
import './Loading.css';

export default function Loading () {
	const emoji = 'cold' === config.type ? '❄️' : '🌡️';

	return (
		<div className="container">
			<div className={`circle ${config.type}`}>{emoji}</div>
		</div>
	);
}
