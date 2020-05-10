import React from "react";
import ReactMapboxGl, { Layer, Feature } from 'react-mapbox-gl';
import {
  Row,
  Col
} from "react-bootstrap"

const Map = ReactMapboxGl({
  accessToken:
    'pk.eyJ1Ijoic2NvYXRlMDIiLCJhIjoiY2thMWlodXF5MDB4aTNmcjM3NmVidGx1NCJ9.b3SCkt21lFjBjVpNZ9RPWg'
});

const ZIPMap = () => {
    return (
        <Row className="align-items-center my-3">
          <Col className="d-flex justify-content-center">
          <Map
           // eslint-disable-next-line
            style="mapbox://styles/mapbox/dark-v10"
            containerStyle={{
              height: '85vh',
              width: '75vw'
            }}
          >
            <Layer type="symbol" id="marker" layout={{ 'icon-image': 'marker-15' }}>
              <Feature coordinates={[-0.481747846041145, 51.3233379650232]} />
            </Layer>
          </Map>
          </Col>
        </Row>
    );
}

export { ZIPMap };
export default ZIPMap
