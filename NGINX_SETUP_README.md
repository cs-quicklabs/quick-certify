# Nginx Setup for Development Environment

This guide explains how to set up Nginx as a reverse proxy for the development environment on a DigitalOcean Droplet.

## Prerequisites

- A DigitalOcean Droplet with Ubuntu 20.04 or later
- Docker and Docker Compose installed
- Domain name pointing to your Droplet (optional but recommended)

## Installation Steps

1. **Install Nginx**

```bash
sudo apt update
sudo apt install nginx -y
```

2. **Create Nginx Configuration**

Create a new configuration file:

```bash
sudo nano /etc/nginx/sites-available/quick-certify-dev
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-droplet-ip-or-domain;  # Replace with your Droplet's IP or domain

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Development specific settings
    client_max_body_size 50M;
    client_body_buffer_size 128k;

    # Enable CORS for development
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
    add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;
}
```

3. **Enable the Site**

```bash
sudo ln -sf /etc/nginx/sites-available/quick-certify-dev /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
```

4. **Test and Restart Nginx**

```bash
sudo nginx -t
sudo systemctl restart nginx
```

5. **Start the Application**

```bash
cd /path/to/your/project
docker-compose -f docker/dev/docker-compose.dev.yml up -d
```

## Accessing the Application

- Frontend: `http://your-droplet-ip-or-domain`
- Backend API: `http://your-droplet-ip-or-domain/api`

## Important Notes

1. **Security Considerations**

   - This configuration is for development purposes only
   - CORS is enabled for all origins (`*`)
   - No SSL/TLS encryption
   - Not suitable for production use

2. **Troubleshooting**

   - Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
   - Check application logs: `docker-compose -f docker/dev/docker-compose.dev.yml logs`
   - Ensure ports 80, 3000, and 8080 are open in your DigitalOcean firewall settings

3. **Firewall Configuration**

   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 3000/tcp
   sudo ufw allow 8080/tcp
   ```

4. **Updating Configuration**
   - After making changes to the Nginx configuration:
     ```bash
     sudo nginx -t
     sudo systemctl reload nginx
     ```

## Development Workflow

1. Make changes to your code
2. Rebuild and restart containers:
   ```bash
   docker-compose -f docker/dev/docker-compose.dev.yml down
   docker-compose -f docker/dev/docker-compose.dev.yml up -d --build
   ```

## Cleanup

To remove the Nginx configuration:

```bash
sudo rm /etc/nginx/sites-enabled/quick-certify-dev
sudo rm /etc/nginx/sites-available/quick-certify-dev
sudo systemctl restart nginx
```
