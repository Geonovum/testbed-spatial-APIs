# Introduction

This report describes research work carried out as part of Geonovum's Spatial Data APIs Testbed project, which ran from September to December 2021.  The project involved five research topics: this report describes Topic 5 "Simple/linked data encodings for spatial data APIs".   

The goals of the topic were:

* exploring the applicability of lighter formats (specifically, JSON) for the publication of geospatial
data.
* experimenting with the use of semantically enabled data - focusing the use of the JSON-LD spec in
combination with geodata in JSON, and the added value of the output.

Swirrl's approach to this task was influenced by the kind of work the company carries out for government organisations, addressing a range of data integration and data dissemination challenges.  Data analysis in government often involves comparing and connecting data from different sources, typically from different departments of a large organisation or from separate organisations.  Typical ‘enterprise’ approaches to data integration are often unsuitable when working across organisation boundaries in this way.

This has led Swirrl to apply the Linked Data approach, exploiting web standards and the globally-scoped identifiers that are typically used in RDF and Linked Data.  For background to what Linked Data involves, see Tim Berners-Lee's [original note](https://www.w3.org/DesignIssues/LinkedData.html) and the [W3C summary page](https://www.w3.org/standards/semanticweb/data). 

Often spatial data is an important element of these data integration and data analysis activities and there is a need to combine spatial and non-spatial data to get a complete picture.  In the past GIS systems and GIS specialists have operated largely independently of web-based data and that group of specialists.  While GIS systems can hold non-spatial properties of ‘spatial things’ and linked data can hold spatial data about the ‘resources’ of interest, each approach has its own strengths and weaknesses and so the best approach to data management and exploitation involved elements of both.  Finding ways to bring together these two communities of users was one of the main objectives of the OGC/W3C Spatial Data on the Web Working Group.

Swirrl’s work with the English Environment Agency (‘EA’) has a particularly strong spatial element to it and the ability to connect spatial and linked data is an area of keen interest to the EA. 

The approach taken in the new set of OGC APIs, and in particular the OGC API Features, seems to offer new opportunities for effective integration of spatial and investigating the potential of this is at the core of this piece of work.

Data integration becomes a lot easier when different data collections share common well-managed reference data. The ability to re-use or refer to definitive data also reduces duplication of effort and makes for more reliable data management. In general a resource-centric or feature-centric approach is more flexible than a ‘layer-centric’ approach typical of many GIS applications.  It is useful to be able to ‘slice’ data in many different ways.

The OGC API Features allows fine-grained addressing and retrieval of data about spatial things.  However not all data relevant to a feature or spatial thing can sensibly be managed as part of a single API, so the ability to link both ways between a Features API endpoint and other data sources, whether linked data or other spatial APIs, will be very useful.

Many of the existing applications that Swirrl operates for the EA are based around a collection of data held as RDF in a triple store.  The potential to offer the OGC API Features as another option for accessing data in this form is attractive. It would of course be possible to transform data from RDF into another format and store it in a different way, but the possibility of using the RDF data directly is attractive and one of the things we have investigated here.

How best to link from one data collection to another was another aspect of the research: whether using existing aspects of Features API or enhancing the responses with JSON-LD.


# Objectives

The main objective of the work was to investigate how the OGC API, perhaps with extensions, could contribute to improving the interoperability of spatial and linked data.

In the context of the Environment Agency's data, much of it is already available and managed as RDF and used to support a range of data access applications. The ability to access this data via the OGC API Features would be a valuable addition to the options available to users but ideally this would be achieved without adding to the burden of data management.  If the OGC API Features could be provided from the same data sources that support the existing Linked Data applications, then that would avoid adding to the data update processes and reduces the risk of different data access options becoming inconsistent or 'out of sync'.

So our first objective was to investigate how we could support the OGC API Features on top of existing RDF databases.

At the heart of Linked Data is of course the importance of links between items.  Many of the properties of a thing are expressed as a relationship between that  and some other thing, where all things of interest are assigned URIs as identifiers.  A secondary objective was to see how these linking aspects could be supported using the OGC API Features.

One option for a possible extension to the standard API would be to use [JSON-LD](https://www.w3.org/TR/json-ld11/) instead of the standard (Geo)JSON responses.  JSON-LD is a JSON-based format for representing linked data. If this could be used to provide a data representation that satisfies the OGC API Features specification and works with clients, but can provide additional detail about a resource for those who want it, then that could potentially be a powerful approach.  An objective of the work was to investigate this possibility.



# Test data

Four datasets were selected from data created by the English Environment Agency to test the approach and provide real use cases for linking data together.

The datasets are available to download as compressed n-triples files from an Amazon S3 bucket: s3://swirrl-ogc-api-test-data/

## Ecology monitoring sites

This dataset contains monitoring sites where samples are taken to assess the population of invertebrates, diatoms and macrophytes. (These are managed in an Environment Agency system called 'Biosys'). The monitoring sites and associated data can be explored via a [web application](https://environment.data.gov.uk/ecology/explorer/).

Each monitoring site has a point geometry.  Each monitoring site is associated with a Water Body, one of the other collections of data selected for testing.

[Download](https://swirrl-ogc-api-test-data.s3.eu-west-2.amazonaws.com/biosys-sites.nt.gz)


## Embankments

These represent flood defence embankments,  a subset of a larger dataset of flood defence assets managed by the Environment Agency.  These have a line geometry.

There is an interactive application for exploring and viewing the collection of flood defence assets at https://environment.data.gov.uk/asset-management/index.html.  Also individual assets have their own web page (eg https://environment.data.gov.uk/asset-management/id/asset/110912 and various machine-readable representations of their RDF description, eg https://environment.data.gov.uk/asset-management/id/asset/110912.ttl)

[Download](https://swirrl-ogc-api-test-data.s3.eu-west-2.amazonaws.com/embankments.nt.gz)

## Water bodies

Water bodies are a set of polygons used for monitoring, managing and reporting on the state of the countries water environment. Each has a polygon geometry.  The water bodies are a way of breaking down physical catchment areas into smaller units.

[Download](https://swirrl-ogc-api-test-data.s3.eu-west-2.amazonaws.com/waterbodies.nt.gz)

## Local authorities

This collection is the set of local government districts in England. Some of the responsibilities for environmental management and flood defence fall to local authorities and a common use case is the need to break down national datasets by local authority.  Each has a polygon or multi-polygon geometry.

[Download](https://swirrl-ogc-api-test-data.s3.eu-west-2.amazonaws.com/local-authorities.nt.gz)


# Implementing the OGC API Features with RDF and Geosparql

The existing applications that make use of the test data require it to be accessible via SPARQL and the data is managed in a 'triple store' database.  

Our basic approach to implementing the OGC API was to write SPARQL queries that retrieved the necessary data, then format that into OGC-compliant API responses using a web application, written in the Clojure programming language.

Retrieving features within a bounding box is an important method of the Features API. To implement this we used the [GeoSPARQL functions](https://www.ogc.org/standards/geosparql) that the OGC defined to add a spatial data querying capability to SPARQL.

The geometries of items in the test data was already represented using the [GeoSPARQL ontology](https://opengeospatial.github.io/ogc-geosparql/geosparql11/index.html) and so was already in the structure expected by GeoSPARQL queries.

We tested a range of triple stores with implementations of Geosparql and settled on [GeoSPARQL Fuseki](https://jena.apache.org/documentation/geosparql/geosparql-fuseki), part of the Apache Jena project.  GeoSPARQL Fuseki and Apache Jena are open source, which meant that together with this open source implementation of the OGC API meant that the entire software stack could be open source.  Also, GeoSPARQL Fuseki has a [GeoSPARQL implementation](https://jena.apache.org/documentation/geosparql/) that is complete and compliant with the GeoSPARQL standard.  Also it is easy to install and configure, and initial testing showed that it's performance was satisfactory with the sizes of test datasets we were using.

A GeoSPARQL query was written for each collection, selecting items according to their `rdf:type` and returning the properties of items in that collection to be returned in the API response.  The spatial function `<http://jena.apache.org/spatial#intersectsBox>` was used to select items within a bounding box.  The query templates for each of the four selected data collections can be seen in the source code [here](https://github.com/Swirrl/ogc-api-prototype/tree/main/src/ogc_api/data/queries).  Currently only a small representative subset of all properties of each item are retrieved and included in the API responses but it would be trivial to extend this to return a larger or fully comprehensive version of the data.

The full source code for the implementation is available from https://github.com/Swirrl/ogc-api-prototype and includes basic instructions on how to install and run the code. 


# Linked Data and the OGC API Features

In the context of providing useful access to multiple collections of data through multiple access methods or formats, there are typically two main kinds of link which is useful to make:

* to alternative views or representations of the same item
* to related data items

## Alternative representations

In our context, we are interested in two main representations of data items: the OGC API Features view and the RDF view (or potentially a page of a web application designed to give a user-friendly presentation of the RDF version of the data).

Because the data we are using is represented as RDF, each item of interest has an identifier in the form of a URI.  In general this will be different to the URL of the OGC API method to return data about that item.  In our test data for example, the embankment with URI `http://environment.data.gov.uk/asset-management/id/asset/110912` is available through the API as `https://geonovum-staging.publishmydata.com/collections/Embankment/items/110912`.

The conventions of Linked Data mean that it is possible to directly dereference the identifier of the item to get information about it.  This dereferencing supports content negotiation so you can ask for it in different formats, for example as a web page: `https://environment.data.gov.uk/asset-management/id/asset/110912.html` or in Turtle format: `https://environment.data.gov.uk/asset-management/id/asset/110912.ttl`.

In this case there is also an option to view this asset in the context of a web application designed for exploring the whole collection of flood defence assets:

[https://environment.data.gov.uk/asset-management/index.html?element=http%3A%2F%2Fenvironment.data.gov.uk%2Fasset-management%2Fid%2Fasset%2F110912](https://environment.data.gov.uk/asset-management/index.html?element=http%3A%2F%2Fenvironment.data.gov.uk%2Fasset-management%2Fid%2Fasset%2F110912).

In general we want to support users in discovering and using the various options available.  It would be straightforward to add another property to the RDF representation of the data that links to the OGC API URL for the corresponding item, using some appropriate RDF property - that could be something generic such as `rdfs:seeAlso` but it would probably be more informative to coin a new specific property to be clear that it is linking to an OGC API Features version of the item.

When linking from the OGC API Features representation to the RDF representation, there are a number of options. 

The OGC API Features standard includes a `links` element based on HTTP Link Headers and using the [IANA registry of link types](https://www.iana.org/assignments/link-relations/link-relations.xhtml).  

Given that each item in the API typically corresponds to a Spatial Thing, in our case with a persistent globally scoped identifier in the form of a URI, we could use the `about` relation in the links section to provide the URI of the item in question.  (One question to investigate here is that the OGC spec requires the inclusion of a `type` for each link, corresponding to the HTTP content-type.  The RDF identifier of a resource is typically agnostic about content-type and multiple representations are often available. A pragmatic solution could be to link to a particular representation of the RDF identifier, eg the HTML version or a JSON-LD version and use a matching content-type).

Another possibility would be to include the URI of the item as the value of one of the properties returned in the item description.  There is already an `id` property that refers to the {featureId} section of the API URL pattern `https://{domain}/collections/{collectionId}/items/{featureId}` , so some other property would be required.  It would be preferable if a convention or standard could be established for a consistent property to be used for this purpose, but any obviously named property could serve the purpose.

This is one area where JSON-LD has built in facilities which could be used. Adding a @context element to the OGC API responses would allow the use of JSON-LD to add richer information to the response. However updating the OGC API to use JSON-LD rather than just JSON has some significant implications that have pros and cons.  JSON-LD is a JSON-compatible syntax for RDF, so by making the OGC API responses JSON-LD, it becomes an RDF API, even if it is possible for clients to interpret it as regular JSON and choose to ignore the extra information provided. 

Getting the benefit of the extra RDF information requires client software or developers to be able to process and use the RDF.  There are potential benefits in having a single API response that can be interpreted as OGC API Features compliant and also be interpretable as RDF - one API could serve a broader range of interests. There are likely to be some situations where the compatibility breaks down but we have not yet investigated deeply enough to identify specific problems.

However in our situation, we already have options for providing data as RDF, so using the OGC API to deliver RDF responses is duplicating something that is already available.  We want to support a broader range of users and applications by providing the OGC API Features, and we want users to be aware of and easily discover connections from one view of the data to another.  But that does not mean that one single API implementation has to solve all use cases.

Our current view is that it is better to have separate access options, each optimised for a particular set of users, but all working on a common set of underlying data.  That way the data management is efficient and reliable but we can deliver access the data in a wide variety of ways to suit different use cases. 

And for the specific question of how to relate the API response for a particular item to the RDF representation of it, our preferred approach is to use the links section of the API response and have a `rel: about` link which provides the URI of the resource which is described by the API response.


## Related items

The other key aspect of linking is to link one item to other related items.  There is already a `rel: collection` link in the standard API response, relating an item to the collection that contains it.  But in the description of an item we often find that it is useful to provide further links.

Explicit representation of geographical hierarchy or containment relationships are often useful. Although these can be computed from geospatial analysis of the geometry of different features, knowing for example that a monitoring site is within a particular water body, or a flood defence asset is in a particular local authority allow for easy and more efficient filtering of data to answer common questions.  

Another common example is relating an item to organisational information: which organisation is responsible for maintaining a flood defence for example.  

Event-related data is another widely occurring example.  The broader data collections from which our examples are drawn also include sets of measurements made at monitoring sites - where some set of observations of properties of interest are recorded at a particular time.  The flood defence assets are related to series of maintenance activities that have been carried out in the past or are planned in the future.  It does not generally make sense to try to represent all this information directly as properties of the spatial thing, but rather to link to other resources that can organise the relevant information in an easy to access way. 

Not all types of data are appropriate for representation in the OGC API Features.  If there is no spatial element to a resource then it probably does not make sense to use the Features API.  Or if the focus is on retrieving subsets of observation data, then other APIs may be more appropriate.

The OGC Environmental Data Retrieval API is closely related to the Features API and may be a good solution in the case of collections of observation or sampling data.

Whether or not the related item is available in a Features API collection, there are two main options for managing the link information: either in the links section of the API response or as the value for a particular property.

A limitation of the links section is the need to use an IANA standard relationship type.  For this case the `related` property is probably the most appropriate, but provides very little information on the nature of the relationship.  

Including the link to an external item as the value of a property is much more flexible.  The pure JSON approach means that these properties are named just using strings and some external documentation may be needed to fully define what they mean.  A potential advantage of the JSON-LD option described above is that properties can be associated with URIs so that the mechanisms of the RDF set of standards can be used for defining individual terms and their broader data models.

In our proof of concept implementation we have experimented with both approaches to linking to other items.  Our preferred approach is to use the value of a property in the main API response.



# Hosted endpoint

The API implementation and test data is hosted at: 

https://geonovum.publishmydata.com/

(Note that a browser extension that formats JSON in a more readable way makes it easier to view and understand the API responses: for example this one for Chrome: https://chrome.google.com/webstore/detail/json-formatter/bcjindcccaagfpapjjmafapmmgkkhgoa)

# Testing and compliance

The API has been tested against the [OGC API - Features Conformance Test Suite](https://cite.ogc.org/teamengine/about/ogcapi-features-1.0/1.0/site/).  The most important tests pass but there are still some test failures with the current state of the implementation.

TODO: check and document which tests from the OGC test suite still fail.

The demo application (described below) uses Leaflet, building on the simple example client available at https://github.com/opengeospatial/ogcapi-features/blob/master/implementations/clients/leaflet.md. It shows that the API responses can be correctly interpreted by a library expecting geojson.

We have also successfully tested the API with QGIS, using the QGIS feature to import a layer from an OGC API Features endpoint - see https://docs.qgis.org/3.16/en/docs/user_manual/working_with_ogc/ogc_client_support.html#wfs-and-wfs-t-client .



# Example application

We have developed a simple web application that makes calls to the API and displays the results on a web map, using the Leaflet.js library.  The demo is hosted at:

https://geonovum.publishmydata.com/demo/map.html

It uses the bbox method to retrieve the data contained in the current viewport of the map.  It is currently set to retrieve a maximum of 100 features from a collection within the bounding box, to avoid attempting to load too much data into the browser, so when the map is fully zoomed out, only a subset of features are drawn. (Trying to draw all features from some collections can lead to the browser running out of memory).

As well as demonstrating how the API can be called and the results displayed, the application provides a simple illustration of the approach to linking that we have been investigating.

Clicking on a feature on the map brings up a pop-up with a link to the OGC API item and in some cases a link to another related item, whether part of another collection in the API endpoint (for example the Biosys monitoring sites link to the waterbody that contains them) or to an external link (the waterbodies on the map link to an external web page about the catchment they form part of).

The source code for the demo application can be seen at: https://github.com/Swirrl/ogc-api-prototype/tree/main/demo

# Further work

This report describes work that was carried out in a relatively short research project, so limiting the amount of work that could be done and raising many questions that could benefit from further investigation.  Some specific items which we intend to investigate after the end of the project include:

* further refining the API implementation to achieve full compliance with the validation test suite
* implementing examples of JSON-LD contexts to test our assumptions about it
* updating RDF representations of data to link to the OGC API as another useful option for data access
* implementing a more general approach to configuring a new collection, so that it can be added via a configuration file rather than requiring recompilation of the API code.



# Conclusions

Our main conclusions from the work are:

* for a collection of Linked Data with a spatial aspect, the OGC API Features offers an additional mode of access that is easy to use and compatible with existing map and GIS tools
* it was relatively straightforward to implement a version of the API that runs directly from the triple store where the Linked Data was already stored, using the open standard SPARQL query language with GeoSPARQL extensions.
* Both the OGC API Features and RDF have their strengths - the most valuable option for users is to provide both, making connections between the two views of the data where appropriate.
* We considered a JSON-LD based approach which would in effect combine the OGC API and the RDF versions of data into a single response.  This has some potential that merits further investigation, but our initial conclusion is that rather than trying to have one solution that does everything, it may be easier for users to offer both approaches, providing consistent and compatible results but in different formats and with different querying options, and let users decide which is best suited to their application and toolset.



