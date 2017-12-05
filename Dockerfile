# Use an official Node runtime as a parent image
FROM node:9.2.0-alpine

# Set the working directory to /app
WORKDIR /s3-plus-1

# Copy the current directory contents into the container at /app
ADD . /s3-plus-1

# Install any needed packages specified in requirements.txt
#RUN pip install -r requirements.txt

# Make port 9000 available to the world outside this container
EXPOSE 9000

# Define environment variable
ENV ENVIRONMENT prod
ENV PORT 9000
ENV NODE_ENV production


# Run app.py when the container launches
CMD ["node", "app.js"]
