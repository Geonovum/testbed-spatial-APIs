# Setup instructions for OGC API Records
This folder has the setup instructionsa and customisation for pygeoapi using the IHO / OGC API Records data.

## Setup pygeoapi
From scratch the default pygeoapi setup instructions work well.

* python3 -m venv pygeoapi
* cd pygeoapi
* . bin/activate
* git clone https://github.com/geopython/pygeoapi.git
* cd pygeoapi
* pip3 install -r requirements.txt
* python3 setup.py install
* cp pygeoapi-config.yml example-config.yml
* vi example-config.yml  # edit as required
* export PYGEOAPI_CONFIG=example-config.yml
* export PYGEOAPI_OPENAPI=example-openapi.yml
* pygeoapi openapi generate $PYGEOAPI_CONFIG > $PYGEOAPI_OPENAPI
* pygeoapi serve

This gets pygeoapi up and running.

## Configure to use our records.
In the setup folder is a startup script start.sh and a charts-config.yml configuration for the pygeoapi server. This contains mappings to the individual tinydb catalogues created for the IHO datasets. NL ENC data harvesting and NOAA chart metadata for S-57 and S111 metadata are included.

