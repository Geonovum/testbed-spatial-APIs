# Topic 2: Spatial data APIs Discovery
## Content
This document contains the main report of the topic 2 project. It also doucments references to its outputs, namely.

* Model and Application Schema documentation outputs (Enterprise Architect / MS Word)
* IHO Feature Catalogue construction and detailed description (XML)
* pygeoapi setup instructions and configuration files (JSON, YAML)
* tinyDB Catalogue (geoJSON + scripts for their creation)
* Miscellaneous data manipulation tools (miscellaneous formats, python and jar libraries)
* Documents, presentations and other notes from the project including all public briefing presentations. [here](docs/)


## Background 
This folder contains working drafts, test data and results/reports of the topic 2. The aim of topic 2 is "...to make a collection of spatial data discoverable (i.e. FAIR Findable) on the web, using OGC API standards, and to report on how this can best be done..." - Topic 2 is concerned with data which originates in the marine domain and which is (normally) conformant with the framework of standards defined by the Internaitonal Hydrographic Organization. There are a number of objectives (detailed below) and various outputs which have been produced throughout the research.

## Our Scope
This topic takes place in the marine domain, specifically in waters mainly (but not exclusively) governed, managed and mapped by hydrographic agencies and using standards which are defined by the International Hydrographic Organization (IHO). Specifically, our topic looks at how existing/emerging international standards can be leveraged using OGC API methodologies, OGC API Records:

The main objectives of the research are: 
* Demonstrate how IHO S-100 marine data can be discovered using existing OGC API methodologies and the ISO 19115 metadata embedded in S-100 datasets and service discovery metadata within ISO S-128.
* Setup a testbed for a region with multiple S-100 datasets and service definitions in S-128 and provide dataset discoverability services using OGC API methodologies.
* Feedback to the OGC community, primarily through OGC MDWG, and IHO, through the upcoming revision to S-100 (edition 5.0.0) on any modifications to the standards base to more easily enable interoperability between the two frameworks.
* Produce a documented initial approach detailing how the discoverability elements can be used as a prototype to develop full OGC/IHO interoperability and the potential for such interoperability.


## Problem Statement.
IHO S-100 provides an overall methodology and set of component standards for modelling and encoding all types of marine phenomena. It is the culmentaiton of many years effort by the hydrographic community and is approaching edition 5.0.0, intended for live implementation on commercial vessel bridges satisfying international regulatory standards and for primary navigation of verssels.
S-100 implements or profiles many of the ISO19100 series of standards, with the intention of increasing interoperability for the many international hydrographic offices needing to produce data serving broader purposes.
Traditionally most HOs worldwide have produced data to serve the goal of primary navigation but many case studies have highlighted the immense value of marine geospatial data.
Findability of marine geospatial data from these organisations remains bespoke and relatively under-standardised. Within the core market and user base for data individual use cases have been implemented for discoverability but interoperability is low between implementers in regions and little standardisation has been explored.

### S-57 data
S-57 electronic chart data is distributed with a basic aggregation methodology, thus:

![image](https://user-images.githubusercontent.com/3368156/144290302-fc877b69-438f-432c-99f1-b5d6078025f7.png)

Data is catalogued by a single file, CATALOG.031, encoded in ISO811 format (the same format used to encode charts themselves). The vast majority of such data is distributed to vessels for primary navigation under SOLAS and broader uses tend to be of individual feature layers, disaggregated and turned into various different formats with varying degrees of lossy transformations.

The concept of “service” as the sum total of all possible datasets also exists due to the IMO requirement for maintenance of a revision record on every vessel. Service metadata is defined by a single CSV file delivered with all distributed datasets, PRODUCTS. TXT

![image](https://user-images.githubusercontent.com/3368156/144290330-a111b50b-9a26-41f7-96e7-63b9d18f9133.png)

Ultimately, therefore there are a number of sources of individual feature, dataset and service metadata within the standards. “Coverage” has a very specific meaning in all IHO standards. S-57 (and to some extent, S-100) define it as a 2-D polygon where data coverage exists and it is included in most datasets as a feature in its right (validation tests exclude features which lie outside coverage areas). In S-57, in order to create datasets with rectangular (angular rectangular) extents, coverage is extended with areas of “no data available” (this has been dispensed with in the newer S-101 ENC equivalent S-100 product specification. Indeed, it is this coverage, together with a dataset’s Compilation Scale, that form a high priority metadata item across services.
Charts are updateable. One of the significant differences between S-57, S-100 and other vector formats is the rigorous incremental update method it encapsulates. 
This update method allows for incremental updating of features, attributes, and the topological structure of which its geometry is made. The model is one of simple Add/Delete and Modify instructions encoded as sequences of update instructions in discrete updates. This creates some metadata challenges though as a dataset’s “issue date” can be sometimes interpreted as the date of the major edition issue or the latest update. S-57 has evolved a dedicated process for describing the process, which has been (at least partly) inherited by S-101.

## Metadata and S-100.
Due to the relatively rudimentary metadata specification in the existing S-57 standard, S-100 implemented an ISO19115 conformant metadata profile, which is, in turn implemented by each of the S-100 component product specifications.

Metadata in the S-100 framework is described in a far more standardised form but its broader uses and service metadata has not received any formal treatment from an interoperability perspective. Although XML data describing aggregates of cells 

S-100 has a dedicated part devoted to metadata (Part 4, currently undergoing substantial revision for S-100 edition 5.0.0, due for release in 2022). This Part essentially profiles the ISO19115 approach (like many other metadata framework) by establishing a core set of “fields” (i.e. data) which are (largely) drawn from datasets using the framework and then providing an encoding of said data fields alongside the datasets themselves. Like some other domains, S-100 also provides a mechanism for extending metadata models for individual product specifications with different XML Schemas representing each product specification..

The UML model for the S-100 metadata model is shown in the diagram below
![image](https://user-images.githubusercontent.com/3368156/144290277-e1c4cf14-7c10-445a-8b68-6c3de74f31cb.png)

An example of dataset discovery metadata is
```xml
<DatasetDiscoveryMetadata>
  <fileName></fileName>
</DatasetDiscoveryMetadata>
```
S-100, as a framework standard, defines a number of product specifications, all of which have their own XML Feature Catalogue. 
[TODO: Feature Catalogue and example]

## Our approach
Traditionally metadata is defined as “metadata about data”. There are, essentially, two “data” models in S-100 then. The first is the S-100 General Feature model (GFM). This is how S-100 expresses “data” within its domain. Drawing heavily from ISO19100 and allied standards, the S-100 GFM provides a way of encoding marine phenomena in a structure defined within the framework’s parameters. These structures encode the entities, attributes and relationships from UML-based Application Schemas into  In practice, arbitrarily complex structures can be formulated to describe such phenomena, all instances of the S-100 GFM.
The second “data” model is the metadata model, as defined in the previous section. This is also UML based but has a separate XML encoding drawn from the ISO model templates and using many of the ISO XML schemas.

The challenge of the research, then, is twofold
* To develop a way of representing IHO "data" content in a way which can be used in OGC API implementations
* To appraise the S-100 (and S-57) metadata representations in an OGC API context.

In order to approach these challenges realistically some examples have been drawn from the many IHO standards availablem namely:
* IHO S-128 which is the only IHO product specification representing "metadata" of any kind. S-128 represents service metadata for a service provider with multiple different products included, data coverage and times/dates of release and update.
* IHO S-57 (and S-101). The most ubiquitous of all IHO product specificaitons, S-57 is the standard for electronic charts and a mandated standard for Coastal states under the IMO SOLAS convention. 
* IHO S-100 product specifications, S-111 and S-102 - these product specifications represent mature developed product specifications under the IHO's S-100 framework and have well-evolved metadata models within their defined standards.

The “OGC API” family of standards has evolved from a long period of user consultation rationalising many of the perceived shortcomings of the (very) prescriptive W*S standards of the previous generation. OGC API provides an “essentially” content neutral model for defining (using OAS) “content” and webservices to access it. To date, no robust mapping from the S-100 GFM has been made to OGC API / OAS. Although not technically "difficult" the two models remain fairly distant from each other in a number of domains and a structured approach which can be reused for multiple IHO use cases is still challengin.

The crucial observation within the reseafch presented here is that the OGC API methodology is what is extended for the construction of metadata using OGC API Records. OGC API Records is another OGC API type, just like the data it describes. There are more mandatory fields but the structure is essentially the same.

From this observation an approach for S-100 begins to emerge. If a single mapping from IHO to OGC API is required then metadata can also be covered within that. Using the S-100 GFM a model for metadata which mirrors the OGC API Records structure (essentially, itself, an ISO19115 profile) can be built and extended for each product specification as required. This is the approach the research project has taken to address the core problem of expressing IHO data in structured OGC API Records.

The other major advancement with this research process has been an initial survey of how to convert data representing an instance of the S-100 General Feature Model to a representation compatible with OGC API standards. OGC API standards are very general and "content neutral" in the extreme but a family/profile can be drawn based on the constraints documented in S-100.

## Explanation of research project stages.
The discrete steps taken were:
1. The construction of a UML model using IHO encoding practices describing OGC API Records “content” and types.
2.	Mapping of existing IHO metadata structures into the OGC API Records features generated. Bespoke extensions have been accommodated in the model for existing S-57 charts, S-102 Dense Bathymetry, S-111 Surface currents and S-104 Water Levels.
3.	Derivation of the model into component XML Feature Catalogue elements and realisation of abstract types and relationships within it. 
4.	Use of feature catalogue to construct, programmatically, features representing each OGC API Record for a number of domains. The domains chosen were.
*	Electronic Chart Data in S-57 format for US and the Netherlands
* Surface current datasets conforming to IHO S-111 from NOAA
5. Construction of test datasets conforming to the feature catalogue record structure and located in a cloud server in an open database schema
6. Aggregation of metadata records and exposure in OGC API Records form using pygeoapi for OGC API Records. This involves the construction of OGC API Records encodings in geojson encapsulated in tinydb catalogue entries. 
7.	Testing using pygeoapi server, GIS and programmatically
8.	Writing up results (this document)

## First implementation - S-128 data structures.
The first implementation of the research surrounds 
[TODO]


## Second implementation - S-57 and S-111 data structures.

## Third implementation - full S-57/S-100 metadata record creation.

## Other outputs
In arriving at these results a number of “interesting” byproducts have also been generated…
1.	A mapping of IHO feature data to a generic geoJSON encapsulation which can be used for a data structure template mapping IHO GFM to OAS specifications. 
2.	Mappings from existing IHO file formats have been accomplished. These map from S-57 PRODUCTS.TXT Service Metadata and also individually harvest data from unencrypted S-57 charts (kindly released by the Netherlands HO for the project). 
3.	S-128 mappings have been produced which conform to the existing S-128 prodict specification. These use the S-128 feature model and translate to OAS conformant data structures which can be seamlessly embedded in OGC API.

## Model created for OGC API Records

[TODO]
![image](https://user-images.githubusercontent.com/3368156/144290230-c436eff0-f0b8-402c-8b66-89531cf30830.png)

## Feature Catalogue for OGC API Records.

[TODO]

## Mapping from IHO Fields to OGC API Records

[TODO]
![image](https://user-images.githubusercontent.com/3368156/144292136-f1b853e2-20f5-40fe-aaf3-a686c8f70cd3.png)

