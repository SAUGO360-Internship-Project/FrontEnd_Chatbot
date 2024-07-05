import React, { useState, useEffect } from 'react';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import * as Babel from '@babel/standalone';

const DynamicComponentLoader = ({ codeString }) => {
  const [Component, setComponent] = useState(null);

  useEffect(() => {
    const loadComponent = async () => {
      try {
        // Remove the `export default` statement from the code string
        const cleanedCodeString = codeString.replace('export default ChartTest;', '');

        // Transform the received code string from JSX and ES6 module syntax to plain JavaScript
        const transformedCode = Babel.transform(cleanedCodeString, {
          presets: ['react', 'env']
        }).code;

        // Construct a new function with the transformed code
        const createComponent = new Function(
          'React',
          'useState',
          'useEffect',
          'Pie',
          'Bar',
          'Line',
          'ChartJS',
          `${transformedCode}; return ChartTest;`
        );

        // Invoke the function with the required dependencies
        const Component = createComponent(React, React.useState, React.useEffect, Pie, Bar, Line, ChartJS);

        setComponent(() => Component);
      } catch (error) {
        console.error('Failed to create component:', error);
      }
    };
    loadComponent(); 
  }, [codeString]);

  if (!Component) return <div>Componenet can't be generated</div>;

  return (
    <div className="dynamic-component-container">
      <Component />
    </div>
  )

};

export default DynamicComponentLoader;
