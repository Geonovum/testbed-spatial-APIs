import { Link } from 'src/interfaces/link.interface';

import { Feature } from './feature-collection.interface';

export class FeatureResponse {
    links: Link[];
    feature: Feature;
}