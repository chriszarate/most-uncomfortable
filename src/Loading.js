import React from 'react';
import './Loading.css';

export default function Loading ( { emoji } ) {
	return (
		<div className="container">
			<div className={`circle`}>{emoji}</div>
		</div>
	);
}
