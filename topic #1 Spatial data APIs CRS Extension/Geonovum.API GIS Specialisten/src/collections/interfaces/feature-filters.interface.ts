interface FeatureFilters {
    // pre-defined filters on the collection
    limit?: number;
    startIndex?: number;
    crs?: string;
    bbox?: string;
    'bbox-crs'?: string;
    datetime?: string;
    format?: Format;

    // any property filters
    [key: string]: any;
}

type Format = 'GeoJSON' | 'JSON-FG';