import { Geometry } from 'src/interfaces/geometry.interface';
import { Link } from 'src/interfaces/link.interface';
import { BBox } from 'src/types/types';

import { ApiProperty } from '@nestjs/swagger';

export class FeatureCollection {
    type: "FeatureCollection";

    @ApiProperty({description: 'Bounding box of the feature collection, in the projection indicated in the crs property', type: [Number, Number, Number, Number]})
    bbox: BBox;

    /** The projection of the collection in this repsonse */
    crs: Crs;

    /** The projection of the collection as it is in the database */
    storageCrs: Crs;

    /** Features in the collection */
    features: Feature[];

    /** Number of features that match the query parameters */
    numberMatched: number;

   /** Number of features returned in the request */
    numberReturned: number;

    /** The time at the moment the request was processed */
    timeStamp: Date;

    /** Total number of features in the collection */
    totalFeatures: number;

    links: Link[];
}

export class Feature {
    /** Feature identifier, usually contructed as `collectionId.FeaturePrimaryKey` */
    id: string;

    coordRefSys?: string;

    geometry?: Geometry;
    where?: Geometry;

    @ApiProperty({description: 'Bounding box of the feature', type: [Number, Number, Number, Number]})
    bbox: BBox;

    /** Name of the geometry column */
    geometry_name: string;

    /** Feature properties, all remaining columns */
    properties: any;

    /** FeatureType */
    type: 'Feature'
}

export class Crs {
    type: 'name';
    properties: {
        name: string;
    };
}