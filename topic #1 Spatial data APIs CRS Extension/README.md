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

For [the live demo](https://geoservice-ogc-api.azurewebsites.net) of the API implementation, a different dataset is used. This is upon request from Geonovum, in order to make it possible for them to experiment with this data set in combination with INSPIRE standards and different CRS'ses for the data. The [live demo](https://geoservice-ogc-api.azurewebsites.net) contains data about the national monuments in The Netherlands and is available as RD New, ETRS89 and WGS84. The API endpoint for the live demo can be found [here](https://geoservice-ogc-api.azurewebsites.net/api).

## Implementation

We are using a PostGIS database in combination with a NestJS API. NestJS is a typescript framework based on Express.js for setting up an API project in a structured way. To connect to the database, we are using TypeORM.
Since we’ve been working on a modular front-end these past months, we decided to set up our API in a modular way as well. We want to be as flexible as possible when it comes to the data the API is serving, detaching it from any data model. With some built-in tables and queries in PostGIS, it is straightforward to know which tables are in the database, their primary keys, and their geometry columns.

## Data encodings for the output format

The API supports two output formats: GeoJSON and JSON-FG. Both have pros and cons. The demo website includes more, but those are all derived by the viewer from GeoJSON.

### OGC API formats

The OGC API standard [does not mandate](http://docs.opengeospatial.org/is/17-069r3/17-069r3.html#_requirements_classes_for_encodings) an output format. Instead, the API specifications allow a client to request the supported encodings. However, they give examples of HTML, GeoJSON, as these are the recommended encodings for the data. HTML is suggested as a human-readable and search engine indexable format.

### Coupling of encoding and CRS

GeoJSON does not contain CRS support, according to its official specifications. The CRS is either assumed (WGS84 - EPSG:4326) or provided externally. If an API or an online service provides the data to the user, the CRS can be added to a request header or coupled in a parameter in the URL. However, GIS - and more general data - analyses often rely on offline or desktop solutions. By using a GeoJSON in an offline solution, we can lose track of the intended CRS of the data and risk overwriting it with another CRS.
There are GeoJSON formats that have a CRS defined, usually created with GIS desktop software. They are considered non-standardized GeoJSON or use an obsolete version of the GeoJSON specification, as only the GIS software can read them.

### GeoJSON

GeoJSON is a de-facto standard in web GIS. From all the big web mapping libraries, like Leaflet, OpenLayers, and D3, to web GIS suppliers, like Google Maps, HERE, and MapBox, GeoJSON is used by default. Our demo client is also built around GeoJSON, making it an obvious choice for implementation. When GeoJSON data is downloaded, a user can never be sure about the used CRS of the data, which is a large drawback. Also, to be completely GeoJSON compliant, data should only be returned as WGS84.

### JSON-FG format

The JSON-FG is an enriched yet unimplemented version of GeoJSON. It adds new functionalities that were not available in his predecessors, like new geometry type, temporal support, and CRS in the output file. JSON-FG has the benefit that it is based on JSON, which integrates seamlessly with Javascript frameworks for this API. On top of that, it is a fairly compact format, unlike GML for example, which uses more memory to store the same data. By explicitly storing the CRS of the data inside the file, JSON-FG makes it easier to work with the data for someone who has no prior experience with spatial data on the web, as compared to the implicit CRS of GeoJSON.

The major drawback of using JSON-FG is that the standard has not yet been finalized and this API is an early adaptor. Another, minor, drawback of the JSON-FG specification is that it is using GeoJSON as a starting point, but when a CRS other than WGS84 is chosen, the geometry is stored in the `where` element instead of the `geometry` element which is standard in GeoJSON. The `geometry` element is still present causing overhead and it's making it possible to have geometries stored in two different elements within the same specification, which can both be cumbersome to process and be confusing.

### Best practices

Best practices for choosing an encoding.

> Choose an encoding that is supported by your intended audience

> Choose an encoding that can store the projection for offline usage

> In order to remain compatible with current web clients, it is recommended to keep supporting GeoJSON at least until JSON-FG has been finalized as a standard.

## Reprojection

The OGC API specifications allow for two relevant endpoints. It is possible to either request the native or other CRS. When data is requested, a projection needs to be specified. In our setup, reprojection is done by the PostGIS database. We use PostGIS to take advantage of the list of projections already set up. However, this might make the navigation in the API a bit harder for inexperienced users.
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

1. The link collections should contain a self-link according to the specifications. However, we consider this to be unnecessary because the response type and title of this request are already known and thus this information is redundant.
1. Link-hrefs must contain an absolute URL according to the specifications. We created a domain-independent application so that we could use relative paths. This is quite a common practice in the current API definition.

### Conformance finding

The declaration of conformance class of the CORE specifications requires an API-endpoint to disclose which standards it conforms to.
The conformance links [in the documentation](http://docs.ogc.org/is/17-069r3/17-069r3.html#_declaration_of_conformance_classes) are given without introduction. It is not clear if there are more options allowed than the ones listed as an example in the documentation of the conformance endpoint. It is also not specified what the API needs to implement to be able to list each conformance. It would be very handy to have this information available. Finally, the mentioned OAS30 link also refers to a 'NotFound' page.

### Collections

The collections’ endpoint is a catalog of available featureCollections. We chose the JSON-link approach to indicate the available CRS transformations. We refer to them as individual collections. The CRS lists bring us to our next findings:

#### Finding

In contrast to using the proposed ‘URL-identification’ as proposed in the specs, we suggest to use the integer values of the EPSG. This is a more straightforward approach and less prone to errors because it requires a smaller parameter in the URL: ?CRS=4326 instead of CRS=http://www.opengis.net/def/crs/EPSG/0/4326. This also prevents confusion when one projection can be determined by multiple links, for example with http://www.opengis.net/def/crs/EPSG/0/4326 and http://www.opengis.net/def/crs/OGC/1.3/CRS84 referring to the same projection. However, the URL structure allows for more information to be transmitted about the used CRS, such as a version and the authority.

#### Finding

Since PostGIS provides a large amount of OCG CRS’ses, it is a bit impractical to send a list with all of them. However, it could be an idea to set up an endpoint for serving available CRS’ses, and referring to this endpoint when listing the CRS's.

### Items

For the items’ endpoint, we chose a GeoJSON response, similar to the GeoServer implementation. Not only it gives versatility to the requested data by allowing it to fit as a GeoJSON, but also it fits in our application.
Because we are using a Postgres/PostGIS database, we are able to easily calculate some metrics that can give extra information to the user, without causing extra pressure on the performance of the API. For that reason, we created numberMatched, numberReturned, and totalFeatures properties in the API.
The inclusion of the ‘paging’-links in the resulting output is also very useful. Consumers of the API can then easily traverse through the pages of results by utilizing these links.

### Filters

We also implemented straightforward and self-explanatory filters, like bounding box, limit/startIndex and, property filters (e.g. ?status=open, where a feature with property status can be filtered).

### Specific items

Users can request items according to the REST principle. Further down the road, we can develop other operations in the API, like PUT and DELETE requests.

### Not included specifications

In order to meet the deadline of the testbed, we have chosen not to do a full implementation of the OGC API - Features - Part 1: Core specifications, but only included what was needed for making the implementation of Part 2 possible.

The following specifications have not been implemented yet:

-   Core: Requirements class Core
-   Core: Unknown or invalid parameters
-   Core: web caching
-   Core: cors support
-   Core: encodings
-   Core: string internalization
-   Core: Link headers
-   Core: GML encoding

## Validation of the API

During the course of the testbed, the OGC published a validation tool for the OGC API - Features - Part2: Coordinate Reference Systems by Reference specifications. After the development of the API, we tried to validate the developed API against the OGC validator. In our API we are using relative links for navigation, in order to keep the API compact and make it possible to deploy it on any server or in a clustered fashion. However, the OGC Validator expects absolute links, which caused the validation to fail technically, before being able to validate the API in a meaningful way.

Upon researching this issue, we noticed that [a similar issue](https://github.com/opengeospatial/ets-ogcapi-features10/issues/180) has already been reported to the OGC, but it is still under discussion in the backlog. Therefore, within the timeframe of the Testbed, we have not been able to validate the API with the OGC Validator.

## Content-negotiation

In HTTP, [content negotiation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Content_negotiation) is the mechanism that is used for serving different representations of a resource to the same URI to help the user agent specify which representation is best suited for the user.

### Different methods

In order to specify in which representation the data needs to be returned by the server, a client needs to tell the server which format is preferred. Through REST, there are two ways for a clients to specify which format of the data it wishes to receive: request headers and URI patterns. Strictly speaking, these two methods are not interchangeable. Request headers are used to request a media type, whereas URI patterns are used to identify resources.

For a better understanding of each, we will give some examples to show the differences.

#### Request header example

The request headers are used to specify a media type. When the client is a browser that visits a website, and the website contains an image, the request headers can be used to request the same image as a PNG file or as a JPEG file. Although both have different, file format specific characteristics, the user will in the end see the same image on the website. This method is advocated by Geonovum.

#### URI pattern example

With URI pattern content negotiation, a different resource is requested from the server. These different resources can, in the end, contain the same data, but this is not necessarily the case. When we take the same example as for content negotiation, we can imagine an URI that points to an image that contains the file format in the URI. For example, we can request https://baseurl.domain/image.png and https://baseurl.domain/image.jpg and still see the same image in the browser, only in a different file format. However, we can also request https://baseurl.domain/image.txt, which doesn't return the actual image, but a text file with metadata about the image, which is a different resource all together. This method is advocated by the Open Geospatial Consortium.

### Content-negotiation for encodings and projections

When we take the information about content-negotiation into consideration and apply it to geospatial data, it forces us to think about what data is being returned, in order to be able to decide on which technique to use.

In the most common case, when using the example or requesting an image using request headers, the same will apply to geographical data: a client requests a certain feature on a certain location in a certain projection and format and this feature will be a representation of a real world object. When the same request is made, but with a different projection and/or format, the feature will still the a representation of the same real world object with mostly the same properties.

However, when we take into consideration that an API implementation of the OGC Features specification can include both WGS84 and RD New (the Dutch national grid) as a CRS, we might be tipping the scales. A feature requested in WGS84 might represent a real world object perfectly, no matter where the feature is located in the world. However, the same feature requested in RD New might be incorrect or invalid, if the real world object is outside the limitations on the CRS.

Within the geoscience field, it is obviously common knowledge that data stored within a specific CRS should adhere to the limitations of that particular CRS. The OGC API specifications are however intended to encourage the usage of spatial data outside of the geospatial domain. One can image the scenario where a Dutch national dataset is presented by the API in both RD New and WGS84 with a storage CRS of RD New for precision, in order to be able to display is properly in a desktop GIS in RD New for accuracy and for viewing online in a map viewer in WGS84 for convenience. A less informed user might be tempted to use the data in WGS84 and start manipulating or displaying it outside of the bounds of RD New, and adding features in other parts of the world. When they end up in the storage, their geometries are at best distorted, but can be completely invalid.

The former case will be the most common, but the latter case is a real possibility. Of course, we can invent all sorts of safeguards to prevent this from happening, but it shows that the nature of spatial data more closely represents the pattern of different resources, than of different media types. Therefore we support the OGC decision to implement the content-negotiation through the URI pattern.

### Additional benefits

In addition to the stated benefits, the URI pattern also makes the API more human and search engine readable, since it allows for simply browsing the available paths for different encodings and projections in the browser. This allows for greater findability of the data and to greater usage.

### Content-negotiation conclusion

Given the considerations, we recommend following the OGC method of implementing content-negotiation. Technically, it is trivial to implement either way. For existing API's or to be able to support clients that can only do request headers, it might be feasible to start supporting both methods, to allow for an upgrade period, after which only the URI pattern method will be supported.

## Conclusion

The implementation of the core features of the API was very straightforward and done according to both OGC Standards and API common development. The challenges were in connecting the API to the database and retrieving data from there.
As well as mapping the CRS’s nomenclature that PostGIS and OGC use. Both use different naming for the CRS’ses: PostGIS uses EPSG: and OGC uses a name. Without a proper guide, this can get very confusing at times.
When supporting a multitude of transformations, the response message could become enormous. For that reason, the solution might be separating the available transformation on a different endpoint.
When it comes to content negotiation, query-params are the most suitable option. It is easier to implement and does not have the drawbacks of the traditional browser header negotiation.
From a web developer’s perspective, this API approach makes more sense than the traditional WFS implementation. The decoupling of WFS constructions makes this API easier for non-GIS developers to use.

## License

[<img src="https://www.gnu.org/graphics/gplv3-with-text-136x68.png">](https://www.gnu.org/licenses/gpl-3.0.html)
