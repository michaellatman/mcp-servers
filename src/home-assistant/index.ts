#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";

// Define tools for interacting with Home Assistant entities and services
const DEVICE_CONTROL_TOOL: Tool = {
  name: "home_assistant_device_control",
  description: "Control Home Assistant devices such as lights, switches, and thermostats",
  inputSchema: {
    type: "object",
    properties: {
      entity_id: { type: "string", description: "Entity ID of the device" },
      service: { type: "string", description: "Service to call (e.g., turn_on, turn_off)" },
      service_data: { type: "object", description: "Additional service data", additionalProperties: true }
    },
    required: ["entity_id", "service"]
  }
};

const SENSOR_DATA_RETRIEVAL_TOOL: Tool = {
  name: "home_assistant_sensor_data_retrieval",
  description: "Retrieve sensor data from Home Assistant",
  inputSchema: {
    type: "object",
    properties: {
      entity_id: { type: "string", description: "Entity ID of the sensor" }
    },
    required: ["entity_id"]
  }
};

const AUTOMATION_MANAGEMENT_TOOL: Tool = {
  name: "home_assistant_automation_management",
  description: "Manage Home Assistant automations (create, modify, delete)",
  inputSchema: {
    type: "object",
    properties: {
      action: { type: "string", description: "Action to perform (create, modify, delete)" },
      automation_id: { type: "string", description: "ID of the automation (required for modify and delete)" },
      automation_data: { type: "object", description: "Automation data (required for create and modify)", additionalProperties: true }
    },
    required: ["action"]
  }
};

const STATE_MONITORING_TOOL: Tool = {
  name: "home_assistant_state_monitoring",
  description: "Monitor the state of Home Assistant entities",
  inputSchema: {
    type: "object",
    properties: {
      entity_id: { type: "string", description: "Entity ID of the entity to monitor" }
    },
    required: ["entity_id"]
  }
};

const NOTIFICATION_HANDLING_TOOL: Tool = {
  name: "home_assistant_notification_handling",
  description: "Send notifications through Home Assistant's notification system",
  inputSchema: {
    type: "object",
    properties: {
      message: { type: "string", description: "Notification message" },
      title: { type: "string", description: "Notification title" },
      target: { type: "string", description: "Notification target" }
    },
    required: ["message"]
  }
};

const SERVICE_CALL_TOOL: Tool = {
  name: "home_assistant_service_call",
  description: "Call Home Assistant services to perform various actions",
  inputSchema: {
    type: "object",
    properties: {
      service: { type: "string", description: "Service to call" },
      service_data: { type: "object", description: "Additional service data", additionalProperties: true }
    },
    required: ["service"]
  }
};

const EVENT_LISTENING_TOOL: Tool = {
  name: "home_assistant_event_listening",
  description: "Listen for and respond to events within Home Assistant",
  inputSchema: {
    type: "object",
    properties: {
      event_type: { type: "string", description: "Type of event to listen for" }
    },
    required: ["event_type"]
  }
};

// Server implementation
const server = new Server(
  {
    name: "example-servers/home-assistant",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// Check for Home Assistant API URL and token
const HOME_ASSISTANT_API_URL = process.env.HOME_ASSISTANT_API_URL!;
const HOME_ASSISTANT_API_TOKEN = process.env.HOME_ASSISTANT_API_TOKEN!;
if (!HOME_ASSISTANT_API_URL || !HOME_ASSISTANT_API_TOKEN) {
  console.error("Error: HOME_ASSISTANT_API_URL and HOME_ASSISTANT_API_TOKEN environment variables are required");
  process.exit(1);
}

// Helper function to call Home Assistant API
async function callHomeAssistantAPI(endpoint: string, method: string, body?: any) {
  const url = `${HOME_ASSISTANT_API_URL}${endpoint}`;
  const response = await fetch(url, {
    method,
    headers: {
      "Authorization": `Bearer ${HOME_ASSISTANT_API_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    throw new Error(`Home Assistant API error: ${response.status} ${response.statusText}\n${await response.text()}`);
  }

  return await response.json();
}

// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    DEVICE_CONTROL_TOOL,
    SENSOR_DATA_RETRIEVAL_TOOL,
    AUTOMATION_MANAGEMENT_TOOL,
    STATE_MONITORING_TOOL,
    NOTIFICATION_HANDLING_TOOL,
    SERVICE_CALL_TOOL,
    EVENT_LISTENING_TOOL
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case "home_assistant_device_control": {
        const { entity_id, service, service_data } = args;
        const endpoint = `/api/services/${service.split(".")[0]}/${service.split(".")[1]}`;
        const body = { entity_id, ...service_data };
        const result = await callHomeAssistantAPI(endpoint, "POST", body);
        return {
          content: [{ type: "text", text: `Device control result: ${JSON.stringify(result)}` }],
          isError: false
        };
      }

      case "home_assistant_sensor_data_retrieval": {
        const { entity_id } = args;
        const endpoint = `/api/states/${entity_id}`;
        const result = await callHomeAssistantAPI(endpoint, "GET");
        return {
          content: [{ type: "text", text: `Sensor data: ${JSON.stringify(result)}` }],
          isError: false
        };
      }

      case "home_assistant_automation_management": {
        const { action, automation_id, automation_data } = args;
        let endpoint = "/api/services/automation/";
        let method = "POST";
        let body = automation_data;

        switch (action) {
          case "create":
            endpoint += "create";
            break;
          case "modify":
            endpoint += "modify";
            body = { automation_id, ...automation_data };
            break;
          case "delete":
            endpoint += "delete";
            body = { automation_id };
            break;
          default:
            throw new Error(`Invalid action: ${action}`);
        }

        const result = await callHomeAssistantAPI(endpoint, method, body);
        return {
          content: [{ type: "text", text: `Automation management result: ${JSON.stringify(result)}` }],
          isError: false
        };
      }

      case "home_assistant_state_monitoring": {
        const { entity_id } = args;
        const endpoint = `/api/states/${entity_id}`;
        const result = await callHomeAssistantAPI(endpoint, "GET");
        return {
          content: [{ type: "text", text: `State monitoring result: ${JSON.stringify(result)}` }],
          isError: false
        };
      }

      case "home_assistant_notification_handling": {
        const { message, title, target } = args;
        const endpoint = "/api/services/notify";
        const body = { message, title, target };
        const result = await callHomeAssistantAPI(endpoint, "POST", body);
        return {
          content: [{ type: "text", text: `Notification handling result: ${JSON.stringify(result)}` }],
          isError: false
        };
      }

      case "home_assistant_service_call": {
        const { service, service_data } = args;
        const endpoint = `/api/services/${service.split(".")[0]}/${service.split(".")[1]}`;
        const result = await callHomeAssistantAPI(endpoint, "POST", service_data);
        return {
          content: [{ type: "text", text: `Service call result: ${JSON.stringify(result)}` }],
          isError: false
        };
      }

      case "home_assistant_event_listening": {
        const { event_type } = args;
        const endpoint = `/api/events/${event_type}`;
        const result = await callHomeAssistantAPI(endpoint, "GET");
        return {
          content: [{ type: "text", text: `Event listening result: ${JSON.stringify(result)}` }],
          isError: false
        };
      }

      default:
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true
        };
    }
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true
    };
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Home Assistant MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
