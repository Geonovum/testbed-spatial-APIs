import { GeoInfo } from 'src/interfaces/geometry.interface';
import { BBox } from 'src/types/types';
import { EntityManager, SelectQueryBuilder } from 'typeorm';

import { BadRequestException, NotFoundException } from '@nestjs/common';

export abstract class PostgresUtils {
    public static async getTables(entityManager: EntityManager): Promise<{ tablename: string; bbox: BBox; geoInfo: GeoInfo }[]> {
        const layerList = await entityManager
            .createQueryBuilder()
            .select('tables.f_table_name as tablename, tables.f_geometry_column as geom_column, srid as storagesrid')
            .from('geometry_columns', 'tables')
            .where('tables.f_table_schema = :schema', {
                schema: process.env.DATABASE_SCHEMA,
            })
            .getRawMany();

        for (const layer of layerList) {
            const query = await entityManager
                .createQueryBuilder()
                .select(`ST_Extent("${layer.geom_column}") as bbox`)
                .from(`${process.env.DATABASE_SCHEMA}.${layer.tablename}`, 'tablename')
                .getRawOne();

            layer.bbox = query.bbox;
        }

        return layerList.map((x) => {
            return {
                tablename: x.tablename,
                bbox: this.formatBoxWktToArray(x.bbox),
                geoInfo: {
                    geomColumn: x.geom_column,
                    storageSrid: x.storagesrid,
                } as GeoInfo,
            };
        });
    }

    public static async getPkForTable(entityManager: EntityManager, tablename: string): Promise<string> {
        const result = await entityManager
            .createQueryBuilder()
            .select('pg_attribute.attname')
            .from('pg_index', 'pg_index')
            .addFrom('pg_class', 'pg_class')
            .addFrom('pg_attribute', 'pg_attribute')
            .addFrom('pg_namespace', 'pg_namespace')
            .where(
                'pg_class.oid = :table::regclass AND indrelid = pg_class.oid AND nspname = :namespace AND pg_class.relnamespace = pg_namespace.oid AND pg_attribute.attrelid = pg_class.oid AND pg_attribute.attnum = any(pg_index.indkey) AND indisprimary',
                { table: `${process.env.DATABASE_SCHEMA}."${tablename}"`, namespace: process.env.DATABASE_SCHEMA }
            )
            .getRawOne();

        if (!result) {
            throw new NotFoundException();
        }

        return result.attname;
    }

    public static async getGeoInfoForTable(entityManager: EntityManager, tablename: string): Promise<GeoInfo> {
        const result = await entityManager.createQueryBuilder().select('*').from('geometry_columns', 'geom').where('f_table_name = :table', { table: tablename }).getRawOne();

        if (!result) {
            throw new NotFoundException();
        }

        return {
            geomColumn: result['f_geometry_column'],
            storageSrid: result['srid'],
        };
    }

    public static async getFeaturesForTable(
        entityManager: EntityManager,
        tablename: string,
        geoInfo: GeoInfo,
        filters: FeatureFilters
    ): Promise<{ result: any[]; numberMatched: number; totalFeatures: number; bbox: any }> {
        const targetSrid = this.mapCrsToSrid(filters.crs);
        const { geomColumn, storageSrid } = geoInfo;
        const { limit, startIndex, bbox, datetime, 'bbox-crs': bboxcrs, crs, format, ...propertyFilters } = filters;

        if (storageSrid === 0) {
            throw new BadRequestException('Storage SRID of this layer is unknown, please fix the geometries in the database');
        }

        let query = entityManager
            .createQueryBuilder()
            .select(`*, ST_ASGEOJSON(ST_TRANSFORM("${geomColumn}", ${targetSrid})) AS geojson, ST_ASGEOJSON(ST_TRANSFORM(ST_ENVELOPE("${geomColumn}"), ${targetSrid})) as bbox`)
            .from(`${process.env.DATABASE_SCHEMA}.${tablename}`, 'tablename')
            .where(propertyFilters)
            .take(limit)
            .skip(startIndex);

        let numberMatchedQuery = entityManager.createQueryBuilder().select(`count(*)`).from(`${process.env.DATABASE_SCHEMA}.${tablename}`, 'tablename').where(propertyFilters);

        let bboxResultQuery = entityManager
            .createQueryBuilder()
            .select(`ST_ASGEOJSON(ST_EXTENT(ST_TRANSFORM("${geomColumn}", ${targetSrid}))) AS bbox`)
            .from(`${process.env.DATABASE_SCHEMA}.${tablename}`, 'tablename')
            .where(propertyFilters);

        if (bbox) {
            // add bbox filter to relevant queries
            const bboxArr = JSON.parse(bbox);
            const bboxSrid = this.mapCrsToSrid(filters['bbox-crs']);
            query = this.addBboxFilterToQuery(query, geomColumn, storageSrid, bboxArr, bboxSrid);
            numberMatchedQuery = this.addBboxFilterToQuery(numberMatchedQuery, geomColumn, storageSrid, bboxArr, bboxSrid);
            bboxResultQuery = this.addBboxFilterToQuery(bboxResultQuery, geomColumn, storageSrid, bboxArr, bboxSrid);
        }

        const totalFeatures = await entityManager.createQueryBuilder().select(`count(*)`).from(`${process.env.DATABASE_SCHEMA}.${tablename}`, 'tablename').getRawOne();

        const result = await query.getRawMany();
        const bboxResult = await bboxResultQuery.getRawOne();
        const numberMatched = await numberMatchedQuery.getRawOne();
        return { result, numberMatched: +numberMatched.count, totalFeatures: +totalFeatures.count, bbox: bboxResult.bbox };
    }

    public static async getFeature(entityManager: EntityManager, tablename: string, featureId: string, pkColumn: string, geoInfo: GeoInfo, crs?: string) {
        const targetSrid = this.mapCrsToSrid(crs);
        const { geomColumn } = geoInfo;

        const feature = await entityManager
            .createQueryBuilder()
            .select(`*, ST_ASGEOJSON(ST_TRANSFORM("${geomColumn}", ${targetSrid})) AS geojson, ST_ASGEOJSON(ST_TRANSFORM(ST_ENVELOPE("${geomColumn}"), ${targetSrid})) as bbox`)
            .from(`${process.env.DATABASE_SCHEMA}.${tablename}`, 'tablename')
            .where({
                [pkColumn]: featureId,
            })
            .getRawOne();

        return feature;
    }

    /** Maps the OGC CRS notation to the postgis SRID (EPSG) number */
    private static mapCrsToSrid(crs: string): number {
        if (!crs) {
            return 4326; // Global standard
        }

        if (!this.availableProjections[crs]) {
            throw new BadRequestException(crs, 'projection not supported');
        }
        return this.availableProjections[crs];
    }

    private static addBboxFilterToQuery(query: SelectQueryBuilder<unknown>, geomColumn: string, storageSrid: number, bboxArr: number[], bboxSrid: number) {
        query = query.andWhere(`(ST_TRANSFORM(ST_MAKEENVELOPE(:left, :bottom, :right, :top, :bboxsrid), ${storageSrid}) && ${geomColumn})`, {
            left: bboxArr[0],
            bottom: bboxArr[1],
            right: bboxArr[2],
            top: bboxArr[3],
            bboxsrid: bboxSrid,
            storagesrid: storageSrid,
        });
        return query;
    }

    private static formatBoxWktToArray(bbox: string | null): BBox | null {
        return bbox
            ? (bbox
                  .split('(')[1]
                  .split(')')[0]
                  .replace(',', ' ')
                  .split(' ')
                  .map((x: string) => +x) as BBox)
            : (bbox as null);
    }

    // TODO: construct this list in a clever way or define a (better) list of commonly used projections
    // the supported srid list of postgres is over 5000 items, to define them all in every request is a bit overkill.
    private static availableProjections = {
        'http://www.opengis.net/def/crs/OGC/1.3/CRS84': 4326,
        'http://www.opengis.net/def/crs/EPSG/0/4326': 4326,
        'http://www.opengis.net/def/crs/EPSG/0/28992': 28992,
        'http://www.opengis.net/def/crs/EPSG/0/3857': 3857,
        'http://www.opengis.net/def/crs/EPSG/0/4258': 4258,
    };
}
