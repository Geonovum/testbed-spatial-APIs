import { Extent } from 'src/interfaces/geometry.interface';
import { Link } from 'src/interfaces/link.interface';

/** Collection object containing the collections array and a link array with links to each collection */
export class Collections {
    /** links to the available collections */
    links: Link[];

    /** the list of coordinate reference systems supported (global) */
    crs: string[];
    
    /** array of the available collections  */
    collections: Collection[];
}

export class Collection {
    id: string;
    title: string;
    description: string;
    extent: Extent;
    itemType: 'feature';
    links: Link[];
    /** the list of coordinate reference systems supported (for this collection) */
    crs: string[];
}