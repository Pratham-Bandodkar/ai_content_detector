FROM node:20-bullseye-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-dev \
    build-essential \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory to root
WORKDIR /app

# Install Python dependencies
RUN pip3 install --no-cache-dir \
    numpy \
    torch --index-url https://download.pytorch.org/whl/cpu \
    tensorflow-cpu \
    transformers \
    librosa \
    opencv-python-headless \
    h5py \
    joblib \
    scikit-learn \
    pillow

# Copy package files first for caching
COPY backend/package*.json ./backend/

# Install Node dependencies
WORKDIR /app/backend
RUN npm install

# Copy the rest of the application
WORKDIR /app
COPY backend ./backend
COPY models ./models

# Build Next.js app
WORKDIR /app/backend
RUN npm run build

# Expose port and start Next.js
EXPOSE 3000
ENV PORT=3000
CMD ["npm", "run", "start"]
