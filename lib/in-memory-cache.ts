type Store = {
	[ key: string ]: {
		expiry: number,
		value: any,
	},
}

class InMemoryCache {
	debug: boolean;
	store: Store;

	constructor( debug = false ) {
		this.debug = debug;
		this.store = {};
	}

	clear() {
		this.store = {};
	}

	get<TValue>( key: string ): TValue | null {
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

	async getWithFallback<TValue>( key: string, fn: () => Promise<TValue>, ttl: number = 300 ): Promise<TValue> {
		const cached = this.get<TValue>( key );
		if ( cached ) {
			return cached;
		}

		const value = await fn();
		this.set( key, value, ttl );

		return value;
	}

	set( key: string, value: any, ttl: number = 300 ) {
		this.debug && console.log( `Setting cache object "${key}" with ttl ${ttl}` );

		this.store[ key ] = {
			expiry: Date.now() + ( ttl * 1000 ),
			value,
		};
	}
}

export default new InMemoryCache( 'production' !== process.env.NODE_ENV );
