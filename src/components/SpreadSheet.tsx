"use client"

import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
import { ColDef } from 'ag-grid-community';
import { useMemo, useState } from 'react';


export default function SpreadSheet() {
const [rowData, setRowData] = useState([
    { make: "Toyota", model: "Celica", price: 95430, electric: false},
    { make: "Ford", model: "Mondeo", price: 32000, electric: true },
    { make: "Porsche", model: "Boxster", price: 72000, electric: false }
])

const defaultColDef = useMemo(() => {
  return {
    // flex: 1,
    filter: true,
    editable: true,
  }
}, [])


const handleColumnRemoval = (fieldName: string) => {
  const newColDefs = colDefs.filter((colDef) => colDef.field !== fieldName);
  setColDefs(newColDefs);
};

const handleClick = () => {
  alert("Sorting the data now")
}

const [colDefs, setColDefs] = useState<ColDef[]>([
  {
    field: "make",
    headerName: "Company",
    // flex: 1,
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: { values: ['Tesla', 'Fold', 'Toyota']},
  },
  {
    field: "model",
    // flex: 1
  },
  {
    field: "price",
    // flex: 1
  },
  {
    field: "electric",
    // flex: 1
  },
])

// className="ag-theme-alpine-dark"

  return (
    <div className="ag-theme-alpine" style={{ height: '100vh', width: '100%'}}>
    {/* <h2 onClick={() => handleColumnRemoval('make')}>Make (X)</h2>
    <h2 onClick={() => handleColumnRemoval('model')}>Model (X)</h2>
    <h2 onClick={() => handleColumnRemoval('price')}>Price (X)</h2>
    <h2 onClick={() => handleColumnRemoval('electric')}>Electric (X)</h2> */}
    <AgGridReact 
    rowData={rowData}
    columnDefs={colDefs}
    defaultColDef={defaultColDef}
    rowSelection={'multiple'}
    />
    </div>
  );
}

