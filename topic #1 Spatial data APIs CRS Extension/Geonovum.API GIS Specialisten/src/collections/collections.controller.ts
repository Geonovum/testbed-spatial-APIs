import { Request as Req } from 'express';

import { Controller, Get, Param, Query, Request } from '@nestjs/common';
import { ApiBadRequestResponse, ApiNotFoundResponse, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

import { CollectionsService } from './collections.service';
import { Collection, Collections } from './interfaces/collections.interface';
import { FeatureCollection } from './interfaces/feature-collection.interface';
import { FeatureResponse } from './interfaces/feature-response.interface';

@ApiTags('Collections')
@Controller('collections')
export class CollectionsController {
    constructor(private readonly collectionsService: CollectionsService) {}

    /** Returns the available collections */
    @Get()
    getCollections(): Promise<Collections> {
        return this.collectionsService.getCollections();
    }

    /** Returns the specified collection */
    @Get(':id')
    @ApiParam({ name: 'id', description: 'identifier of the collection' })
    @ApiNotFoundResponse({ description: 'Specified collection not found' })
    getCollection(@Param('id') id: string): Promise<Collection> {
        return this.collectionsService.getCollection(id);
    }

    /** Returns the items of the specified collection */
    @Get(':collectionId/items')
    @ApiParam({ name: 'collectionId', description: 'identifier of the collection' })
    @ApiQuery({ name: 'limit', description: 'limit the amount of responses', required: false })
    @ApiQuery({ name: 'startIndex', description: 'start the list of responses from this index, to facilitate pagination', required: false })
    @ApiQuery({ name: 'crs', description: 'requested projection of the data', required: false })
    @ApiQuery({ name: 'bbox', description: 'bounding box filter', required: false })
    @ApiQuery({ name: 'bbox-crs', description: 'projection of the bounding box values', required: false })
    @ApiQuery({ name: 'datetime', description: 'temporal interval filter', required: false })
    @ApiQuery({ name: 'format', description: 'respo format', required: false })
    @ApiQuery({ description: 'any other property filters, f.ex. "status=ok"', required: false })
    @ApiNotFoundResponse({ description: 'Specified collection not found or empty' })
    @ApiBadRequestResponse({ description: 'Requested CRS not supported' })
    async getFeatures(@Param('collectionId') collectionId: string, @Query() filters: FeatureFilters, @Request() request: Req): Promise<FeatureCollection> {
        const result = await this.collectionsService.getFeatures(collectionId, filters);

        request.res.set('Content-Crs', result.crs.properties.name);
        return result;
    }

    /** Returns the specified item of the specified collection */
    @Get(':collectionId/items/:featureId')
    async getFeature(
        @Param('collectionId') collectionId: string,
        @Param('featureId') featureId: string,
        @Query('crs') crs: string,
        @Request() request: Req
    ): Promise<FeatureResponse> {
        const result = await this.collectionsService.getFeature(collectionId, featureId, crs);

        request.res.set('Content-Crs', crs);
        return result;
    }
}
