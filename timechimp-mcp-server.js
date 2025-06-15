#!/usr/bin/env node

/**
 * TimeChimp MCP Server
 * 
 * A Model Context Protocol (MCP) server for interacting with TimeChimp API v2.
 * Provides comprehensive tools for all TimeChimp endpoints including projects, users, 
 * time entries, contacts, customers, tasks, invoices, expenses, mileage, and more.
 * 
 * Authentication: Uses API key in the 'api-key' header
 * Base URL: https://v2.api.timechimp.com
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

class TimechimpMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'timechimp-mcp-server',
        version: '0.7.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.apiKey = process.env.TIMECHIMP_API_KEY;
    this.baseUrl = 'https://v2.api.timechimp.com';

    this.setupToolHandlers();
  }

  /**
   * Make an authenticated request to the TimeChimp API
   */
  async makeRequest(endpoint, options = {}) {
    if (!this.apiKey) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'TIMECHIMP_API_KEY environment variable is required'
      );
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'api-key': this.apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'api-version': '2.0',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new McpError(
          ErrorCode.InternalError,
          `TimeChimp API error: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }
      throw new McpError(
        ErrorCode.InternalError,
        `Request failed: ${error.message}`
      );
    }
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          // Projects
          {
            name: 'get_projects',
            description: 'Retrieve all projects from TimeChimp',
            inputSchema: {
              type: 'object',
              properties: {
                top: {
                  type: 'number',
                  description: 'Maximum number of projects to return (1-10000, default: 100)',
                  minimum: 1,
                  maximum: 10000,
                },
                skip: {
                  type: 'number',
                  description: 'Number of projects to skip for pagination (default: 0)',
                  minimum: 0,
                },
                count: {
                  type: 'boolean',
                  description: 'Whether to include the total count of results (default: true)',
                },
                expand: {
                  type: 'string',
                  description: 'Comma-delimited list of properties to expand (e.g., "customer,tasks")',
                },
                active_only: {
                  type: 'boolean',
                  description: 'Only return active projects (default: false)',
                },
                filter: {
                  type: 'string',
                  description: 'OData filter expression (e.g., "name eq \'Project Name\'" or "active eq true")',
                },
                orderby: {
                  type: 'string',
                  description: 'OData orderby expression (e.g., "name desc" or "createdAt desc")',
                },
              },
              additionalProperties: false,
            },
          },
          {
            name: 'get_project_by_id',
            description: 'Get a specific project by ID',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  description: 'Project ID',
                },
                expand: {
                  type: 'string',
                  description: 'Comma-delimited list of properties to expand',
                },
              },
              required: ['id'],
              additionalProperties: false,
            },
          },
          {
            name: 'create_project',
            description: 'Create a new project',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'The project name',
                },
                active: {
                  type: 'boolean',
                  description: 'Whether the project can be used (default: true)',
                },
                code: {
                  type: 'string',
                  description: 'The project code',
                },
                notes: {
                  type: 'string',
                  description: 'The project description',
                },
                color: {
                  type: 'string',
                  description: 'The project color',
                },
                startDate: {
                  type: 'string',
                  description: 'The project start date (YYYY-MM-DD format)',
                  pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                },
                endDate: {
                  type: 'string',
                  description: 'The project end date (YYYY-MM-DD format)',
                  pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                },
                invoicing: {
                  type: 'object',
                  description: 'The project invoicing settings',
                  properties: {
                    method: {
                      type: 'string',
                      description: 'The project invoicing method used',
                      enum: ['NoInvoicing', 'TaskHourlyRate', 'UserHourlyRate', 'ProjectHourlyRate', 'CustomerHourlyRate', 'ProjectRate', 'TaskRate'],
                    },
                    hourlyRate: {
                      type: 'number',
                      description: 'The hourly rate of the project (only used when invoicing method = ProjectHourlyRate)',
                    },
                    fixedRate: {
                      type: 'number',
                      description: 'The fixed rate/price of the project (only used when invoicing method = ProjectRate)',
                    },
                    reference: {
                      type: 'string',
                      description: 'The project invoicing reference',
                    },
                    date: {
                      type: 'string',
                      description: 'The project invoicing date (YYYY-MM-DD format, only used when invoicing method = ProjectRate)',
                      pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                    },
                  },
                  additionalProperties: false,
                },
                budget: {
                  type: 'object',
                  description: 'The project budget settings',
                  properties: {
                    method: {
                      type: 'string',
                      description: 'The project budget method used',
                      enum: ['NoBudget', 'TotalHours', 'TaskHours', 'UserHours', 'TotalRate', 'TaskRate', 'TotalCost'],
                    },
                    hours: {
                      type: 'number',
                      description: 'The hourly budget of the project (only used when budget method = TotalHours)',
                    },
                    rate: {
                      type: 'number',
                      description: 'The budget rate of the project (only used when budget method = TotalRate or TotalCost)',
                    },
                    notificationPercentage: {
                      type: 'number',
                      description: 'The budget percentage threshold at which a notification is sent out',
                    },
                  },
                  additionalProperties: false,
                },
                customer: {
                  type: 'object',
                  description: 'Customer to be linked with the project',
                  properties: {
                    id: {
                      type: 'number',
                      description: 'Unique identifier for the customer',
                    },
                  },
                  required: ['id'],
                  additionalProperties: false,
                },
                mainProject: {
                  type: 'object',
                  description: 'Main project to be linked with the project (if it is a subproject)',
                  properties: {
                    id: {
                      type: 'number',
                      description: 'Unique identifier for the project',
                    },
                  },
                  required: ['id'],
                  additionalProperties: false,
                },
                subprojects: {
                  type: 'array',
                  description: 'List of subprojects to be linked to the project (if it is a main project)',
                  items: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'number',
                        description: 'Unique identifier for the project',
                      },
                    },
                    required: ['id'],
                    additionalProperties: false,
                  },
                },
                managers: {
                  type: 'array',
                  description: 'List of managers to be linked to the project',
                  items: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'number',
                        description: 'Unique identifier for the user',
                      },
                    },
                    required: ['id'],
                    additionalProperties: false,
                  },
                },
                tags: {
                  type: 'array',
                  description: 'List of tags to be linked to the project',
                  items: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'number',
                        description: 'Unique identifier for the tag',
                      },
                    },
                    required: ['id'],
                    additionalProperties: false,
                  },
                },
                projectTasks: {
                  type: 'array',
                  description: 'List of project tasks to be linked to the project (if no tasks are specified, active common tasks will be prefilled)',
                  items: {
                    type: 'object',
                    properties: {
                      active: {
                        type: 'boolean',
                        description: 'Whether the project task can be used for registration (default: true)',
                      },
                      billable: {
                        type: 'boolean',
                        description: 'Whether the project task can be invoiced (default: true)',
                      },
                      hourlyRate: {
                        type: 'number',
                        description: 'The project task hourly rate (used when project invoicing method = TaskHourlyRate)',
                      },
                      fixedRate: {
                        type: 'number',
                        description: 'The project task fixed rate (used when project invoicing method = TaskRate)',
                      },
                      budgetHours: {
                        type: 'number',
                        description: 'The project task budget hours (used when project budget method = TaskHours)',
                      },
                      budgetRate: {
                        type: 'number',
                        description: 'The project task budget rate (used when project budget method = TaskRate)',
                      },
                      task: {
                        type: 'object',
                        description: 'Task to be linked to the project task',
                        properties: {
                          id: {
                            type: 'number',
                            description: 'Unique identifier for the task',
                          },
                        },
                        required: ['id'],
                        additionalProperties: false,
                      },
                    },
                    required: ['task'],
                    additionalProperties: false,
                  },
                },
                projectUsers: {
                  type: 'array',
                  description: 'List of project users to be linked to the project (if no users are specified, active users will be prefilled)',
                  items: {
                    type: 'object',
                    properties: {
                      active: {
                        type: 'boolean',
                        description: 'Whether the project user can be used (default: true)',
                      },
                      hourlyRate: {
                        type: 'number',
                        description: 'The project user hourly rate (used when project invoicing method = UserHourlyRate)',
                      },
                      budgetHours: {
                        type: 'number',
                        description: 'The project user budget hours (used when project budget method = UserHours)',
                      },
                      costHourlyRate: {
                        type: 'number',
                        description: 'The project user purchase hourly rate',
                      },
                      user: {
                        type: 'object',
                        description: 'User to be linked to the project user',
                        properties: {
                          id: {
                            type: 'number',
                            description: 'Unique identifier for the user',
                          },
                        },
                        required: ['id'],
                        additionalProperties: false,
                      },
                    },
                    required: ['user'],
                    additionalProperties: false,
                  },
                },
              },
              required: ['name', 'projectTasks', 'projectUsers'],
              additionalProperties: false,
            },
          },
          {
            name: 'update_project',
            description: 'Update an existing project',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  description: 'Project ID',
                },
                name: {
                  type: 'string',
                  description: 'The project name',
                },
                active: {
                  type: 'boolean',
                  description: 'Whether the project can be used',
                },
                code: {
                  type: 'string',
                  description: 'The project code',
                },
                notes: {
                  type: 'string',
                  description: 'The project description',
                },
                color: {
                  type: 'string',
                  description: 'The project color',
                },
                startDate: {
                  type: 'string',
                  description: 'The project start date (YYYY-MM-DD format)',
                  pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                },
                endDate: {
                  type: 'string',
                  description: 'The project end date (YYYY-MM-DD format)',
                  pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                },
                invoicing: {
                  type: 'object',
                  description: 'The project invoicing settings',
                  properties: {
                    method: {
                      type: 'string',
                      description: 'The project invoicing method used',
                      enum: ['NoInvoicing', 'TaskHourlyRate', 'UserHourlyRate', 'ProjectHourlyRate', 'CustomerHourlyRate', 'ProjectRate', 'TaskRate', 'Subscription'],
                    },
                    hourlyRate: {
                      type: 'number',
                      description: 'The hourly rate of the project (only used when invoicing method = ProjectHourlyRate)',
                    },
                    fixedRate: {
                      type: 'number',
                      description: 'The fixed rate/price of the project (only used when invoicing method = ProjectRate)',
                    },
                    reference: {
                      type: 'string',
                      description: 'The project invoicing reference',
                    },
                    date: {
                      type: 'string',
                      description: 'The project invoicing date (YYYY-MM-DD format, only used when invoicing method = ProjectRate)',
                      pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                    },
                  },
                  additionalProperties: false,
                },
                budget: {
                  type: 'object',
                  description: 'The project budget settings',
                  properties: {
                    method: {
                      type: 'string',
                      description: 'The project budget method used',
                      enum: ['NoBudget', 'TotalHours', 'TaskHours', 'UserHours', 'TotalRate', 'TaskRate', 'Invoiced', 'TotalCost'],
                    },
                    hours: {
                      type: 'number',
                      description: 'The hourly budget of the project (only used when budget method = TotalHours)',
                    },
                    rate: {
                      type: 'number',
                      description: 'The budget rate of the project (only used when budget method = TotalRate or TotalCost)',
                    },
                    notificationPercentage: {
                      type: 'number',
                      description: 'The budget percentage threshold at which a notification is sent out',
                    },
                  },
                  additionalProperties: false,
                },
                customer: {
                  type: 'object',
                  description: 'Customer to be linked with the project',
                  properties: {
                    id: {
                      type: 'number',
                      description: 'Unique identifier for the customer',
                    },
                  },
                  required: ['id'],
                  additionalProperties: false,
                },
                mainProject: {
                  type: 'object',
                  description: 'Main project to be linked with the project (if it is a subproject)',
                  properties: {
                    id: {
                      type: 'number',
                      description: 'Unique identifier for the project',
                    },
                  },
                  required: ['id'],
                  additionalProperties: false,
                },
                subprojects: {
                  type: 'array',
                  description: 'List of subprojects to be linked to the project (if it is a main project)',
                  items: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'number',
                        description: 'Unique identifier for the project',
                      },
                    },
                    required: ['id'],
                    additionalProperties: false,
                  },
                },
                managers: {
                  type: 'array',
                  description: 'List of managers to be linked to the project',
                  items: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'number',
                        description: 'Unique identifier for the user',
                      },
                    },
                    required: ['id'],
                    additionalProperties: false,
                  },
                },
                tags: {
                  type: 'array',
                  description: 'List of tags to be linked to the project',
                  items: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'number',
                        description: 'Unique identifier for the tag',
                      },
                    },
                    required: ['id'],
                    additionalProperties: false,
                  },
                },
                projectTasks: {
                  type: 'array',
                  description: 'List of project tasks to be linked to the project',
                  items: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'number',
                        description: 'Unique identifier for the project task (can be null if new project task needs to be added)',
                      },
                      active: {
                        type: 'boolean',
                        description: 'Whether the project task can be used for registration (default: true)',
                      },
                      billable: {
                        type: 'boolean',
                        description: 'Whether the project task can be invoiced (default: true)',
                      },
                      hourlyRate: {
                        type: 'number',
                        description: 'The project task hourly rate (used when project invoicing method = TaskHourlyRate)',
                      },
                      fixedRate: {
                        type: 'number',
                        description: 'The project task fixed rate (used when project invoicing method = TaskRate)',
                      },
                      budgetHours: {
                        type: 'number',
                        description: 'The project task budget hours (used when project budget method = TaskHours)',
                      },
                      budgetRate: {
                        type: 'number',
                        description: 'The project task budget rate (used when project budget method = TaskRate)',
                      },
                      task: {
                        type: 'object',
                        description: 'Task to be linked to the project task',
                        properties: {
                          id: {
                            type: 'number',
                            description: 'Unique identifier for the task',
                          },
                        },
                        required: ['id'],
                        additionalProperties: false,
                      },
                    },
                    required: ['task'],
                    additionalProperties: false,
                  },
                },
                projectUsers: {
                  type: 'array',
                  description: 'List of project users to be linked to the project',
                  items: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'number',
                        description: 'Unique identifier for the project user (can be null if new project user needs to be added)',
                      },
                      active: {
                        type: 'boolean',
                        description: 'Whether the project user can be used (default: true)',
                      },
                      hourlyRate: {
                        type: 'number',
                        description: 'The project user hourly rate (used when project invoicing method = UserHourlyRate)',
                      },
                      budgetHours: {
                        type: 'number',
                        description: 'The project user budget hours (used when project budget method = UserHours)',
                      },
                      costHourlyRate: {
                        type: 'number',
                        description: 'The project user purchase hourly rate',
                      },
                      user: {
                        type: 'object',
                        description: 'User to be linked to the project user',
                        properties: {
                          id: {
                            type: 'number',
                            description: 'Unique identifier for the user',
                          },
                        },
                        required: ['id'],
                        additionalProperties: false,
                      },
                    },
                    required: ['user'],
                    additionalProperties: false,
                  },
                },
              },
              required: ['id', 'name', 'invoicing', 'budget', 'projectTasks', 'projectUsers'],
              additionalProperties: false,
            },
          },
          {
            name: 'delete_project',
            description: 'Delete a project',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  description: 'Project ID',
                },
              },
              required: ['id'],
              additionalProperties: false,
            },
          },
          {
            name: 'get_project_insights',
            description: 'Get project insights including hours, budget, costs, and revenue data',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  description: 'Project ID',
                },
              },
              required: ['id'],
              additionalProperties: false,
            },
          },
          // Users
          {
            name: 'get_users',
            description: 'Retrieve all users from TimeChimp',
            inputSchema: {
              type: 'object',
              properties: {
                top: {
                  type: 'number',
                  description: 'Maximum number of users to return (1-10000, default: 100)',
                  minimum: 1,
                  maximum: 10000,
                },
                skip: {
                  type: 'number',
                  description: 'Number of users to skip for pagination (default: 0)',
                  minimum: 0,
                },
                count: {
                  type: 'boolean',
                  description: 'Whether to include the total count of results (default: true)',
                },
                expand: {
                  type: 'string',
                  description: 'Comma-delimited list of properties to expand',
                },
                active_only: {
                  type: 'boolean',
                  description: 'Only return active users (default: false)',
                },
                filter: {
                  type: 'string',
                  description: 'OData filter expression (e.g., "firstName eq \'John\'" or "active eq true")',
                },
                orderby: {
                  type: 'string',
                  description: 'OData orderby expression (e.g., "firstName asc" or "lastName desc")',
                },
              },
              additionalProperties: false,
            },
          },
          {
            name: 'get_user_by_id',
            description: 'Get a specific user by ID',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  description: 'User ID',
                },
                expand: {
                  type: 'string',
                  description: 'Comma-delimited list of properties to expand',
                },
              },
              required: ['id'],
              additionalProperties: false,
            },
          },
          {
            name: 'create_user',
            description: 'Create a new user (note: adding users can result in additional invoice and extra cost)',
            inputSchema: {
              type: 'object',
              properties: {
                userName: {
                  type: 'string',
                  description: 'The user email address',
                },
                displayName: {
                  type: 'string',
                  description: 'The user name',
                },
                language: {
                  type: 'string',
                  description: 'The user language (default: en)',
                  enum: ['en', 'nl', 'de', 'pl', 'fr', 'es'],
                },
                role: {
                  type: 'object',
                  description: 'Role to be assigned to the user (default: User)',
                  properties: {
                    id: {
                      type: 'number',
                      description: 'Unique identifier for the role',
                    },
                  },
                  required: ['id'],
                  additionalProperties: false,
                },
                sendInvitation: {
                  type: 'boolean',
                  description: 'Whether an invitation should be sent to the user (default: false)',
                },
                contracts: {
                  type: 'array',
                  description: 'List of user contracts to be linked',
                  items: {
                    type: 'object',
                    properties: {
                      startDate: {
                        type: 'string',
                        description: 'The contract start date (YYYY-MM-DD format, default: UTC today)',
                        pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                      },
                      endDate: {
                        type: 'string',
                        description: 'The contract end date (YYYY-MM-DD format)',
                        pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                      },
                      weekHours: {
                        type: 'number',
                        description: 'The contract hours per week',
                      },
                      hourlyRate: {
                        type: 'number',
                        description: 'The contract sales hourly rate',
                      },
                      costHourlyRate: {
                        type: 'number',
                        description: 'The contract purchase hourly rate',
                      },
                      contractNumber: {
                        type: 'string',
                        description: 'The contract number',
                      },
                      contractType: {
                        type: 'object',
                        description: 'Contract type to be linked to the contract',
                        properties: {
                          id: {
                            type: 'number',
                            description: 'Unique identifier for the contract type',
                          },
                        },
                        required: ['id'],
                        additionalProperties: false,
                      },
                    },
                    required: ['contractType'],
                    additionalProperties: false,
                  },
                },
              },
              required: ['userName', 'displayName'],
              additionalProperties: false,
            },
          },
          {
            name: 'update_user',
            description: 'Update an existing user',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  description: 'User ID',
                },
                displayName: {
                  type: 'string',
                  description: 'The user name',
                },
                language: {
                  type: 'string',
                  description: 'The user language (default: en)',
                  enum: ['en', 'nl', 'de', 'pl', 'fr', 'es'],
                },
                employeeNumber: {
                  type: 'string',
                  description: 'The user employee number',
                },
                badgeNumber: {
                  type: 'string',
                  description: 'The user badge number',
                },
                citizenServiceNumber: {
                  type: 'string',
                  description: 'The user citizen service number',
                },
                role: {
                  type: 'object',
                  description: 'Role to be assigned to the user (default: User)',
                  properties: {
                    id: {
                      type: 'number',
                      description: 'Unique identifier for the role',
                    },
                  },
                  required: ['id'],
                  additionalProperties: false,
                },
                tags: {
                  type: 'array',
                  description: 'List of tags to be linked with the user',
                  items: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'number',
                        description: 'Unique identifier for the tag',
                      },
                    },
                    required: ['id'],
                    additionalProperties: false,
                  },
                },
                contracts: {
                  type: 'array',
                  description: 'List of user contracts to be linked',
                  items: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'number',
                        description: 'Unique identifier for the user contract (can be null if new user contract needs to be added)',
                      },
                      startDate: {
                        type: 'string',
                        description: 'The contract start date (YYYY-MM-DD format, default: UTC today)',
                        pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                      },
                      endDate: {
                        type: 'string',
                        description: 'The contract end date (YYYY-MM-DD format)',
                        pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                      },
                      weekHours: {
                        type: 'number',
                        description: 'The contract hours per week',
                      },
                      hourlyRate: {
                        type: 'number',
                        description: 'The contract sales hourly rate',
                      },
                      costHourlyRate: {
                        type: 'number',
                        description: 'The contract purchase/cost hourly rate',
                      },
                      contractNumber: {
                        type: 'string',
                        description: 'The contract number',
                      },
                      contractType: {
                        type: 'object',
                        description: 'Contract type to be linked with the contract',
                        properties: {
                          id: {
                            type: 'number',
                            description: 'Unique identifier for the contract type',
                          },
                        },
                        required: ['id'],
                        additionalProperties: false,
                      },
                    },
                    required: ['contractType'],
                    additionalProperties: false,
                  },
                },
              },
              required: ['id', 'displayName'],
              additionalProperties: false,
            },
          },
          // Time Entries
          {
            name: 'get_time_entries',
            description: 'Retrieve time entries from TimeChimp',
            inputSchema: {
              type: 'object',
              properties: {
                top: {
                  type: 'number',
                  description: 'Maximum number of time entries to return (1-10000, default: 100)',
                  minimum: 1,
                  maximum: 10000,
                },
                skip: {
                  type: 'number',
                  description: 'Number of time entries to skip for pagination (default: 0)',
                  minimum: 0,
                },
                count: {
                  type: 'boolean',
                  description: 'Whether to include the total count of results (default: true)',
                },
                expand: {
                  type: 'string',
                  description: 'Comma-delimited list of properties to expand (e.g., "user,project,task")',
                },
                user_id: {
                  type: 'string',
                  description: 'Filter by specific user ID',
                },
                project_id: {
                  type: 'string',
                  description: 'Filter by specific project ID',
                },
                from_date: {
                  type: 'string',
                  description: 'Start date for filtering (YYYY-MM-DD format)',
                  pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                },
                to_date: {
                  type: 'string',
                  description: 'End date for filtering (YYYY-MM-DD format)',
                  pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                },
                filter: {
                  type: 'string',
                  description: 'OData filter expression (e.g., "date eq 2023-12-31" or "start gt 2023-12-31T23:59:59Z")',
                },
                orderby: {
                  type: 'string',
                  description: 'OData orderby expression (e.g., "date desc" or "start desc")',
                },
              },
              additionalProperties: false,
            },
          },
          {
            name: 'get_time_entry_by_id',
            description: 'Get a specific time entry by ID',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  description: 'Time entry ID',
                },
                expand: {
                  type: 'string',
                  description: 'Comma-delimited list of properties to expand',
                },
              },
              required: ['id'],
              additionalProperties: false,
            },
          },
          // Contacts
          {
            name: 'get_contacts',
            description: 'Retrieve all contacts from TimeChimp',
            inputSchema: {
              type: 'object',
              properties: {
                top: {
                  type: 'number',
                  description: 'Maximum number of contacts to return (1-10000, default: 100)',
                  minimum: 1,
                  maximum: 10000,
                },
                skip: {
                  type: 'number',
                  description: 'Number of contacts to skip for pagination (default: 0)',
                  minimum: 0,
                },
                count: {
                  type: 'boolean',
                  description: 'Whether to include the total count of results (default: true)',
                },
                expand: {
                  type: 'string',
                  description: 'Comma-delimited list of properties to expand (e.g., "customers")',
                },
                active_only: {
                  type: 'boolean',
                  description: 'Only return active contacts (default: false)',
                },
                filter: {
                  type: 'string',
                  description: 'OData filter expression (e.g., "name eq \'John Doe\'" or "active eq true")',
                },
                orderby: {
                  type: 'string',
                  description: 'OData orderby expression (e.g., "name asc" or "created desc")',
                },
              },
              additionalProperties: false,
            },
          },
          {
            name: 'get_contact_by_id',
            description: 'Get a specific contact by ID',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  description: 'Contact ID',
                },
                expand: {
                  type: 'string',
                  description: 'Comma-delimited list of properties to expand',
                },
              },
              required: ['id'],
              additionalProperties: false,
            },
          },
          {
            name: 'create_contact',
            description: 'Create a new contact',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'The contact name',
                },
                jobTitle: {
                  type: 'string',
                  description: 'The contact job title',
                },
                email: {
                  type: 'string',
                  description: 'The contact email address',
                },
                phone: {
                  type: 'string',
                  description: 'The contact phone number',
                },
                useForInvoicing: {
                  type: 'boolean',
                  description: 'Whether the contact info will be used for invoicing (default: false)',
                },
                active: {
                  type: 'boolean',
                  description: 'Whether the contact can be used (default: true)',
                },
                customers: {
                  type: 'array',
                  description: 'List of customer IDs to link to this contact',
                  items: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'number',
                        description: 'Customer ID',
                      },
                    },
                    required: ['id'],
                  },
                },
              },
              required: ['name'],
              additionalProperties: false,
            },
          },
          {
            name: 'update_contact',
            description: 'Update an existing contact',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  description: 'Contact ID',
                },
                name: {
                  type: 'string',
                  description: 'The contact name',
                },
                jobTitle: {
                  type: 'string',
                  description: 'The contact job title',
                },
                email: {
                  type: 'string',
                  description: 'The contact email address',
                },
                phone: {
                  type: 'string',
                  description: 'The contact phone number',
                },
                useForInvoicing: {
                  type: 'boolean',
                  description: 'Whether the contact info will be used for invoicing',
                },
                active: {
                  type: 'boolean',
                  description: 'Whether the contact can be used',
                },
                customers: {
                  type: 'array',
                  description: 'List of customer IDs to link to this contact',
                  items: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'number',
                        description: 'Customer ID',
                      },
                    },
                    required: ['id'],
                  },
                },
              },
              required: ['id', 'name'],
              additionalProperties: false,
            },
          },
          {
            name: 'delete_contact',
            description: 'Delete a contact',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  description: 'Contact ID',
                },
              },
              required: ['id'],
              additionalProperties: false,
            },
          },
          // Customers
          {
            name: 'get_customers',
            description: 'Retrieve all customers from TimeChimp',
            inputSchema: {
              type: 'object',
              properties: {
                top: {
                  type: 'number',
                  description: 'Maximum number of customers to return (1-10000, default: 100)',
                  minimum: 1,
                  maximum: 10000,
                },
                skip: {
                  type: 'number',
                  description: 'Number of customers to skip for pagination (default: 0)',
                  minimum: 0,
                },
                count: {
                  type: 'boolean',
                  description: 'Whether to include the total count of results (default: true)',
                },
                expand: {
                  type: 'string',
                  description: 'Comma-delimited list of properties to expand (e.g., "contacts,projects")',
                },
                active_only: {
                  type: 'boolean',
                  description: 'Only return active customers (default: false)',
                },
                filter: {
                  type: 'string',
                  description: 'OData filter expression (e.g., "name eq \'Company Name\'" or "active eq true")',
                },
                orderby: {
                  type: 'string',
                  description: 'OData orderby expression (e.g., "name asc" or "created desc")',
                },
              },
              additionalProperties: false,
            },
          },
          {
            name: 'get_customer_by_id',
            description: 'Get a specific customer by ID',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  description: 'Customer ID',
                },
                expand: {
                  type: 'string',
                  description: 'Comma-delimited list of properties to expand',
                },
              },
              required: ['id'],
              additionalProperties: false,
            },
          },
          {
            name: 'create_customer',
            description: 'Create a new customer',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'The customer name',
                },
                active: {
                  type: 'boolean',
                  description: 'Whether the customer can be used (default: true)',
                },
                relationId: {
                  type: 'string',
                  description: 'The customer number',
                },
                address: {
                  type: 'object',
                  description: 'The customer address info',
                  properties: {
                    address: {
                      type: 'string',
                      description: 'The address line',
                    },
                    postalCode: {
                      type: 'string',
                      description: 'The postal code',
                    },
                    city: {
                      type: 'string',
                      description: 'The city',
                    },
                    country: {
                      type: 'string',
                      description: 'The country',
                    },
                  },
                  additionalProperties: false,
                },
                phone: {
                  type: 'string',
                  description: 'The customer phone number',
                },
                email: {
                  type: 'string',
                  description: 'The customer email address',
                },
                website: {
                  type: 'string',
                  description: 'The customer website URL',
                },
                paymentPeriod: {
                  type: 'number',
                  description: 'The customer payment term in days',
                },
                hourlyRate: {
                  type: 'number',
                  description: 'The customer default hourly price',
                },
                mileageRate: {
                  type: 'number',
                  description: 'The customer default mileage price, per KM',
                },
                iban: {
                  type: 'string',
                  description: 'The customer IBAN',
                },
                bic: {
                  type: 'string',
                  description: 'The customer BIC',
                },
                vatNumber: {
                  type: 'string',
                  description: 'The customer VAT number',
                },
                kvkNumber: {
                  type: 'string',
                  description: 'The customer business ID',
                },
                invoiceAddress: {
                  type: 'object',
                  description: 'The customer invoice address info, override of the customer address info',
                  properties: {
                    address: {
                      type: 'string',
                      description: 'The address line',
                    },
                    postalCode: {
                      type: 'string',
                      description: 'The postal code',
                    },
                    city: {
                      type: 'string',
                      description: 'The city',
                    },
                    country: {
                      type: 'string',
                      description: 'The country',
                    },
                  },
                  additionalProperties: false,
                },
                notes: {
                  type: 'string',
                  description: 'The customer notes',
                },
                prospect: {
                  type: 'boolean',
                  description: 'The customer is a prospect',
                },
                vatRate: {
                  type: 'object',
                  description: 'Vat rate to be used for this customer',
                  properties: {
                    id: {
                      type: 'number',
                      description: 'Unique identifier for the vat rate',
                    },
                  },
                  required: ['id'],
                  additionalProperties: false,
                },
                tags: {
                  type: 'array',
                  description: 'List of tag IDs to link to this customer',
                  items: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'number',
                        description: 'Tag ID',
                      },
                    },
                    required: ['id'],
                    additionalProperties: false,
                  },
                },
                contacts: {
                  type: 'array',
                  description: 'List of contact IDs to link to this customer',
                  items: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'number',
                        description: 'Contact ID',
                      },
                    },
                    required: ['id'],
                    additionalProperties: false,
                  },
                },
              },
              required: ['name'],
              additionalProperties: false,
            },
          },
          {
            name: 'update_customer',
            description: 'Update an existing customer',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  description: 'Customer ID',
                },
                name: {
                  type: 'string',
                  description: 'The customer name',
                },
                active: {
                  type: 'boolean',
                  description: 'Whether the customer can be used',
                },
                relationId: {
                  type: 'string',
                  description: 'The customer number',
                },
                address: {
                  type: 'object',
                  description: 'The customer address info',
                  properties: {
                    address: {
                      type: 'string',
                      description: 'The address line',
                    },
                    postalCode: {
                      type: 'string',
                      description: 'The postal code',
                    },
                    city: {
                      type: 'string',
                      description: 'The city',
                    },
                    country: {
                      type: 'string',
                      description: 'The country',
                    },
                  },
                  additionalProperties: false,
                },
                phone: {
                  type: 'string',
                  description: 'The customer phone number',
                },
                email: {
                  type: 'string',
                  description: 'The customer email address',
                },
                website: {
                  type: 'string',
                  description: 'The customer website URL',
                },
                paymentPeriod: {
                  type: 'number',
                  description: 'The customer payment term in days',
                },
                hourlyRate: {
                  type: 'number',
                  description: 'The customer default hourly price',
                },
                mileageRate: {
                  type: 'number',
                  description: 'The customer default mileage price, per KM',
                },
                iban: {
                  type: 'string',
                  description: 'The customer IBAN',
                },
                bic: {
                  type: 'string',
                  description: 'The customer BIC',
                },
                vatNumber: {
                  type: 'string',
                  description: 'The customer VAT number',
                },
                kvkNumber: {
                  type: 'string',
                  description: 'The customer business ID',
                },
                invoiceAddress: {
                  type: 'object',
                  description: 'The customer invoice address info, if differs from the customer address info',
                  properties: {
                    address: {
                      type: 'string',
                      description: 'The address line',
                    },
                    postalCode: {
                      type: 'string',
                      description: 'The postal code',
                    },
                    city: {
                      type: 'string',
                      description: 'The city',
                    },
                    country: {
                      type: 'string',
                      description: 'The country',
                    },
                  },
                  additionalProperties: false,
                },
                notes: {
                  type: 'string',
                  description: 'The customer notes',
                },
                prospect: {
                  type: 'boolean',
                  description: 'The customer is a prospect',
                },
                vatRate: {
                  type: 'object',
                  description: 'Vat rate to be linked with the customer',
                  properties: {
                    id: {
                      type: 'number',
                      description: 'Unique identifier for the vat rate',
                    },
                  },
                  required: ['id'],
                  additionalProperties: false,
                },
                tags: {
                  type: 'array',
                  description: 'List of tag IDs to link to this customer',
                  items: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'number',
                        description: 'Tag ID',
                      },
                    },
                    required: ['id'],
                    additionalProperties: false,
                  },
                },
                contacts: {
                  type: 'array',
                  description: 'List of contact IDs to link to this customer',
                  items: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'number',
                        description: 'Contact ID',
                      },
                    },
                    required: ['id'],
                    additionalProperties: false,
                  },
                },
              },
              required: ['id', 'name'],
              additionalProperties: false,
            },
          },
          {
            name: 'delete_customer',
            description: 'Delete a customer',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  description: 'Customer ID',
                },
              },
              required: ['id'],
              additionalProperties: false,
            },
          },
          // Tasks
          {
            name: 'get_tasks',
            description: 'Retrieve all tasks from TimeChimp',
            inputSchema: {
              type: 'object',
              properties: {
                top: {
                  type: 'number',
                  description: 'Maximum number of tasks to return (1-10000, default: 100)',
                  minimum: 1,
                  maximum: 10000,
                },
                skip: {
                  type: 'number',
                  description: 'Number of tasks to skip for pagination (default: 0)',
                  minimum: 0,
                },
                count: {
                  type: 'boolean',
                  description: 'Whether to include the total count of results (default: true)',
                },
                expand: {
                  type: 'string',
                  description: 'Comma-delimited list of properties to expand (e.g., "project")',
                },
                active_only: {
                  type: 'boolean',
                  description: 'Only return active tasks (default: false)',
                },
                project_id: {
                  type: 'string',
                  description: 'Filter by specific project ID',
                },
                filter: {
                  type: 'string',
                  description: 'OData filter expression (e.g., "name eq \'Task Name\'" or "active eq true")',
                },
                orderby: {
                  type: 'string',
                  description: 'OData orderby expression (e.g., "name asc" or "created desc")',
                },
              },
              additionalProperties: false,
            },
          },
          {
            name: 'get_task_by_id',
            description: 'Get a specific task by ID',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  description: 'Task ID',
                },
                expand: {
                  type: 'string',
                  description: 'Comma-delimited list of properties to expand',
                },
              },
              required: ['id'],
              additionalProperties: false,
            },
          },
          // Invoices
          {
            name: 'get_invoices',
            description: 'Retrieve all invoices from TimeChimp',
            inputSchema: {
              type: 'object',
              properties: {
                top: {
                  type: 'number',
                  description: 'Maximum number of invoices to return (1-10000, default: 100)',
                  minimum: 1,
                  maximum: 10000,
                },
                skip: {
                  type: 'number',
                  description: 'Number of invoices to skip for pagination (default: 0)',
                  minimum: 0,
                },
                count: {
                  type: 'boolean',
                  description: 'Whether to include the total count of results (default: true)',
                },
                expand: {
                  type: 'string',
                  description: 'Comma-delimited list of properties to expand (e.g., "customer,projects")',
                },
                customer_id: {
                  type: 'string',
                  description: 'Filter by specific customer ID',
                },
                from_date: {
                  type: 'string',
                  description: 'Start date for filtering (YYYY-MM-DD format)',
                  pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                },
                to_date: {
                  type: 'string',
                  description: 'End date for filtering (YYYY-MM-DD format)',
                  pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                },
                filter: {
                  type: 'string',
                  description: 'OData filter expression (e.g., "status eq \'sent\'" or "total gt 1000")',
                },
                orderby: {
                  type: 'string',
                  description: 'OData orderby expression (e.g., "invoiceDate desc" or "total desc")',
                },
              },
              additionalProperties: false,
            },
          },
          {
            name: 'get_invoice_by_id',
            description: 'Get a specific invoice by ID',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  description: 'Invoice ID',
                },
                expand: {
                  type: 'string',
                  description: 'Comma-delimited list of properties to expand',
                },
              },
              required: ['id'],
              additionalProperties: false,
            },
          },
          // Expenses
          {
            name: 'get_expenses',
            description: 'Retrieve all expenses from TimeChimp',
            inputSchema: {
              type: 'object',
              properties: {
                top: {
                  type: 'number',
                  description: 'Maximum number of expenses to return (1-10000, default: 100)',
                  minimum: 1,
                  maximum: 10000,
                },
                skip: {
                  type: 'number',
                  description: 'Number of expenses to skip for pagination (default: 0)',
                  minimum: 0,
                },
                count: {
                  type: 'boolean',
                  description: 'Whether to include the total count of results (default: true)',
                },
                expand: {
                  type: 'string',
                  description: 'Comma-delimited list of properties to expand (e.g., "user,project,customer")',
                },
                user_id: {
                  type: 'string',
                  description: 'Filter by specific user ID',
                },
                project_id: {
                  type: 'string',
                  description: 'Filter by specific project ID',
                },
                customer_id: {
                  type: 'string',
                  description: 'Filter by specific customer ID',
                },
                from_date: {
                  type: 'string',
                  description: 'Start date for filtering (YYYY-MM-DD format)',
                  pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                },
                to_date: {
                  type: 'string',
                  description: 'End date for filtering (YYYY-MM-DD format)',
                  pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                },
                filter: {
                  type: 'string',
                  description: 'OData filter expression (e.g., "amount gt 100" or "approved eq true")',
                },
                orderby: {
                  type: 'string',
                  description: 'OData orderby expression (e.g., "date desc" or "amount desc")',
                },
              },
              additionalProperties: false,
            },
          },
          {
            name: 'get_expense_by_id',
            description: 'Get a specific expense by ID',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  description: 'Expense ID',
                },
                expand: {
                  type: 'string',
                  description: 'Comma-delimited list of properties to expand',
                },
              },
              required: ['id'],
              additionalProperties: false,
            },
          },
          {
            name: 'create_expense',
            description: 'Create a new expense',
            inputSchema: {
              type: 'object',
              properties: {
                date: {
                  type: 'string',
                  description: 'The expense date (YYYY-MM-DD format, default: UTC today)',
                  pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                },
                notes: {
                  type: 'string',
                  description: 'The expense notes',
                },
                quantity: {
                  type: 'number',
                  description: 'The expense quantity (default: 1)',
                  minimum: 0,
                },
                rate: {
                  type: 'number',
                  description: 'The expense rate/price',
                  minimum: 0,
                },
                billable: {
                  type: 'boolean',
                  description: 'Whether the expense can be invoiced (default: true)',
                },
                customer: {
                  type: 'object',
                  description: 'Customer to be linked with the expense',
                  properties: {
                    id: {
                      type: 'number',
                      description: 'Unique identifier for the customer',
                    },
                  },
                  required: ['id'],
                  additionalProperties: false,
                },
                project: {
                  type: 'object',
                  description: 'Project to be linked with the expense',
                  properties: {
                    id: {
                      type: 'number',
                      description: 'Unique identifier for the project',
                    },
                  },
                  required: ['id'],
                  additionalProperties: false,
                },
                product: {
                  type: 'object',
                  description: 'Product to be linked with the expense',
                  properties: {
                    id: {
                      type: 'number',
                      description: 'Unique identifier for the product',
                    },
                  },
                  required: ['id'],
                  additionalProperties: false,
                },
                user: {
                  type: 'object',
                  description: 'User to be linked with the expense',
                  properties: {
                    id: {
                      type: 'number',
                      description: 'Unique identifier for the user',
                    },
                  },
                  required: ['id'],
                  additionalProperties: false,
                },
                vatRate: {
                  type: 'object',
                  description: 'VAT rate to be linked with the expense (default: highest percentage)',
                  properties: {
                    id: {
                      type: 'number',
                      description: 'Unique identifier for the VAT rate',
                    },
                  },
                  required: ['id'],
                  additionalProperties: false,
                },
              },
              required: ['rate', 'user'],
              additionalProperties: false,
            },
          },
          {
            name: 'update_expense',
            description: 'Update an existing expense',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  description: 'Expense ID',
                },
                date: {
                  type: 'string',
                  description: 'The expense date (YYYY-MM-DD format)',
                  pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                },
                notes: {
                  type: 'string',
                  description: 'The expense notes',
                },
                quantity: {
                  type: 'number',
                  description: 'The expense quantity',
                  minimum: 0,
                },
                rate: {
                  type: 'number',
                  description: 'The expense rate/price',
                  minimum: 0,
                },
                billable: {
                  type: 'boolean',
                  description: 'Whether the expense can be invoiced',
                },
                customer: {
                  type: 'object',
                  description: 'Customer to be linked with the expense',
                  properties: {
                    id: {
                      type: 'number',
                      description: 'Unique identifier for the customer',
                    },
                  },
                  required: ['id'],
                  additionalProperties: false,
                },
                project: {
                  type: 'object',
                  description: 'Project to be linked with the expense',
                  properties: {
                    id: {
                      type: 'number',
                      description: 'Unique identifier for the project',
                    },
                  },
                  required: ['id'],
                  additionalProperties: false,
                },
                product: {
                  type: 'object',
                  description: 'Product to be linked with the expense',
                  properties: {
                    id: {
                      type: 'number',
                      description: 'Unique identifier for the product',
                    },
                  },
                  required: ['id'],
                  additionalProperties: false,
                },
                user: {
                  type: 'object',
                  description: 'User to be linked with the expense',
                  properties: {
                    id: {
                      type: 'number',
                      description: 'Unique identifier for the user',
                    },
                  },
                  required: ['id'],
                  additionalProperties: false,
                },
                vatRate: {
                  type: 'object',
                  description: 'VAT rate to be linked with the expense',
                  properties: {
                    id: {
                      type: 'number',
                      description: 'Unique identifier for the VAT rate',
                    },
                  },
                  required: ['id'],
                  additionalProperties: false,
                },
              },
              required: ['id', 'rate', 'user'],
              additionalProperties: false,
            },
          },
          {
            name: 'delete_expense',
            description: 'Delete an expense',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  description: 'Expense ID',
                },
              },
              required: ['id'],
              additionalProperties: false,
            },
          },
          {
            name: 'update_expense_status',
            description: 'Update the status of expenses (internal approval/invoicing status)',
            inputSchema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  description: 'Status history message',
                },
                expenses: {
                  type: 'array',
                  description: 'List of expenses to be updated (maximum of 100 entries)',
                  items: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'number',
                        description: 'Unique identifier for the expense',
                      },
                    },
                    required: ['id'],
                    additionalProperties: false,
                  },
                  maxItems: 100,
                },
                status: {
                  type: 'string',
                  description: 'The internal approval/invoicing status of the expense',
                  enum: ['Open', 'PendingApproval', 'Approved', 'Invoiced', 'WrittenOff', 'Rejected'],
                },
              },
              required: ['expenses', 'status'],
              additionalProperties: false,
            },
          },
          {
            name: 'update_expense_client_status',
            description: 'Update the client status of expenses (external approval/invoicing status)',
            inputSchema: {
              type: 'object',
              properties: {
                clientStatus: {
                  type: 'string',
                  description: 'The external approval/invoicing status of the expense (used only when client portal is enabled)',
                  enum: ['Open', 'PendingApproval', 'Approved', 'Invoiced', 'WrittenOff', 'Rejected'],
                },
                message: {
                  type: 'string',
                  description: 'Status history message',
                },
                expenses: {
                  type: 'array',
                  description: 'List of expenses to be updated (maximum of 100 entries)',
                  items: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'number',
                        description: 'Unique identifier for the expense',
                      },
                    },
                    required: ['id'],
                    additionalProperties: false,
                  },
                  maxItems: 100,
                },
              },
              required: ['clientStatus', 'expenses'],
              additionalProperties: false,
            },
          },
          {
            name: 'get_expense_status_history',
            description: 'Query status history modification records of an expense',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  description: 'Expense ID',
                },
                top: {
                  type: 'number',
                  description: 'Maximum number of status history records to return (1-10000, default: 100)',
                  minimum: 1,
                  maximum: 10000,
                },
                skip: {
                  type: 'number',
                  description: 'Number of status history records to skip for pagination (default: 0)',
                  minimum: 0,
                },
                count: {
                  type: 'boolean',
                  description: 'Whether to include the total count of results (default: true)',
                },
                expand: {
                  type: 'string',
                  description: 'Comma-delimited list of properties to expand',
                },
                filter: {
                  type: 'string',
                  description: 'OData filter expression',
                },
                orderby: {
                  type: 'string',
                  description: 'OData orderby expression (e.g., "modifiedOn desc")',
                },
              },
              required: ['id'],
              additionalProperties: false,
            },
          },
          // Mileage
          {
            name: 'get_mileage',
            description: 'Retrieve all mileage entries from TimeChimp',
            inputSchema: {
              type: 'object',
              properties: {
                top: {
                  type: 'number',
                  description: 'Maximum number of mileage entries to return (1-10000, default: 100)',
                  minimum: 1,
                  maximum: 10000,
                },
                skip: {
                  type: 'number',
                  description: 'Number of mileage entries to skip for pagination (default: 0)',
                  minimum: 0,
                },
                count: {
                  type: 'boolean',
                  description: 'Whether to include the total count of results (default: true)',
                },
                expand: {
                  type: 'string',
                  description: 'Comma-delimited list of properties to expand (e.g., "user,project,customer")',
                },
                user_id: {
                  type: 'string',
                  description: 'Filter by specific user ID',
                },
                project_id: {
                  type: 'string',
                  description: 'Filter by specific project ID',
                },
                customer_id: {
                  type: 'string',
                  description: 'Filter by specific customer ID',
                },
                from_date: {
                  type: 'string',
                  description: 'Start date for filtering (YYYY-MM-DD format)',
                  pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                },
                to_date: {
                  type: 'string',
                  description: 'End date for filtering (YYYY-MM-DD format)',
                  pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                },
                filter: {
                  type: 'string',
                  description: 'OData filter expression (e.g., "distance gt 50" or "approved eq true")',
                },
                orderby: {
                  type: 'string',
                  description: 'OData orderby expression (e.g., "date desc" or "distance desc")',
                },
              },
              additionalProperties: false,
            },
          },
          {
            name: 'get_mileage_by_id',
            description: 'Get a specific mileage entry by ID',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  description: 'Mileage entry ID',
                },
                expand: {
                  type: 'string',
                  description: 'Comma-delimited list of properties to expand',
                },
              },
              required: ['id'],
              additionalProperties: false,
            },
          },
          {
            name: 'create_mileage',
            description: 'Create a new mileage entry',
            inputSchema: {
              type: 'object',
              properties: {
                date: {
                  type: 'string',
                  description: 'The mileage date (YYYY-MM-DD format, default: UTC today)',
                  pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                },
                fromAddress: {
                  type: 'string',
                  description: 'The mileage from address',
                },
                toAddress: {
                  type: 'string',
                  description: 'The mileage to address',
                },
                notes: {
                  type: 'string',
                  description: 'The mileage notes',
                },
                distance: {
                  type: 'number',
                  description: 'The mileage distance in KM',
                  minimum: 0,
                },
                billable: {
                  type: 'boolean',
                  description: 'Whether the mileage can be invoiced (default: true)',
                },
                type: {
                  type: 'string',
                  description: 'The mileage type',
                  enum: ['Private', 'Business', 'HomeWork'],
                },
                customer: {
                  type: 'object',
                  description: 'Customer to be linked with the mileage',
                  properties: {
                    id: {
                      type: 'number',
                      description: 'Unique identifier for the customer',
                    },
                  },
                  required: ['id'],
                  additionalProperties: false,
                },
                project: {
                  type: 'object',
                  description: 'Project to be linked with the mileage',
                  properties: {
                    id: {
                      type: 'number',
                      description: 'Unique identifier for the project',
                    },
                  },
                  required: ['id'],
                  additionalProperties: false,
                },
                vehicle: {
                  type: 'object',
                  description: 'Vehicle to be linked with the mileage',
                  properties: {
                    id: {
                      type: 'number',
                      description: 'Unique identifier for the mileage vehicle',
                    },
                  },
                  required: ['id'],
                  additionalProperties: false,
                },
                user: {
                  type: 'object',
                  description: 'User to be linked with the mileage',
                  properties: {
                    id: {
                      type: 'number',
                      description: 'Unique identifier for the user',
                    },
                  },
                  required: ['id'],
                  additionalProperties: false,
                },
              },
              required: ['distance', 'type', 'user'],
              additionalProperties: false,
            },
          },
          {
            name: 'update_mileage',
            description: 'Update an existing mileage entry',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  description: 'Mileage entry ID',
                },
                date: {
                  type: 'string',
                  description: 'The mileage date (YYYY-MM-DD format)',
                  pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                },
                fromAddress: {
                  type: 'string',
                  description: 'The mileage from address',
                },
                toAddress: {
                  type: 'string',
                  description: 'The mileage to address',
                },
                notes: {
                  type: 'string',
                  description: 'The mileage notes',
                },
                distance: {
                  type: 'number',
                  description: 'The mileage distance in KM',
                  minimum: 0,
                },
                billable: {
                  type: 'boolean',
                  description: 'Whether the mileage can be invoiced',
                },
                type: {
                  type: 'string',
                  description: 'The mileage type',
                  enum: ['Private', 'Business', 'HomeWork'],
                },
                customer: {
                  type: 'object',
                  description: 'Customer to be linked with the mileage',
                  properties: {
                    id: {
                      type: 'number',
                      description: 'Unique identifier for the customer',
                    },
                  },
                  required: ['id'],
                  additionalProperties: false,
                },
                project: {
                  type: 'object',
                  description: 'Project to be linked with the mileage',
                  properties: {
                    id: {
                      type: 'number',
                      description: 'Unique identifier for the project',
                    },
                  },
                  required: ['id'],
                  additionalProperties: false,
                },
                vehicle: {
                  type: 'object',
                  description: 'Vehicle to be linked with the mileage',
                  properties: {
                    id: {
                      type: 'number',
                      description: 'Unique identifier for the mileage vehicle',
                    },
                  },
                  required: ['id'],
                  additionalProperties: false,
                },
                user: {
                  type: 'object',
                  description: 'User to be linked with the mileage',
                  properties: {
                    id: {
                      type: 'number',
                      description: 'Unique identifier for the user',
                    },
                  },
                  required: ['id'],
                  additionalProperties: false,
                },
              },
              required: ['id', 'distance', 'type', 'user'],
              additionalProperties: false,
            },
          },
          {
            name: 'delete_mileage',
            description: 'Delete a mileage entry',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  description: 'Mileage entry ID',
                },
              },
              required: ['id'],
              additionalProperties: false,
            },
          },
          {
            name: 'update_mileage_status',
            description: 'Update the status of mileage entries (internal approval/invoicing status)',
            inputSchema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  description: 'Status history message',
                },
                mileages: {
                  type: 'array',
                  description: 'List of mileage entries to be updated (maximum of 100 entries)',
                  items: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'number',
                        description: 'Unique identifier for the mileage',
                      },
                    },
                    required: ['id'],
                    additionalProperties: false,
                  },
                  maxItems: 100,
                },
                status: {
                  type: 'string',
                  description: 'The internal approval/invoicing status of the mileage',
                  enum: ['Open', 'PendingApproval', 'Approved', 'Invoiced', 'WrittenOff', 'Rejected'],
                },
              },
              required: ['mileages', 'status'],
              additionalProperties: false,
            },
          },
          {
            name: 'update_mileage_client_status',
            description: 'Update the client status of mileage entries (external approval/invoicing status)',
            inputSchema: {
              type: 'object',
              properties: {
                clientStatus: {
                  type: 'string',
                  description: 'The external approval/invoicing status of the mileage (used only when client portal is enabled)',
                  enum: ['Open', 'PendingApproval', 'Approved', 'Invoiced', 'WrittenOff', 'Rejected'],
                },
                message: {
                  type: 'string',
                  description: 'Status history message',
                },
                mileages: {
                  type: 'array',
                  description: 'List of mileage entries to be updated (maximum of 100 entries)',
                  items: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'number',
                        description: 'Unique identifier for the mileage',
                      },
                    },
                    required: ['id'],
                    additionalProperties: false,
                  },
                  maxItems: 100,
                },
              },
              required: ['clientStatus', 'mileages'],
              additionalProperties: false,
            },
          },
          {
            name: 'get_mileage_status_history',
            description: 'Query status history modification records of a mileage entry',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  description: 'Mileage entry ID',
                },
                top: {
                  type: 'number',
                  description: 'Maximum number of status history records to return (1-10000, default: 100)',
                  minimum: 1,
                  maximum: 10000,
                },
                skip: {
                  type: 'number',
                  description: 'Number of status history records to skip for pagination (default: 0)',
                  minimum: 0,
                },
                count: {
                  type: 'boolean',
                  description: 'Whether to include the total count of results (default: true)',
                },
                expand: {
                  type: 'string',
                  description: 'Comma-delimited list of properties to expand',
                },
                filter: {
                  type: 'string',
                  description: 'OData filter expression',
                },
                orderby: {
                  type: 'string',
                  description: 'OData orderby expression (e.g., "modifiedOn desc")',
                },
              },
              required: ['id'],
              additionalProperties: false,
            },
          },
          {
            name: 'get_mileage_vehicles',
            description: 'Retrieve all mileage vehicles from TimeChimp',
            inputSchema: {
              type: 'object',
              properties: {
                top: {
                  type: 'number',
                  description: 'Maximum number of mileage vehicles to return (1-10000, default: 100)',
                  minimum: 1,
                  maximum: 10000,
                },
                skip: {
                  type: 'number',
                  description: 'Number of mileage vehicles to skip for pagination (default: 0)',
                  minimum: 0,
                },
                count: {
                  type: 'boolean',
                  description: 'Whether to include the total count of results (default: true)',
                },
                expand: {
                  type: 'string',
                  description: 'Comma-delimited list of properties to expand (e.g., "users")',
                },
                active_only: {
                  type: 'boolean',
                  description: 'Only return active mileage vehicles (default: false)',
                },
                filter: {
                  type: 'string',
                  description: 'OData filter expression (e.g., "brand eq \'Toyota\'" or "active eq true")',
                },
                orderby: {
                  type: 'string',
                  description: 'OData orderby expression (e.g., "brand asc" or "created desc")',
                },
              },
              additionalProperties: false,
            },
          },
          {
            name: 'get_mileage_vehicle_by_id',
            description: 'Get a specific mileage vehicle by ID',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  description: 'Mileage vehicle ID',
                },
                expand: {
                  type: 'string',
                  description: 'Comma-delimited list of properties to expand',
                },
              },
              required: ['id'],
              additionalProperties: false,
            },
          },
          // Tags
          {
            name: 'get_tags',
            description: 'Retrieve all tags from TimeChimp',
            inputSchema: {
              type: 'object',
              properties: {
                top: {
                  type: 'number',
                  description: 'Maximum number of tags to return (1-10000, default: 100)',
                  minimum: 1,
                  maximum: 10000,
                },
                skip: {
                  type: 'number',
                  description: 'Number of tags to skip for pagination (default: 0)',
                  minimum: 0,
                },
                count: {
                  type: 'boolean',
                  description: 'Whether to include the total count of results (default: true)',
                },
                expand: {
                  type: 'string',
                  description: 'Comma-delimited list of properties to expand',
                },
                active_only: {
                  type: 'boolean',
                  description: 'Only return active tags (default: false)',
                },
                filter: {
                  type: 'string',
                  description: 'OData filter expression (e.g., "name eq \'Important\'" or "active eq true")',
                },
                orderby: {
                  type: 'string',
                  description: 'OData orderby expression (e.g., "name asc" or "created desc")',
                },
              },
              additionalProperties: false,
            },
          },
          {
            name: 'get_tag_by_id',
            description: 'Get a specific tag by ID',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  description: 'Tag ID',
                },
                expand: {
                  type: 'string',
                  description: 'Comma-delimited list of properties to expand',
                },
              },
              required: ['id'],
              additionalProperties: false,
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          // Projects
          case 'get_projects':
            return await this.getProjects(args);
          case 'get_project_by_id':
            return await this.getProjectById(args);
          case 'create_project':
            return await this.createProject(args);
          case 'update_project':
            return await this.updateProject(args);
          case 'delete_project':
            return await this.deleteProject(args);
          case 'get_project_insights':
            return await this.getProjectInsights(args);
          
          // Users
          case 'get_users':
            return await this.getUsers(args);
          case 'get_user_by_id':
            return await this.getUserById(args);
          case 'create_user':
            return await this.createUser(args);
          case 'update_user':
            return await this.updateUser(args);
          
          // Time Entries
          case 'get_time_entries':
            return await this.getTimeEntries(args);
          case 'get_time_entry_by_id':
            return await this.getTimeEntryById(args);
          
          // Contacts
          case 'get_contacts':
            return await this.getContacts(args);
          case 'get_contact_by_id':
            return await this.getContactById(args);
          case 'create_contact':
            return await this.createContact(args);
          case 'update_contact':
            return await this.updateContact(args);
          case 'delete_contact':
            return await this.deleteContact(args);
          
          // Customers
          case 'get_customers':
            return await this.getCustomers(args);
          case 'get_customer_by_id':
            return await this.getCustomerById(args);
          case 'create_customer':
            return await this.createCustomer(args);
          case 'update_customer':
            return await this.updateCustomer(args);
          case 'delete_customer':
            return await this.deleteCustomer(args);
          
          // Tasks
          case 'get_tasks':
            return await this.getTasks(args);
          case 'get_task_by_id':
            return await this.getTaskById(args);
          
          // Invoices
          case 'get_invoices':
            return await this.getInvoices(args);
          case 'get_invoice_by_id':
            return await this.getInvoiceById(args);
          
          // Expenses
          case 'get_expenses':
            return await this.getExpenses(args);
          case 'get_expense_by_id':
            return await this.getExpenseById(args);
          case 'create_expense':
            return await this.createExpense(args);
          case 'update_expense':
            return await this.updateExpense(args);
          case 'delete_expense':
            return await this.deleteExpense(args);
          case 'update_expense_status':
            return await this.updateExpenseStatus(args);
          case 'update_expense_client_status':
            return await this.updateExpenseClientStatus(args);
          case 'get_expense_status_history':
            return await this.getExpenseStatusHistory(args);
          
          // Mileage
          case 'get_mileage':
            return await this.getMileage(args);
          case 'get_mileage_by_id':
            return await this.getMileageById(args);
          case 'create_mileage':
            return await this.createMileage(args);
          case 'update_mileage':
            return await this.updateMileage(args);
          case 'delete_mileage':
            return await this.deleteMileage(args);
          case 'update_mileage_status':
            return await this.updateMileageStatus(args);
          case 'update_mileage_client_status':
            return await this.updateMileageClientStatus(args);
          case 'get_mileage_status_history':
            return await this.getMileageStatusHistory(args);
          case 'get_mileage_vehicles':
            return await this.getMileageVehicles(args);
          case 'get_mileage_vehicle_by_id':
            return await this.getMileageVehicleById(args);
          
          // Tags
          case 'get_tags':
            return await this.getTags(args);
          case 'get_tag_by_id':
            return await this.getTagById(args);
          
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error.message}`
        );
      }
    });
  }

  /**
   * Build query parameters for OData requests
   */
  buildQueryParams(args = {}) {
    const { top, skip, count, expand, filter, orderby } = args;
    const params = new URLSearchParams();
    
    // Pagination parameters
    if (top) params.append('$top', top.toString());
    if (skip) params.append('$skip', skip.toString());
    if (count !== undefined) params.append('$count', count.toString());
    
    // Expansion
    if (expand) params.append('$expand', expand);
    
    // Ordering
    if (orderby) params.append('$orderby', orderby);
    
    // Filtering
    if (filter) params.append('$filter', filter);
    
    return params;
  }

  /**
   * Build filter expression with common filters
   */
  buildFilterExpression(args = {}) {
    const { active_only, user_id, project_id, customer_id, from_date, to_date, filter } = args;
    let filterExpression = '';
    
    // Add active filter
    if (active_only) {
      filterExpression = 'active eq true';
    }
    
    // Add user_id filter
    if (user_id) {
      const userFilter = `user/id eq ${user_id}`;
      filterExpression = filterExpression ? `${filterExpression} and ${userFilter}` : userFilter;
    }
    
    // Add project_id filter
    if (project_id) {
      const projectFilter = `project/id eq ${project_id}`;
      filterExpression = filterExpression ? `${filterExpression} and ${projectFilter}` : projectFilter;
    }
    
    // Add customer_id filter
    if (customer_id) {
      const customerFilter = `customer/id eq ${customer_id}`;
      filterExpression = filterExpression ? `${filterExpression} and ${customerFilter}` : customerFilter;
    }
    
    // Add date range filters
    if (from_date) {
      const dateFilter = `date ge ${from_date}`;
      filterExpression = filterExpression ? `${filterExpression} and ${dateFilter}` : dateFilter;
    }
    
    if (to_date) {
      const dateFilter = `date le ${to_date}`;
      filterExpression = filterExpression ? `${filterExpression} and ${dateFilter}` : dateFilter;
    }
    
    // Add custom filter
    if (filter) {
      filterExpression = filterExpression ? `${filterExpression} and ${filter}` : filter;
    }
    
    return filterExpression;
  }

  /**
   * Generic method to handle GET requests
   */
  async handleGetRequest(endpoint, args = {}, defaultOrderBy = null) {
    const params = this.buildQueryParams(args);
    const filterExpression = this.buildFilterExpression(args);
    
    // Add default ordering if no custom orderby is provided
    if (defaultOrderBy && !args.orderby) {
      params.append('$orderby', defaultOrderBy);
    }
    
    if (filterExpression) {
      params.set('$filter', filterExpression);
    }

    const fullEndpoint = `${endpoint}${params.toString() ? `?${params.toString()}` : ''}`;
    
    try {
      const data = await this.makeRequest(fullEndpoint);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error retrieving data from ${endpoint}: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  /**
   * Generic method to handle GET by ID requests
   */
  async handleGetByIdRequest(endpoint, id, expand = null) {
    const params = new URLSearchParams();
    if (expand) params.append('$expand', expand);
    
    const fullEndpoint = `${endpoint}/${id}${params.toString() ? `?${params.toString()}` : ''}`;
    
    try {
      const data = await this.makeRequest(fullEndpoint);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error retrieving data from ${endpoint}/${id}: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  // Projects
  async getProjects(args = {}) {
    return await this.handleGetRequest('/projects', args);
  }

  async getProjectById(args = {}) {
    const { id, expand } = args;
    return await this.handleGetByIdRequest('/projects', id, expand);
  }

  async createProject(args = {}) {
    const { name, active, code, notes, color, startDate, endDate, invoicing, budget, customer, mainProject, subprojects, managers, tags, projectTasks, projectUsers } = args;
    
    const projectData = {
      name,
      active,
      code,
      notes,
      color,
      startDate,
      endDate,
      invoicing,
      budget,
      customer,
      mainProject,
      subprojects,
      managers,
      tags,
      projectTasks,
      projectUsers,
    };

    try {
      const data = await this.makeRequest('/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error creating project: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async updateProject(args = {}) {
    const { id, name, active, code, notes, color, startDate, endDate, invoicing, budget, customer, mainProject, subprojects, managers, tags, projectTasks, projectUsers } = args;
    
    const projectData = {
      name,
      active,
      code,
      notes,
      color,
      startDate,
      endDate,
      invoicing,
      budget,
      customer,
      mainProject,
      subprojects,
      managers,
      tags,
      projectTasks,
      projectUsers,
    };

    try {
      const data = await this.makeRequest(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(projectData),
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error updating project: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async deleteProject(args = {}) {
    const { id } = args;

    try {
      await this.makeRequest(`/projects/${id}`, {
        method: 'DELETE',
      });
      
      return {
        content: [
          {
            type: 'text',
            text: `Project ${id} deleted successfully`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error deleting project: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async getProjectInsights(args = {}) {
    const { id } = args;
    
    try {
      const data = await this.makeRequest(`/projects/${id}/insights`);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error retrieving project insights: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  // Users
  async getUsers(args = {}) {
    return await this.handleGetRequest('/users', args);
  }

  async getUserById(args = {}) {
    const { id, expand } = args;
    return await this.handleGetByIdRequest('/users', id, expand);
  }

  async createUser(args = {}) {
    const { userName, displayName, language, role, sendInvitation, contracts } = args;
    
    const userData = {
      userName,
      displayName,
      language,
      role,
      sendInvitation,
      contracts,
    };

    try {
      const data = await this.makeRequest('/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error creating user: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async updateUser(args = {}) {
    const { id, displayName, language, employeeNumber, badgeNumber, citizenServiceNumber, role, tags, contracts } = args;
    
    const userData = {
      displayName,
      language,
      employeeNumber,
      badgeNumber,
      citizenServiceNumber,
      role,
      tags,
      contracts,
    };

    try {
      const data = await this.makeRequest(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error updating user: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  // Time Entries
  async getTimeEntries(args = {}) {
    return await this.handleGetRequest('/times', args);
  }

  async getTimeEntryById(args = {}) {
    const { id, expand } = args;
    return await this.handleGetByIdRequest('/times', id, expand);
  }

  // Contacts
  async getContacts(args = {}) {
    return await this.handleGetRequest('/contacts', args);
  }

  async getContactById(args = {}) {
    const { id, expand } = args;
    return await this.handleGetByIdRequest('/contacts', id, expand);
  }

  async createContact(args = {}) {
    const { name, jobTitle, email, phone, useForInvoicing, active, customers } = args;
    
    const contactData = {
      name,
      ...(jobTitle && { jobTitle }),
      ...(email && { email }),
      ...(phone && { phone }),
      ...(useForInvoicing !== undefined && { useForInvoicing }),
      ...(active !== undefined && { active }),
      ...(customers && { customers }),
    };

    try {
      const data = await this.makeRequest('/contacts', {
        method: 'POST',
        body: JSON.stringify(contactData),
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error creating contact: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async updateContact(args = {}) {
    const { id, name, jobTitle, email, phone, useForInvoicing, active, customers } = args;
    
    const contactData = {
      name,
      ...(jobTitle !== undefined && { jobTitle }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(useForInvoicing !== undefined && { useForInvoicing }),
      ...(active !== undefined && { active }),
      ...(customers !== undefined && { customers }),
    };

    try {
      const data = await this.makeRequest(`/contacts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(contactData),
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error updating contact: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async deleteContact(args = {}) {
    const { id } = args;

    try {
      await this.makeRequest(`/contacts/${id}`, {
        method: 'DELETE',
      });
      
      return {
        content: [
          {
            type: 'text',
            text: `Contact ${id} deleted successfully`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error deleting contact: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  // Customers
  async getCustomers(args = {}) {
    return await this.handleGetRequest('/customers', args);
  }

  async getCustomerById(args = {}) {
    const { id, expand } = args;
    return await this.handleGetByIdRequest('/customers', id, expand);
  }

  async createCustomer(args = {}) {
    const { name, active, relationId, address, phone, email, website, paymentPeriod, hourlyRate, mileageRate, iban, bic, vatNumber, kvkNumber, invoiceAddress, notes, prospect, vatRate, tags, contacts } = args;
    
    const customerData = {
      name,
      active,
      relationId,
      address,
      phone,
      email,
      website,
      paymentPeriod,
      hourlyRate,
      mileageRate,
      iban,
      bic,
      vatNumber,
      kvkNumber,
      invoiceAddress,
      notes,
      prospect,
      vatRate,
      tags,
      contacts,
    };

    try {
      const data = await this.makeRequest('/customers', {
        method: 'POST',
        body: JSON.stringify(customerData),
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error creating customer: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async updateCustomer(args = {}) {
    const { id, name, active, relationId, address, phone, email, website, paymentPeriod, hourlyRate, mileageRate, iban, bic, vatNumber, kvkNumber, invoiceAddress, notes, prospect, vatRate, tags, contacts } = args;
    
    const customerData = {
      name,
      active,
      relationId,
      address,
      phone,
      email,
      website,
      paymentPeriod,
      hourlyRate,
      mileageRate,
      iban,
      bic,
      vatNumber,
      kvkNumber,
      invoiceAddress,
      notes,
      prospect,
      vatRate,
      tags,
      contacts,
    };

    try {
      const data = await this.makeRequest(`/customers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(customerData),
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error updating customer: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async deleteCustomer(args = {}) {
    const { id } = args;

    try {
      await this.makeRequest(`/customers/${id}`, {
        method: 'DELETE',
      });
      
      return {
        content: [
          {
            type: 'text',
            text: `Customer ${id} deleted successfully`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error deleting customer: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  // Tasks
  async getTasks(args = {}) {
    return await this.handleGetRequest('/tasks', args);
  }

  async getTaskById(args = {}) {
    const { id, expand } = args;
    return await this.handleGetByIdRequest('/tasks', id, expand);
  }

  // Invoices
  async getInvoices(args = {}) {
    return await this.handleGetRequest('/invoices', args);
  }

  async getInvoiceById(args = {}) {
    const { id, expand } = args;
    return await this.handleGetByIdRequest('/invoices', id, expand);
  }

  // Expenses
  async getExpenses(args = {}) {
    return await this.handleGetRequest('/expenses', args);
  }

  async getExpenseById(args = {}) {
    const { id, expand } = args;
    return await this.handleGetByIdRequest('/expenses', id, expand);
  }

  // Mileage
  async getMileage(args = {}) {
    return await this.handleGetRequest('/mileage', args);
  }

  async getMileageById(args = {}) {
    const { id, expand } = args;
    return await this.handleGetByIdRequest('/mileage', id, expand);
  }

  async createMileage(args = {}) {
    const { date, fromAddress, toAddress, notes, distance, billable, type, customer, project, vehicle, user } = args;
    
    const mileageData = {
      date,
      fromAddress,
      toAddress,
      notes,
      distance,
      billable,
      type,
      customer,
      project,
      vehicle,
      user,
    };

    try {
      const data = await this.makeRequest('/mileage', {
        method: 'POST',
        body: JSON.stringify(mileageData),
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error creating mileage: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async updateMileage(args = {}) {
    const { id, date, fromAddress, toAddress, notes, distance, billable, type, customer, project, vehicle, user } = args;
    
    const mileageData = {
      date,
      fromAddress,
      toAddress,
      notes,
      distance,
      billable,
      type,
      customer,
      project,
      vehicle,
      user,
    };

    try {
      const data = await this.makeRequest(`/mileage/${id}`, {
        method: 'PUT',
        body: JSON.stringify(mileageData),
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error updating mileage: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async deleteMileage(args = {}) {
    const { id } = args;

    try {
      await this.makeRequest(`/mileage/${id}`, {
        method: 'DELETE',
      });
      
      return {
        content: [
          {
            type: 'text',
            text: `Mileage ${id} deleted successfully`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error deleting mileage: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async updateMileageStatus(args = {}) {
    const { message, mileages, status } = args;
    
    const mileageData = {
      message,
      mileages,
      status,
    };

    try {
      const data = await this.makeRequest('/mileage/status', {
        method: 'PUT',
        body: JSON.stringify(mileageData),
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error updating mileage status: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async updateMileageClientStatus(args = {}) {
    const { clientStatus, message, mileages } = args;
    
    const mileageData = {
      clientStatus,
      message,
      mileages,
    };

    try {
      const data = await this.makeRequest('/mileage/clientStatus', {
        method: 'PUT',
        body: JSON.stringify(mileageData),
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error updating mileage client status: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async getMileageStatusHistory(args = {}) {
    const { id, top, skip, count, expand, filter, orderby } = args;
    
    const params = new URLSearchParams();
    if (top) params.append('$top', top.toString());
    if (skip) params.append('$skip', skip.toString());
    if (count !== undefined) params.append('$count', count.toString());
    if (expand) params.append('$expand', expand);
    if (filter) params.append('$filter', filter);
    if (orderby) params.append('$orderby', orderby);
    
    const fullEndpoint = `/mileage/${id}/statusHistory${params.toString() ? `?${params.toString()}` : ''}`;
    
    try {
      const data = await this.makeRequest(fullEndpoint);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error retrieving mileage status history: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async getMileageVehicles(args = {}) {
    return await this.handleGetRequest('/mileageVehicles', args);
  }

  async getMileageVehicleById(args = {}) {
    const { id, expand } = args;
    return await this.handleGetByIdRequest('/mileageVehicles', id, expand);
  }

  // Tags
  async getTags(args = {}) {
    return await this.handleGetRequest('/tags', args);
  }

  async getTagById(args = {}) {
    const { id, expand } = args;
    return await this.handleGetByIdRequest('/tags', id, expand);
  }

  async createExpense(args = {}) {
    const { date, notes, quantity, rate, billable, customer, project, product, user, vatRate } = args;
    
    const expenseData = {
      date,
      notes,
      quantity,
      rate,
      billable,
      customer,
      project,
      product,
      user,
      vatRate,
    };

    try {
      const data = await this.makeRequest('/expenses', {
        method: 'POST',
        body: JSON.stringify(expenseData),
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error creating expense: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async updateExpense(args = {}) {
    const { id, date, notes, quantity, rate, billable, customer, project, product, user, vatRate } = args;
    
    const expenseData = {
      date,
      notes,
      quantity,
      rate,
      billable,
      customer,
      project,
      product,
      user,
      vatRate,
    };

    try {
      const data = await this.makeRequest(`/expenses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(expenseData),
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error updating expense: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async deleteExpense(args = {}) {
    const { id } = args;

    try {
      await this.makeRequest(`/expenses/${id}`, {
        method: 'DELETE',
      });
      
      return {
        content: [
          {
            type: 'text',
            text: `Expense ${id} deleted successfully`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error deleting expense: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async updateExpenseStatus(args = {}) {
    const { message, expenses, status } = args;
    
    const expenseData = {
      message,
      expenses,
      status,
    };

    try {
      const data = await this.makeRequest('/expenses/status', {
        method: 'PUT',
        body: JSON.stringify(expenseData),
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error updating expense status: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async updateExpenseClientStatus(args = {}) {
    const { clientStatus, message, expenses } = args;
    
    const expenseData = {
      clientStatus,
      message,
      expenses,
    };

    try {
      const data = await this.makeRequest('/expenses/clientStatus', {
        method: 'PUT',
        body: JSON.stringify(expenseData),
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error updating expense client status: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async getExpenseStatusHistory(args = {}) {
    const { id, top, skip, count, expand, filter, orderby } = args;
    
    const params = new URLSearchParams();
    if (top) params.append('$top', top.toString());
    if (skip) params.append('$skip', skip.toString());
    if (count !== undefined) params.append('$count', count.toString());
    if (expand) params.append('$expand', expand);
    if (filter) params.append('$filter', filter);
    if (orderby) params.append('$orderby', orderby);
    
    const fullEndpoint = `/expenses/${id}/statusHistory${params.toString() ? `?${params.toString()}` : ''}`;
    
    try {
      const data = await this.makeRequest(fullEndpoint);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error retrieving expense status history: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('TimeChimp MCP server running on stdio');
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.error('Shutting down TimeChimp MCP server...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('Shutting down TimeChimp MCP server...');
  process.exit(0);
});

// Start the server
const server = new TimechimpMCPServer();
server.run().catch((error) => {
  console.error('Failed to run server:', error);
  process.exit(1);
}); 