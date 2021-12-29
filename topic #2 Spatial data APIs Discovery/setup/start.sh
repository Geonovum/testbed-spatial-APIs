#!/bin/bash

export PYGEOAPI_OPENAPI=example-openapi.yml
export PYGEOAPI_CONFIG=charts-config.yml
pygeoapi openapi generate $PYGEOAPI_CONFIG > $PYGEOAPI_OPENAPI
pygeoapi serve
