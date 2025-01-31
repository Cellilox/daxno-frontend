"use client"

import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
import { ColDef } from 'ag-grid-community';
import { useEffect, useMemo, useState } from 'react';

type Field = {
    id: string;
    name: string;
    description: string | null;
};

type SpreadsheetProps = {
    columns: Field[] | undefined;
    records: any[] | undefined
};

type FieldsData = {
    [key: string]: string; 
  };
  
// type Record = {
//     fields_data: any
//   };


export default function SpreadSheet({columns, records}: SpreadsheetProps) {
console.log('FFFF', columns)

const [rowData, setRowData] = useState<any[] | undefined>([])

useEffect(() => {
    setRowData(records);
  }, [records])

const defaultColDef = useMemo(() => {
  return {
    // flex: 1,
    filter: true,
    editable: true,
  }
}, [])


// const handleColumnRemoval = (fieldName: string) => {
//   const newColDefs = colDefs.filter((colDef) => colDef.field !== fieldName);
//   setColDefs(newColDefs);
// };

// const handleClick = () => {
//   alert("Sorting the data now")
// }


//Sample for future
// const [colDefs, setColDefs] = useState<ColDef[]>([
//   {
//     field: "make",
//     headerName: "Company",
//     // flex: 1,
//     cellEditor: 'agSelectCellEditor',
//     cellEditorParams: { values: ['Tesla', 'Fold', 'Toyota']},
//   },
//   {
//     field: "model",
//     // flex: 1
//   },
//   {
//     field: "price",
//     // flex: 1
//   },
//   {
//     field: "electric",
//     // flex: 1
//   },
// ])


const [colDefs, setColDefs] = useState<ColDef[]>([])

useEffect(() => {
    //@ts-ignore
    setColDefs(columns);
}, [columns]);


// className="ag-theme-alpine-dark"

  return (
    <div className="ag-theme-alpine" style={{ height:'70vh', width: '100%'}}>
    <AgGridReact 
    rowData={rowData}
    columnDefs={colDefs}
    defaultColDef={defaultColDef}
    rowSelection={'multiple'}
    />
    </div>
  );
}

