import { BBox, Point, Polygon } from 'src/types/types';
import { ApiProperty } from '@nestjs/swagger';

export class Geometry {
    @ApiProperty({ description: 'coordinates of the geometry', type: [Number] })
    coordinates: Point | Polygon;
    type: string;
}

export interface GeoInfo {
    geomColumn: string;
    storageSrid: number;
}

export class Extent {
    spatial: Spatial;
    temporal?: Temporal;
}

export class Spatial {
    @ApiProperty({ description: 'Bounding box', type: [Number, Number, Number, Number] })
    bbox: BBox[];
}

export class Temporal {
    @ApiProperty({ description: 'Temporal interval', type: [Date, {}] })
    interval: [Date, any][];
}
