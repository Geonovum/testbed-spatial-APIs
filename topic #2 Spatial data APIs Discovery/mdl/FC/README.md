# Feature Catalogue for OGC API Records

## Introduction
This folder contains the relevant files for the IHO Feauture Catalogue representing the OGC API Records datasets compiled from source data. The IHO Feature Catalogue conforms to the IHO Feature Catalogue XML Schema from S-100 edition 4.0.0. 

## Construction
The feature catalogue is constructed from the EA model contained in this repository. The Feature Catalogue elements, its simple/complex attributes, their values, types and multiplicities are all contained within the EA model and exported from the EA model as individual compliant XML files. These are contained in the 001 (version 001) folder. When aggregated together they give the combined feature catalogue OGCRecordv3.xml

## Realisation of abstract types.
The feature catalogue is then "realised" which creates only concrete types, inserting the inherited attributes and relationships into each conrete type as appropriate. The resulting catalogue is contained in this folder as OGCRecordv3-R.xml

## Feature Catalogue 
The Feature catalogue is contained in XML form. Most of the documentation for its entries are in the model descriptions which are also output into the EA documentation report contained in this folder. The next version of the feature catalogue will contain all these definitions. 