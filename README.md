# TimeChimp MCP Server

A comprehensive Model Context Protocol (MCP) server for interacting with TimeChimp API v2. This server provides tools for retrieving and managing all major TimeChimp resources including projects, users, time entries, contacts, customers, tasks, invoices, expenses, mileage, and tags.

## Features

- **Projects**: Full CRUD operations (Create, Read, Update, Delete) with comprehensive project management including invoicing, budgeting, task/user assignments, and insights
- **Users**: Full CRUD operations (Create, Read, Update, Delete) with user management including roles, contracts, tags, and employee information
- **Time Entries**: Fetch time entries with date ranges, user/project filtering, and sorting
- **Contacts**: Full CRUD operations (Create, Read, Update, Delete) for contact management
- **Customers**: Full CRUD operations (Create, Read, Update, Delete) for customer management
- **Tasks**: Get task information with project filtering and sorting
- **Invoices**: Retrieve invoices with customer and date filtering
- **Expenses**: Full CRUD operations (Create, Read, Update, Delete) for expense management with status tracking
- **Mileage**: Full CRUD operations (Create, Read, Update, Delete) for mileage management with status tracking and vehicle assignment
- **Mileage Vehicles**: Retrieve mileage vehicle information for vehicle assignment
- **Tags**: Get tag information for organization and categorization
- Built as a single JavaScript file for easy deployment
- Uses TimeChimp API v2 with proper authentication and OData conventions
- Comprehensive error handling and validation
- Support for $expand, $count, and all OData query parameters

## Prerequisites

- Node.js 18.0.0 or higher
- A TimeChimp account with API access
- TimeChimp API key

## Installation

1. Clone or download this repository:
```bash
git clone <repository-url>
cd TimeJS
```

2. Install dependencies:
```bash
npm install
```

3. Make the server executable:
```bash
chmod +x timechimp-mcp-server.js
```

## Configuration

### API Key Setup

You need to set your TimeChimp API key as an environment variable:

```bash
export TIMECHIMP_API_KEY="your-api-key-here"
```

Or create a `.env` file:
```
TIMECHIMP_API_KEY=your-api-key-here
```

### Getting Your TimeChimp API Key

1. Log in to your TimeChimp account
2. Go to your profile settings
3. Navigate to the API section
4. Generate or copy your API key

## Claude Desktop Integration

To use this TimeChimp MCP server with Claude Desktop, you need to add it to your Claude Desktop configuration.

### Step 1: Clone the Repository

```bash
git clone https://github.com/Sungdaddy/TimeyChimpey.git
cd TimeyChimpey
npm install
```

### Step 2: Set Up Your API Key

Create a `.env` file in the project directory:
```bash
echo "TIMECHIMP_API_KEY=your-actual-api-key-here" > .env
```

### Step 3: Configure Claude Desktop

Add the following configuration to your Claude Desktop settings. The location of the configuration file depends on your operating system:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "timechimp": {
      "command": "node",
      "args": ["timechimp-mcp-server.js"],
      "cwd": "/path/to/your/TimeyChimpey",
      "env": {
        "TIMECHIMP_API_KEY": "your-actual-api-key-here"
      }
    }
  }
}
```

**Important**: Replace `/path/to/your/TimeyChimpey` with the actual path to where you cloned the repository, and replace `your-actual-api-key-here` with your actual TimeChimp API key.

### Step 4: Restart Claude Desktop

After adding the configuration, restart Claude Desktop completely for the changes to take effect.

### Step 5: Verify Integration

Once Claude Desktop restarts, you should be able to use TimeChimp-related commands. Try asking Claude to:

- "Get all my projects from TimeChimp"
- "Show me recent time entries"
- "List all customers"
- "Create a new expense entry"

### Example Configuration

Here's a complete example configuration file:

```json
{
  "mcpServers": {
    "timechimp": {
      "command": "node",
      "args": ["timechimp-mcp-server.js"],
      "cwd": "/Users/yourname/TimeyChimpey",
      "env": {
        "TIMECHIMP_API_KEY": "your-actual-api-key-here"
      }
    }
  }
}
```

### Troubleshooting Claude Desktop Integration

1. **Server not connecting**: Ensure the path in `cwd` is correct and points to the directory containing `timechimp-mcp-server.js`

2. **API key errors**: Verify your API key is correct and has proper permissions in TimeChimp

3. **Node.js not found**: Make sure Node.js is installed and accessible from the command line

4. **Permission errors**: Ensure Claude Desktop has permission to execute Node.js and access the project directory

5. **Configuration not loading**: Double-check the JSON syntax in your configuration file - it must be valid JSON

### Available Tools in Claude Desktop

Once configured, you'll have access to all 46 TimeChimp tools through Claude Desktop:

- **Projects**: Create, read, update, delete projects with insights
- **Users**: Manage users with contracts and roles
- **Time Entries**: Track and manage time entries
- **Contacts**: Full contact management
- **Customers**: Complete customer lifecycle management
- **Expenses**: Expense tracking with approval workflows
- **Mileage**: Mileage tracking with vehicle management
- **And much more...**

You can ask Claude to perform any TimeChimp operation naturally, such as "Create a new project for client ABC" or "Show me all pending expenses that need approval."

## Usage

### Running the Server

```bash
# Start the server
npm start

# Or run directly
node timechimp-mcp-server.js

# For development with debugging
npm run dev
```

### Available Tools

#### Projects

##### 1. get_projects

Retrieve projects from TimeChimp.

**Parameters:**
- `top` (number, optional): Maximum number of projects to return (1-10000, default: 100)
- `skip` (number, optional): Number of projects to skip for pagination (default: 0)
- `count` (boolean, optional): Whether to include the total count of results (default: true)
- `expand` (string, optional): Comma-delimited list of properties to expand (e.g., "customer,tasks")
- `active_only` (boolean, optional): Only return active projects (default: false)
- `filter` (string, optional): OData filter expression
- `orderby` (string, optional): OData orderby expression

**Example:**
```json
{
  "name": "get_projects",
  "arguments": {
    "top": 50,
    "active_only": true,
    "expand": "customer,tasks",
    "orderby": "name desc"
  }
}
```

##### 2. get_project_by_id

Get a specific project by ID.

**Parameters:**
- `id` (number, required): Project ID
- `expand` (string, optional): Comma-delimited list of properties to expand

**Example:**
```json
{
  "name": "get_project_by_id",
  "arguments": {
    "id": 123,
    "expand": "customer,tasks"
  }
}
```

##### 3. create_project

Create a new project.

**Parameters:**
- `name` (string, required): The project name
- `active` (boolean, optional): Whether the project can be used (default: true)
- `code` (string, optional): The project code
- `notes` (string, optional): The project description
- `color` (string, optional): The project color
- `startDate` (string, optional): The project start date (YYYY-MM-DD format)
- `endDate` (string, optional): The project end date (YYYY-MM-DD format)
- `invoicing` (object, optional): The project invoicing settings
  - `method` (string, optional): The project invoicing method used
    - Allowed values: `NoInvoicing`, `TaskHourlyRate`, `UserHourlyRate`, `ProjectHourlyRate`, `CustomerHourlyRate`, `ProjectRate`, `TaskRate`
  - `hourlyRate` (number, optional): The hourly rate of the project (only used when invoicing method = ProjectHourlyRate)
  - `fixedRate` (number, optional): The fixed rate/price of the project (only used when invoicing method = ProjectRate)
  - `reference` (string, optional): The project invoicing reference
  - `date` (string, optional): The project invoicing date (YYYY-MM-DD format, only used when invoicing method = ProjectRate)
- `budget` (object, optional): The project budget settings
  - `method` (string, optional): The project budget method used
    - Allowed values: `NoBudget`, `TotalHours`, `TaskHours`, `UserHours`, `TotalRate`, `TaskRate`, `TotalCost`
  - `hours` (number, optional): The hourly budget of the project (only used when budget method = TotalHours)
  - `rate` (number, optional): The budget rate of the project (only used when budget method = TotalRate or TotalCost)
  - `notificationPercentage` (number, optional): The budget percentage threshold at which a notification is sent out
- `customer` (object, optional): Customer to be linked with the project
  - `id` (number, required): Unique identifier for the customer
- `mainProject` (object, optional): Main project to be linked with the project (if it is a subproject)
  - `id` (number, required): Unique identifier for the project
- `subprojects` (array, optional): List of subprojects to be linked to the project (if it is a main project)
- `managers` (array, optional): List of managers to be linked to the project
- `tags` (array, optional): List of tags to be linked to the project
- `projectTasks` (array, required): List of project tasks to be linked to the project (if no tasks are specified, active common tasks will be prefilled)
- `projectUsers` (array, required): List of project users to be linked to the project (if no users are specified, active users will be prefilled)

**Example:**
```json
{
  "name": "create_project",
  "arguments": {
    "name": "Website Redesign",
    "code": "WEB-2024",
    "notes": "Complete redesign of company website",
    "color": "#3498db",
    "startDate": "2024-01-15",
    "endDate": "2024-06-30",
    "invoicing": {
      "method": "ProjectHourlyRate",
      "hourlyRate": 125.00,
      "reference": "WEB-2024-INV"
    },
    "budget": {
      "method": "TotalHours",
      "hours": 400,
      "notificationPercentage": 80
    },
    "customer": {"id": 123},
    "managers": [{"id": 456}],
    "tags": [{"id": 1}, {"id": 2}],
    "projectTasks": [
      {
        "active": true,
        "billable": true,
        "hourlyRate": 125.00,
        "task": {"id": 789}
      }
    ],
    "projectUsers": [
      {
        "active": true,
        "hourlyRate": 125.00,
        "budgetHours": 200,
        "user": {"id": 101}
      }
    ]
  }
}
```

##### 4. update_project

Update an existing project.

**Parameters:**
- `id` (number, required): Project ID
- `name` (string, required): The project name
- `active` (boolean, optional): Whether the project can be used
- `code` (string, optional): The project code
- `notes` (string, optional): The project description
- `color` (string, optional): The project color
- `startDate` (string, optional): The project start date (YYYY-MM-DD format)
- `endDate` (string, optional): The project end date (YYYY-MM-DD format)
- `invoicing` (object, required): The project invoicing settings
  - `method` (string, optional): The project invoicing method used
    - Allowed values: `NoInvoicing`, `TaskHourlyRate`, `UserHourlyRate`, `ProjectHourlyRate`, `CustomerHourlyRate`, `ProjectRate`, `TaskRate`, `Subscription`
  - `hourlyRate` (number, optional): The hourly rate of the project (only used when invoicing method = ProjectHourlyRate)
  - `fixedRate` (number, optional): The fixed rate/price of the project (only used when invoicing method = ProjectRate)
  - `reference` (string, optional): The project invoicing reference
  - `date` (string, optional): The project invoicing date (YYYY-MM-DD format, only used when invoicing method = ProjectRate)
- `budget` (object, required): The project budget settings
  - `method` (string, optional): The project budget method used
    - Allowed values: `NoBudget`, `TotalHours`, `TaskHours`, `UserHours`, `TotalRate`, `TaskRate`, `Invoiced`, `TotalCost`
  - `hours` (number, optional): The hourly budget of the project (only used when budget method = TotalHours)
  - `rate` (number, optional): The budget rate of the project (only used when budget method = TotalRate or TotalCost)
  - `notificationPercentage` (number, optional): The budget percentage threshold at which a notification is sent out
- `customer` (object, optional): Customer to be linked with the project
  - `id` (number, required): Unique identifier for the customer
- `mainProject` (object, optional): Main project to be linked with the project (if it is a subproject)
  - `id` (number, required): Unique identifier for the project
- `subprojects` (array, optional): List of subprojects to be linked to the project (if it is a main project)
- `managers` (array, optional): List of managers to be linked to the project
- `tags` (array, optional): List of tags to be linked to the project
- `projectTasks` (array, required): List of project tasks to be linked to the project
- `projectUsers` (array, required): List of project users to be linked to the project

**Example:**
```json
{
  "name": "update_project",
  "arguments": {
    "id": 123,
    "name": "Website Redesign - Phase 2",
    "endDate": "2024-08-31",
    "invoicing": {
      "method": "ProjectHourlyRate",
      "hourlyRate": 150.00
    },
    "budget": {
      "method": "TotalHours",
      "hours": 600,
      "notificationPercentage": 85
    },
    "projectTasks": [
      {
        "id": 456,
        "active": true,
        "billable": true,
        "hourlyRate": 150.00,
        "budgetHours": 120,
        "task": {"id": 789}
      }
    ],
    "projectUsers": [
      {
        "id": 789,
        "active": true,
        "hourlyRate": 150.00,
        "budgetHours": 300,
        "costHourlyRate": 90.00,
        "user": {"id": 101}
      }
    ]
  }
}
```

##### 5. delete_project

Delete a project.

**Parameters:**
- `id` (number, required): Project ID

**Example:**
```json
{
  "name": "delete_project",
  "arguments": {
    "id": 123
  }
}
```

##### 6. get_project_insights

Get project insights including hours, budget, costs, and revenue data.

**Parameters:**
- `id` (number, required): Project ID

**Example:**
```json
{
  "name": "get_project_insights",
  "arguments": {
    "id": 123
  }
}
```

#### Users

##### 7. get_users

Retrieve users from TimeChimp.

**Parameters:**
- `top` (number, optional): Maximum number of users to return (1-10000, default: 100)
- `skip` (number, optional): Number of users to skip for pagination (default: 0)
- `count` (boolean, optional): Whether to include the total count of results (default: true)
- `expand` (string, optional): Comma-delimited list of properties to expand
- `active_only` (boolean, optional): Only return active users (default: false)
- `filter` (string, optional): OData filter expression
- `orderby` (string, optional): OData orderby expression

**Example:**
```json
{
  "name": "get_users",
  "arguments": {
    "top": 100,
    "filter": "firstName eq 'John' and active eq true",
    "orderby": "lastName asc"
  }
}
```

##### 8. get_user_by_id

Get a specific user by ID.

**Parameters:**
- `id` (number, required): User ID
- `expand` (string, optional): Comma-delimited list of properties to expand

##### 9. create_user

Create a new user (note: adding users can result in additional invoice and extra cost).

**Parameters:**
- `userName` (string, required): The user email address
- `displayName` (string, required): The user name
- `language` (string, optional): The user language (default: en)
  - Allowed values: `en`, `nl`, `de`, `pl`, `fr`, `es`
- `role` (object, optional): Role to be assigned to the user (default: User)
  - `id` (number, required): Unique identifier for the role
- `sendInvitation` (boolean, optional): Whether an invitation should be sent to the user (default: false)
- `contracts` (array, optional): List of user contracts to be linked
  - `startDate` (string, optional): The contract start date (YYYY-MM-DD format, default: UTC today)
  - `endDate` (string, optional): The contract end date (YYYY-MM-DD format)
  - `weekHours` (number, optional): The contract hours per week
  - `hourlyRate` (number, optional): The contract sales hourly rate
  - `costHourlyRate` (number, optional): The contract purchase hourly rate
  - `contractNumber` (string, optional): The contract number
  - `contractType` (object, required): Contract type to be linked to the contract
    - `id` (number, required): Unique identifier for the contract type

**Example:**
```json
{
  "name": "create_user",
  "arguments": {
    "userName": "john.doe@company.com",
    "displayName": "John Doe",
    "language": "en",
    "role": {"id": 2},
    "sendInvitation": true,
    "contracts": [
      {
        "startDate": "2024-01-15",
        "endDate": "2024-12-31",
        "weekHours": 40,
        "hourlyRate": 75.00,
        "costHourlyRate": 50.00,
        "contractNumber": "EMP-2024-001",
        "contractType": {"id": 1}
      }
    ]
  }
}
```

##### 10. update_user

Update an existing user.

**Parameters:**
- `id` (number, required): User ID
- `displayName` (string, required): The user name
- `language` (string, optional): The user language (default: en)
  - Allowed values: `en`, `nl`, `de`, `pl`, `fr`, `es`
- `employeeNumber` (string, optional): The user employee number
- `badgeNumber` (string, optional): The user badge number
- `citizenServiceNumber` (string, optional): The user citizen service number
- `role` (object, optional): Role to be assigned to the user (default: User)
  - `id` (number, required): Unique identifier for the role
- `tags` (array, optional): List of tags to be linked with the user
- `contracts` (array, optional): List of user contracts to be linked
  - `id` (number, optional): Unique identifier for the user contract (can be null if new user contract needs to be added)
  - `startDate` (string, optional): The contract start date (YYYY-MM-DD format, default: UTC today)
  - `endDate` (string, optional): The contract end date (YYYY-MM-DD format)
  - `weekHours` (number, optional): The contract hours per week
  - `hourlyRate` (number, optional): The contract sales hourly rate
  - `costHourlyRate` (number, optional): The contract purchase/cost hourly rate
  - `contractNumber` (string, optional): The contract number
  - `contractType` (object, required): Contract type to be linked with the contract
    - `id` (number, required): Unique identifier for the contract type

**Example:**
```json
{
  "name": "update_user",
  "arguments": {
    "id": 123,
    "displayName": "John Doe - Senior Developer",
    "language": "en",
    "employeeNumber": "EMP-001",
    "badgeNumber": "BADGE-001",
    "role": {"id": 3},
    "tags": [{"id": 1}, {"id": 2}],
    "contracts": [
      {
        "id": 456,
        "startDate": "2024-01-15",
        "endDate": "2024-12-31",
        "weekHours": 40,
        "hourlyRate": 85.00,
        "costHourlyRate": 55.00,
        "contractNumber": "EMP-2024-001-UPD",
        "contractType": {"id": 1}
      }
    ]
  }
}
```

#### Time Entries

##### 11. get_time_entries

Retrieve time entries from TimeChimp.

**Parameters:**
- `top` (number, optional): Maximum number of time entries to return (1-10000, default: 100)
- `skip` (number, optional): Number of time entries to skip for pagination (default: 0)
- `count` (boolean, optional): Whether to include the total count of results (default: true)
- `expand` (string, optional): Comma-delimited list of properties to expand (e.g., "user,project,task")
- `user_id` (string, optional): Filter by specific user ID
- `project_id` (string, optional): Filter by specific project ID
- `from_date` (string, optional): Start date for filtering (YYYY-MM-DD format)
- `to_date` (string, optional): End date for filtering (YYYY-MM-DD format)
- `filter` (string, optional): OData filter expression
- `orderby` (string, optional): OData orderby expression

**Example:**
```json
{
  "name": "get_time_entries",
  "arguments": {
    "top": 100,
    "from_date": "2024-01-01",
    "to_date": "2024-01-31",
    "user_id": "123",
    "expand": "user,project,task",
    "orderby": "date desc"
  }
}
```

##### 12. get_time_entry_by_id

Get a specific time entry by ID.

**Parameters:**
- `id` (number, required): Time entry ID
- `expand` (string, optional): Comma-delimited list of properties to expand

#### Contacts

##### 13. get_contacts

Retrieve all contacts from TimeChimp.

**Parameters:**
- `top` (number, optional): Maximum number of contacts to return (1-10000, default: 100)
- `skip` (number, optional): Number of contacts to skip for pagination (default: 0)
- `count` (boolean, optional): Whether to include the total count of results (default: true)
- `expand` (string, optional): Comma-delimited list of properties to expand (e.g., "customers")
- `active_only` (boolean, optional): Only return active contacts (default: false)
- `filter` (string, optional): OData filter expression
- `orderby` (string, optional): OData orderby expression

**Example:**
```json
{
  "name": "get_contacts",
  "arguments": {
    "top": 50,
    "expand": "customers",
    "filter": "name eq 'John Doe'",
    "orderby": "name asc"
  }
}
```

##### 14. get_contact_by_id

Get a specific contact by ID.

**Parameters:**
- `id` (number, required): Contact ID
- `expand` (string, optional): Comma-delimited list of properties to expand

##### 15. create_contact

Create a new contact.

**Parameters:**
- `name` (string, required): The contact name
- `jobTitle` (string, optional): The contact job title
- `email` (string, optional): The contact email address
- `phone` (string, optional): The contact phone number
- `useForInvoicing` (boolean, optional): Whether the contact info will be used for invoicing (default: false)
- `active` (boolean, optional): Whether the contact can be used (default: true)
- `customers` (array, optional): List of customer IDs to link to this contact

**Example:**
```json
{
  "name": "create_contact",
  "arguments": {
    "name": "John Doe",
    "jobTitle": "Project Manager",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "useForInvoicing": true,
    "customers": [{"id": 123}, {"id": 456}]
  }
}
```

##### 16. update_contact

Update an existing contact.

**Parameters:**
- `id` (number, required): Contact ID
- `name` (string, required): The contact name
- `jobTitle` (string, optional): The contact job title
- `email` (string, optional): The contact email address
- `phone` (string, optional): The contact phone number
- `useForInvoicing` (boolean, optional): Whether the contact info will be used for invoicing
- `active` (boolean, optional): Whether the contact can be used
- `customers` (array, optional): List of customer IDs to link to this contact

##### 17. delete_contact

Delete a contact.

**Parameters:**
- `id` (number, required): Contact ID

**Example:**
```json
{
  "name": "delete_contact",
  "arguments": {
    "id": 123
  }
}
```

#### Customers

##### 18. get_customers

Retrieve all customers from TimeChimp.

**Parameters:**
- `top` (number, optional): Maximum number of customers to return (1-10000, default: 100)
- `skip` (number, optional): Number of customers to skip for pagination (default: 0)
- `count` (boolean, optional): Whether to include the total count of results (default: true)
- `expand` (string, optional): Comma-delimited list of properties to expand (e.g., "contacts,projects")
- `active_only` (boolean, optional): Only return active customers (default: false)
- `filter` (string, optional): OData filter expression
- `orderby` (string, optional): OData orderby expression

##### 19. get_customer_by_id

Get a specific customer by ID.

**Parameters:**
- `id` (number, required): Customer ID
- `expand` (string, optional): Comma-delimited list of properties to expand

##### 20. create_customer

Create a new customer.

**Parameters:**
- `name` (string, required): The customer name
- `active` (boolean, optional): Whether the customer can be used (default: true)
- `relationId` (string, optional): The customer number
- `address` (object, optional): The customer address info
  - `address` (string, optional): The address line
  - `postalCode` (string, optional): The postal code
  - `city` (string, optional): The city
  - `country` (string, optional): The country
- `phone` (string, optional): The customer phone number
- `email` (string, optional): The customer email address
- `website` (string, optional): The customer website URL
- `paymentPeriod` (number, optional): The customer payment term in days
- `hourlyRate` (number, optional): The customer default hourly price
- `mileageRate` (number, optional): The customer default mileage price, per KM
- `iban` (string, optional): The customer IBAN
- `bic` (string, optional): The customer BIC
- `vatNumber` (string, optional): The customer VAT number
- `kvkNumber` (string, optional): The customer business ID
- `invoiceAddress` (object, optional): The customer invoice address info, override of the customer address info
  - `address` (string, optional): The address line
  - `postalCode` (string, optional): The postal code
  - `city` (string, optional): The city
  - `country` (string, optional): The country
- `notes` (string, optional): The customer notes
- `prospect` (boolean, optional): The customer is a prospect
- `vatRate` (object, optional): Vat rate to be used for this customer
  - `id` (number, required): Unique identifier for the vat rate
- `tags` (array, optional): List of tag IDs to link to this customer
- `contacts` (array, optional): List of contact IDs to link to this customer

**Example:**
```json
{
  "name": "create_customer",
  "arguments": {
    "name": "Acme Corporation",
    "email": "contact@acme.com",
    "phone": "+1234567890",
    "website": "https://acme.com",
    "address": {
      "address": "123 Business St",
      "postalCode": "12345",
      "city": "Business City",
      "country": "USA"
    },
    "paymentPeriod": 30,
    "hourlyRate": 150.00,
    "prospect": false,
    "tags": [{"id": 1}, {"id": 2}],
    "contacts": [{"id": 123}]
  }
}
```

##### 21. update_customer

Update an existing customer.

**Parameters:**
- `id` (number, required): Customer ID
- `name` (string, required): The customer name
- `active` (boolean, optional): Whether the customer can be used
- `relationId` (string, optional): The customer number
- `address` (object, optional): The customer address info
  - `address` (string, optional): The address line
  - `postalCode` (string, optional): The postal code
  - `city` (string, optional): The city
  - `country` (string, optional): The country
- `phone` (string, optional): The customer phone number
- `email` (string, optional): The customer email address
- `website` (string, optional): The customer website URL
- `paymentPeriod` (number, optional): The customer payment term in days
- `hourlyRate` (number, optional): The customer default hourly price
- `mileageRate` (number, optional): The customer default mileage price, per KM
- `iban` (string, optional): The customer IBAN
- `bic` (string, optional): The customer BIC
- `vatNumber` (string, optional): The customer VAT number
- `kvkNumber` (string, optional): The customer business ID
- `invoiceAddress` (object, optional): The customer invoice address info, if differs from the customer address info
  - `address` (string, optional): The address line
  - `postalCode` (string, optional): The postal code
  - `city` (string, optional): The city
  - `country` (string, optional): The country
- `notes` (string, optional): The customer notes
- `prospect` (boolean, optional): The customer is a prospect
- `vatRate` (object, optional): Vat rate to be linked with the customer
  - `id` (number, required): Unique identifier for the vat rate
- `tags` (array, optional): List of tag IDs to link to this customer
- `contacts` (array, optional): List of contact IDs to link to this customer

**Example:**
```json
{
  "name": "update_customer",
  "arguments": {
    "id": 456,
    "name": "Acme Corporation Ltd",
    "email": "newcontact@acme.com",
    "paymentPeriod": 45,
    "hourlyRate": 175.00
  }
}
```

##### 22. delete_customer

Delete a customer.

**Parameters:**
- `id` (number, required): Customer ID

**Example:**
```json
{
  "name": "delete_customer",
  "arguments": {
    "id": 456
  }
}
```

#### Tasks

##### 23. get_tasks

Retrieve all tasks from TimeChimp.

**Parameters:**
- `top` (number, optional): Maximum number of tasks to return (1-10000, default: 100)
- `skip` (number, optional): Number of tasks to skip for pagination (default: 0)
- `count` (boolean, optional): Whether to include the total count of results (default: true)
- `expand` (string, optional): Comma-delimited list of properties to expand (e.g., "project")
- `active_only` (boolean, optional): Only return active tasks (default: false)
- `project_id` (string, optional): Filter by specific project ID
- `filter` (string, optional): OData filter expression
- `orderby` (string, optional): OData orderby expression

##### 24. get_task_by_id

Get a specific task by ID.

**Parameters:**
- `id` (number, required): Task ID
- `expand` (string, optional): Comma-delimited list of properties to expand

#### Invoices

##### 25. get_invoices

Retrieve all invoices from TimeChimp.

**Parameters:**
- `top` (number, optional): Maximum number of invoices to return (1-10000, default: 100)
- `skip` (number, optional): Number of invoices to skip for pagination (default: 0)
- `count` (boolean, optional): Whether to include the total count of results (default: true)
- `expand` (string, optional): Comma-delimited list of properties to expand (e.g., "customer,projects")
- `customer_id` (string, optional): Filter by specific customer ID
- `from_date` (string, optional): Start date for filtering (YYYY-MM-DD format)
- `to_date` (string, optional): End date for filtering (YYYY-MM-DD format)
- `filter` (string, optional): OData filter expression
- `orderby` (string, optional): OData orderby expression

##### 26. get_invoice_by_id

Get a specific invoice by ID.

**Parameters:**
- `id` (number, required): Invoice ID
- `expand` (string, optional): Comma-delimited list of properties to expand

#### Expenses

##### 27. get_expenses

Retrieve all expenses from TimeChimp.

**Parameters:**
- `top` (number, optional): Maximum number of expenses to return (1-10000, default: 100)
- `skip` (number, optional): Number of expenses to skip for pagination (default: 0)
- `count` (boolean, optional): Whether to include the total count of results (default: true)
- `expand` (string, optional): Comma-delimited list of properties to expand (e.g., "user,project,customer")
- `user_id` (string, optional): Filter by specific user ID
- `project_id` (string, optional): Filter by specific project ID
- `customer_id` (string, optional): Filter by specific customer ID
- `from_date` (string, optional): Start date for filtering (YYYY-MM-DD format)
- `to_date` (string, optional): End date for filtering (YYYY-MM-DD format)
- `filter` (string, optional): OData filter expression
- `orderby` (string, optional): OData orderby expression

##### 28. get_expense_by_id

Get a specific expense by ID.

**Parameters:**
- `id` (number, required): Expense ID
- `expand` (string, optional): Comma-delimited list of properties to expand

##### 29. create_expense

Create a new expense.

**Parameters:**
- `date` (string, optional): The expense date (YYYY-MM-DD format, default: UTC today)
- `notes` (string, optional): The expense notes
- `quantity` (number, optional): The expense quantity (default: 1)
- `rate` (number, required): The expense rate/price
- `billable` (boolean, optional): Whether the expense can be invoiced (default: true)
- `customer` (object, optional): Customer to be linked with the expense
  - `id` (number, required): Unique identifier for the customer
- `project` (object, optional): Project to be linked with the expense
  - `id` (number, required): Unique identifier for the project
- `product` (object, optional): Product to be linked with the expense
  - `id` (number, required): Unique identifier for the product
- `user` (object, required): User to be linked with the expense
  - `id` (number, required): Unique identifier for the user
- `vatRate` (object, optional): VAT rate to be linked with the expense (default: highest percentage)
  - `id` (number, required): Unique identifier for the VAT rate

**Example:**
```json
{
  "name": "create_expense",
  "arguments": {
    "date": "2024-01-15",
    "notes": "Business lunch with client",
    "quantity": 1,
    "rate": 75.50,
    "billable": true,
    "customer": {"id": 123},
    "project": {"id": 456},
    "user": {"id": 789}
  }
}
```

##### 30. update_expense

Update an existing expense.

**Parameters:**
- `id` (number, required): Expense ID
- `date` (string, optional): The expense date (YYYY-MM-DD format)
- `notes` (string, optional): The expense notes
- `quantity` (number, optional): The expense quantity
- `rate` (number, required): The expense rate/price
- `billable` (boolean, optional): Whether the expense can be invoiced
- `customer` (object, optional): Customer to be linked with the expense
  - `id` (number, required): Unique identifier for the customer
- `project` (object, optional): Project to be linked with the expense
  - `id` (number, required): Unique identifier for the project
- `product` (object, optional): Product to be linked with the expense
  - `id` (number, required): Unique identifier for the product
- `user` (object, required): User to be linked with the expense
  - `id` (number, required): Unique identifier for the user
- `vatRate` (object, optional): VAT rate to be linked with the expense
  - `id` (number, required): Unique identifier for the VAT rate

**Example:**
```json
{
  "name": "update_expense",
  "arguments": {
    "id": 123,
    "notes": "Updated: Business lunch with client and partner",
    "rate": 85.00,
    "user": {"id": 789}
  }
}
```

##### 31. delete_expense

Delete an expense.

**Parameters:**
- `id` (number, required): Expense ID

**Example:**
```json
{
  "name": "delete_expense",
  "arguments": {
    "id": 123
  }
}
```

##### 32. update_expense_status

Update the status of expenses (internal approval/invoicing status).

**Parameters:**
- `message` (string, optional): Status history message
- `expenses` (array, required): List of expenses to be updated (maximum of 100 entries)
  - `id` (number, required): Unique identifier for the expense
- `status` (string, required): The internal approval/invoicing status
  - Allowed values: `Open`, `PendingApproval`, `Approved`, `Invoiced`, `WrittenOff`, `Rejected`

**Example:**
```json
{
  "name": "update_expense_status",
  "arguments": {
    "message": "Approved by manager",
    "expenses": [{"id": 123}, {"id": 124}],
    "status": "Approved"
  }
}
```

##### 33. update_expense_client_status

Update the client status of expenses (external approval/invoicing status).

**Parameters:**
- `clientStatus` (string, required): The external approval/invoicing status (used only when client portal is enabled)
  - Allowed values: `Open`, `PendingApproval`, `Approved`, `Invoiced`, `WrittenOff`, `Rejected`
- `message` (string, optional): Status history message
- `expenses` (array, required): List of expenses to be updated (maximum of 100 entries)
  - `id` (number, required): Unique identifier for the expense

**Example:**
```json
{
  "name": "update_expense_client_status",
  "arguments": {
    "clientStatus": "Approved",
    "message": "Client approved expenses",
    "expenses": [{"id": 123}, {"id": 124}]
  }
}
```

##### 34. get_expense_status_history

Query status history modification records of an expense.

**Parameters:**
- `id` (number, required): Expense ID
- `top` (number, optional): Maximum number of status history records to return (1-10000, default: 100)
- `skip` (number, optional): Number of status history records to skip for pagination (default: 0)
- `count` (boolean, optional): Whether to include the total count of results (default: true)
- `expand` (string, optional): Comma-delimited list of properties to expand
- `filter` (string, optional): OData filter expression
- `orderby` (string, optional): OData orderby expression (e.g., "modifiedOn desc")

**Example:**
```json
{
  "name": "get_expense_status_history",
  "arguments": {
    "id": 123,
    "orderby": "modifiedOn desc",
    "top": 50
  }
}
```

#### Mileage

##### 35. get_mileage

Retrieve all mileage entries from TimeChimp.

**Parameters:**
- `top` (number, optional): Maximum number of mileage entries to return (1-10000, default: 100)
- `skip` (number, optional): Number of mileage entries to skip for pagination (default: 0)
- `count` (boolean, optional): Whether to include the total count of results (default: true)
- `expand` (string, optional): Comma-delimited list of properties to expand (e.g., "user,project,customer")
- `user_id` (string, optional): Filter by specific user ID
- `project_id` (string, optional): Filter by specific project ID
- `customer_id` (string, optional): Filter by specific customer ID
- `from_date` (string, optional): Start date for filtering (YYYY-MM-DD format)
- `to_date` (string, optional): End date for filtering (YYYY-MM-DD format)
- `filter` (string, optional): OData filter expression
- `orderby` (string, optional): OData orderby expression

##### 36. get_mileage_by_id

Get a specific mileage entry by ID.

**Parameters:**
- `id` (number, required): Mileage entry ID
- `expand` (string, optional): Comma-delimited list of properties to expand

##### 37. create_mileage

Create a new mileage entry.

**Parameters:**
- `date` (string, optional): The mileage date (YYYY-MM-DD format, default: UTC today)
- `fromAddress` (string, optional): The mileage from address
- `toAddress` (string, optional): The mileage to address
- `notes` (string, optional): The mileage notes
- `distance` (number, required): The mileage distance in KM
- `billable` (boolean, optional): Whether the mileage can be invoiced (default: true)
- `type` (string, required): The mileage type
  - Allowed values: `Private`, `Business`, `HomeWork`
- `customer` (object, optional): Customer to be linked with the mileage
  - `id` (number, required): Unique identifier for the customer
- `project` (object, optional): Project to be linked with the mileage
  - `id` (number, required): Unique identifier for the project
- `vehicle` (object, optional): Vehicle to be linked with the mileage
  - `id` (number, required): Unique identifier for the mileage vehicle
- `user` (object, required): User to be linked with the mileage
  - `id` (number, required): Unique identifier for the user

**Example:**
```json
{
  "name": "create_mileage",
  "arguments": {
    "date": "2024-01-15",
    "fromAddress": "Office - 123 Business St, Business City",
    "toAddress": "Client Site - 456 Client Ave, Client City",
    "notes": "Client meeting and project consultation",
    "distance": 45.5,
    "billable": true,
    "type": "Business",
    "customer": {"id": 123},
    "project": {"id": 456},
    "vehicle": {"id": 789},
    "user": {"id": 101}
  }
}
```

##### 38. update_mileage

Update an existing mileage entry.

**Parameters:**
- `id` (number, required): Mileage entry ID
- `date` (string, optional): The mileage date (YYYY-MM-DD format)
- `fromAddress` (string, optional): The mileage from address
- `toAddress` (string, optional): The mileage to address
- `notes` (string, optional): The mileage notes
- `distance` (number, required): The mileage distance in KM
- `billable` (boolean, optional): Whether the mileage can be invoiced
- `type` (string, required): The mileage type
  - Allowed values: `Private`, `Business`, `HomeWork`
- `customer` (object, optional): Customer to be linked with the mileage
  - `id` (number, required): Unique identifier for the customer
- `project` (object, optional): Project to be linked with the mileage
  - `id` (number, required): Unique identifier for the project
- `vehicle` (object, optional): Vehicle to be linked with the mileage
  - `id` (number, required): Unique identifier for the mileage vehicle
- `user` (object, required): User to be linked with the mileage
  - `id` (number, required): Unique identifier for the user

**Example:**
```json
{
  "name": "update_mileage",
  "arguments": {
    "id": 123,
    "notes": "Updated: Client meeting, project consultation, and site inspection",
    "distance": 52.3,
    "fromAddress": "Office - 123 Business St, Business City",
    "toAddress": "Client Site - 456 Client Ave, Client City (with site inspection)",
    "type": "Business",
    "user": {"id": 101}
  }
}
```

##### 39. delete_mileage

Delete a mileage entry.

**Parameters:**
- `id` (number, required): Mileage entry ID

**Example:**
```json
{
  "name": "delete_mileage",
  "arguments": {
    "id": 123
  }
}
```

##### 40. update_mileage_status

Update the status of mileage entries (internal approval/invoicing status).

**Parameters:**
- `message` (string, optional): Status history message
- `mileages` (array, required): List of mileage entries to be updated (maximum of 100 entries)
  - `id` (number, required): Unique identifier for the mileage
- `status` (string, required): The internal approval/invoicing status
  - Allowed values: `Open`, `PendingApproval`, `Approved`, `Invoiced`, `WrittenOff`, `Rejected`

**Example:**
```json
{
  "name": "update_mileage_status",
  "arguments": {
    "message": "Approved by manager after review",
    "mileages": [{"id": 123}, {"id": 124}],
    "status": "Approved"
  }
}
```

##### 41. update_mileage_client_status

Update the client status of mileage entries (external approval/invoicing status).

**Parameters:**
- `clientStatus` (string, required): The external approval/invoicing status (used only when client portal is enabled)
  - Allowed values: `Open`, `PendingApproval`, `Approved`, `Invoiced`, `WrittenOff`, `Rejected`
- `message` (string, optional): Status history message
- `mileages` (array, required): List of mileage entries to be updated (maximum of 100 entries)
  - `id` (number, required): Unique identifier for the mileage

**Example:**
```json
{
  "name": "update_mileage_client_status",
  "arguments": {
    "clientStatus": "Approved",
    "message": "Client approved mileage claims",
    "mileages": [{"id": 123}, {"id": 124}]
  }
}
```

##### 42. get_mileage_status_history

Query status history modification records of a mileage entry.

**Parameters:**
- `id` (number, required): Mileage entry ID
- `top` (number, optional): Maximum number of status history records to return (1-10000, default: 100)
- `skip` (number, optional): Number of status history records to skip for pagination (default: 0)
- `count` (boolean, optional): Whether to include the total count of results (default: true)
- `expand` (string, optional): Comma-delimited list of properties to expand
- `filter` (string, optional): OData filter expression
- `orderby` (string, optional): OData orderby expression (e.g., "modifiedOn desc")

**Example:**
```json
{
  "name": "get_mileage_status_history",
  "arguments": {
    "id": 123,
    "orderby": "modifiedOn desc",
    "top": 50
  }
}
```

##### 43. get_mileage_vehicles

Retrieve all mileage vehicles from TimeChimp.

**Parameters:**
- `top` (number, optional): Maximum number of mileage vehicles to return (1-10000, default: 100)
- `skip` (number, optional): Number of mileage vehicles to skip for pagination (default: 0)
- `count` (boolean, optional): Whether to include the total count of results (default: true)
- `expand` (string, optional): Comma-delimited list of properties to expand (e.g., "users")
- `active_only` (boolean, optional): Only return active mileage vehicles (default: false)
- `filter` (string, optional): OData filter expression
- `orderby` (string, optional): OData orderby expression

**Example:**
```json
{
  "name": "get_mileage_vehicles",
  "arguments": {
    "active_only": true,
    "expand": "users",
    "orderby": "brand asc"
  }
}
```

##### 44. get_mileage_vehicle_by_id

Get a specific mileage vehicle by ID.

**Parameters:**
- `id` (number, required): Mileage vehicle ID
- `expand` (string, optional): Comma-delimited list of properties to expand

**Example:**
```json
{
  "name": "get_mileage_vehicle_by_id",
  "arguments": {
    "id": 789,
    "expand": "users"
  }
}
```

#### Tags

##### 45. get_tags

Retrieve all tags from TimeChimp.

**Parameters:**
- `top` (number, optional): Maximum number of tags to return (1-10000, default: 100)
- `skip` (number, optional): Number of tags to skip for pagination (default: 0)
- `count` (boolean, optional): Whether to include the total count of results (default: true)
- `expand` (string, optional): Comma-delimited list of properties to expand
- `active_only` (boolean, optional): Only return active tags (default: false)
- `filter` (string, optional): OData filter expression
- `orderby` (string, optional): OData orderby expression

##### 46. get_tag_by_id

Get a specific tag by ID.

**Parameters:**
- `id` (number, required): Tag ID
- `expand` (string, optional): Comma-delimited list of properties to expand

## TimeChimp API v2 Features

### Pagination
The server uses TimeChimp's standard pagination parameters:
- `$top`: Maximum number of records to return (1-10000, default: 100)
- `$skip`: Number of records to skip for pagination

### Filtering (OData)
The server supports TimeChimp's OData filtering conventions:
- Basic filters: `name eq 'Project Name'`
- Boolean filters: `active eq true`
- Date filters: `date eq 2023-12-31`
- DateTime filters: `start gt 2023-12-31T23:59:59Z`
- Combined filters: `active eq true and name eq 'Project Name'`
- Collection filters: `projects/any(project:project/id eq 123)`

### Sorting (OData)
The server supports OData sorting:
- Single field: `name desc`
- Multiple fields: `name desc, createdAt asc`
- Nested properties: `address/city asc`

### Expansion (OData)
The server supports expanding related entities:
- Single expansion: `customer`
- Multiple expansions: `customer,projects,tasks`
- Nested expansions: `customer/contacts`

### Count
The server supports counting total results:
- `$count=true`: Include total count in response
- `$count=false`: Exclude total count (default for performance)

## API Endpoints

The server interacts with the following TimeChimp API v2 endpoints:

- `GET /projects` - Retrieve projects
- `GET /projects/{id}` - Get specific project by ID
- `POST /projects` - Create new project
- `PUT /projects/{id}` - Update existing project
- `DELETE /projects/{id}` - Delete project
- `GET /projects/{id}/insights` - Get project insights
- `GET /users` - Retrieve users  
- `GET /users/{id}` - Get specific user by ID
- `POST /users` - Create new user
- `PUT /users/{id}` - Update existing user
- `GET /times` - Retrieve time entries
- `GET /times/{id}` - Get specific time entry by ID
- `GET /contacts` - Retrieve contacts
- `GET /contacts/{id}` - Get specific contact by ID
- `POST /contacts` - Create new contact
- `PUT /contacts/{id}` - Update existing contact
- `DELETE /contacts/{id}` - Delete contact
- `GET /customers` - Retrieve customers
- `GET /customers/{id}` - Get specific customer by ID
- `POST /customers` - Create new customer
- `PUT /customers/{id}` - Update existing customer
- `DELETE /customers/{id}` - Delete customer
- `GET /tasks` - Retrieve tasks
- `GET /tasks/{id}` - Get specific task by ID
- `GET /invoices` - Retrieve invoices
- `GET /invoices/{id}` - Get specific invoice by ID
- `GET /expenses` - Retrieve expenses
- `GET /expenses/{id}` - Get specific expense by ID
- `POST /expenses` - Create new expense
- `PUT /expenses/{id}` - Update existing expense
- `DELETE /expenses/{id}` - Delete expense
- `PUT /expenses/status` - Update expense status (internal)
- `PUT /expenses/clientStatus` - Update expense client status (external)
- `GET /expenses/{id}/statusHistory` - Get expense status history
- `GET /mileage` - Retrieve mileage entries
- `GET /mileage/{id}` - Get specific mileage entry by ID
- `POST /mileage` - Create new mileage entry
- `PUT /mileage/{id}` - Update existing mileage entry
- `DELETE /mileage/{id}` - Delete mileage entry
- `PUT /mileage/status` - Update mileage status (internal)
- `PUT /mileage/clientStatus` - Update mileage client status (external)
- `GET /mileage/{id}/statusHistory` - Get mileage status history
- `GET /mileageVehicles` - Retrieve mileage vehicles
- `GET /mileageVehicles/{id}` - Get specific mileage vehicle by ID
- `GET /tags` - Retrieve tags
- `GET /tags/{id}` - Get specific tag by ID

All requests are authenticated using the `api-key` header and support OData query parameters.

## Advanced Examples

### Complex Filtering
```json
{
  "name": "get_time_entries",
  "arguments": {
    "filter": "date ge 2024-01-01 and date le 2024-01-31 and user/id eq 123 and project/active eq true",
    "expand": "user,project,task",
    "orderby": "date desc, start desc",
    "top": 50
  }
}
```

### Pagination Example
```json
{
  "name": "get_projects",
  "arguments": {
    "top": 25,
    "skip": 50,
    "count": true,
    "orderby": "name asc"
  }
}
```

### Creating and Managing Contacts
```json
// Create a contact
{
  "name": "create_contact",
  "arguments": {
    "name": "Jane Smith",
    "jobTitle": "CEO",
    "email": "jane@company.com",
    "useForInvoicing": true,
    "customers": [{"id": 123}]
  }
}

// Update the contact
{
  "name": "update_contact",
  "arguments": {
    "id": 456,
    "name": "Jane Smith-Johnson",
    "phone": "+1987654321"
  }
}

// Get contact with expanded customers
{
  "name": "get_contact_by_id",
  "arguments": {
    "id": 456,
    "expand": "customers"
  }
}
```

### Creating and Managing Customers
```json
// Create a customer
{
  "name": "create_customer",
  "arguments": {
    "name": "Acme Corporation",
    "email": "contact@acme.com",
    "phone": "+1234567890",
    "website": "https://acme.com",
    "address": {
      "address": "123 Business St",
      "postalCode": "12345",
      "city": "Business City",
      "country": "USA"
    },
    "paymentPeriod": 30,
    "hourlyRate": 150.00,
    "prospect": false,
    "tags": [{"id": 1}, {"id": 2}],
    "contacts": [{"id": 123}]
  }
}

// Update the customer
{
  "name": "update_customer",
  "arguments": {
    "id": 456,
    "name": "Acme Corporation Ltd",
    "email": "newcontact@acme.com",
    "paymentPeriod": 45,
    "hourlyRate": 175.00
  }
}

// Get customer with expanded contacts and tags
{
  "name": "get_customer_by_id",
  "arguments": {
    "id": 456,
    "expand": "contacts,tags"
  }
}
```

### Creating and Managing Expenses
```json
// Create an expense
{
  "name": "create_expense",
  "arguments": {
    "date": "2024-01-15",
    "notes": "Business lunch with client",
    "quantity": 1,
    "rate": 75.50,
    "billable": true,
    "customer": {"id": 123},
    "project": {"id": 456},
    "user": {"id": 789}
  }
}

// Update the expense
{
  "name": "update_expense",
  "arguments": {
    "id": 123,
    "notes": "Updated: Business lunch with client and partner",
    "rate": 85.00,
    "user": {"id": 789}
  }
}

// Update expense status (approve multiple expenses)
{
  "name": "update_expense_status",
  "arguments": {
    "message": "Approved by manager",
    "expenses": [{"id": 123}, {"id": 124}],
    "status": "Approved"
  }
}

// Get expense status history
{
  "name": "get_expense_status_history",
  "arguments": {
    "id": 123,
    "orderby": "modifiedOn desc"
  }
}
```

### Creating and Managing Projects
```json
// Create a project with comprehensive settings
{
  "name": "create_project",
  "arguments": {
    "name": "Website Redesign Project",
    "code": "WEB-2024-001",
    "notes": "Complete redesign of company website with modern UI/UX",
    "color": "#3498db",
    "startDate": "2024-01-15",
    "endDate": "2024-06-30",
    "invoicing": {
      "method": "ProjectHourlyRate",
      "hourlyRate": 125.00,
      "reference": "WEB-2024-INV"
    },
    "budget": {
      "method": "TotalHours",
      "hours": 400,
      "notificationPercentage": 80
    },
    "customer": {"id": 123},
    "managers": [{"id": 456}],
    "tags": [{"id": 1}, {"id": 2}],
    "projectTasks": [
      {
        "active": true,
        "billable": true,
        "hourlyRate": 125.00,
        "budgetHours": 100,
        "task": {"id": 789}
      },
      {
        "active": true,
        "billable": true,
        "hourlyRate": 150.00,
        "budgetHours": 80,
        "task": {"id": 790}
      }
    ],
    "projectUsers": [
      {
        "active": true,
        "hourlyRate": 125.00,
        "budgetHours": 200,
        "costHourlyRate": 80.00,
        "user": {"id": 101}
      },
      {
        "active": true,
        "hourlyRate": 150.00,
        "budgetHours": 200,
        "costHourlyRate": 100.00,
        "user": {"id": 102}
      }
    ]
  }
}

// Update the project with new requirements
{
  "name": "update_project",
  "arguments": {
    "id": 123,
    "name": "Website Redesign Project - Phase 2",
    "endDate": "2024-08-31",
    "invoicing": {
      "method": "ProjectHourlyRate",
      "hourlyRate": 150.00
    },
    "budget": {
      "method": "TotalHours",
      "hours": 600,
      "notificationPercentage": 85
    },
    "projectTasks": [
      {
        "id": 456,
        "active": true,
        "billable": true,
        "hourlyRate": 150.00,
        "budgetHours": 120,
        "task": {"id": 789}
      }
    ],
    "projectUsers": [
      {
        "id": 789,
        "active": true,
        "hourlyRate": 150.00,
        "budgetHours": 300,
        "costHourlyRate": 90.00,
        "user": {"id": 101}
      }
    ]
  }
}

// Get project insights for performance analysis
{
  "name": "get_project_insights",
  "arguments": {
    "id": 123
  }
}

// Get project with expanded relationships
{
  "name": "get_project_by_id",
  "arguments": {
    "id": 123,
    "expand": "customer,managers,tags,projectTasks,projectUsers"
  }
}
```

### Creating and Managing Users
```json
// Create a user with contract and role assignment
{
  "name": "create_user",
  "arguments": {
    "userName": "john.doe@company.com",
    "displayName": "John Doe",
    "language": "en",
    "role": {"id": 2},
    "sendInvitation": true,
    "contracts": [
      {
        "startDate": "2024-01-15",
        "endDate": "2024-12-31",
        "weekHours": 40,
        "hourlyRate": 75.00,
        "costHourlyRate": 50.00,
        "contractNumber": "EMP-2024-001",
        "contractType": {"id": 1}
      }
    ]
  }
}

// Update the user with new role and contract terms
{
  "name": "update_user",
  "arguments": {
    "id": 123,
    "displayName": "John Doe - Senior Developer",
    "language": "en",
    "employeeNumber": "EMP-001",
    "badgeNumber": "BADGE-001",
    "citizenServiceNumber": "123456789",
    "role": {"id": 3},
    "tags": [{"id": 1}, {"id": 2}],
    "contracts": [
      {
        "id": 456,
        "startDate": "2024-01-15",
        "endDate": "2024-12-31",
        "weekHours": 40,
        "hourlyRate": 85.00,
        "costHourlyRate": 55.00,
        "contractNumber": "EMP-2024-001-UPD",
        "contractType": {"id": 1}
      }
    ]
  }
}

// Get user with expanded relationships
{
  "name": "get_user_by_id",
  "arguments": {
    "id": 123,
    "expand": "role,team,tags,contracts,selfBilling,customSchedule"
  }
}

// Get users with filtering and expansion
{
  "name": "get_users",
  "arguments": {
    "filter": "active eq true and role/name eq 'Developer'",
    "expand": "role,contracts",
    "orderby": "displayName asc",
    "top": 50
  }
}
```

### Creating and Managing Mileage

```json
// Create a mileage entry
{
  "name": "create_mileage",
  "arguments": {
    "date": "2024-01-15",
    "fromAddress": "Office - 123 Business St, Business City",
    "toAddress": "Client Site - 456 Client Ave, Client City",
    "notes": "Client meeting and project consultation",
    "distance": 45.5,
    "billable": true,
    "type": "Business",
    "customer": {"id": 123},
    "project": {"id": 456},
    "vehicle": {"id": 789},
    "user": {"id": 101}
  }
}

// Update the mileage entry
{
  "name": "update_mileage",
  "arguments": {
    "id": 123,
    "notes": "Updated: Client meeting, project consultation, and site inspection",
    "distance": 52.3,
    "fromAddress": "Office - 123 Business St, Business City",
    "toAddress": "Client Site - 456 Client Ave, Client City (with site inspection)",
    "type": "Business",
    "user": {"id": 101}
  }
}

// Update mileage status (approve multiple mileage entries)
{
  "name": "update_mileage_status",
  "arguments": {
    "message": "Approved by manager after review",
    "mileages": [{"id": 123}, {"id": 124}],
    "status": "Approved"
  }
}

// Update mileage client status
{
  "name": "update_mileage_client_status",
  "arguments": {
    "clientStatus": "Approved",
    "message": "Client approved mileage claims",
    "mileages": [{"id": 123}, {"id": 124}]
  }
}

// Get mileage status history
{
  "name": "get_mileage_status_history",
  "arguments": {
    "id": 123,
    "orderby": "modifiedOn desc"
  }
}

// Get mileage entries with filtering
{
  "name": "get_mileage",
  "arguments": {
    "user_id": "101",
    "from_date": "2024-01-01",
    "to_date": "2024-01-31",
    "filter": "type eq 'Business' and billable eq true",
    "expand": "user,project,customer,vehicle",
    "orderby": "date desc"
  }
}

// Get mileage vehicles
{
  "name": "get_mileage_vehicles",
  "arguments": {
    "active_only": true,
    "expand": "users",
    "orderby": "brand asc"
  }
}

// Get specific mileage vehicle with users
{
  "name": "get_mileage_vehicle_by_id",
  "arguments": {
    "id": 789,
    "expand": "users"
  }
}
```

## Error Handling

The server includes comprehensive error handling:

- **Authentication errors**: When API key is missing or invalid
- **API errors**: When TimeChimp API returns error responses (including 429 rate limiting)
- **Network errors**: When requests fail due to connectivity issues
- **Validation errors**: When invalid parameters are provided
- **OData errors**: When invalid filter or orderby expressions are used

Error responses include detailed error messages to help with debugging.

## Development

### Project Structure

```
TimeJS/
├── timechimp-mcp-server.js    # Main server file
├── package.json               # Node.js dependencies and scripts
└── README.md                  # This file
```

### Adding New Tools

To add new tools:

1. Add the tool definition to the `ListToolsRequestSchema` handler
2. Add a case for the tool in the `CallToolRequestSchema` handler
3. Implement the tool method in the `TimechimpMCPServer` class
4. Use the generic `handleGetRequest` or `handleGetByIdRequest` methods for consistency

### Testing

You can test the server using any MCP client or by running it directly and sending JSON-RPC messages via stdin.

## Troubleshooting

### Common Issues

1. **"TIMECHIMP_API_KEY environment variable is required"**
   - Make sure you've set the `TIMECHIMP_API_KEY` environment variable
   - Verify the API key is correct and has proper permissions

2. **"TimeChimp API error: 401 Unauthorized"**
   - Check that your API key is valid and not expired
   - Ensure your TimeChimp account has API access enabled

3. **"TimeChimp API error: 404 Not Found"**
   - The API endpoint might not exist or the URL might be incorrect
   - Check if you're using the correct TimeChimp API v2 base URL

4. **"TimeChimp API error: 429 Too Many Requests"**
   - You've exceeded the rate limit (100 requests per minute per company)
   - Wait for the rate limit to reset or implement request throttling

5. **OData filter errors**
   - Verify your filter syntax follows OData conventions
   - Check that field names are correct and properly escaped
   - Use single quotes for string values: `name eq 'Project Name'`

6. **Network connection errors**
   - Verify your internet connection
   - Check if there are any firewall restrictions

### Debug Mode

Run the server in debug mode to get more detailed logging:

```bash
npm run dev
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues related to:
- **This MCP server**: Open an issue in this repository
- **TimeChimp API**: Contact TimeChimp support at ict@timechimp.com
- **MCP protocol**: Check the Model Context Protocol documentation

## Changelog

### v0.7.0
- Added full CRUD operations for mileage (Create, Read, Update, Delete)
- Added mileage status management with internal and external status updates
- Added mileage status history tracking functionality
- Added mileage vehicle management (Read operations)
- Enhanced mileage management with comprehensive linking to customers, projects, vehicles, and users
- Added bulk status update capabilities for mileage (up to 100 entries at once)
- Updated tool count to 46 total tools
- Added mileage CRUD examples to documentation

### v0.6.0
- Added full CRUD operations for users (Create, Read, Update, Delete)
- Added user contract management and role assignment
- Updated tool count to 38 total tools
- Added user CRUD examples to documentation

### v0.5.0
- Added full CRUD operations for projects (Create, Read, Update, Delete)
- Added project insights functionality
- Updated tool count to 36 total tools
- Added project CRUD examples to documentation

### v0.4.0
- Added full CRUD operations for expenses (Create, Read, Update, Delete)
- Added expense status management with internal and external status updates
- Added expense status history tracking functionality
- Enhanced expense management with comprehensive linking to customers, projects, products, users, and VAT rates
- Added bulk status update capabilities (up to 100 expenses at once)
- Updated tool count to 32 total tools
- Added expense CRUD examples to documentation

### v0.3.0
- Added full CRUD operations for customers (Create, Read, Update, Delete)
- Added comprehensive customer management with address, payment terms, rates, and relationships
- Enhanced customer tools with support for VAT rates, tags, and contact linking
- Updated tool count to 26 total tools
- Added customer CRUD examples to documentation

### v0.2.0
- Added comprehensive support for all major TimeChimp API v2 endpoints
- Added full CRUD operations for contacts (Create, Read, Update, Delete)
- Added support for customers, tasks, invoices, expenses, mileage, and tags
- Added generic request handlers for consistency and maintainability
- Enhanced OData support with $expand, $count, and improved filtering
- Added individual "get by ID" tools for all resource types
- Improved error handling and validation
- Updated API version header to 2.0

### v0.1.0
- Initial release
- Support for GetProjects, Users, and TimeEntries tools
- TimeChimp API v2 integration with OData support
- Comprehensive error handling and validation
- Default sorting for projects (most recent first)