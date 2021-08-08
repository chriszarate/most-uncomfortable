import type { NextApiRequest, NextApiResponse } from 'next'
import sheetrock from 'sheetrock';

type SheetRow = {
	cellsArray: string[],
};

type SheetResponse = {
	rows: SheetRow[],
};

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<Person[]>
) {
	const people = await getPeople();
	
	res.status( 200 ).json( people );
}

export async function getPeople(): Promise<Person[]> {
	const rows = await new Promise<SheetRow[]>( ( resolve, reject ) => {
		sheetrock( {
			url: process.env.GOOGLE_SHEET_URL,
			reset: true,
			query: 'select A,B,D',
			callback: function ( error: Error, _: any, response: SheetResponse ): void {
				if ( error ) {
					reject( error );
				}

				resolve( response.rows.slice( 1 ) ); // remove header row
			}
		} );
	} );

	return rows.map( ( { cellsArray: row } ) => ( {
		emoji: row[2],
		location: row[1],
		name: row[0],
		shortLocation: row[1].replace( /,\s[A-Z]{2}$/, '' ),
	} ) );
}

