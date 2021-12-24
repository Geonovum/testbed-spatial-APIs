# OGC API CRS Extensions

Testbed project for Geonovum - implement CRS Extension for OGC API Features following the OGC API - Features - Part 2: Coordinate Reference Systems by Reference specifications.

## Scope

Geographic data is everywhere. If created properly, it has a specific ‘coordinate reference system‘ (CRS) to uniquely link this data to a real-world location. Ideally, the same CRS is used for all datasets existing in a specific environment.
However, there might be situations when choosing one CRS for multiple datasets may cause troubles. Namely, when dealing with data from multiple countries. In this case, these two countries may have their official CRS developed and used officially, making the choice of one over the other difficult.
The [Geonovum](https://geonovum.nl) project, by [GIS Specialisten](https://gisspecialisten.nl), demonstrates how geographic data can be used with multiple CRS within APIs. It also shows the required efforts to serve data with multiple CRS; request and use data with specific CRS.

## Dataset

For purposes of developing and testing the API, we used the Nitrogen deposits (NOx) datasets from the Netherlands. This is an INSPIRE dataset that covers the whole of the country and slightly overlaps with Germany and Belgium. Since the scope of the project is the reprojection of data, a national one with relevance in the border region of neighboring countries is a good starting point.

The dataset is available as a bulk download (WCS) and WMS from [data.overheid.nl](https://data.overheid.nl/dataset/5449-grootschalige-stikstofdepositie-nederland#webservice).

Due to the unavailability of the WCS, we used the WMS. We created a [hexagonal grid](https://towardsdatascience.com/spatial-modelling-tidbits-honeycomb-or-fishnets-7f0b19273aab) so that the average of NOx values for that specific could be calculated. The output of this analysis makes the dataset with a quite simple structure, containing ID, minimum NOx value, maximum NOx value, and geometry. This dataset is published to the testbed's PostGIS database.

For [the live demo](https://geoservice-ogc-api.azurewebsites.net) of the API implementation, a different dataset is used. This is upon request from Geonovum, in order to make it possible for them to experiment with this data set in combination with INSPIRE standards and different CRS'ses for the data. The [live demo](https://geoservice-ogc-api.azurewebsites.net) contains data about the national monuments in The Netherlands and is available as RD New, ETRS89 and WGS84.

## Implementation

We are using a PostGIS database in combination with a NestJS API. NestJS is a typescript framework based on Express.js for setting up an API project in a structured way. To connect to the database, we are using TypeORM.
Since we’ve been working on a modular front-end these past months, we decided to set up our API in a modular way as well. We want to be as flexible as possible when it comes to the data the API is serving, detaching it from any data model. With some built-in tables and queries in PostGIS, it is straightforward to know which tables are in the database, their primary keys, and their geometry columns.

## Data encodings for the output format

The API supports two output formats: GeoJSON and JSON-FG. Both have pros and cons.

### OGC API formats

The OGC API standard [does not mandate](http://docs.opengeospatial.org/is/17-069r3/17-069r3.html#_requirements_classes_for_encodings) an output format. Instead, the API specifications allow a client to request the supported encodings. However, they give examples of HTML, GeoJSON, as these are the recommended encodings for the data. HTML is suggested as a human-readable and search engine indexable format.

### Coupling of encoding and CRS

GeoJSON does not contain CRS, according to its official specifications. The CRS is either assumed (WGS84 - EPSG:4326) or provided externally. If an API or an online service provides the data to the user, the CRS can be added to a header or coupled in a parameter in the URL. However, GIS analyses often rely on offline or desktop solutions. By using a GeoJSON in an offline solution, we can lose track of the intended CRS of the data and risk overwriting it with another CRS.
However, there are GeoJSON that have a CRS defined, usually created with GIS desktop software. They are considered non-standardized GeoJSON, as only the GIS software can read them.

### GeoJSON

GeoJSON is a de-facto standard in web GIS. From all the big web mapping libraries, like Leaflet, OpenLayers, and D3, to web GIS suppliers, like Google Maps, HERE, and MapBox, GeoJSON is used by default. Our demo client is also built around GeoJSON, making it an obvious choice for implementation.

### JSON-FG format

The JSON-FG is an enrichment yet unimplemented version of GeoJSON. It adds new functionalities that were not available in his predecessors, like new geometry type, temporal support, and CRS in the output file.

### Best practices

Best practices for choosing an encoding.

> Choose an encoding that is supported by your intended audience

> Choose an encoding that can store the projection for offline usage

## Reprojection

The OGC API specifications allow for two relevant endpoints. It is possible to either request the native or other CRS. When data is requested, a projection needs to be specified. In our setup, reprojection is done by the PostGIS database. We use PostGIS is to take advantage of the list of projects already set up. However, this might make the navigation in the API a bit harder for non-experient users.
From a technological standpoint, it is not feasible to support all the CRS’s, by ourselves. On one hand, it would increase the time-money spent on maintenance, on the other hand, there are already instruments capable of supporting CRS, so it would be unnecessary.

### Best practices

Best practices for CRS support in the API

> Limit the number of supported CRS’ses for clarity

> Only support CRS’ses that make sense for the data. If a CRS doesn't cover the data, do not support it.

### Caching and performance

To increase the performance of the API, the reprojection is done by the PostGIS database, which - in our setup - gives better performance than loading the database from storage into the API, reprojecting the data there, and then serving the data to the client. As usual, performance is tightly coupled with the chosen implementation and deployment configuration.  
Depending on the storage format, it may or may not be possible to let a fast implementation like a database handle the reprojection. When supporting multiple CRS’ses through the API, it is recommended to have a mechanism in place to do the conversion. Many programming languages support libraries that can handle this. Since geographic data can be large and complex, it is recommended to cache the converted data for reuse by another client, or the same client at a later time. This eliminates the need of reprojecting the same data more than once.

## Implementation findings

While building the API, the following observations were made.

### Routes

The proposed API routes are easy to use. They fit a well-structured API implementation.

### Landing page

The landing page contains the available routes of the API. This is the first endpoint where we see the usage of Links.

#### Findings

1. Self-links are link collections that traditionally require a 'self' link reference. We consider this to be unnecessary because the response type and title are already known.
1. Link-hrefs must contain an absolute URL. We created a domain-independent application so that we could use relative paths. This is quite a common practice in the current API definition.

### Conformance finding

The conformance links seem to come out of nowhere. These links are nowhere to be found. Are there more than the ones listed as an example in the documentation of the conformance endpoint? And what does the API need to implement to be able to list each conformance. It would be very handy to have this information available.
The OAS30 link also refers to a 'NotFound' page.

### Collections

The collections’ endpoint is a catalog of available featureCollections. We chose the JSON-link approach to indicate the available CRS transformations. We refer to them as individual collections. The CRS lists bring us to our next findings:

#### Finding

In contrast to using the proposed ‘URL-identification’ as proposed in the specs, we decided to use the integer values of the EPSG. This is a more straightforward approach and less prone to errors because it requires a smaller parameter in the URL: ?CRS=4326 instead of CRS=http://www.opengis.net/def/crs/EPSG/0/4326.

#### Finding

Since PostGIS provides a large amount of OCG CRS’ses, it is a bit impractical to send a list with all of them. However, it could be an idea to set up an endpoint for serving available CRS’ses

### Items

For the items’ endpoint, we chose a GeoJson response, similar to the GeoServer implementation. Not only it gives versatility to the requested data by allowing it to fit as a GeoJson, but also it fits in our application.
Because we are using a Postgres/PostGIS database, we are able to easily calculate some metrics that can give extra information to the user, without causing extra pressure on the performance of the API. For that reason, we created numberMatched, numberReturned, and totalFeatures properties in the API.
The inclusion of the ‘paging’-links in the resulting output is also very useful. Consumers of the API can then easily traverse through the pages of results by utilizing these links.

### Filters

We also implemented straightforward and self-explanatory filters, like bounding box, limit/startIndex and, property filters (e.g. ?status=open, where a feature with property status can be filtered).

### Specific items

Users can request items according to the REST principle. Further down the road, we can develop other operations in the API, like PUT and DELETE requests.

## Content-negotiation

Clients provide their requests to servers, and they give a reply back. Traditionally, browser headers (client-side) manage content-negotiation. However, the proposed way of content-negotiation through query params or URL extensions is more common.
Content-negotiation through headers already has some known limitations and drawbacks. These do not appear when using the proposed way of negotiation. In the end, query params are simpler to use and standard practice in API development.
Implementing both is possible yet not advisable. There are far too many choices to have in consideration. Moreover, one always has prevalence over the other. For that reason, we prefer to use the query params.

### Conclusion

The implementation of the core features of the API was very straightforward and done according to both OGC Standards and API common development. The challenges were in connecting the API to the database and retrieving data from there.
The challenges were in mapping the CRS’s nomenclature that PostGIS and OGC use. Both use different naming for the CRS’ses: PostGIS uses EPSG: and OGC uses a name. Without a proper guide, this can get very confusing at times.
When supporting a multitude of transformations, the response message could become enormous. For that reason, the solution might be separating the available transformation on a different endpoint.
When it comes to content negotiation, query-params are the most suitable option. It is easier to implement and does not have the drawbacks of the traditional browser header negotiation.
From a web developer’s perspective, this API approach makes more sense than the traditional WFS implementation. The decoupling of WFS constructions makes this API easier for non-GIS developers to use.

## License

[<img src="https://www.gnu.org/graphics/gplv3-with-text-136x68.png">](https://www.gnu.org/licenses/gpl-3.0.html)
