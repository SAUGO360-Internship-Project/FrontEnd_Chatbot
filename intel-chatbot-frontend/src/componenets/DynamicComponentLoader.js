import React, { useState, useEffect, useRef } from 'react';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import * as Babel from '@babel/standalone';

const DynamicComponentLoader = ({ codeString }) => {
  const [Component, setComponent] = useState(null);
  const [error, setError] = useState(null);

  const colonIndex = codeString.indexOf(':');
  // Split the response to have the text and the URL separately 
  const firstPart = codeString.substring(0, colonIndex + 1).trim();
  const secondPart = codeString.substring(colonIndex + 1).trim();

  useEffect(() => {
    const loadComponent = async () => {
      try {
        setError(null);

        // Remove the `export default` statement from the code string
        const cleanedCodeString = secondPart.replace(/export\s+default\s+\w+;/, '');

        // Transform the received code string from JSX and ES6 module syntax to plain JavaScript
        const transformedCode = Babel.transform(cleanedCodeString, {
          presets: ['react', 'env']
        }).code;

        // Safely evaluate the transformed code using a function wrapper
        // eslint-disable-next-line no-new-func
        const createComponent = new Function(
          'React',
          'useState',
          'useEffect',
          'useRef',
          'Pie',
          'Bar',
          'Line',
          'ChartJS',
          `${transformedCode}; return (typeof ChartTest !== 'undefined' ? ChartTest : MapDisplay);`
        );

        // Invoke the function with the required dependencies
        const Component = createComponent(React, useState, useEffect, useRef, Pie, Bar, Line, ChartJS);

        setComponent(() => Component);
      } catch (error) {
        console.error('Failed to create component:', error);
        setError(error);
      }
    };

    loadComponent();
  }, [secondPart]); 

  if (error) return <div>Failed to load component: {error.message}</div>;
  if (!Component) return <div>Loading component...</div>;

  return (
    <div>
      <p>{firstPart}</p>
      <div className='dynamic-component-container' style={{ height: 'auto', width: '700px', maxWidth: '800px', margin: '2'}}>
        <Component />
      </div>
    </div>
  );
};

export default DynamicComponentLoader;
