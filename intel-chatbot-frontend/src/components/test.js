// import React, { useRef, useEffect } from 'react';



// const MapDisplay = () => {
//   const mapRef = useRef(null);
//   const infoWindowRef = useRef(null);
//   const coordinates = {coordinates}
//   const type = {type}; 

//   useEffect(() => {
//     if (!mapRef.current) return;

//     const map = new window.google.maps.Map(mapRef.current, {
//       center: { lat: coordinates[0].lat, lng: coordinates[0].lng },
//       zoom: type === 'triangle' ? 5 : 15,
//       mapTypeId: 'terrain',
//     });

//     if (type === 'triangle') {
//       const triangleCoords = coordinates.map(coord => ({ lat: coord.lat, lng: coord.lng }));

//       const triangle = new window.google.maps.Polygon({
//         paths: triangleCoords,
//         strokeColor: '#FF0000',
//         strokeOpacity: 0.8,
//         strokeWeight: 3,
//         fillColor: '#FF0000',
//         fillOpacity: 0.35,
//       });

//       triangle.setMap(map);

//       infoWindowRef.current = new window.google.maps.InfoWindow();

//       triangle.addListener('click', (event) => showArrays(event, triangle, map));
//     } else if (type === 'normal') {
//       new window.google.maps.Marker({
//         position: { lat: coordinates[0].lat, lng: coordinates[0].lng },
//         map,
//       });
//     }
//   }, [coordinates, type]);

//   const showArrays = (event, polygon, map) => {
//     const vertices = polygon.getPath();
//     let contentString =
//       '<b>Triangle Polygon</b><br>' +
//       'Clicked location: <br>' +
//       event.latLng.lat() +
//       ',' +
//       event.latLng.lng() +
//       '<br>';

//     for (let i = 0; i < vertices.getLength(); i++) {
//       const xy = vertices.getAt(i);
//       contentString +=
//         '<br>' + 'Coordinate ' + i + ':<br>' + xy.lat() + ',' + xy.lng();
//     }

//     infoWindowRef.current.setContent(contentString);
//     infoWindowRef.current.setPosition(event.latLng);
//     infoWindowRef.current.open(map);
//   };

//   return <div ref={mapRef} style={{ height: '400px', width: '100%' }} />;
// };

// export default MapDisplay;



// code to create heat maps
// import React from 'react';
// import HeatMapGrid from 'react-heatmap-grid';

// const Legend = ({ min, max }) => {
//     const gradient = [];
//     const steps = 10;
//     for (let i = 0; i <= steps; i++) {
//         const value = min + ((max - min) / steps) * i;
//         gradient.push(`rgba(255, 99, 132, ${value / 100})`);
//     }

//     return (
//         <div style={{ marginTop: '20px', textAlign: 'center' }}>
//             <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>Intensity Legend</div>
//             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                 <div style={{ marginRight: '10px' }}>{min}%</div>
//                 {gradient.map((color, index) => (
//                     <div
//                         key={index}
//                         style={{
//                             width: '20px',
//                             height: '20px',
//                             backgroundColor: color,
//                             marginRight: index < steps ? '2px' : '0',
//                         }}
//                     />
//                 ))}
//                 <div style={{ marginLeft: '10px' }}>{max}%</div>
//             </div>
//             <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', padding: '0 20px' }}>
//                 <div style={{ flexBasis: '33%'}}>Low</div>
//                 <div style={{ flexBasis: '33%'}}>Medium</div>
//                 <div style={{ flexBasis: '33%'}}>High</div>
//             </div>
//         </div>
//     );
// };

// const HeatMap = () => {
//     const xLabels = {xLabels};
//     const yLabels = {yLabels};
//     const heatMapData = {heatMapData}

//     return (
//         <div>
//             <h2>Heat Map Example</h2>
//             <HeatMapGrid
//                 data={heatMapData}
//                 xLabels={xLabels}
//                 yLabels={yLabels}
//                 cellStyle={(background, value, min, max, data, x, y) => ({
//                     background: `rgba(255, 99, 132, ${value / 100})`,
//                     fontSize: '11px',
//                 })}
//                 cellRender={(value) => value && `${value}%`}
//             />
//             <Legend min={0} max={100} />
//         </div>
//     );
// };


// export default HeatMap;


import React from 'react';
import HeatMapGrid from 'react-heatmap-grid';

const Legend = ({ min, max }) => {
    const gradient = [];
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
        const value = min + ((max - min) / steps) * i;
        gradient.push(`rgba(255, 99, 132, ${value / 100})`);
    }

    return (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>Intensity Legend</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ marginRight: '10px' }}>{min}%</div>
                {gradient.map((color, index) => (
                    <div
                        key={index}
                        style={{
                            width: '20px',
                            height: '20px',
                            backgroundColor: color,
                            marginRight: index < steps ? '2px' : '0',
                        }}
                    />
                ))}
                <div style={{ marginLeft: '10px' }}>{max}%</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', padding: '0 20px' }}>
                <div style={{ flexBasis: '33%' }}>Low</div>
                <div style={{ flexBasis: '33%' }}>Medium</div>
                <div style={{ flexBasis: '33%' }}>High</div>
            </div>
        </div>
    );
};

const HeatMap = () => {
    const xLabels = ['Closed', 'Open'];
    const yLabels = ['Low', 'High', 'Medium'];
    const heatMapData = [[34, 11], [24, 1], [57, 3]];

    return (
        <div>
            <h2>Heat Map Example</h2>
            <HeatMapGrid
                data={heatMapData}
                xLabels={xLabels}
                yLabels={yLabels}
                cellStyle={(background, value, min, max, data, x, y) => ({
                    background: `rgba(255, 99, 132, ${value / 100})`,
                    fontSize: '11px',
                })}
                cellRender={(value) => value && `${value}%`}
            />
            <Legend min={0} max={100} />
        </div>
    );
};

export default HeatMap;


