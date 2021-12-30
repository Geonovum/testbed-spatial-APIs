# Topic 2: Spatial data APIs Discovery
## Content
This document contains the main report of the topic 2 project. It also doucments references to its outputs, namely.

* Model and Application Schema documentation outputs (Enterprise Architect / MS Word) [model documentation](mdl/)
* IHO Feature Catalogue construction and detailed description (XML) [feature catalogue](mdl/FC)
* pygeoapi setup instructions and configuration files (JSON, YAML) [setup](setup)
* tinyDB Catalogue (geoJSON + scripts for their creation) [setup](setup/tests/data/nl/)
* Miscellaneous data manipulation tools (miscellaneous formats, python and jar libraries)
* Documents, presentations and other notes from the project including all public briefing presentations [here](docs/).


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

Findability of marine geospatial data from these organisations remains bespoke and relatively under-standardised. Within the core market and user base for data individual use cases have been implemented for discoverability but interoperability is low between implementers in different regions and little standardisation has been explored from a technical perspective. 

Much effort and activity has been focused on broader uses through the IHO's own MSDI working group (MSDIWG) but this has focused on building capacity rather than technical means of achieving interoperability. As a result, most IHO implementers have developed a broad range of solutions for MSDI deployment and data promulgation with a large disparity of standards, encodings and formats in use.

### S-57 data

The primary output of most IHO data producers is the electronic navigational chart (ENC). An ENC is a vector based format, designed specifically for the purpose of narine navigation of large, SOLAS class vessels. It is the result of many years of standardisation globally and is a comprehensive standard encompassing 180 different feature classes and their respective attributes. S-57 has long been identified as a central cartographic asset with many broader uses other than navigation. Many data producers disaggregate the component features from the S-57 chart and form value added datasets in order to allow access to individual feature classes such as:
* Bathymetric data, soundings and depth areas
* Coastline, Shoreline Constructions and Land Areas
* Wrecks, Obstructions and Hazards
* Aids to Navigation
* Maritime Limits and Boundaries

The end result of many years of cooperation with organisations under the IMO, ENC is accepted for primary navigation of all vessels under the international SOLAS convention. Its content, therefore, carries a significant amount of liability for its member state producers.

S-101, described in the next section is the replacement format for ENC currently entering the development stage by the IHO.

S-57 electronic chart data is distributed with a basic aggregation methodology, thus:

![image](https://user-images.githubusercontent.com/3368156/144290302-fc877b69-438f-432c-99f1-b5d6078025f7.png)

Data is catalogued by a single file, CATALOG.031, encoded in ISO811 format (the same format used to encode charts themselves). The vast majority of such data is distributed to vessels for primary navigation under SOLAS and broader uses tend to be of individual feature layers, disaggregated and turned into various different formats with varying degrees of lossy transformations.

The concept of “service” as the sum total of all possible datasets also exists due to the IMO requirement for maintenance of a revision record on every vessel. Service metadata is defined by a single CSV file delivered with all distributed datasets, PRODUCTS. TXT

![image](https://user-images.githubusercontent.com/3368156/144290330-a111b50b-9a26-41f7-96e7-63b9d18f9133.png)

Ultimately, therefore there are a number of sources of individual feature, dataset and service metadata within the standards. “Coverage” has a very specific meaning in all IHO standards. S-57 (and to some extent, S-100) define it as a 2-D polygon where data coverage exists and it is included in most datasets as a feature in its right (validation tests exclude features which lie outside coverage areas). In S-57, in order to create datasets with rectangular (angular rectangular) extents, coverage is extended with areas of “no data available” (this has been dispensed with in the newer S-101 ENC equivalent S-100 product specification. Indeed, it is this coverage, together with a dataset’s Compilation Scale, that form a high priority metadata item across services.

Charts are updateable. One of the significant differences between S-57, S-100 and other vector formats is the rigorous incremental update method it encapsulates. 

This update method allows for incremental updating of features, attributes, and the topological structure of which its geometry is made. The model is one of simple Add/Delete and Modify instructions encoded as sequences of update instructions in discrete updates. This creates some metadata challenges though as a dataset’s “issue date” can be sometimes interpreted as the date of the major edition issue or the latest update. S-57 has evolved a dedicated process for describing the process, which has been (at least partly) inherited by S-101.

## The introduction of IHO S-100
In response to the successes of IHO S-57 and its development the IHO commenced an ambitious development programme in 2003. What was initially S-57 “version 4” became IHO S-100, the “Universal Hydrographic Data Model”. S-100 is a far more ambitious project, to define an overarching global framework for the representation of any marine geospatial data within an open standard. Using the ISO19100 series framework for its defining principles, IHO S-100 defines the many elements needed to comprehensively model, represent, encode and portray digital datasets representing marine entities in many domains and subdomains. IHO S-100 defines individual “product specifications” covering many different types of marine geospatial data including electronic charts and publications, regulated and protected marine spaces, maritime limits and boundaries and maritime safety information.

Coupled with a geospatial registry hosted at the IHO in Monaco, and supported by a number of ancillary IHO standards, S-100 represents the culmination of 20 years of progress and development in hydrographic thinking and is a unique achievement in the field of global geospatial standards.

With the publication of S-100 edition 5.0.0, destined to be the framework for development of the next generation of ECDIS systems on ocean-going vessels for the next 20-30 years, and in the centenary of the founding of the IHO, the standard is finally approaching a level of maturity where widespread adoption will take place by participating hydrographic offices, industry and scientific implementers.  This adoption will run the course of 2020-2030, the IHO’s “Decade of Implementation”. 

S-100 is the foundation for the e-Navigation community’s Common Maritime Data Structure (CMDS) standard as well as the foremost marine standard used by the United Nations Group on Global Geospatial Information Management (UN-GGIM) for implementation in pursuit of the UN’s Sustainable Development Goals.

S-100 ushers in some significant changes to implementers of marine geospatial data under its product specifications.
* Multiple product specifications. A potentially unlimited number of individual product specifications can be created, each with their own models, reusing feature and attribute definitions from the IHO geospatial registry. This diversity of different product specifications will enable S-100 to address multiple use cases, user groups and marine geospatial phenomena in its different user groups.
* Model-Driven development. S-100 implements an abstract feature model, the GFM, which all product specifications implement. This fuses coverage and vector feature types and provides machine-readable schemas for all components
* Dynamic feature and portrayal mechanisms driven by XML catalogues.

## Metadata and S-100.
Due to the relatively rudimentary metadata specification in the existing S-57 standard, S-100 implemented an ISO19115 conformant metadata profile, which is, in turn implemented by each of the S-100 component product specifications.

Metadata in the S-100 framework is described in a far more standardised form but its broader uses and service metadata has not received any formal treatment from an interoperability perspective. Although XML data describing aggregates of cells 

S-100 has a dedicated part devoted to metadata (Part 4, currently undergoing substantial revision for S-100 edition 5.0.0, due for release in 2022). This Part essentially profiles the ISO19115 approach (like many other metadata framework) by establishing a core set of “fields” (i.e. data) which are (largely) drawn from datasets using the framework and then providing an encoding of said data fields alongside the datasets themselves. Like some other domains, S-100 also provides a mechanism for extending metadata models for individual product specifications with different XML Schemas representing each product specification..

The UML model for the S-100 metadata model is shown in the diagram below
![image](https://user-images.githubusercontent.com/3368156/144290277-e1c4cf14-7c10-445a-8b68-6c3de74f31cb.png)

An example of dataset discovery metadata is
```xml
    <S100XC:datasetDiscoveryMetadata>
        <S100XC:S100_DatasetDiscoveryMetadata>
            <S100XC:fileName>101AA00AA4X0000.000</S100XC:fileName>
            <S100XC:filePath>101AA00AA4X0000</S100XC:filePath>
            <S100XC:description>AA4X0000V41</S100XC:description>
            <S100XC:dataProtection>false</S100XC:dataProtection>
            <S100XC:protectionScheme>S100p154.0.0</S100XC:protectionScheme>
            <S100XC:digitalSignatureReference>dsa</S100XC:digitalSignatureReference>
            <S100XC:digitalSignatureValue>
                <S100XC:signedPublicKey id="O=Internet Widgits Pty Ltd, ST=asd, C=ad">AAAAAAA=</S100XC:signedPublicKey>
                <S100XC:digitalSignature>302D02147B0979262D94C4462C0D994585184093F1520C0602150081A7BA38A611F64559E52F52E5696F2040CF0C0E</S100XC:digitalSignature>
            </S100XC:digitalSignatureValue>
            <S100XC:classification ns1:isoType="mco:MD_ClassificationCode">
                <mco:MD_ClassificationCode codeList="http://standards.iso.org/iso/19115/resources/Codelists/cat/codelists.xml#MD_ClassificationCode" codeListValue="unclassified">unclassified</mco:MD_ClassificationCode>
            </S100XC:classification>
            <S100XC:purpose>new edition</S100XC:purpose>
            <S100XC:specificUsage>
                <ns13:MD_Usage>
                    <ns13:specificUsage>
                        <ns1:CharacterString>Transit</ns1:CharacterString>
                    </ns13:specificUsage>
                </ns13:MD_Usage>
            </S100XC:specificUsage>
            <S100XC:editionNumber>1</S100XC:editionNumber>
            <S100XC:updateNumber>0</S100XC:updateNumber>
            <S100XC:updateApplicationDate>2020-08-03</S100XC:updateApplicationDate>
            <S100XC:issueDate>2020-08-03</S100XC:issueDate>
            <S100XC:productSpecification>
                <S100XC:name>S-101</S100XC:name>
                <S100XC:version>010000</S100XC:version>
                <S100XC:date>2018-12-01</S100XC:date>
                <S100XC:number>101</S100XC:number>
            </S100XC:productSpecification>
```
## The Feature Catalogue
S-100, as a framework standard, defines a number of product specifications, all of which have their own XML Feature Catalogue. The feature catalogue is the main artefact of any S-100 product specification. The feature catalogue is the central definition of how data is arranged, its feature names, types, multiplicities and possible values. A small extract from the S-101 feature catalogue defining a depth area feature and its two primary attributes is shown below:

```xml
        <S100FC:S100_FC_FeatureType isAbstract="false">
            <S100FC:name>Depth Area</S100FC:name>
            <S100FC:definition>A water area whose depth is within a defined range of values.</S100FC:definition>
            <S100FC:code>DepthArea</S100FC:code>
            <S100FC:remarks>Intertidal areas are encoded as depth areas. These do not have to include soundings. The depth range within a depth area is defined by the attributes depth range maximum value and depth range minimum value.</S100FC:remarks>
            <S100FC:alias>DEPARE</S100FC:alias>
            <S100FC:definitionReference>
                <S100FC:sourceIdentifier>262</S100FC:sourceIdentifier>
                <S100FC:definitionSource ref="IHOREG"/>
            </S100FC:definitionReference>
            <S100FC:attributeBinding sequential="false">
                <S100FC:multiplicity>
                    <S100Base:lower>1</S100Base:lower>
                    <S100Base:upper infinite="false">1</S100Base:upper>
                </S100FC:multiplicity>
                <S100FC:attribute ref="depthRangeMinimumValue"/>
            </S100FC:attributeBinding>
            <S100FC:attributeBinding sequential="false">
                <S100FC:multiplicity>
                    <S100Base:lower>1</S100Base:lower>
                    <S100Base:upper infinite="false">1</S100Base:upper>
                </S100FC:multiplicity>
                <S100FC:attribute ref="depthRangeMaximumValue"/>
            </S100FC:attributeBinding>
```


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

