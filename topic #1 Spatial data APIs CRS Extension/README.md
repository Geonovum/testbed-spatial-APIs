# OGC API CRS Extensions

Testbed project for Geonovum to implement CRS Extension for OGC API Features.
## Scope

Geographic data is everywhere. It is often served with a specific coordinate reference system, referring to the country the data is about. That is useful when that specific coordinate system is also the one you want to use, because for example your data is within the borders of one country. However, what happens when you want to use cross-border data? Then you need data about one country in the coordinate reference system of another country.  

That is why this [Geonovum](https://geonovum.nl) project, by [GIS Specialisten](https://gisspecialisten.nl), demonstrates how spatial data can be used in multiple coordinate reference systems within APIs. Next to that, it shows the required effort to serve data in multiple coordinate reference systems, and request and use data in specific coordinate reference systems.  

This project works with nitrogen deposit and Natura2000 data regarding the Netherlands. This data is used to demonstrate how it can be served in different coordinate systems. 

## Dataset
As a test dataset, we selected the Nitrogen deposits 2020. This is an INSPIRE dataset that covers the whole of Netherlands and overlaps slightly with Germany and Belgium. Since the scope of the project is on reprojection, a national dataset that has relevance in the border region of neighboring countries, seemed like a good starting point. The dataset is available as bulk download (WCS) and WMS from [data.overheid.nl](https://data.overheid.nl/dataset/5449-grootschalige-stikstofdepositie-nederland#webservice).  

At the time, the WCS service was not available, so we used the WMS as a basis, through zonal statistics we created a [hexagonal grid](https://towardsdatascience.com/spatial-modelling-tidbits-honeycomb-or-fishnets-7f0b19273aab) with the NOx deposits values, which we stored in a PostGIS database hosted by Geonovum. The grid is stored as WGS84. 

An additional benefit to this dataset, is that it is a flat datastructure with a very simple structure. The PostGIS table contains and ID column, minimum and maximum deposites and a geometry column. This allows us to put the focus on the CRS Extension of the OGC API standard, without needing a lot of time to process the data. 

## Data encodings for output format
The OGC API standard [does not mandate](http://docs.opengeospatial.org/is/17-069r3/17-069r3.html#_requirements_classes_for_encodings) an output format. They do however give examples of HTML, GeoJSON, as these are the recommended encodings for the data. HTML is suggested as a human readable and search engine indexible format. GeoJSON is a de-facto standard in web GIS. All the big web mapping libraries, like Leaflet, OpenLayers and D3, as well as web GIS suppliers, like Google Maps, HERE and MapBox, use WGS84 by default and sometimes as the only option. Being a relatively light weight format and a fimilair format for web developers, our demo viewer includes support for GeoJSON and not for a spatial format like GML. This implementation of the OGC API Features - CRS Extension is therefor focused on serving GeoJSON files through the API. To handle the different projections in the output format, the depracated standard of [Named CRS-ses](https://geojson.org/geojson-spec.html#named-crs) is used within the GeoJSON files to specify the projection of the data. 

### CRS notation
To be determined

## License
[<img src="https://www.gnu.org/graphics/gplv3-with-text-136x68.png">](https://www.gnu.org/licenses/gpl-3.0.html)