FROM node:18-alpine

# Set the working directory
WORKDIR /app


COPY package.json .
# Install dependencies
RUN npm install
RUN export CI=false

# Copy all files to the container
COPY . .

# Define build arguments
ARG PORT=3000
ARG REACT_APP_BACKEND_BASE_URL

# Set environment variables
ENV PORT=$PORT
ENV REACT_APP_BACKEND_BASE_URL=$REACT_APP_BACKEND_BASE_URL

# Expose the desired port
EXPOSE $PORT

RUN npm run build

# Use 'serve' to serve the production build on the specified port
CMD ["sh", "-c", "PORT=$PORT REACT_APP_BACKEND_BASE_URL=$REACT_APP_BACKEND_BASE_URL npm start"]
