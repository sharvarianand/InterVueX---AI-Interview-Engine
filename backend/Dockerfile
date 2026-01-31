FROM node:18

WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create uploads directory for CVs
RUN mkdir -p uploads/cvs

# Expose port 7860 (Hugging Face Spaces default)
EXPOSE 7860

# Start the application
CMD ["npm", "start"]
