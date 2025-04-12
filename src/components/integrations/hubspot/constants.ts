import { HubSpotExportType } from './types';

export const STANDARD_PROPERTIES = {
  contacts: [
    { label: 'Email', value: 'email', required: true },
    { label: 'First Name', value: 'firstname' },
    { label: 'Last Name', value: 'lastname' },
    { label: 'Phone', value: 'phone' }
  ],
  companies: [
    { label: 'Company Name', value: 'name', required: true },
    { label: 'Domain', value: 'domain' },
    { label: 'Phone', value: 'phone' }
  ],
  deals: [
    { label: 'Deal Name', value: 'dealname', required: true },
    { label: 'Amount', value: 'amount' },
    { label: 'Close Date', value: 'closedate' }
  ],
  tickets: [
    { label: 'Subject', value: 'subject', required: true },
    { label: 'Priority', value: 'priority' },
    { label: 'Description', value: 'content' }
  ]
} as const;

export const REQUIRED_PROPERTIES = {
  contacts: [
    { name: 'email', defaultValue: '' },
  ],
  companies: [
    { name: 'name', defaultValue: 'Unnamed Company' },
    { name: 'domain', defaultValue: '' }
  ],
  deals: [
    { name: 'dealname', defaultValue: 'Unnamed Deal' },
    { name: 'pipeline', defaultValue: 'default' },
    { name: 'dealstage', defaultValue: 'appointmentscheduled' }
  ],
  tickets: [
    { name: 'subject', defaultValue: 'New Ticket' },
    { name: 'content', defaultValue: 'No content provided' },
    { name: 'hs_pipeline', defaultValue: 'default' },
    { name: 'hs_pipeline_stage', defaultValue: 'default' }
  ]
} as const;

export const CRITICAL_PROPERTIES = {
  contacts: [
    { name: 'email', description: 'Primary email of the contact', example: 'john@example.com' },
    { name: 'firstname', description: 'First name of the contact', example: 'John' },
    { name: 'lastname', description: 'Last name of the contact', example: 'Doe' }
  ],
  companies: [
    { name: 'name', description: 'Company name', example: 'Acme Corp' },
    { name: 'domain', description: 'Company website domain', example: 'acme.com' },
    { name: 'industry', description: 'Company industry', example: 'Technology' }
  ],
  deals: [
    { name: 'dealname', description: 'Name of the deal', example: 'Project X Contract' },
    { name: 'pipeline', description: 'Sales pipeline', example: 'default' },
    { name: 'dealstage', description: 'Stage in the pipeline', example: 'appointmentscheduled' },
    { name: 'amount', description: 'Deal amount', example: '5000' }
  ],
  tickets: [
    { name: 'subject', description: 'Ticket subject', example: 'Technical Support Request' },
    { name: 'content', description: 'Ticket description', example: 'Customer reported an issue...' },
    { name: 'hs_pipeline', description: 'Ticket pipeline', example: 'default' },
    { name: 'hs_pipeline_stage', description: 'Stage in the pipeline', example: 'default' },
    { name: 'priority', description: 'Ticket priority', example: 'HIGH, MEDIUM, LOW' }
  ]
} as const;

export const DUMMY_INVOICE_DATA = {
  "Invoice Number": "INV-2024-001",
  "Due Date": "2024-03-15",
  "Payment Terms": "Net 30",
  "Invoice Date": "2024-02-15",
  "Total Amount": "1,500.00",
  "Currency": "USD",
  "Customer Name": "Acme Corporation",
  "Customer Email": "billing@acmecorp.com",
  "Customer Address": "123 Business Ave, Suite 100, New York, NY 10001",
  "Customer Phone": "+1 (555) 123-4567",
  "Customer Tax ID": "US123456789",
  "Company Name": "Tech Solutions Inc.",
  "Company Address": "456 Tech Street, San Francisco, CA 94105",
  "Company Phone": "+1 (555) 987-6543",
  "Company Email": "finance@techsolutions.com",
  "Company Tax ID": "US987654321",
  "Bank Name": "Global Bank",
  "Bank Account": "1234567890",
  "Bank Routing": "021000021",
  "SWIFT Code": "GBANKUS33",
  "Item 1 Description": "Software Development Services",
  "Item 1 Quantity": "1",
  "Item 1 Unit Price": "1,500.00",
  "Item 1 Amount": "1,500.00",
  "Subtotal": "1,500.00",
  "Tax Rate": "8.5%",
  "Tax Amount": "127.50",
  "Total": "1,627.50",
  "Notes": "Payment due within 30 days of invoice date",
  "Status": "Pending",
  "Payment Method": "Bank Transfer",
  "Payment Reference": "PAY-2024-001",
  "Payment Date": "",
  "Payment Amount": "",
  "Payment Status": "Unpaid"
}; 