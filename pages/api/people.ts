import { initializeApp } from 'firebase/app';
import {
	get,
	getDatabase,
	ref,
	set,
} from 'firebase/database';
import cache from '../../lib/in-memory-cache';
import type { NextApiRequest, NextApiResponse } from 'next'
import {notEmpty} from '../../lib/utils';

initializeApp( {
  apiKey: process.env.FIREBASE_API_KEY,
  databaseURL: process.env.FIREBASE_REALTIME_DATABASE_URL,
} );

const databaseResource = process.env.FIREBASE_REALTIME_DATABASE_RESOURCE || '';
const databaseRef = ref( getDatabase(), databaseResource );

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Person[]>
) {
	if ( 'POST' === req.method ) {
		try {
			const people = validateInput( req.body );
			await updatePeople( people );

			return res.status( 200 ).json( [] );
		} catch ( err ) {
			console.error( err );

			return res.status( 400 ).json( [] );
		}
	}

	const people = await getPeople();
	
	res.status( 200 ).json( people );
}

async function getPeopleFromFirebase(): Promise<Person[]> {
	const snapshot = await get( databaseRef );

	if ( snapshot.exists() ) {
		const people: StoredPerson = snapshot.val();

		return people
			.filter( record => record.name && record.location )
			.map( record => ( {
				...record,
				shortLocation: record.location.replace( /,\s[A-Z]{2}$/, '' ),
			} ) );
	}

	console.error( 'No data exists!' );
	return [];
}

function validateInput( blob: any ) {
	const answer1 = blob?.answer1 || 'UNKNOWN';
	const answer2 = blob?.answer2 || 'UNKNOWN';

	if (
		answer1 !== process.env.SECURITY_ANSWER1 ||
		answer2 !== process.env.SECURITY_ANSWER2
	) {
		throw new Error( 'Incorrect security answers' );
	}

	const untrustedInput = Array.isArray( blob?.people ) ? blob.people : [];
	const people = untrustedInput.map( validatePerson ).filter( notEmpty );

	if ( 4 !== people.length ) {
		throw new Error( 'Unexpected input' );
	}

	return people;
}

function validatePerson( blob: any ): StoredPerson | null {
	if (
		'string' === typeof blob.location &&
		'string' === typeof blob.name &&
		blob.location &&
		blob.name
	) {
		return blob;
	}

	return null;
}

async function updatePeople( people: StoredPerson[] ): Promise<void> {
	await set( databaseRef, people );
	cache.clear();
}

export function getPeople() {
	return cache.getWithFallback<Person[]>( 'PEOPLE', getPeopleFromFirebase, 3600 );
}
