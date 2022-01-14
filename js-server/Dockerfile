FROM mhart/alpine-node:16
# Create app directory
WORKDIR /workspace

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY yarn.lock ./

RUN yarn

# Bundle app source
COPY . /workspace

EXPOSE 8080

CMD [ "node", "index.js" ]