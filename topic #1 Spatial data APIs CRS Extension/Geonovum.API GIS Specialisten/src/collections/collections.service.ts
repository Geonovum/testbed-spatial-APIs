import { GeoInfo, Geometry } from 'src/interfaces/geometry.interface';
import { BBox } from 'src/types/types';
import { PostgresUtils } from 'src/utils/postgres.utils';
import { EntityManager } from 'typeorm';

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';

import { Collection, Collections } from './interfaces/collections.interface';
import { Feature, FeatureCollection } from './interfaces/feature-collection.interface';
import { FeatureResponse } from './interfaces/feature-response.interface';

@Injectable()
export class CollectionsService {
    constructor(@InjectEntityManager() private readonly entityManager: EntityManager) {}

    async getCollections(): Promise<Collections> {
        const layerList: { tablename: string; bbox: BBox; geoInfo: GeoInfo }[] = await PostgresUtils.getTables(this.entityManager);
        const collections: Collections = {
            links: [{ href: '/collections', rel: 'self', type: 'application/json', title: 'this document' }],
            crs: [
                'http://www.opengis.net/def/crs/OGC/1.3/CRS84', // TODO: construct this list on mapping in the Utils file
                'http://www.opengis.net/def/crs/EPSG/0/4326',
                'http://www.opengis.net/def/crs/EPSG/0/28992',
                'http://www.opengis.net/def/crs/EPSG/0/3857',
                'http://www.opengis.net/def/crs/EPSG/0/4258',
            ],
            collections: layerList.map((x) => {
                return {
                    id: x.tablename,
                    title: x.tablename, //TODO: get title/description for id from a config file
                    description: '',
                    extent: {
                        spatial: {
                            bbox: [x.bbox],
                            crs: `http://www.opengis.net/def/crs/EPSG/0/${x.geoInfo.storageSrid}`,
                        },
                    },
                    itemType: 'feature',
                    links: [{ href: `/collections/${x.tablename}/items`, rel: 'items', type: 'application/geo+json', title: `${x.tablename}: items` }],
                    crs: ['#/crs'],
                };
            }),
        };

        return collections;
    }

    async getCollection(id: string): Promise<Collection> {
        const collections = await this.getCollections();
        const collection = collections.collections.find((x) => x.id === id);
        if (!collection) {
            throw new NotFoundException();
        }
        collection.crs = collections.crs;

        return collection;
    }

    async getFeatures(collectionId: string, filters: FeatureFilters): Promise<FeatureCollection> {
        try {
            const pk = await PostgresUtils.getPkForTable(this.entityManager, collectionId);
            const geoInfo = await PostgresUtils.getGeoInfoForTable(this.entityManager, collectionId);
            let { result: features, numberMatched, totalFeatures, bbox } = await PostgresUtils.getFeaturesForTable(this.entityManager, collectionId, geoInfo, filters);
            const usedCrs = filters.crs || 'http://www.opengis.net/def/crs/OGC/1.3/CRS84';

            features = features.map((x) => this.mapFeatures(x, collectionId, pk, geoInfo, filters.format, usedCrs));

            const featureCollection: FeatureCollection = {
                type: 'FeatureCollection',
                bbox: bbox ? this.formatBbox(JSON.parse(bbox)) : filters.bbox ? JSON.parse(filters.bbox) : [],
                crs: {
                    type: 'name',
                    properties: {
                        name: usedCrs,
                    },
                },
                storageCrs: {
                    type: 'name',
                    properties: {
                        name: `http://www.opengis.net/def/crs/EPSG/0/${geoInfo.storageSrid}`,
                    },
                },
                features,
                numberMatched,
                numberReturned: features.length,
                timeStamp: new Date(),
                totalFeatures,
                links: [
                    {
                        href: `/collections/${collectionId}/items${Object.keys(filters).length > 0 ? '?' : ''}${new URLSearchParams(filters).toString()}`,
                        rel: 'self',
                        type: 'application/geo+json',
                        title: 'this document',
                    },
                ],
            };

            const endIndex = (+filters.startIndex || 0) + features.length;
            if (endIndex < numberMatched) {
                // theres more to see, so add the 'next' link
                let { startIndex, ...otherFilters } = filters;
                featureCollection.links.push({
                    href: `/collections/${collectionId}/items?${new URLSearchParams(otherFilters).toString()}&startIndex=${endIndex}`,
                    rel: 'next',
                    type: 'application/geo+json',
                    title: 'next page',
                });
            }
            // ? Optional TODO: include a 'prev' link too

            return featureCollection;
        } catch (e) {
            if (e.status === 400) {
                throw e;
            }

            console.error(e);
            //TODO: improve error handling to match the exact reason the request failed
            throw new NotFoundException();
        }
    }

    async getFeature(collectionId: string, featureId: string, crs?: string): Promise<FeatureResponse> {
        const pk = await PostgresUtils.getPkForTable(this.entityManager, collectionId);
        const geoInfo = await PostgresUtils.getGeoInfoForTable(this.entityManager, collectionId);

        const featureData = await PostgresUtils.getFeature(this.entityManager, collectionId, featureId, pk, geoInfo, crs);
        return {
            links: [
                { href: `collections/${collectionId}/items/${featureId}`, rel: 'self', type: 'application/json', title: 'this document' },
                { href: `collections/${collectionId}`, rel: 'collection', type: 'application/json', title: 'the collection containing this feature' },
            ],
            feature: this.mapFeatures(featureData, collectionId, pk, geoInfo),
        };
    }

    private mapFeatures(feature: any, collectionId: string, pk: string, geoInfo: GeoInfo, format?: Format, crs?: string): Feature {
        const { [geoInfo.geomColumn]: _geomColumn, geojson, bbox, ...filteredFeature } = feature;
        const geometry = JSON.parse(geojson) as Geometry;
        const bboxJson = JSON.parse(bbox) as Geometry;

        let value: Partial<Feature> = {
            id: `${collectionId}.${feature[pk]}`,
            bbox: this.formatBbox(bboxJson),
            geometry,
            geometry_name: geoInfo.geomColumn,
            properties: filteredFeature,
            type: 'Feature',
        };

        if (format === 'JSON-FG') value = { ...value, coordRefSys: crs, where: geometry, geometry: null };

        return value as Feature;
    }

    private formatBbox(bbox: Geometry): BBox {
        let result = [];
        if (!bbox) {
            // item without geometry -> also no bbox
            return null as any;
        }

        if (bbox.type === 'Polygon') {
            result = [...bbox.coordinates[0][0], ...bbox.coordinates[0][2]];
        } else {
            result = [bbox.coordinates[0], bbox.coordinates[1], bbox.coordinates[0], bbox.coordinates[1]];
        }
        return result as BBox;
    }
}
