### API Documentation for Pet Management Service

---

> **Base URL:**  `https://ao-dimension-life-1.onrender.com`

### **1. Initialize Pet**

- **Endpoint:** `/init_pet`
- **Method:** `GET`
- **Description:** Initializes a pet with the given name, description, and address.
- **Query Parameters:**
  - `name` (string, required): The name of the pet.
  - `description` (string, required): A description of the pet.
  - `address` (string, required): The unique address for the pet.

- **Response:**
  - **Success (200):**
    - `success` (boolean): Indicates if the operation was successful.
    - `result` (object): The information about the pet after initialization.
  - **Error (400):**
    - `success` (boolean): `false`
    - `message` (string): Describes the error, e.g., "Missing parameters".
  - **Error (500):**
    - `success` (boolean): `false`
    - `message` (string): Error message, if something went wrong on the server.

- **Example Request:**
  ```bash
  GET /init_pet?name=Fluffy&description=Cute%20Kitten&address=0x1234567890abcdef
  ```

- **Example Response:**
  ```json
  {
    "success": true,
    "result": {
      "name": "Fluffy",
      "description": "Cute Kitten",
      "level": 1,
      "address": "0x1234567890abcdef",
      ...
    }
  }
  ```

---

### **2. Update Pet Level**

- **Endpoint:** `/update_level`
- **Method:** `GET`
- **Description:** Updates the level of a pet with the given address.
- **Query Parameters:**
  - `address` (string, required): The unique address of the pet whose level is to be updated.

- **Response:**
  - **Success (200):**
    - `success` (boolean): Indicates if the operation was successful.
    - `result` (object): The updated information about the pet.
  - **Error (400):**
    - `success` (boolean): `false`
    - `message` (string): Describes the error, e.g., "Missing parameters".
  - **Error (500):**
    - `success` (boolean): `false`
    - `message` (string): Error message, if something went wrong on the server.

- **Example Request:**
  ```bash
  GET /update_level?address=0x1234567890abcdef
  ```

- **Example Response:**
  ```json
  {
    "success": true,
    "result": {
      "name": "Fluffy",
      "description": "Cute Kitten",
      "level": 2,
      "address": "0x1234567890abcdef",
      ...
    }
  }
  ```

---

### **General Notes:**

1. **Authentication:**
   - This API does not currently implement authentication. Ensure that the service is securely accessed if deployed in a production environment.

2. **Environment Variables:**
   - The API depends on several environment variables for configuration:
     - `USE_AR`: Determines whether Arweave should be used.
     - `API_KEY`: API key for accessing certain features.
     - `AO_PET`: The Arweave object ID for pets.
     - `ETHEREUM_PRIV_KEY`: Ethereum private key.
     - `ARWEAVE_PRIV_KEY`: Arweave private key.

3. **Error Handling:**
   - Errors are returned as JSON objects with a `success: false` field and a `message` field explaining the error.
   - Ensure that all required query parameters are provided to avoid `400` errors.

---

### **Changelog:**

- **Version 1.0:**
  - Initial release with `/init_pet` and `/update_level` endpoints for managing pet data.

---

### **Contact:**

For any issues or questions, please contact the API maintainer.

> https://t.me/leeduckgo