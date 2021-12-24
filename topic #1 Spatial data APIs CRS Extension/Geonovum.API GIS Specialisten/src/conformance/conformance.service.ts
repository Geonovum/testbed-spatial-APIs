import { Injectable } from '@nestjs/common';

import { Conformance } from './interfaces/conformance.interface';

@Injectable()
export class ConformanceService {
    getConformance(): Conformance {
        const conformance: Conformance = {
            conformsTo: [
                'http://www.opengis.net/spec/ogcapi-features-1/1.0/conf/core',
                'http://www.opengis.net/spec/ogcapi-features-1/1.0/conf/oas30',
                'http://www.opengis.net/spec/ogcapi-features-1/1.0/conf/geojson',
            ],
        };
        return conformance;
    }
}
