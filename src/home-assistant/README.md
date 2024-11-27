# Home Assistant MCP Server

This MCP server provides integration with Home Assistant, allowing for control and monitoring of smart home devices and systems.

## Available Tools

### home_assistant_device_control
- **Description**: Control Home Assistant devices such as lights, switches, and thermostats.
- **Input Schema**:
  - `entity_id` (string): Entity ID of the device.
  - `service` (string): Service to call (e.g., turn_on, turn_off).
  - `service_data` (object, optional): Additional service data.

### home_assistant_sensor_data_retrieval
- **Description**: Retrieve sensor data from Home Assistant.
- **Input Schema**:
  - `entity_id` (string): Entity ID of the sensor.

### home_assistant_automation_management
- **Description**: Manage Home Assistant automations (create, modify, delete).
- **Input Schema**:
  - `action` (string): Action to perform (create, modify, delete).
  - `automation_id` (string, optional): ID of the automation (required for modify and delete).
  - `automation_data` (object, optional): Automation data (required for create and modify).

### home_assistant_state_monitoring
- **Description**: Monitor the state of Home Assistant entities.
- **Input Schema**:
  - `entity_id` (string): Entity ID of the entity to monitor.

### home_assistant_notification_handling
- **Description**: Send notifications through Home Assistant's notification system.
- **Input Schema**:
  - `message` (string): Notification message.
  - `title` (string, optional): Notification title.
  - `target` (string, optional): Notification target.

### home_assistant_service_call
- **Description**: Call Home Assistant services to perform various actions.
- **Input Schema**:
  - `service` (string): Service to call.
  - `service_data` (object, optional): Additional service data.

### home_assistant_event_listening
- **Description**: Listen for and respond to events within Home Assistant.
- **Input Schema**:
  - `event_type` (string): Type of event to listen for.

## Usage Instructions

1. **Set up Home Assistant API**:
   - Ensure your Home Assistant instance is running and accessible.
   - Obtain the Home Assistant API URL and a long-lived access token.

2. **Configure Environment Variables**:
   - Set the following environment variables:
     - `HOME_ASSISTANT_API_URL`: The URL of your Home Assistant instance (e.g., `http://localhost:8123`).
     - `HOME_ASSISTANT_API_TOKEN`: Your Home Assistant long-lived access token.

3. **Run the Server**:
   - Use the following command to start the server:
     ```sh
     npx @modelcontextprotocol/server-home-assistant
     ```

4. **Integrate with MCP Client**:
   - Add the Home Assistant MCP server to your MCP client configuration.
   - Use the available tools to interact with your Home Assistant instance.

## Configuration Details

- **Home Assistant API URL**: The URL of your Home Assistant instance.
- **Home Assistant API Token**: A long-lived access token for authenticating with the Home Assistant API.

## Example Configuration

```json
{
  "mcpServers": {
    "home-assistant": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-home-assistant"
      ],
      "env": {
        "HOME_ASSISTANT_API_URL": "http://localhost:8123",
        "HOME_ASSISTANT_API_TOKEN": "YOUR_LONG_LIVED_ACCESS_TOKEN"
      }
    }
  }
}
```

## How to Get Environment Variables

### HOME_ASSISTANT_API_URL
1. Open your Home Assistant instance in a web browser.
2. Copy the URL from the address bar (e.g., `http://localhost:8123`).

### HOME_ASSISTANT_API_TOKEN
1. Open your Home Assistant instance in a web browser.
2. Go to your user profile by clicking on your user icon in the bottom left corner.
3. Scroll down to the "Long-Lived Access Tokens" section.
4. Click on "Create Token".
5. Enter a name for the token and click "OK".
6. Copy the generated token and use it as the value for `HOME_ASSISTANT_API_TOKEN`.

## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.
