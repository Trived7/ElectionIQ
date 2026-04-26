# Use a lightweight Nginx image
FROM nginx:alpine

# Copy the custom Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static assets into the Nginx serving directory
COPY index.html /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/

# Expose the port Cloud Run expects (8080)
EXPOSE 8080

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
