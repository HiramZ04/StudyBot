# StudyBot
LLM with the capacity to make summaries from lectures, notes, and presentations. Evaluating the need of a RAG based framework

## Setup instructions
### 1. Clone the repository and navigate to the project directory.

### 2. Configure environment variables:
   - Inside the `backend` directory, create a file named `.env`
   - Add the following to the file:

    ```
    OPENAI_BASE_URL = https://api.openai.com/v1
    OPENAI_API_KEY = your_openai_api_key_here
    MODEL = gpt-5-nano
    EMBEDDING_MODEL=all-MiniLM-L6-v2
    TOP_K=5
    CHUNK_SIZE=512
    CHUNK_OVERLAP=64
    ```

   - Replace `your_openai_api_key_here` with your actual key from (https://platform.openai.com/api-keys)

### 3. Compile the frontend:
   - Navigate to the `frontend` directory and run `npm install` to install the dependencies.
   - Run `npm run build` to compile the frontend assets into the `dist` directory.

### 4. Set up the backend:
   - Return to root directory
   - Run `pip install -r backend/requirements.txt`

### 5. Start the server:
   - Run `fastapi dev backend/app.py` (must be run from root directory)

### 7. Open a web browser and navigate to http://localhost:8000 to access the application.