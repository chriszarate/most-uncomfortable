type Store = {
	[ key: string ]: {
		expiry: number,
		value: any,
	},
}

export default class InMemoryCache {
	debug: boolean;
	store: Store;

	constructor( debug = false ) {
		this.debug = debug;
		this.store = {};
	}

	get( key: string ) {
		const stored = this.store[ key ];

		if ( stored ) {
			if ( stored.expiry >= Date.now() ) {
				this.debug && console.log( `Returning cache object "${key}" from cache` );
				return stored.value;
			}

			this.debug && console.log( `Cache object "${key}" has expired` );
		}
		
		this.debug && console.log( `Cache object "${key}" not found` );
		return null;
	}

	set( key: string, value: any, ttl: number = 300 ) {
		this.debug && console.log( `Setting cache object "${key}" with ttl ${ttl}` );

		this.store[ key ] = {
			expiry: Date.now() + ( ttl * 1000 ),
			value,
		};
	}
}
