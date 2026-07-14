FROM node:22-bookworm

# Install useful tools
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    vim \
    unzip \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install global AI CLI tools
RUN npm install -g \
    @google/gemini-cli \
    opencode-ai

WORKDIR /workspace

EXPOSE 3001