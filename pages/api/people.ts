import { kv } from '@vercel/kv';
import type { NextApiRequest, NextApiResponse } from 'next'
import { notEmpty } from '../../lib/utils';

const KV_PEOPLE_KEY = 'people_data';

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

function validatePerson( blob: any ): Person | null {
	if (
		'string' === typeof blob.location &&
		'string' === typeof blob.name &&
		blob.location &&
		blob.name
	) {
		return {
			...blob,
			shortLocation: blob.location.replace( /,\s[A-Z]{2}$/, '' ),
		};
	}

	return null;
}

async function updatePeople( people: Person[] ): Promise<void> {
	await kv.set<Person[]>( KV_PEOPLE_KEY, people );
}

export async function getPeople(): Promise<Person[]> {
	return await kv.get<Person[]>( KV_PEOPLE_KEY ) || [];
}
