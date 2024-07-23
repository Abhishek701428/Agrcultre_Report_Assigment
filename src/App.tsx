import React, { useEffect, useState } from 'react';
import { MantineProvider, Table } from '@mantine/core';
import '@mantine/core/styles.css';
import { theme } from './theme';
import './App.css'; 
interface CropData {
  avgYield: string;
  avgArea: string;
}

interface YearDataEntry {
  year: number;
  maxCrop: string;
  minCrop: string;
  maxProduction?: number;
  minProduction?: number;
}

interface TablesData {
  yearData: YearDataEntry[];
  cropData: Record<string, CropData>;
}

const App: React.FC = () => {
  const [tablesData, setTablesData] = useState<TablesData>({ yearData: [], cropData: {} });

  useEffect(() => {
    fetch('../Manufac _ India Agro Dataset.json')
      .then(response => response.json())
      .then((data: any[]) => {
        const processedData = processData(data);
        setTablesData(processedData);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const processData = (data: any[]): TablesData => {
    const result: TablesData = { yearData: [], cropData: {} };
    const cropTotals: Record<string, number> = {};
    const cropAreas: Record<string, number> = {};
    const cropCounts: Record<string, number> = {};

    data.forEach(row => {
      const production = row['Crop Production (UOM:t(Tonnes))'] || 0;
      const cropYield = row['Yield Of Crops (UOM:Kg/Ha(KilogramperHectare))'] || 0;
      const area = row['Area Under Cultivation (UOM:Ha(Hectares))'] || 0;
      const year = row['Year'];
      const cropName = row['Crop Name'];

      const yearEntry = result.yearData.find(y => y.year === year);
      if (!yearEntry) {
        result.yearData.push({
          year,
          maxCrop: cropName,
          minCrop: cropName,
          maxProduction: production,
          minProduction: production
        });
      } else {
        const currentMaxProduction = yearEntry.maxProduction || 0;
        const currentMinProduction = yearEntry.minProduction || Infinity;

        if (production > currentMaxProduction) {
          yearEntry.maxCrop = cropName;
          yearEntry.maxProduction = production;
        }
        if (production < currentMinProduction) {
          yearEntry.minCrop = cropName;
          yearEntry.minProduction = production;
        }
      }

      if (!cropTotals[cropName]) {
        cropTotals[cropName] = 0;
        cropAreas[cropName] = 0;
        cropCounts[cropName] = 0;
      }

      cropTotals[cropName] += production;
      cropAreas[cropName] += area;
      cropCounts[cropName] += 1;
    });

    for (const crop in cropTotals) {
      result.cropData[crop] = {
        avgYield: (cropTotals[crop] / cropCounts[crop] || 0).toFixed(3),
        avgArea: (cropAreas[crop] / cropCounts[crop] || 0).toFixed(3)
      };
    }

    return result;
  };

  return (
    <MantineProvider theme={theme}>
      <div className="app-container">
        <h1 className="table-title">Indian Agriculture Data Analysis</h1>
        <div className="table-wrapper">
          <Table className="mantine-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Crop with Maximum Production in that Year</th>
                <th>Crop with Minimum Production in that Year</th>
              </tr>
            </thead>
            <tbody>
              {tablesData.yearData.map((row, index) => (
                <tr key={index}>
                  <td>{row.year}</td>
                  <td>{row.maxCrop}</td>
                  <td>{row.minCrop}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <div className="table-wrapper">
          <Table className="mantine-table">
            <thead>
              <tr>
                <th>Crop</th>
                <th>Average Yield of the Crop between 1950-2020</th>
                <th>Average Cultivation Area of the Crop between 1950-2020</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(tablesData.cropData).map(([crop, data], index) => (
                <tr key={index}>
                  <td>{crop}</td>
                  <td>{data.avgYield}</td>
                  <td>{data.avgArea}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </MantineProvider>
  );
};

export default App;
